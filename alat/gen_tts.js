#!/usr/bin/env node
/**
 * Bikin file suara basa Bali memakai Gemini TTS, lalu simpan sebagai mp3.
 *
 * Data soal & kosakata dibaca LANGSUNG dari index.html supaya audio tidak
 * pernah beda dengan teks yang tampil di game.
 *
 * API key hanya dipakai di sini (komputer lokal); key tidak pernah ikut
 * ter-upload ke GitHub Pages.
 *
 *   node gen_tts.js            -> bikin yang belum ada
 *   node gen_tts.js --force    -> bikin ulang semua
 *   node gen_tts.js --edge     -> bikin MP3 lewat Edge Read Aloud tanpa key
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
let ffmpeg = process.env.FFMPEG_PATH || null;

function jalurFfmpeg() {
  if (ffmpeg) return ffmpeg;
  try { ffmpeg = require('ffmpeg-static'); }
  catch (e) {
    throw new Error('ffmpeg belum tersedia; pasang ffmpeg-static atau set FFMPEG_PATH');
  }
  return ffmpeg;
}

/* ==================================================================
   JALUR UTAMA (opsional): GOOGLE CLOUD TEXT-TO-SPEECH
   ------------------------------------------------------------------
   Produk Google yang BERBEDA dari Gemini API, dan kuotanya jauh lebih
   lapang: 1 juta karakter/bulan gratis untuk suara WaveNet (kita cuma
   perlu ~8 ribu karakter untuk SEMUA klip). Bonusnya: keluarannya sudah
   MP3, jadi tidak perlu ffmpeg.

   Syaratnya cuma satu: Cloud TTS MENOLAK API key biasa, jadi perlu file
   kunci service account. Taruh JSON-nya sebagai `.gcp-sa.json` di folder
   ini dan skrip otomatis memakainya lebih dulu; kalau tidak ada, jatuh
   ke jalur Gemini seperti biasa.

   Cara membuat filenya (sekali saja):
     1. console.cloud.google.com -> pilih/buat project
     2. aktifkan "Cloud Text-to-Speech API"
     3. IAM & Admin -> Service Accounts -> Create -> role "Cloud Text-to-
        Speech User" -> Keys -> Add key -> JSON -> unduh
     4. simpan sebagai .gcp-sa.json di folder skrip ini
   ================================================================== */
const SA_PATH = '.gcp-sa.json';
const punyaCloudTTS = fs.existsSync(SA_PATH);
let tokenCache = { token: null, kadaluarsa: 0 };

// Suara id-ID. Basa Bali memakai ejaan Latin yang dekat dengan bahasa
// Indonesia, jadi suara id-ID melafalkannya dengan baik.
const SUARA_CLOUD = { putu: 'id-ID-Wavenet-B', niluh: 'id-ID-Wavenet-A' };
const SUARA_EDGE = { putu: 'id-ID-ArdiNeural', niluh: 'id-ID-GadisNeural' };
const PAKAI_EDGE = process.argv.includes('--edge');
const PYTHON = process.env.PYTHON || 'python';

function ttsEdge(teks, siapa, tujuan) {
  execFileSync(PYTHON, [
    '-m', 'edge_tts',
    '--voice', SUARA_EDGE[siapa] || SUARA_EDGE.putu,
    '--rate=-12%',
    '--text', teks,
    '--write-media', tujuan
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* Tukar service account JSON jadi OAuth2 access token (JWT RS256).
   Tidak perlu gcloud CLI -- cukup modul crypto bawaan Node. */
async function tokenCloud() {
  if (tokenCache.token && Date.now() < tokenCache.kadaluarsa) return tokenCache.token;
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  const iat = Math.floor(Date.now() / 1000);
  const klaim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    exp: iat + 3600, iat
  };
  const isi = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' +
              b64url(JSON.stringify(klaim));
  const tanda = crypto.createSign('RSA-SHA256').update(isi).sign(sa.private_key);
  const jwt = isi + '.' + b64url(tanda);

  const r = await fetch(klaim.aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt
    }),
    signal: AbortSignal.timeout(45000)
  });
  if (!r.ok) throw new Error('token gagal: ' + (await r.text()).slice(0, 160));
  const d = await r.json();
  tokenCache = { token: d.access_token, kadaluarsa: Date.now() + (d.expires_in - 120) * 1000 };
  return tokenCache.token;
}

