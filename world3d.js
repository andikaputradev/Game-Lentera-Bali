/* ================================================================
   DUNIA BUDAYA 3D - Mode petualangan 360 derajat Lentera Bali
   Pemain memutar badan/HP (sensor gyro) atau menggeser layar untuk
   mencari benda budaya 3D di sekelilingnya, menyentuhnya, lalu
   membaca Kartu Pusaka berisi nama & fakta seru.
   Dibangun dengan Three.js (three.min.js) tanpa aset model eksternal.
   ================================================================ */

// ----------------------------------------------------------------
// DATABASE BENDA 3D: nama Bali, arti, fakta seru, foto, & perakit 3D
// ----------------------------------------------------------------
const WORLD3D_DB = {
  1: [ // PARAHYANGAN
    { nama: "Pura Besakih", arti: "Pura terbesar di Bali", emoji: "🛕", foto: "cocokparah1.png",
      fakta: "Pura Besakih dijuluki 'Ibu dari semua Pura' dan berdiri megah di lereng Gunung Agung, gunung tertinggi di Bali!",
      builder: "puraBesakih" },
    { nama: "Canang", arti: "Persembahan bunga harian", emoji: "🌺", foto: "cocokparah2.png",
      fakta: "Warna-warni bunga pada canang punya makna arah mata angin, dan dibuat setiap hari dengan penuh kasih sayang.",
      builder: "canang" },
    { nama: "Penjor", arti: "Hiasan bambu hari Galungan", emoji: "🎋", foto: "cocokparah3.png",
      fakta: "Lengkungan penjor melambangkan Gunung Agung sekaligus ekor Naga Basuki, simbol kemakmuran!",
      builder: "penjor" },
    { nama: "Pura Tanah Lot", arti: "Pura di atas batu karang laut", emoji: "🌊", foto: "cocokparah4.png",
      fakta: "Saat air laut pasang, Pura Tanah Lot terlihat seperti mengapung di tengah lautan. Keren, kan?",
      builder: "tanahLot" },
    { nama: "Mebakti", arti: "Sembahyang / berdoa", emoji: "🙏", foto: "cocokparah5.png",
      fakta: "Saat mebakti, tangan dicakupkan di depan dahi sebagai tanda hormat kepada Sang Hyang Widhi Wasa.",
      builder: "mebakti" }
  ],
  2: [ // PAWONGAN
    { nama: "Pajeng", arti: "Payung upacara", emoji: "☂️", foto: "cocokpawo1.png",
      fakta: "Pajeng putih-kuning menandakan tempat yang disucikan. Payung ini setia memayungi upacara adat Bali!",
      builder: "pajeng" },
    { nama: "Galeng", arti: "Bantal", emoji: "😴", foto: "cocokpawo2.png",
      fakta: "Galeng artinya bantal dalam Bahasa Bali. Tidur yang cukup membuat kita kuat belajar dan bermain!",
      builder: "galeng" },
    { nama: "Klepon", arti: "Jajan bola hijau isi gula", emoji: "🍡", foto: "cocokpawo3.jpeg",
      fakta: "Klepon meletus manis di mulut karena berisi gula merah cair! Jajan ini sering hadir dalam sesajen.",
      builder: "klepon" },
    { nama: "Matan Ai", arti: "Matahari", emoji: "☀️", foto: "cocokpawo4.jpg",
      fakta: "Matan Ai artinya 'mata hari'. Petani Subak memakai matahari sebagai penunjuk waktu mengatur sawah!",
      builder: "matanAi" },
    { nama: "Kuping", arti: "Telinga", emoji: "👂", foto: "cocokpawo5.jpg",
      fakta: "Dengan kuping kita mendengarkan pitutur (nasihat) orang tua dan guru. Pendengar yang baik adalah teman yang baik!",
      builder: "kuping" }
  ],
  3: [ // PALEMAHAN
    { nama: "Bulan", arti: "Bulan di langit malam", emoji: "🌕", foto: "cocokpaleh1.png",
      fakta: "Malam bulan purnama adalah hari suci di Bali. Banyak upacara digelar saat bulan bundar sempurna!",
      builder: "bulan" },
    { nama: "Bintang", arti: "Bintang di angkasa", emoji: "✨", foto: "cocokpaleh2.png",
      fakta: "Zaman dahulu, nelayan dan petani Bali membaca bintang untuk menentukan arah dan musim tanam.",
      builder: "bintang" },
    { nama: "Sampi", arti: "Sapi", emoji: "🐄", foto: "cocokpaleh3.png",
      fakta: "Sampi membantu petani membajak sawah. Di Bali bahkan ada lomba lari sapi seru bernama Makepung!",
      builder: "sampi" },
    { nama: "Sampat", arti: "Sapu lidi", emoji: "🧹", foto: "cocokpaleh4.png",
      fakta: "Sampat dibuat dari tulang daun kelapa. Alat sederhana ini jagoan gotong royong menjaga kebersihan!",
      builder: "sampat" },
    { nama: "Matan Ai Engseb", arti: "Matahari terbenam", emoji: "🌅", foto: "cocokpaleh5.png",
      fakta: "Saat matan ai engseb, langit berubah keemasan menandai sandikala - waktunya anak-anak pulang ke rumah.",
      builder: "matanAiEngseb" }
  ]
};

const W3D_PUJIAN = ["KEREN! 🔥", "HEBAT! ⭐", "MANTAP! 🎉", "LUAR BIASA! ⚡", "JENIUS BUDAYA! 🧠✨", "SUPER! 🌟"];

// ----------------------------------------------------------------
// STATE INTERNAL
// ----------------------------------------------------------------
let w3d = null; // seluruh state sesi 3D aktif disimpan di sini

