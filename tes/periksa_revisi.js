#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repo = path.dirname(path.dirname(__filename));
const baca = p => fs.readFileSync(path.join(repo, p), 'utf8');
const harus = (syarat, pesan) => {
  if (!syarat) throw new Error(pesan);
};

const html = baca('index.html');
const sw = baca('sw.js');
const daftarAudio = new Set(JSON.parse(baca('audio/daftar.json')));
const daftarCache = new Function('self', sw + '; return { INTI, SISA };')({ addEventListener() {} });
for (const jalur of new Set([...daftarCache.INTI, ...daftarCache.SISA])) {
  if (jalur === './') continue;
  harus(fs.existsSync(path.join(repo, jalur)), 'aset cache PWA tidak ditemukan: ' + jalur);
}
const berkasAudio = fs.readdirSync(path.join(repo, 'audio'))
  .filter(n => n.endsWith('.mp3'))
  .map(n => n.replace(/\.mp3$/, ''));
harus(berkasAudio.length === daftarAudio.size, 'jumlah MP3 dan manifest audio berbeda');
for (const nama of berkasAudio) {
  harus(daftarAudio.has(nama), 'MP3 belum masuk manifest: ' + nama);
  harus(sw.includes('audio/' + nama + '.mp3'), 'MP3 belum masuk cache PWA: ' + nama);
}

// JavaScript halaman harus tetap bisa diparse setelah perubahan pada monolit HTML.
const blokScript = html.match(/<script>([\s\S]*?)<\/script>/);
harus(blokScript, 'blok JavaScript index.html tidak ditemukan');
new Function(blokScript[1]);

harus(html.includes('ᬮᬾᬦ᭄ᬢᬾᬭ\\u200bᬩᬮᬶ') || html.includes('ᬮᬾᬦ᭄ᬢᬾᬭ​ᬩᬮᬶ'),
  'aksara Bali nama game tidak ditemukan');
harus(html.includes('font/NotoSansBalinese.woff2'), 'font aksara Bali belum dirujuk');
const font = fs.readFileSync(path.join(repo, 'font', 'NotoSansBalinese.woff2'));
harus(font.subarray(0, 4).toString('ascii') === 'wOF2', 'font lokal bukan WOFF2 yang valid');

harus(html.includes("{ 1: 'parahyangan', 2: 'pawongan', 3: 'palemahan' }"),
  'pemetaan ikon level berubah atau tidak ditemukan');
for (const nama of ['parahyangan', 'pawongan', 'palemahan']) {
  harus(fs.existsSync(path.join(repo, 'foto', 'level', nama + '.webp')), 'aset ikon hilang: ' + nama);
}

for (const label of ['Pilih Level', 'Mulai Bermain']) {
  harus(html.includes('aria-label="' + label + '"'), 'label tombol beranda hilang: ' + label);
  harus(html.includes('>' + label + '</span>'), 'keterangan terlihat hilang: ' + label);
}

harus(html.includes('id="image-lightbox"'), 'lightbox gambar soal belum ada');
harus(html.includes('function bukaPembesarGambar()'), 'fungsi pembuka lightbox belum ada');
harus(html.includes('timerDitundaOlehZoom'), 'kontrak jeda timer saat zoom belum ada');
harus((html.match(/bukaPembesarGambar\(/g) || []).length === 2,
  'zoom harus terbatas pada tombol gambar soal utama');

harus(html.includes('const DAFTAR_PUSTAKA = ['), 'data Daftar Pustaka belum ada');
harus(html.includes('Kosa Basa.docx') && html.includes('Bank Soal Lentera Bali'),
  'sumber internal belum lengkap');
harus(html.includes("pilihLevelPustaka(\\'kredit\\')") && html.includes("pilihLevelPustaka(\\'daftar-pustaka\\')"),
  'Sumber Foto dan Daftar Pustaka harus menjadi menu terpisah');

harus(html.includes('function ucapkanMateri('), 'pembacaan materi belum tersedia');
harus(html.includes('function ucapkanInstruksi()'), 'pembacaan instruksi belum tersedia');
harus(html.includes('VOLUME_MUSIK_NARASI = 0.18'), 'penurunan volume musik saat narasi belum ada');

const audioMateri = [];
const jumlah = {
  1: [4, 3, 3],
  2: [4, 3, 4],
  3: [4, 3, 4]
};
for (const [level, materi] of Object.entries(jumlah)) {
  materi.forEach((banyak, mi) => {
    for (let ki = 0; ki < banyak; ki++) audioMateri.push(`materi-${level}-${mi}-${ki}`);
  });
}
audioMateri.push('instruksi-cocok-gambar', 'instruksi-cecimpedan');
for (const nama of audioMateri) {
  harus(sw.includes('audio/' + nama + '.mp3'), 'cache PWA belum memuat ' + nama);
}
harus(sw.includes("const VERSI = 'v2'"), 'versi cache PWA belum dinaikkan');

const belumAda = audioMateri.filter(n => !daftarAudio.has(n) ||
  !fs.existsSync(path.join(repo, 'audio', n + '.mp3')));
if (process.argv.includes('--require-audio')) {
  harus(!belumAda.length, 'audio baru belum lengkap: ' + belumAda.join(', '));
  for (const nama of audioMateri) {
    const mp3 = fs.readFileSync(path.join(repo, 'audio', nama + '.mp3'));
    const berheaderId3 = mp3.subarray(0, 3).toString('ascii') === 'ID3';
    const berheaderFrame = mp3[0] === 0xff && (mp3[1] & 0xe0) === 0xe0;
    harus(mp3.length > 800 && (berheaderId3 || berheaderFrame), 'MP3 tidak valid: ' + nama);
  }
}

console.log('Pemeriksaan revisi lulus.');
console.log('Audio baru tersedia:', audioMateri.length - belumAda.length + '/' + audioMateri.length);
if (belumAda.length) console.log('Audio menunggu proses TTS:', belumAda.length);