/* Kembalikan Buffer MP3 langsung (bukan PCM). */
async function ttsCloud(teks, siapa) {
  const token = await tokenCloud();
  const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: teks },
      voice: { languageCode: 'id-ID', name: SUARA_CLOUD[siapa] || SUARA_CLOUD.putu },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.85, pitch: 0, sampleRateHertz: 24000 }
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!r.ok) {
    const e = new Error('cloud-tts ' + r.status);
    e.detail = (await r.text()).slice(0, 160);
    e.status = r.status;
    throw e;
  }
  const d = await r.json();
  return Buffer.from(d.audioContent, 'base64');
}

/* Kuota gratis Gemini dihitung per PROYEK per MODEL. Jadi tiap API key
   (proyek berbeda) punya jatah sendiri, dan tiap model TTS punya jatah
   sendiri lagi. Kita putar semua kombinasi key x model.

   Catatan: pesan 429 "exceeded your current quota" dipakai BAIK untuk batas
   per-menit MAUPUN per-hari, jadi kombinasi yang kena 429 tidak langsung
   dicoret selamanya -- hanya diistirahatkan sebentar lalu boleh dicoba lagi. */
const KUNCI_ENV = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
const KEYS = (fs.existsSync('.gemkeys')
  ? fs.readFileSync('.gemkeys', 'utf8')
  : fs.existsSync('.gemkey')
    ? fs.readFileSync('.gemkey', 'utf8')
    : KUNCI_ENV
).split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);

const MODEL_TTS = [
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts'
];

// semua kombinasi (key, model); "istirahat" = waktu paling awal boleh dipakai lagi
const JALUR = [];
KEYS.forEach((k, ki) => MODEL_TTS.forEach(m => JALUR.push({ k, ki: ki + 1, m, istirahat: 0 })));
let jalurBerikut = 0;