// ----------------------------------------------------------------
// PERKAKAS KECIL PEMBANGUN 3D
// ----------------------------------------------------------------
function w3dMat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.75, metalness: 0.05 }, opts || {}));
}
function w3dMesh(geo, material, x, y, z) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// ----------------------------------------------------------------
// PABRIK OBJEK 3D LOW-POLY (satu fungsi per benda budaya)
// Semua objek dirakit dari bentuk dasar agar ringan & bebas lisensi
// ----------------------------------------------------------------
const W3D_BUILDERS = {

  puraBesakih() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.BoxGeometry(2.2, 0.3, 2.2), w3dMat(0x8a8a80), 0, 0.15, 0));       // pelataran batu
    g.add(w3dMesh(new THREE.BoxGeometry(1.5, 0.25, 1.5), w3dMat(0x9a9a90), 0, 0.42, 0));      // undakan
    g.add(w3dMesh(new THREE.BoxGeometry(1.1, 0.7, 1.1), w3dMat(0x8d5524), 0, 0.9, 0));        // badan pura bata
    // Atap meru bertingkat (ciri khas pura)
    const atap = w3dMat(0x2e2a26);
    const tingkat = [ [1.35, 1.45], [1.05, 1.95], [0.75, 2.4], [0.45, 2.8] ];
    tingkat.forEach(t => {
      const c = w3dMesh(new THREE.ConeGeometry(t[0], 0.45, 4), atap, 0, t[1], 0);
      c.rotation.y = Math.PI / 4;
      g.add(c);
      g.add(w3dMesh(new THREE.BoxGeometry(0.32, 0.18, 0.32), w3dMat(0xc9a227), 0, t[1] + 0.24, 0)); // sela emas
    });
    g.add(w3dMesh(new THREE.SphereGeometry(0.12, 10, 10), w3dMat(0xffd700, { emissive: 0xaa8800 }), 0, 3.1, 0)); // puncak emas
    return g;
  },

  canang() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.BoxGeometry(1.6, 0.16, 1.6), w3dMat(0xd9b38c), 0, 0.3, 0));       // wadah janur
    g.add(w3dMesh(new THREE.BoxGeometry(1.66, 0.1, 0.12), w3dMat(0xbf9067), 0, 0.4, 0.78));   // bibir wadah
    g.add(w3dMesh(new THREE.BoxGeometry(1.66, 0.1, 0.12), w3dMat(0xbf9067), 0, 0.4, -0.78));
    g.add(w3dMesh(new THREE.BoxGeometry(0.12, 0.1, 1.66), w3dMat(0xbf9067), 0.78, 0.4, 0));
    g.add(w3dMesh(new THREE.BoxGeometry(0.12, 0.1, 1.66), w3dMat(0xbf9067), -0.78, 0.4, 0));
    g.add(w3dMesh(new THREE.CylinderGeometry(0.68, 0.68, 0.05, 16), w3dMat(0x3f7d3a), 0, 0.42, 0)); // alas daun
    // Taburan bunga warna-warni (tiap warna punya makna arah)
    const warna = [0xe63946, 0xffffff, 0xffd166, 0x9b5de5, 0xff70a6, 0xe63946, 0xffffff, 0xffd166, 0xff9770];
    warna.forEach((w, i) => {
      const sudut = (i / warna.length) * Math.PI * 2;
      const r = i % 2 === 0 ? 0.45 : 0.25;
      g.add(w3dMesh(new THREE.SphereGeometry(0.13, 8, 8), w3dMat(w), Math.cos(sudut) * r, 0.52, Math.sin(sudut) * r));
    });
    g.add(w3dMesh(new THREE.SphereGeometry(0.16, 8, 8), w3dMat(0xffffff), 0, 0.56, 0)); // jepun tengah
    return g;
  },

  penjor() {
    const g = new THREE.Group();
    // Batang bambu melengkung (lengkungan = Gunung Agung)
    const jalur = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.85, 0, 0), new THREE.Vector3(-0.85, 1.4, 0),
      new THREE.Vector3(-0.5, 2.5, 0), new THREE.Vector3(0.5, 3.05, 0), new THREE.Vector3(1.5, 2.55, 0)
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(jalur, 24, 0.07, 8, false), w3dMat(0x9aa84f)));
    // Hiasan janur menggantung di sepanjang lengkung
    for (let i = 0; i <= 6; i++) {
      const p = jalur.getPoint(0.45 + (i / 6) * 0.55);
      const j = w3dMesh(new THREE.ConeGeometry(0.09, 0.5, 6), w3dMat(0xd9e650, { emissive: 0x333d00 }), p.x, p.y - 0.3, p.z);
      j.rotation.x = Math.PI;
      g.add(j);
    }
    // Sampian ujung (hiasan gantung besar)
    const ujung = jalur.getPoint(1);
    const s = w3dMesh(new THREE.OctahedronGeometry(0.22), w3dMat(0xf2e394), ujung.x, ujung.y - 0.6, ujung.z);
    s.scale.y = 1.7;
    g.add(s);
    // Sanggah kecil di kaki penjor
    g.add(w3dMesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), w3dMat(0xf5f5f0), -0.15, 0.35, 0));
    const a = w3dMesh(new THREE.ConeGeometry(0.34, 0.28, 4), w3dMat(0x2e2a26), -0.15, 0.7, 0);
    a.rotation.y = Math.PI / 4;
    g.add(a);
    return g;
  },

  tanahLot() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.CylinderGeometry(1.9, 1.9, 0.18, 24), w3dMat(0x2d7dd2, { transparent: true, opacity: 0.85 }), 0, 0.09, 0)); // laut
    const karang = w3dMesh(new THREE.DodecahedronGeometry(0.85), w3dMat(0x5a4a42), 0, 0.75, 0); // batu karang
    karang.scale.set(1.15, 0.95, 1);
    g.add(karang);
    const buih = w3dMesh(new THREE.TorusGeometry(1.0, 0.06, 8, 24), w3dMat(0xffffff, { transparent: true, opacity: 0.7 }), 0, 0.19, 0); // buih ombak
    buih.rotation.x = Math.PI / 2;
    g.add(buih);
    g.add(w3dMesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), w3dMat(0x6b5b4f), 0, 1.85, 0));    // badan pura di puncak karang
    const t1 = w3dMesh(new THREE.ConeGeometry(0.5, 0.35, 4), w3dMat(0x2e2a26), 0, 2.25, 0); t1.rotation.y = Math.PI / 4; g.add(t1);
    const t2 = w3dMesh(new THREE.ConeGeometry(0.32, 0.3, 4), w3dMat(0x2e2a26), 0, 2.55, 0); t2.rotation.y = Math.PI / 4; g.add(t2);
    return g;
  },

  mebakti() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 16), w3dMat(0xd9b38c), 0, 0.04, 0)); // tikar
    g.add(w3dMesh(new THREE.ConeGeometry(0.55, 1.0, 12), w3dMat(0xf5f5f0), 0, 0.55, 0));      // badan berkamen putih
    g.add(w3dMesh(new THREE.SphereGeometry(0.3, 12, 12), w3dMat(0xe8b88a), 0, 1.3, 0));       // kepala
    g.add(w3dMesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), w3dMat(0xffffff), 0, 1.52, 0));      // udeng
    // Tangan mencakup di depan dahi (sikap sembahyang)
    const l1 = w3dMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8), w3dMat(0xe8b88a), -0.2, 1.1, 0.3);
    l1.rotation.z = 0.5; l1.rotation.x = -0.7; g.add(l1);
    const l2 = w3dMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8), w3dMat(0xe8b88a), 0.2, 1.1, 0.3);
    l2.rotation.z = -0.5; l2.rotation.x = -0.7; g.add(l2);
    g.add(w3dMesh(new THREE.BoxGeometry(0.12, 0.26, 0.1), w3dMat(0xe8b88a), 0, 1.42, 0.42));  // ujung jari tercakup
    g.add(w3dMesh(new THREE.SphereGeometry(0.06, 8, 8), w3dMat(0xffffff), 0.3, 1.42, 0.12));  // bunga jepun di telinga
    return g;
  },

  pajeng() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), w3dMat(0xcaa54a, { metalness: 0.4 }), 0, 1.2, 0)); // tiang emas
    g.add(w3dMesh(new THREE.ConeGeometry(1.15, 0.72, 20), w3dMat(0xc0392b), 0, 2.15, 0));     // kanopi merah
    g.add(w3dMesh(new THREE.CylinderGeometry(1.15, 1.15, 0.22, 20, 1, true), w3dMat(0x8e2620, { side: THREE.DoubleSide }), 0, 1.72, 0)); // rumbai
    const lisEmas = w3dMesh(new THREE.TorusGeometry(1.14, 0.035, 8, 24), w3dMat(0xffd700, { metalness: 0.5 }), 0, 1.8, 0); // lis emas tepi kanopi
    lisEmas.rotation.x = Math.PI / 2;
    g.add(lisEmas);
    g.add(w3dMesh(new THREE.SphereGeometry(0.11, 10, 10), w3dMat(0xffd700, { emissive: 0x7a5c00 }), 0, 2.6, 0)); // kuncup puncak
    g.add(w3dMesh(new THREE.CylinderGeometry(0.28, 0.36, 0.18, 12), w3dMat(0x6b4b2a), 0, 0.09, 0)); // dudukan
    return g;
  },

  galeng() {
    const g = new THREE.Group();
    const badan = w3dMesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 20), w3dMat(0x7fb3d5), 0, 0.62, 0);
    badan.rotation.z = Math.PI / 2;
    g.add(badan);
    g.add(w3dMesh(new THREE.SphereGeometry(0.5, 16, 16), w3dMat(0x7fb3d5), -0.75, 0.62, 0));  // ujung bulat kiri
    g.add(w3dMesh(new THREE.SphereGeometry(0.5, 16, 16), w3dMat(0x7fb3d5), 0.75, 0.62, 0));   // ujung bulat kanan
    const s1 = w3dMesh(new THREE.CylinderGeometry(0.51, 0.51, 0.16, 20), w3dMat(0xffffff), -0.35, 0.62, 0); s1.rotation.z = Math.PI / 2; g.add(s1); // strip putih
    const s2 = w3dMesh(new THREE.CylinderGeometry(0.51, 0.51, 0.16, 20), w3dMat(0xffffff), 0.35, 0.62, 0); s2.rotation.z = Math.PI / 2; g.add(s2);
    g.add(w3dMesh(new THREE.SphereGeometry(0.12, 8, 8), w3dMat(0xffd166), -1.22, 0.62, 0));   // kuncir
    g.add(w3dMesh(new THREE.SphereGeometry(0.12, 8, 8), w3dMat(0xffd166), 1.22, 0.62, 0));
    return g;
  },

  klepon() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.CylinderGeometry(1.05, 1.15, 0.12, 20), w3dMat(0xf2f2f2), 0, 0.06, 0)); // piring
    g.add(w3dMesh(new THREE.CylinderGeometry(0.88, 0.88, 0.04, 20), w3dMat(0x3f7d3a), 0, 0.14, 0)); // alas daun pisang
    const posisi = [ [0, 0.42, 0], [-0.45, 0.42, 0.2], [0.45, 0.42, 0.2], [0, 0.42, -0.48], [-0.05, 0.95, -0.05] ];
    posisi.forEach(p => {
      g.add(w3dMesh(new THREE.SphereGeometry(0.3, 12, 12), w3dMat(0x4caf50), p[0], p[1], p[2])); // bola klepon pandan
      for (let i = 0; i < 7; i++) { // taburan kelapa parut
        const a = Math.random() * Math.PI * 2, r = Math.random() * 0.24;
        g.add(w3dMesh(new THREE.SphereGeometry(0.035, 5, 5), w3dMat(0xffffff),
          p[0] + Math.cos(a) * r, p[1] + 0.26, p[2] + Math.sin(a) * r));
      }
    });
    return g;
  },

  matanAi() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.SphereGeometry(0.75, 20, 20), w3dMat(0xffb703, { emissive: 0xff8800, emissiveIntensity: 0.6 }), 0, 1.1, 0)); // bola surya
    for (let i = 0; i < 10; i++) { // sinar mentari
      const a = (i / 10) * Math.PI * 2;
      const ray = w3dMesh(new THREE.ConeGeometry(0.1, 0.5, 6), w3dMat(0xff9500, { emissive: 0xcc5500 }),
        Math.cos(a) * 1.05, 1.1 + Math.sin(a) * 1.05, 0);
      ray.rotation.z = a - Math.PI / 2;
      g.add(ray);
    }
    // Wajah ceria (anak-anak suka!)
    g.add(w3dMesh(new THREE.SphereGeometry(0.07, 8, 8), w3dMat(0x33261a), -0.25, 1.28, 0.68));
    g.add(w3dMesh(new THREE.SphereGeometry(0.07, 8, 8), w3dMat(0x33261a), 0.25, 1.28, 0.68));
    const senyum = w3dMesh(new THREE.TorusGeometry(0.26, 0.045, 8, 16, Math.PI * 0.8), w3dMat(0x33261a), 0, 0.98, 0.66);
    senyum.rotation.z = Math.PI + 0.35;
    g.add(senyum);
    return g;
  },

  kuping() {
    const g = new THREE.Group();
    const dasar = w3dMesh(new THREE.SphereGeometry(0.8, 16, 16), w3dMat(0xf0c8a0), 0, 1.0, -0.15);
    dasar.scale.set(0.85, 1.0, 0.35); // pipi sebagai latar
    g.add(dasar);
    const luar = w3dMesh(new THREE.TorusGeometry(0.52, 0.16, 10, 20, Math.PI), w3dMat(0xe8b88a), 0, 1.1, 0.1);
    luar.rotation.z = Math.PI / 2; // daun telinga luar
    g.add(luar);
    const dalam = w3dMesh(new THREE.TorusGeometry(0.28, 0.09, 8, 16, Math.PI), w3dMat(0xd9a06e), 0, 1.05, 0.16);
    dalam.rotation.z = Math.PI / 2; // lekuk dalam
    g.add(dalam);
    g.add(w3dMesh(new THREE.SphereGeometry(0.2, 10, 10), w3dMat(0xe8b88a), 0, 0.52, 0.1)); // cuping
    const anting = w3dMesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), w3dMat(0xffd700, { metalness: 0.6 }), 0, 0.32, 0.1);
    g.add(anting); // anting emas biar jelas ini telinga!
    return g;
  },

  bulan() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.SphereGeometry(0.85, 20, 20), w3dMat(0xcfd8e6, { emissive: 0x8fa8d0, emissiveIntensity: 0.45 }), 0, 1.1, 0)); // purnama
    const kawah = [ [-0.3, 1.35, 0.62, 0.16], [0.3, 1.1, 0.72, 0.12], [-0.1, 0.75, 0.68, 0.1], [0.45, 1.45, 0.5, 0.09] ];
    kawah.forEach(k => {
      const c = w3dMesh(new THREE.SphereGeometry(k[3], 8, 8), w3dMat(0xa8b4c8), k[0], k[1], k[2]);
      c.scale.z = 0.4;
      g.add(c);
    });
    const halo = w3dMesh(new THREE.TorusGeometry(1.1, 0.03, 8, 32), w3dMat(0xdbe6ff, { transparent: true, opacity: 0.5, emissive: 0x99aaff }), 0, 1.1, 0);
    g.add(halo); // lingkar cahaya
    return g;
  },

  bintang() {
    const g = new THREE.Group();
    // Bentuk bintang 5 sudut digambar 2D lalu diberi ketebalan
    const bentuk = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.85 : 0.38;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) bentuk.moveTo(x, y); else bentuk.lineTo(x, y);
    }
    bentuk.closePath();
    const geo = new THREE.ExtrudeGeometry(bentuk, { depth: 0.28, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 });
    const inti = new THREE.Mesh(geo, w3dMat(0xffd700, { emissive: 0xbb8800, emissiveIntensity: 0.7, metalness: 0.35 }));
    inti.position.set(0, 1.15, -0.14);
    g.add(inti);
    // Kerlip kecil di sekitar
    [[-1.0, 1.9, 0.2, 0.09], [1.05, 0.6, -0.1, 0.07], [0.9, 1.9, 0.1, 0.06]].forEach(k => {
      g.add(w3dMesh(new THREE.OctahedronGeometry(k[3]), w3dMat(0xfff3b0, { emissive: 0xddaa33 }), k[0], k[1], k[2]));
    });
    return g;
  },

  sampi() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.CylinderGeometry(1.3, 1.3, 0.1, 20), w3dMat(0x6fae5c), 0, 0.05, 0)); // rumput
    g.add(w3dMesh(new THREE.BoxGeometry(1.4, 0.75, 0.7), w3dMat(0xa0522d), 0, 0.95, 0));      // badan
    g.add(w3dMesh(new THREE.BoxGeometry(0.5, 0.5, 0.45), w3dMat(0xb5651d), 0.85, 1.25, 0));   // kepala
    g.add(w3dMesh(new THREE.BoxGeometry(0.2, 0.16, 0.3), w3dMat(0xe8c8b0), 1.12, 1.1, 0));    // moncong
    g.add(w3dMesh(new THREE.SphereGeometry(0.05, 6, 6), w3dMat(0x1a1a1a), 1.02, 1.38, 0.16)); // mata
    g.add(w3dMesh(new THREE.SphereGeometry(0.05, 6, 6), w3dMat(0x1a1a1a), 1.02, 1.38, -0.16));
    const t1 = w3dMesh(new THREE.ConeGeometry(0.05, 0.3, 6), w3dMat(0xf2e9d8), 0.85, 1.6, 0.18); t1.rotation.z = -0.4; g.add(t1); // tanduk
    const t2 = w3dMesh(new THREE.ConeGeometry(0.05, 0.3, 6), w3dMat(0xf2e9d8), 0.85, 1.6, -0.18); t2.rotation.z = -0.4; g.add(t2);
    g.add(w3dMesh(new THREE.BoxGeometry(0.16, 0.1, 0.24), w3dMat(0xb5651d), 0.78, 1.5, 0.3)); // kuping
    g.add(w3dMesh(new THREE.BoxGeometry(0.16, 0.1, 0.24), w3dMat(0xb5651d), 0.78, 1.5, -0.3));
    // Kaki putih khas sapi Bali
    [[-0.5, 0.28], [0.5, 0.28], [-0.5, -0.28], [0.5, -0.28]].forEach(k => {
      g.add(w3dMesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 8), w3dMat(0xf5f0e6), k[0], 0.33, k[1]));
    });
    const ekor = w3dMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 6), w3dMat(0xa0522d), -0.72, 0.95, 0);
    ekor.rotation.z = 0.5; g.add(ekor);
    g.add(w3dMesh(new THREE.SphereGeometry(0.07, 6, 6), w3dMat(0x5a3a20), -0.92, 0.72, 0));   // ujung ekor
    return g;
  },

  sampat() {
    const g = new THREE.Group();
    const gagang = w3dMesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), w3dMat(0xc89a5b), 0, 1.55, 0);
    gagang.rotation.z = 0.28; g.add(gagang); // gagang miring
    // Rumpun lidi: sempit di atas (dekat gagang), melebar ke lantai
    const lidi = w3dMesh(new THREE.ConeGeometry(0.4, 1.0, 12), w3dMat(0xd2a24c), 0.33, 0.5, 0);
    lidi.rotation.z = 0.28; g.add(lidi);
    const ikat1 = w3dMesh(new THREE.TorusGeometry(0.13, 0.035, 8, 14), w3dMat(0x6b4b2a), 0.26, 0.88, 0);
    ikat1.rotation.z = 0.28; ikat1.rotation.x = Math.PI / 2; g.add(ikat1); // tali pengikat
    // Debu kecil beterbangan (sedang menyapu!)
    [[0.85, 0.14, 0.15], [1.0, 0.3, -0.1], [0.7, 0.08, -0.2]].forEach(d => {
      g.add(w3dMesh(new THREE.SphereGeometry(0.045, 5, 5), w3dMat(0xcbb89d, { transparent: true, opacity: 0.7 }), d[0], d[1], d[2]));
    });
    return g;
  },

  matanAiEngseb() {
    const g = new THREE.Group();
    g.add(w3dMesh(new THREE.CylinderGeometry(1.35, 1.35, 0.14, 24), w3dMat(0x1d4e89), 0, 0.07, 0)); // laut senja
    // Layar langit jingga setengah lingkaran di belakang
    const langit = w3dMesh(new THREE.CylinderGeometry(1.25, 1.25, 0.95, 24, 1, true, 0, Math.PI), w3dMat(0xff9147, { side: THREE.DoubleSide, transparent: true, opacity: 0.75, emissive: 0xcc5511, emissiveIntensity: 0.3 }), 0, 0.55, 0);
    langit.rotation.y = Math.PI / 2;
    g.add(langit);
    g.add(w3dMesh(new THREE.SphereGeometry(0.42, 16, 16), w3dMat(0xff6d1f, { emissive: 0xff4400, emissiveIntensity: 0.8 }), 0, 0.2, 0.35)); // surya separuh tenggelam
    g.add(w3dMesh(new THREE.BoxGeometry(0.16, 0.02, 0.85), w3dMat(0xffb163, { emissive: 0xcc7722 }), 0, 0.15, 0.85)); // pantulan cahaya
    // Burung pulang senja (dua sayap kecil)
    const s1 = w3dMesh(new THREE.BoxGeometry(0.16, 0.025, 0.05), w3dMat(0x333333), -0.42, 1.35, 0.5); s1.rotation.z = 0.5; g.add(s1);
    const s2 = w3dMesh(new THREE.BoxGeometry(0.16, 0.025, 0.05), w3dMat(0x333333), -0.28, 1.35, 0.5); s2.rotation.z = -0.5; g.add(s2);
    return g;
  }
};

