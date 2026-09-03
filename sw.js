/* Service worker Lentera Bali — supaya game bisa dipasang di HP dan dibuka
 * TANPA SINYAL. Di sekolah, sinyal itu yang paling sering tidak ada.
 *
 * Dua lapis, sengaja:
 *   INTI  dipasang saat install — cukup untuk membuka game dan
 *         bermain; anak tidak menunggu belasan MB sebelum bisa mulai.
 *   SISA  (foto soal, suara soal/materi, musik latar) diisi DI LATAR BELAKANG sesudah
 *         game terbuka, satu per satu, supaya tidak membekukan HP kentang.
 *
 * index.html dilayani JARINGAN DULU: kalau tidak, anak akan terus memakai versi
 * lama walau gurunya sudah menerima perbaikan.
 */
const VERSI = 'v2';
const NAMA = 'lentera-bali-' + VERSI;

const INTI = ["./","index.html","manifest.json","foto/logo-lentera-bali.webp","foto/bg-utama.jpg","foto/bg-peta.jpg","foto/bg-kuis.jpg","ikon/ikon-192.png","ikon/ikon-512.png","ikon/ikon-192-maskable.png","ikon/ikon-512-maskable.png","benar.mp3","salah.mp3","selamatdatang.mp3","foto/level/palemahan.webp","foto/level/parahyangan.webp","foto/level/pawongan.webp","karakter/niluh-badan.png","karakter/niluh-kelopak0.png","karakter/niluh-kelopak1.png","karakter/niluh-kepala.png","karakter/niluh-lentera.png","karakter/putu-badan.png","karakter/putu-kelopak0.png","karakter/putu-kelopak1.png","karakter/putu-kepala.png","karakter/putu-lentera.png"];
const SISA = ["foto/aksara/cocok1.jpg","foto/aksara/cocok2.jpg","foto/aksara/cocok3.jpg","foto/aksara/cocok4.jpg","foto/aksara/cocok5.jpg","foto/aksara/soal1.jpg","foto/aksara/soal2.jpg","foto/aksara/soal3.jpg","foto/aksara/soal4.jpg","foto/aksara/soal5.jpg","foto/banten.jpg","foto/canang.jpg","foto/galeng.jpg","foto/keluarga.jpg","foto/klepon.jpg","foto/kran-air.jpg","foto/lontar.jpg","foto/luu-tukad.jpg","foto/matan-ai.jpg","foto/mebakti.jpg","foto/melasti.jpg","foto/nanem-entik.jpg","foto/nyiram.jpg","foto/padmasana.jpg","foto/pajeng.jpg","foto/pura-besakih.jpg","foto/pura-tanah-lot.jpg","foto/pura.jpg","foto/s01-pura.jpg","foto/s02-sang-hyang-widhi.jpg","foto/s04-alam-manusa-ciptaan.jpg","foto/s05-lontar-buku.jpg","foto/s08-ngejot-saiban.jpg","foto/s11-pura-besakih.jpg","foto/s12-penjor.jpg","foto/s15-pura-tanah-lot.jpg","foto/s16-adung-tolong.jpg","foto/s17-becik-ngayah.jpg","foto/s19-dokter-ngubadin-anak-gelem.jpg","foto/s20-alus-sopan-guru.jpg","foto/s21-gotong-royong-kelas.jpg","foto/s22-guru-ngajahin.jpg","foto/s23-mayus.jpg","foto/s25-melah-tresna-asih.jpg","foto/s30-kuping-telinga-anak.jpg","foto/s32-tong-sampah.jpg","foto/s33-seger-bersih.jpg","foto/s35-ngematiang-kran.jpg","foto/s36-prabeya-hemat.jpg","foto/s38-sayang-ubuhan.jpg","foto/sampat.jpg","foto/sampi.jpg","foto/subak.jpg","foto/timpal.jpg","foto/traktor-sawah.jpg","foto/tukad.jpg","audio/kata-banten.mp3","audio/kata-basa-alus.mp3","audio/kata-canang.mp3","audio/kata-dokter.mp3","audio/kata-galeng.mp3","audio/kata-gotong-royong.mp3","audio/kata-guru.mp3","audio/kata-kamen.mp3","audio/kata-kebaya.mp3","audio/kata-klepon.mp3","audio/kata-kuping.mp3","audio/kata-lawar.mp3","audio/kata-lontar.mp3","audio/kata-luu.mp3","audio/kata-matan-ai.mp3","audio/kata-mebakti.mp3","audio/kata-melasti.mp3","audio/kata-nanem.mp3","audio/kata-ngejot.mp3","audio/kata-nyampat.mp3","audio/kata-nyepi.mp3","audio/kata-ogoh-ogoh.mp3","audio/kata-padmasana.mp3","audio/kata-pajeng.mp3","audio/kata-penjor.mp3","audio/kata-prabeya.mp3","audio/kata-pura-besakih.mp3","audio/kata-pura-tanah-lot.mp3","audio/kata-pura.mp3","audio/kata-rerama.mp3","audio/kata-saling-tulungin.mp3","audio/kata-sampi.mp3","audio/kata-saraswati.mp3","audio/kata-sate-lilit.mp3","audio/kata-siam.mp3","audio/kata-subak.mp3","audio/kata-tong-sampah.mp3","audio/kata-traktor.mp3","audio/kata-tresna-asih.mp3","audio/kata-tukad.mp3","audio/kata-udeng.mp3","audio/kata-yeh.mp3","audio/soal-1-0.mp3","audio/soal-1-1.mp3","audio/soal-1-2.mp3","audio/soal-1-3.mp3","audio/soal-1-4.mp3","audio/soal-1-5.mp3","audio/soal-1-6.mp3","audio/soal-1-7.mp3","audio/soal-1-8.mp3","audio/soal-1-9.mp3","audio/soal-2-0.mp3","audio/soal-2-1.mp3","audio/soal-2-2.mp3","audio/soal-2-3.mp3","audio/soal-2-4.mp3","audio/soal-2-5.mp3","audio/soal-2-6.mp3","audio/soal-2-7.mp3","audio/soal-2-8.mp3","audio/soal-2-9.mp3","audio/soal-3-0.mp3","audio/soal-3-1.mp3","audio/soal-3-2.mp3","audio/soal-3-3.mp3","audio/soal-3-4.mp3","audio/soal-3-5.mp3","audio/soal-3-6.mp3","audio/soal-3-7.mp3","audio/soal-3-8.mp3","audio/soal-3-9.mp3","backsound.mp3"];