const urlModel = (m, k) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`;
const HTML = process.env.LB_HTML ||
             'C:\\Users\\DIMAS\\Documents\\Claude\\Game-Lentera-Bali\\index.html';
const OUT = process.env.LB_AUDIO_DIR ||
            path.join(path.dirname(HTML), 'audio');
const FORCE = process.argv.includes('--force');

// Putu suara laki-laki, Ni Luh suara perempuan -- cocok dengan karakter
// yang mulutnya bergerak di layar.
const SUARA = { putu: 'Puck', niluh: 'Kore' };

/* ==================================================================
   PELAFALAN BASA BALI
   ------------------------------------------------------------------
   Gemini TTS tidak punya SSML maupun tag fonem, dan basa Bali TIDAK ada
   di daftar bahasanya (Indonesia dan Jawa ada). Jadi teks basa Bali
   dideteksi sebagai bahasa Indonesia lalu dibaca dengan bunyi Indonesia.

   Yang TERUKUR bisa mengubah bunyinya cuma satu: mengeja ulang teksnya.
   Menyuruh lewat perintah gaya sama sekali tidak mengubah vokalnya
   (diuji 5 kata x 3 pendengar: 0/5 berhasil), begitu pula aksen 'ê' (0/5).
   Mengeja 'a' akhir jadi 'e' berhasil 3/5 - dan itulah satu-satunya tuas.

   BAHAYANYA nyata: 'ica' -> 'ice' terbaca "aice" (bahasa Inggris), jadi
   kata yang hasil ejaannya bertabrakan dengan kata asing dikecualikan,
   dan tiap klip kruna diperiksa ulang dengan mendengarkannya kembali.
   ================================================================== */
/* Hanya yang TERBUKTI buruk saat didengar ulang yang masuk sini - bukan
   tebakan. Isinya bertambah dari hasil pemeriksaan, bukan dari firasat. */
const JANGAN_EJA_ULANG = new Set([
  'ice'       // 'ica' -> terdengar "aice", bunyi bahasa Inggris
]);

function lafalkan(teks) {
  return teks.replace(/[A-Za-zÀ-ÿ']+/g, (kata) => {
    if (kata.length <= 2 || !/a$/.test(kata)) return kata;
    const baru = kata.slice(0, -1) + 'e';
    return JANGAN_EJA_ULANG.has(baru.toLowerCase()) ? kata : baru;
  });
}

/* ---------- ambil data dari index.html ---------- */
function ambilBlok(src, awal, akhir) {
  const i = src.indexOf(awal);
  if (i < 0) throw new Error('tidak ketemu: ' + awal);
  const j = src.indexOf(akhir, i);
  return src.slice(i + awal.length, j);
}

function bacaData() {
  const src = fs.readFileSync(HTML, 'utf8');
  const quizSrc = ambilBlok(src, 'const quizDatabase = {', '\n  const arDatabaseLinks');
  const pustakaSrc = ambilBlok(src, 'const PUSTAKA = {', '\n  /* Setiap kartu materi');
  const quizDatabase = eval('({' + quizSrc.replace(/;\s*$/, '').replace(/\}\s*$/, '') + '})');
  const PUSTAKA = eval('({' + pustakaSrc.replace(/;\s*$/, '').replace(/\}\s*$/, '') + '})');
  return { quizDatabase, PUSTAKA };
}

/* ---------- daftar pekerjaan ---------- */
function daftarKerja({ quizDatabase, PUSTAKA }) {
  // KOSAKATA DULU. Ini aplikasi literasi kosakata, jadi kalau kuota harian
  // habis di tengah jalan, yang sudah jadi adalah bagian yang paling penting.
  const kerja = [];
  for (const lvl of Object.keys(PUSTAKA)) {
    PUSTAKA[lvl].materi.forEach((m, materiIndex) => {
      m.kata.forEach((k, i) => {
        // sebut krunanya dua kali: sekali biasa, sekali pelan-pelan
        const ucap = lafalkan(k.bali);
        kerja.push({
          file: `kata-${k.au}`,
          teks: `${ucap}. ${ucap}.`,
          asli: k.bali,
          periksa: ucap !== k.bali,          // hanya yang diubah yang perlu didengar ulang
          siapa: i % 2 === 0 ? 'putu' : 'niluh',
          gaya: 'Sebutkan kruna basa Bali ini dengan sangat jelas dan pelan, dua kali, untuk anak SD yang sedang belajar melafalkan'
        });
        kerja.push({
          file: `materi-${lvl}-${materiIndex}-${i}`,
          teks: `${lafalkan(k.bali)}. ${k.arti}`,
          asli: `${k.bali}. ${k.arti}`,
          siapa: i % 2 === 0 ? 'putu' : 'niluh',
          gaya: 'Bacakan istilah dan seluruh penjelasan materi ini dengan pelan, jelas, dan ramah seperti guru SD di Bali. Pertahankan urutan basa Bali lalu terjemahan Indonesia'
        });
      });
    });
  }
  kerja.push({
    file: 'instruksi-cocok-gambar',
    teks: 'Adungang kruna sareng gambar ring samping mangda patut',
    siapa: 'putu',
    gaya: 'Bacakan instruksi permainan basa Bali ini dengan pelan, jelas, dan ramah untuk anak SD'
  });
  kerja.push({
    file: 'instruksi-cecimpedan',
    teks: 'Adungang cecimpedan sareng gambar ring samping mangda patut',
    siapa: 'niluh',
    gaya: 'Bacakan instruksi permainan basa Bali ini dengan pelan, jelas, dan ramah untuk anak SD'
  });
  // baru soal-soal kuis (nilainya lebih rendah: sudah ada teksnya di layar)
  for (const lvl of Object.keys(quizDatabase)) {
    quizDatabase[lvl].forEach((q, i) => {
      if (!q.q) return;                       // lewati soal mencocokkan
      kerja.push({
        file: `soal-${lvl}-${i}`,
        teks: q.q,
        siapa: i % 2 === 0 ? 'putu' : 'niluh',
        // Kalimat TIDAK dieja ulang: diuji pada kalimat utuh, 'ica'->'ice'
        // langsung terbaca "aice". Yang ditambahkan cuma penanda basa Bali --
        // itu terbukti mencegah kata yang mirip kata Indonesia ditarik ke
        // bacaan Indonesia (tanpa penanda, "Sampi" terbaca "sampai").
        gaya: 'Bacakan kalimat BASA BALI ini pelan, jelas, dan ramah seperti guru SD di Bali sedang bertanya kepada muridnya. Ini basa Bali, bukan bahasa Indonesia'
      });
    });
  }
  // buang duplikat nama file
  const unik = new Map();
  for (const k of kerja) if (!unik.has(k.file)) unik.set(k.file, k);
  return [...unik.values()];
}

/* ---------- panggil Gemini TTS ---------- */
/* Satu percobaan lewat SATU jalur (key + model). */
async function cobaJalur(jalur, teks, gaya, voice) {
  const body = {
    contents: [{ parts: [{ text: `${gaya}:\n\n${teks}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
    }
  };
  // fetch() Node tidak punya timeout bawaan -- tanpa ini satu koneksi yang
  // menggantung membuat seluruh proses berhenti diam-diam.
  const r = await fetch(urlModel(jalur.m, jalur.k), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000)
  });
  if (!r.ok) {
    const msg = await r.text();
    const e = new Error(`HTTP ${r.status}`);
    e.status = r.status;
    e.detail = msg.slice(0, 120);
    throw e;
  }
  const d = await r.json();
  const part = d?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error('tidak ada audio di respons');
  return Buffer.from(part.inlineData.data, 'base64');   // PCM s16le 24kHz mono
}