// ----------------------------------------------------------------
// SIKLUS HIDUP MODE 3D
// ----------------------------------------------------------------
function startWorld3D() {
  const overlay = document.getElementById('ar-overlay');
  overlay.style.display = 'flex';

  const catName = currentLevel === 1 ? 'PARAHYANGAN' : currentLevel === 2 ? 'PAWONGAN' : 'PALEMAHAN';
  document.getElementById('w3d-title').innerText = '🌏 DUNIA BUDAYA: ' + catName;
  document.getElementById('w3d-desc').innerText = 'Putar badanmu ke segala arah, cari benda budaya, lalu sentuh!';
  document.getElementById('w3d-card').style.display = 'none';
  document.getElementById('w3d-toast').className = 'w3d-toast';

  const nextBtn = document.getElementById('btn-ar-next-action');
  nextBtn.innerText = currentLevel >= 3 ? "Simpan & Selesai Kuis 🏁" : "Level Selanjutnya →";

  initW3DScene();
  initW3DHunt();
  startW3DCamera();
  setupW3DControls();
}

function initW3DScene() {
  const holder = document.getElementById('w3d-canvas-holder');
  holder.innerHTML = '';

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(holder.clientWidth, holder.clientHeight);
  holder.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, holder.clientWidth / holder.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 0);

  // Pencahayaan lembut merata + arah matahari
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x40342a, 1.05));
  const srya = new THREE.DirectionalLight(0xffffff, 0.7);
  srya.position.set(3, 6, 2);
  scene.add(srya);

  // Lingkar sihir emas di lantai membantu orientasi pemain
  const grid = new THREE.PolarGridHelper(8, 8, 5, 48, 0xfacc15, 0xfacc15);
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  scene.add(grid);

  w3d = {
    renderer, scene, camera, holder,
    objects: [], order: [], targetPos: 0, bonus: 0, active: true,
    lon: 0, lat: 0, useGyro: false, gyro: { alpha: 0, beta: 0, gamma: 0, has: false },
    dragging: false, dragMoved: 0, lastX: 0, lastY: 0,
    catchAnim: null, fireworks: [], clock: new THREE.Clock(),
    raycaster: new THREE.Raycaster(), tapVec: new THREE.Vector2(),
    stream: null, raf: 0, listeners: []
  };

  animateW3D();
  const onResize = () => {
    if (!w3d) return;
    w3d.camera.aspect = holder.clientWidth / holder.clientHeight;
    w3d.camera.updateProjectionMatrix();
    w3d.renderer.setSize(holder.clientWidth, holder.clientHeight);
  };
  window.addEventListener('resize', onResize);
  w3d.listeners.push(['resize', onResize, window]);
}