INTI.push('font/NotoSansBalinese.woff2');
SISA.push(
  'audio/materi-1-0-0.mp3', 'audio/materi-1-0-1.mp3', 'audio/materi-1-0-2.mp3', 'audio/materi-1-0-3.mp3',
  'audio/materi-1-1-0.mp3', 'audio/materi-1-1-1.mp3', 'audio/materi-1-1-2.mp3',
  'audio/materi-1-2-0.mp3', 'audio/materi-1-2-1.mp3', 'audio/materi-1-2-2.mp3',
  'audio/materi-2-0-0.mp3', 'audio/materi-2-0-1.mp3', 'audio/materi-2-0-2.mp3', 'audio/materi-2-0-3.mp3',
  'audio/materi-2-1-0.mp3', 'audio/materi-2-1-1.mp3', 'audio/materi-2-1-2.mp3',
  'audio/materi-2-2-0.mp3', 'audio/materi-2-2-1.mp3', 'audio/materi-2-2-2.mp3', 'audio/materi-2-2-3.mp3',
  'audio/materi-3-0-0.mp3', 'audio/materi-3-0-1.mp3', 'audio/materi-3-0-2.mp3', 'audio/materi-3-0-3.mp3',
  'audio/materi-3-1-0.mp3', 'audio/materi-3-1-1.mp3', 'audio/materi-3-1-2.mp3',
  'audio/materi-3-2-0.mp3', 'audio/materi-3-2-1.mp3', 'audio/materi-3-2-2.mp3', 'audio/materi-3-2-3.mp3',
  'audio/instruksi-cocok-gambar.mp3', 'audio/instruksi-cecimpedan.mp3'
);

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(NAMA).then(function (c) { return c.addAll(INTI); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (kunci) {
      return Promise.all(kunci.map(function (k) {
        return k.startsWith('lentera-bali-') && k !== NAMA ? caches.delete(k) : null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // biarkan permintaan luar apa adanya

  // Halaman: jaringan dulu, simpanan sebagai cadangan bila tidak ada sinyal.
  if (req.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(req).then(function (r) {
        if (r && r.status === 200) {
          const salin = r.clone();
          caches.open(NAMA).then(function (c) { c.put(req, salin); });
        }
        return r;
      }).catch(function () {
        return caches.match(req).then(function (c) { 
          return c || caches.match('./') || caches.match('index.html'); 
        });
      })
    );
    return;
  }

  // Aset: simpanan dulu (cepat dan hemat kuota), jaringan bila belum ada.
  e.respondWith(
    caches.match(req).then(function (c) {
      if (c) return c;
      return fetch(req).then(function (r) {
        if (r && r.status === 200) {
          const salin = r.clone();
          caches.open(NAMA).then(function (ch) { ch.put(req, salin); });
        }
        return r;
      });
    })
  );
});

/* Isi sisanya pelan-pelan. Dipanggil halaman lewat postMessage, bukan saat
 * install: kalau semuanya diunduh saat install, pemasangan gagal di sinyal
 * lambat dan anak tidak dapat apa-apa. */
self.addEventListener('message', function (e) {
  if (!e.data || e.data.perintah !== 'isi-sisa') return;
  e.waitUntil((async function () {
    const c = await caches.open(NAMA);
    let jadi = 0;
    for (const jalur of SISA) {
      try {
        if (await c.match(jalur)) { jadi++; continue; }
        const r = await fetch(jalur, { cache: 'no-cache' });
        if (r && r.status === 200) {
          await c.put(jalur, r);
          jadi++;
        }
      } catch (err) { /* satu berkas gagal tidak boleh menghentikan sisanya */ }
      if (jadi > 0 && jadi % 10 === 0) await new Promise(function (s) { setTimeout(s, 60); });
    }
    const semua = await self.clients.matchAll();
    semua.forEach(function (k) { k.postMessage({ kabar: 'sisa-selesai', jumlah: jadi }); });
  })());
});