const tidur = ms => new Promise(s => setTimeout(s, ms));

/* Putar semua jalur sampai ada yang berhasil. Jalur yang kena 429/limit
   diistirahatkan (bukan dicoret), lalu boleh dipakai lagi nanti. */
async function tts(teks, gaya, voice) {
  const mulai = Date.now();
  let terakhir;
  while (Date.now() - mulai < 6 * 60 * 1000) {          // maksimal 6 menit per klip
    let adaYangDicoba = false;
    for (let n = 0; n < JALUR.length; n++) {
      const j = JALUR[(jalurBerikut + n) % JALUR.length];
      if (Date.now() < j.istirahat) continue;
      adaYangDicoba = true;
      jalurBerikut = (jalurBerikut + n + 1) % JALUR.length;
      try {
        const pcm = await cobaJalur(j, teks, gaya, voice);
        return { pcm, model: j.m, kunci: j.ki };
      } catch (e) {
        terakhir = e;
        if (e.status === 429) {
          j.istirahat = Date.now() + 65000;              // istirahatkan ~1 menit
          process.stdout.write('.');
        } else if (e.status >= 500 || e.name === 'TimeoutError') {
          j.istirahat = Date.now() + 20000;
          process.stdout.write('x');
        } else {
          throw e;                                       // galat sungguhan
        }
      }
    }
    if (!adaYangDicoba) {                                // semua sedang istirahat
      process.stdout.write('~');
      await tidur(15000);
    }
  }
  const e = terakhir || new Error('semua jalur TTS sibuk');
  e.semuaHabis = true;
  throw e;
}

/* ---------- PCM -> mp3 ---------- */
function keMp3(pcm, tujuan) {
  execFileSync(jalurFfmpeg(), [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', 'pipe:0',
    // buang senyap di awal/akhir, seragamkan volume, mono 48kbps
    '-af', 'silenceremove=start_periods=1:start_silence=0.1:start_threshold=-50dB:' +
           'stop_periods=-1:stop_silence=0.35:stop_threshold=-50dB,loudnorm=I=-16:TP=-1.5:LRA=11',
    '-c:a', 'libmp3lame', '-b:a', '48k', '-ar', '24000', '-ac', '1',
    tujuan
  ], { input: pcm, stdio: ['pipe', 'ignore', 'pipe'] });
}