function initW3DHunt() {
  const items = WORLD3D_DB[currentLevel];
  w3d.order = items.map((_, i) => i).sort(() => Math.random() - 0.5);
  w3d.targetPos = 0;
  w3d.bonus = 0;
  document.getElementById('w3d-bonus-val').innerText = '0';

  // Slot koleksi progres
  const prog = document.getElementById('w3d-progress');
  prog.innerHTML = '';
  items.forEach((_, i) => {
    const s = document.createElement('div');
    s.className = 'w3d-slot';
    s.id = 'w3d-slot-' + i;
    s.innerText = '?';
    prog.appendChild(s);
  });

  // Sebar benda 3D melingkari pemain (360 derajat penuh!)
  const sudutDasar = [0, 72, 144, 216, 288].sort(() => Math.random() - 0.5);
  items.forEach((item, i) => {
    const grup = W3D_BUILDERS[item.builder]();
    // Alas panggung melayang emas agar gaya semua benda seragam
    const alas = w3dMesh(new THREE.CylinderGeometry(1.5, 1.7, 0.22, 24), w3dMat(0x8d5a2b), 0, -0.13, 0);
    const lis = w3dMesh(new THREE.TorusGeometry(1.55, 0.05, 8, 32), w3dMat(0xfacc15, { emissive: 0x9a7b00, metalness: 0.5 }), 0, -0.02, 0);
    lis.rotation.x = Math.PI / 2;
    grup.add(alas); grup.add(lis);
    // Cincin penanda target (berdenyut saat jadi buruan aktif)
    const cincin = w3dMesh(new THREE.TorusGeometry(1.9, 0.07, 8, 40), w3dMat(0xfacc15, { emissive: 0xcc9900, transparent: true, opacity: 0.9 }), 0, -0.05, 0);
    cincin.rotation.x = Math.PI / 2;
    cincin.visible = false;
    grup.add(cincin);
    // Bola sentuh tak kasat mata: area tangkap luas, ramah jari anak
    const bolaSentuh = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    bolaSentuh.position.y = 1.1;
    grup.add(bolaSentuh);

    const rad = (sudutDasar[i] + (Math.random() * 24 - 12)) * Math.PI / 180;
    const jarak = 5.2 + Math.random() * 1.6;
    grup.position.set(Math.sin(rad) * jarak, 0.4 + Math.random() * 1.4, -Math.cos(rad) * jarak);
    grup.lookAt(0, grup.position.y, 0); // menghadap pemain
    grup.scale.setScalar(0.9);

    grup.userData = { idx: i, baseY: grup.position.y, phase: Math.random() * Math.PI * 2, cincin, caught: false };
    w3d.scene.add(grup);
    w3d.objects.push(grup);
  });

  setW3DTarget();
  showW3DToast('🎯 PETUALANGAN DIMULAI! Putar badanmu!');
}

function setW3DTarget() {
  const item = WORLD3D_DB[currentLevel][w3d.order[w3d.targetPos]];
  document.getElementById('w3d-target-name').innerText = item.emoji + ' ' + item.nama.toUpperCase();
  w3d.objects.forEach(o => { o.userData.cincin.visible = o.userData.idx === w3d.order[w3d.targetPos]; });
}

// ----------------------------------------------------------------
// KAMERA HP SEBAGAI LATAR (dengan cadangan langit senja)
// ----------------------------------------------------------------
function startW3DCamera() {
  const video = document.getElementById('ar-video');
  const overlay = document.getElementById('ar-overlay');
  overlay.classList.remove('w3d-sky-fallback');
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (!w3d) { stream.getTracks().forEach(t => t.stop()); return; }
        w3d.stream = stream;
        video.srcObject = stream;
        video.style.display = 'block';
        video.play().catch(() => {});
      })
      .catch(() => {
        // Tanpa kamera pun tetap seru: latar langit senja magis
        video.style.display = 'none';
        overlay.classList.add('w3d-sky-fallback');
      });
  } else {
    video.style.display = 'none';
    overlay.classList.add('w3d-sky-fallback');
  }
}

// ----------------------------------------------------------------
// KONTROL PANDANGAN: SENSOR GYRO (utama) / GESER LAYAR (cadangan)
// ----------------------------------------------------------------
function setupW3DControls() {
  const holder = w3d.holder;
  const gyroBtn = document.getElementById('w3d-gyro-btn');
  gyroBtn.style.display = 'none';

  const onOrient = (e) => {
    if (!w3d) return;
    if (e.alpha === null || e.alpha === undefined) return;
    w3d.gyro.alpha = e.alpha; w3d.gyro.beta = e.beta; w3d.gyro.gamma = e.gamma;
    if (!w3d.gyro.has) { w3d.gyro.has = true; w3d.useGyro = true; }
  };

  const pasangGyro = () => {
    window.addEventListener('deviceorientation', onOrient);
    w3d.listeners.push(['deviceorientation', onOrient, window]);
  };

  // iOS 13+ mewajibkan izin sensor lewat sentuhan tombol
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    gyroBtn.style.display = 'block';
    gyroBtn.onclick = () => {
      DeviceOrientationEvent.requestPermission().then(st => {
        if (st === 'granted') pasangGyro();
        gyroBtn.style.display = 'none';
      }).catch(() => { gyroBtn.style.display = 'none'; });
    };
  } else {
    pasangGyro();
  }

  // Geser layar: cadangan sekaligus penyesuai arah
  const down = (e) => {
    if (!w3d) return;
    const p = e.touches ? e.touches[0] : e;
    w3d.dragging = true; w3d.dragMoved = 0; w3d.lastX = p.clientX; w3d.lastY = p.clientY;
  };
  const move = (e) => {
    if (!w3d || !w3d.dragging) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - w3d.lastX, dy = p.clientY - w3d.lastY;
    w3d.dragMoved += Math.abs(dx) + Math.abs(dy);
    w3d.lastX = p.clientX; w3d.lastY = p.clientY;
    if (!w3d.useGyro) {
      w3d.lon -= dx * 0.22;
      w3d.lat = Math.max(-80, Math.min(80, w3d.lat + dy * 0.22));
    }
  };
  const up = (e) => {
    if (!w3d) return;
    const wasTap = w3d.dragMoved < 10;
    w3d.dragging = false;
    if (wasTap) {
      const p = (e.changedTouches && e.changedTouches[0]) || e;
      handleW3DTap(p.clientX, p.clientY);
    }
  };
  holder.addEventListener('mousedown', down); holder.addEventListener('touchstart', down, { passive: true });
  window.addEventListener('mousemove', move); window.addEventListener('touchmove', move, { passive: true });
  window.addEventListener('mouseup', up); window.addEventListener('touchend', up);
  w3d.listeners.push(['mousedown', down, holder], ['touchstart', down, holder],
    ['mousemove', move, window], ['touchmove', move, window],
    ['mouseup', up, window], ['touchend', up, window]);
}