(async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let kerja = daftarKerja(bacaData());
  const oi = process.argv.indexOf('--only');
  if (oi > -1) {
    const awalan = process.argv[oi + 1] || '';
    kerja = kerja.filter(k => k.file.startsWith(awalan));
  }
  const li = process.argv.indexOf('--limit');
  if (li > -1) kerja = kerja.slice(0, parseInt(process.argv[li + 1], 10) || 3);
  // --diubah: HANYA klip yang ejaannya benar-benar berubah. Membangkitkan ulang
  // klip yang teksnya sama sekali tidak berubah cuma membakar kuota dan berisiko
  // mengubah suara yang sudah disukai.
  if (process.argv.includes('--diubah')) kerja = kerja.filter(k => k.periksa);
  console.log(`${kerja.length} potongan suara -> ${OUT}\n`);
  if (process.argv.includes('--list')) {
    kerja.forEach(k => console.log(`  ${k.file.padEnd(22)} ${k.siapa.padEnd(6)} ${k.teks.slice(0, 60)}`));
    return;
  }

  if (!PAKAI_EDGE && !punyaCloudTTS && !JALUR.length) {
    throw new Error('Tidak ada kredensial TTS. Sediakan .gcp-sa.json, .gemkeys, .gemkey, atau GEMINI_API_KEY.');
  }

  let dibuat = 0, dilewati = 0, gagal = [];
  let cloudMati = false;
  console.log(PAKAI_EDGE
    ? 'jalur: Edge Read Aloud (MP3 langsung, tanpa key)'
    : punyaCloudTTS
      ? 'jalur utama: Google Cloud TTS (service account) -- kuota lapang'
      : `jalur: Gemini API, ${JALUR.length} kombinasi (${KEYS.length} kunci x ${MODEL_TTS.length} model)`);
  for (const k of kerja) {
    const tujuan = path.join(OUT, k.file + '.mp3');
    if (!FORCE && fs.existsSync(tujuan) && fs.statSync(tujuan).size > 800) { dilewati++; continue; }
    process.stdout.write(`${k.file.padEnd(22)} ${k.siapa.padEnd(6)}`);
    try {
      let asal;
      if (PAKAI_EDGE) {
        ttsEdge(k.teks, k.siapa, tujuan);
        asal = 'edge-tts';
      }
      if (!asal && punyaCloudTTS && !cloudMati) {
        // jalur lapang: langsung dapat mp3, tanpa ffmpeg
        try {
          fs.writeFileSync(tujuan, await ttsCloud(k.teks, k.siapa));
          asal = 'cloud-tts';
        } catch (e) {
          console.log(` [cloud-tts gagal: ${e.status || ''} ${(e.detail || e.message).slice(0, 90)}]`);
          cloudMati = true;                          // jangan coba terus-menerus
        }
      }
      if (!asal) {                                   // jatuh ke Gemini
        const { pcm, model, kunci } = await tts(k.teks, k.gaya, SUARA[k.siapa]);
        keMp3(pcm, tujuan);
        asal = `kunci#${kunci} ${model.replace('gemini-', '')}`;
      }
      const kb = (fs.statSync(tujuan).size / 1024).toFixed(0);
      console.log(` ok ${kb} KB  (${asal})`);
      dibuat++;
      await tidur(punyaCloudTTS && !cloudMati ? 60 : 400);   // Cloud jauh lebih longgar
    } catch (e) {
      console.log(` GAGAL ${e.message}`);
      gagal.push(k.file);
      if (e.semuaHabis) {
        console.log(`\n!! Semua ${JALUR.length} jalur (${KEYS.length} kunci x ${MODEL_TTS.length} model) kehabisan kuota.`);
        console.log('   Jalankan lagi `node gen_tts.js` nanti -- sudah resumable, yang jadi tidak diulang.');
        break;
      }
    }
  }
  // daftar file yang benar-benar ada, dibaca game supaya tidak menembak 404
  const ada = fs.readdirSync(OUT).filter(f => f.endsWith('.mp3')).map(f => f.replace(/\.mp3$/, ''));
  fs.writeFileSync(path.join(OUT, 'daftar.json'), JSON.stringify(ada.sort()));
  console.log(`\n${dibuat} dibuat, ${dilewati} dilewati, ${gagal.length} gagal`);
  console.log(`daftar.json: ${ada.length} klip tersedia dari ${kerja.length}`);
  if (gagal.length) console.log('gagal:', gagal.join(', '));
})();