// Konversi data sensor gyro menjadi arah pandang kamera 3D
// (objek bantu dibuat sekali saja agar tidak membebani memori tiap frame)
const w3dGyroTmp = { zee: null, euler: null, q0: null, q1: null };
function applyW3DGyro() {
  if (!w3dGyroTmp.zee) {
    w3dGyroTmp.zee = new THREE.Vector3(0, 0, 1);
    w3dGyroTmp.euler = new THREE.Euler();
    w3dGyroTmp.q0 = new THREE.Quaternion();
    w3dGyroTmp.q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  }
  const d = Math.PI / 180;
  const orient = (screen.orientation && screen.orientation.angle ? screen.orientation.angle : (window.orientation || 0)) * d;
  w3dGyroTmp.euler.set(w3d.gyro.beta * d, w3d.gyro.alpha * d, -w3d.gyro.gamma * d, 'YXZ');
  w3d.camera.quaternion.setFromEuler(w3dGyroTmp.euler);
  w3d.camera.quaternion.multiply(w3dGyroTmp.q1);
  w3d.camera.quaternion.multiply(w3dGyroTmp.q0.setFromAxisAngle(w3dGyroTmp.zee, -orient));
}

// ----------------------------------------------------------------
// LINGKARAN UTAMA ANIMASI (60x per detik)
// ----------------------------------------------------------------
function animateW3D() {
  if (!w3d) return;
  w3d.raf = requestAnimationFrame(animateW3D);
  const dt = Math.min(w3d.clock.getDelta(), 0.05);
  const t = w3d.clock.elapsedTime;

  // Arah pandang kamera
  if (w3d.useGyro && w3d.gyro.has) {
    applyW3DGyro();
  } else {
    const phi = THREE.MathUtils.degToRad(90 - w3d.lat);
    const theta = THREE.MathUtils.degToRad(w3d.lon);
    w3d.camera.lookAt(
      w3d.camera.position.x + Math.sin(phi) * Math.sin(theta),
      w3d.camera.position.y + Math.cos(phi),
      w3d.camera.position.z - Math.sin(phi) * Math.cos(theta)
    );
  }

  // Benda berputar pelan & mengambang naik-turun
  w3d.objects.forEach(o => {
    if (o.userData.caught) return;
    o.rotation.y += dt * 0.45;
    o.position.y = o.userData.baseY + Math.sin(t * 1.4 + o.userData.phase) * 0.18;
    if (o.userData.cincin.visible) { // cincin target berdenyut
      const s = 1 + Math.sin(t * 5) * 0.12;
      o.userData.cincin.scale.set(s, s, s);
    }
  });

  // Animasi benda tertangkap terbang ke depan mata
  if (w3d.catchAnim) {
    const a = w3d.catchAnim;
    a.t += dt;
    a.obj.rotation.y += dt * 3.5;
    if (!a.shrink) {
      // Fase 1: terbang mendekat dengan pelambatan halus
      const k = Math.min(a.t / 0.8, 1);
      const halus = k * k * (3 - 2 * k);
      const depan = new THREE.Vector3(0, 0, -3.2).applyQuaternion(w3d.camera.quaternion).add(w3d.camera.position);
      a.obj.position.lerpVectors(a.dari, depan, halus);
      a.obj.scale.setScalar(0.9 - halus * 0.25);
      if (k >= 1 && !a.cardShown) {
        a.cardShown = true;
        showW3DCard(a.idx);
      }
    } else {
      // Fase 2: mengecil menghilang setelah kartu ditutup
      a.obj.scale.multiplyScalar(Math.max(0, 1 - dt * 4));
      if (a.obj.scale.x < 0.02) {
        w3d.scene.remove(a.obj);
        w3d.catchAnim = null;
        lanjutSetelahTangkap();
      }
    }
  }

  // Percikan kembang api pesta akhir
  for (let i = w3d.fireworks.length - 1; i >= 0; i--) {
    const f = w3d.fireworks[i];
    f.umur += dt;
    const pos = f.points.geometry.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      pos.setXYZ(j,
        pos.getX(j) + f.vel[j * 3] * dt,
        pos.getY(j) + (f.vel[j * 3 + 1] - f.umur * 2.2) * dt,
        pos.getZ(j) + f.vel[j * 3 + 2] * dt);
    }
    pos.needsUpdate = true;
    f.points.material.opacity = Math.max(0, 1 - f.umur / 1.6);
    if (f.umur > 1.6) { w3d.scene.remove(f.points); w3d.fireworks.splice(i, 1); }
  }

  updateW3DRadar();
  w3d.renderer.render(w3d.scene, w3d.camera);
}

// Panah radar penunjuk arah target (muncul saat target di luar layar)
function updateW3DRadar() {
  const radar = document.getElementById('w3d-radar');
  if (!w3d.active || w3d.catchAnim) { radar.style.display = 'none'; return; }
  const target = w3d.objects.find(o => o.userData.idx === w3d.order[w3d.targetPos] && !o.userData.caught);
  if (!target) { radar.style.display = 'none'; return; }

  const v = target.position.clone().applyMatrix4(w3d.camera.matrixWorldInverse);
  const sudut = Math.atan2(v.x, -v.z); // arah kiri/kanan relatif pandangan
  if (Math.abs(sudut) < 0.45 && v.z < 0) {
    radar.style.display = 'none'; // target sudah terlihat
  } else {
    radar.style.display = 'flex';
    // Panah ➤ dasarnya menunjuk ke kanan, jadi dikurangi 90 derajat
    radar.style.transform = 'translateX(-50%) rotate(' + (sudut - Math.PI / 2) + 'rad)';
  }
}

// ----------------------------------------------------------------
// SENTUHAN PEMAIN: TEBAK BENDA LEWAT SINAR 3D (RAYCAST)
// ----------------------------------------------------------------
function handleW3DTap(cx, cy) {
  if (!w3d || !w3d.active || w3d.catchAnim) return;
  const r = w3d.holder.getBoundingClientRect();
  w3d.tapVec.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  w3d.raycaster.setFromCamera(w3d.tapVec, w3d.camera);
  const kena = w3d.raycaster.intersectObjects(w3d.objects.filter(o => !o.userData.caught), true);
  if (!kena.length) return;

  let grup = kena[0].object;
  while (grup.parent && !w3d.objects.includes(grup)) grup = grup.parent;
  if (!w3d.objects.includes(grup)) return;

  const idx = grup.userData.idx;
  const items = WORLD3D_DB[currentLevel];

  if (idx === w3d.order[w3d.targetPos]) {
    // TEPAT! Benda terbang mendekat lalu Kartu Pusaka terbuka
    playSFX('benar');
    grup.userData.caught = true;
    grup.userData.cincin.visible = false;
    w3d.catchAnim = { obj: grup, idx: idx, t: 0, dari: grup.position.clone(), cardShown: false, shrink: false };
    w3d.bonus += 20;
    score += 20;
    document.getElementById('w3d-bonus-val').innerText = w3d.bonus;
  } else {
    // Belum tepat: beri tahu nama benda yang disentuh (tetap belajar!)
    playSFX('salah');
    showW3DToast('Ups! Itu ' + items[idx].emoji + ' ' + items[idx].nama + '! Coba cari lagi 😄');
  }
}

// ----------------------------------------------------------------
// KARTU PUSAKA: JENDELA ILMU TIAP BENDA
// ----------------------------------------------------------------
function showW3DCard(idx) {
  const item = WORLD3D_DB[currentLevel][idx];
  document.getElementById('w3d-card-emoji').innerText = item.emoji;
  document.getElementById('w3d-card-nama').innerText = item.nama;
  document.getElementById('w3d-card-arti').innerText = item.arti;
  document.getElementById('w3d-card-fakta').innerText = item.fakta;
  document.getElementById('w3d-card-foto').src = item.foto;
  document.getElementById('w3d-card').style.display = 'flex';
}

function closeW3DCard() {
  document.getElementById('w3d-card').style.display = 'none';
  if (w3d && w3d.catchAnim) w3d.catchAnim.shrink = true;
}

function lanjutSetelahTangkap() {
  const idxUrut = w3d.targetPos;
  const item = WORLD3D_DB[currentLevel][w3d.order[idxUrut]];
  const slot = document.getElementById('w3d-slot-' + idxUrut);
  slot.innerText = item.emoji;
  slot.classList.add('filled');

  simpanKeMuseum(currentLevel, w3d.order[idxUrut]);

  w3d.targetPos++;
  if (w3d.targetPos >= w3d.order.length) {
    selesaiW3D();
  } else {
    showW3DToast(W3D_PUJIAN[Math.floor(Math.random() * W3D_PUJIAN.length)]);
    setW3DTarget();
  }
}

// Catat benda yang sudah dikumpulkan (bekal mode Museum-Ku 3D)
function simpanKeMuseum(lvl, idx) {
  let museum = {};
  try { museum = JSON.parse(localStorage.getItem('museum3d')) || {}; } catch (e) {}
  if (!museum[lvl]) museum[lvl] = [];
  if (!museum[lvl].includes(idx)) museum[lvl].push(idx);
  localStorage.setItem('museum3d', JSON.stringify(museum));
}

// ----------------------------------------------------------------
// PESTA AKHIR: KEMBANG API 3D + BONUS
// ----------------------------------------------------------------
function selesaiW3D() {
  w3d.active = false;
  w3d.bonus += 50;
  score += 50;
  document.getElementById('w3d-bonus-val').innerText = w3d.bonus;
  document.getElementById('w3d-target-name').innerText = '🏆 SEMUA DITEMUKAN!';
  document.getElementById('w3d-desc').innerText = 'Kamu Penjelajah Budaya sejati! +50 bonus! Koleksimu tersimpan di Museum. 🏅';
  playSFX('welcome');

  let ledakan = 0;
  const interval = setInterval(() => {
    if (!w3d || ledakan >= 8) { clearInterval(interval); return; }
    spawnW3DFirework();
    ledakan++;
  }, 380);
}

function spawnW3DFirework() {
  const jumlah = 70;
  const posisi = new Float32Array(jumlah * 3);
  const vel = new Float32Array(jumlah * 3);
  const pusat = new THREE.Vector3((Math.random() - 0.5) * 8, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 8);
  for (let i = 0; i < jumlah; i++) {
    posisi[i * 3] = pusat.x; posisi[i * 3 + 1] = pusat.y; posisi[i * 3 + 2] = pusat.z;
    const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), sp = 1.5 + Math.random() * 2;
    vel[i * 3] = Math.sin(b) * Math.cos(a) * sp;
    vel[i * 3 + 1] = Math.cos(b) * sp;
    vel[i * 3 + 2] = Math.sin(b) * Math.sin(a) * sp;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posisi, 3));
  const warna = [0xfacc15, 0xff6d6d, 0x6dc9ff, 0x9dff6d, 0xff9df5][Math.floor(Math.random() * 5)];
  const mat = new THREE.PointsMaterial({ color: warna, size: 0.22, transparent: true, opacity: 1, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  w3d.scene.add(points);
  w3d.fireworks.push({ points, vel, umur: 0 });
}

// ----------------------------------------------------------------
// PESAN MELAYANG & PENUTUPAN BERSIH
// ----------------------------------------------------------------
let w3dToastTimer;
function showW3DToast(msg) {
  const el = document.getElementById('w3d-toast');
  el.innerText = msg;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(w3dToastTimer);
  w3dToastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

function closeWorld3D() {
  document.getElementById('ar-overlay').style.display = 'none';
  document.getElementById('w3d-card').style.display = 'none';
  const video = document.getElementById('ar-video');
  if (!w3d) return;

  if (w3d.stream) w3d.stream.getTracks().forEach(t => t.stop());
  video.srcObject = null;
  cancelAnimationFrame(w3d.raf);
  w3d.listeners.forEach(l => l[2].removeEventListener(l[0], l[1]));

  // Bebaskan memori GPU
  w3d.scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    }
  });
  w3d.renderer.dispose();
  w3d.holder.innerHTML = '';
  w3d = null;
}
