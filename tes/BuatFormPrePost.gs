/**
 * Membuat DUA Google Form sekaligus: Pre-Test dan Post-Test literasi basa Bali.
 *
 * Jalankan fungsi buatKeduaForm(). Setelah selesai, tautannya dicetak di
 * View > Logs (Ctrl+Enter).
 *
 * Gambar diambil dari GitHub Pages lalu ditempelkan sebagai gambar soal.
 * Satu gambar dipakai berulang kali di beberapa soal, jadi hasil unduhannya
 * disimpan (cache) supaya tidak diunduh dua kali - ini yang dulu membuat
 * skrip berjalan lama sekali.
 */
var DATA = {
 "pre": [
  {
   "q": "Genah palinggihan Sang Hyang Widhi Wasa ring pura inggih punika...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/padmasana.jpg",
   "o": [
    "Padmasana",
    "Bale kulkul",
    "Wantilan",
    "Lumbung"
   ],
   "c": 0,
   "kat": "Makna Kata"
  },
  {
   "q": "Gambar ené madan apa?",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s12-penjor.jpg",
   "o": [
    "Sate",
    "Penjor",
    "Lamak",
    "Tamiang"
   ],
   "c": 1,
   "kat": "Makna Kata"
  },
  {
   "q": "Gambar ené madan apa?",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/canang.jpg",
   "o": [
    "Tumpeng",
    "Lamak",
    "Canang",
    "Tamas"
   ],
   "c": 2,
   "kat": "Makna Kata"
  },
  {
   "q": "Apaké balé gedé matampul abesik?",
   "img": null,
   "o": [
    "Galeng",
    "Kuping",
    "Klepon",
    "Pajeng"
   ],
   "c": 3,
   "kat": "Makna Kata"
  },
  {
   "q": "Apaké ngamah acepok betek sesai?",
   "img": null,
   "o": [
    "Galeng",
    "Pajeng",
    "Sampi",
    "Tukad"
   ],
   "c": 0,
   "kat": "Makna Kata"
  },
  {
   "q": "Apaké anak cenik ngemu getih?",
   "img": null,
   "o": [
    "Banten",
    "Klepon",
    "Canang",
    "Penjor"
   ],
   "c": 1,
   "kat": "Makna Kata"
  },
  {
   "q": "Apaké menék bajang, tuun tua?",
   "img": null,
   "o": [
    "Tukad",
    "Pajeng",
    "Matan ai",
    "Bulan"
   ],
   "c": 2,
   "kat": "Makna Kata"
  },
  {
   "q": "Yên suba hémat énergi lakar ngranayang hemat…",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s36-prabeya-hemat.jpg",
   "o": [
    "Bayu",
    "Nasi",
    "Munyi",
    "Prabéya"
   ],
   "c": 3,
   "kat": "Makna Kata"
  },
  {
   "q": "Tiang ngubuh sampi di désa. Ngubuh patuh artiné…",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/sampi.jpg",
   "o": [
    "Miara",
    "Ngebus",
    "Ngalih",
    "Madep"
   ],
   "c": 0,
   "kat": "Makna Kata"
  },
  {
   "q": "Aksara Bali ené wacén. Krunané madan apa?",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/aksara/soal3.jpg",
   "o": [
    "Sampat",
    "Sampi",
    "Bulan",
    "Bintang"
   ],
   "c": 1,
   "kat": "Makna Kata"
  },
  {
   "q": "Rai demen masilihang teken timpale ane sing ngelah. Ento bacakan Solah ane....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s17-becik-ngayah.jpg",
   "o": [
    "Mayus",
    "Lengit",
    "Becik",
    "Jele"
   ],
   "c": 2,
   "kat": "Penggunaan"
  },
  {
   "q": "Rerama sesai maang pitutur. Pitutur rerama patut....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/keluarga.jpg",
   "o": [
    "Kelidin",
    "Saruin",
    "Kalahin",
    "Resepang"
   ],
   "c": 3,
   "kat": "Penggunaan"
  },
  {
   "q": "Tresna asih metimpal. Tresna asih solah ane....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s25-melah-tresna-asih.jpg",
   "o": [
    "Melah",
    "Corah",
    "Jele",
    "Gedeg"
   ],
   "c": 0,
   "kat": "Penggunaan"
  },
  {
   "q": "I Putu demen nyampat di natahe. Nyampat kruna lingganyane…",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/sampat.jpg",
   "o": [
    "Nyampatang",
    "Sampat",
    "Sampate",
    "Nyampat"
   ],
   "c": 1,
   "kat": "Penggunaan"
  },
  {
   "q": "Apang entik-entikané tusing layu patut…",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/nyiram.jpg",
   "o": [
    "Abut",
    "Tunjel",
    "Siam",
    "Tumbeg"
   ],
   "c": 2,
   "kat": "Penggunaan"
  },
  {
   "q": "Umat Hindu nunas ica ring Sang Hyang Widhi antuk ngaturang...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/banten.jpg",
   "o": [
    "Pipis miwah perhiasan",
    "Batik miwah anduk",
    "Sepatu miwah tas",
    "Sesajen miwah banten"
   ],
   "c": 3,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Manusia patut bakti miwah suksma ring Ida Sang Hyang Widhi Wasa santukan...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s04-alam-manusa-ciptaan.jpg",
   "o": [
    "Ida sane nyiptayang jagat miwah manusa",
    "Ida sane mekarya pura",
    "Ida sane ngasilang keneh",
    "Ida sane ngaturang banten"
   ],
   "c": 0,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Rerahinan Saraswati, umat Hindu ngaturang banten ring...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s05-lontar-buku.jpg",
   "o": [
    "Candi miwah arca",
    "Lontar miwah buku",
    "Beras miwah taluh",
    "Ayam miwah bebek"
   ],
   "c": 1,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Betén ené conto parilaksana hémat yéh…",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s35-ngematiang-kran.jpg",
   "o": [
    "tusing ngidupang AC masan ujan",
    "negakin sepéda ka sekolah",
    "ngematiang kran yén suba suud manjus",
    "ngematiang listrik yén suba tengai"
   ],
   "c": 2,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Pidan anaké ngebuhang tanah di cariké nganggon buron sampi. Di zaman jani anaké ngebuhang tanah di carike nganggon...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/traktor-sawah.jpg",
   "o": [
    "Kambing",
    "HP",
    "Robot",
    "Traktor"
   ],
   "c": 3,
   "kat": "Pemahaman Kontekstual"
  }
 ],
 "post": [
  {
   "q": "Wewidangan utawi genah suci anggen umat Hindu maturan kawastanin...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s01-pura.jpg",
   "o": [
    "Pura",
    "Bale banjar",
    "Sekolah",
    "Pasar"
   ],
   "c": 0,
   "kat": "Makna Kata"
  },
  {
   "q": "Tuhan ring agama Hindu kawastanin...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s02-sang-hyang-widhi.jpg",
   "o": [
    "Mpu",
    "Sang Hyang Widhi Wasa",
    "Ratu Gede",
    "Jero Gede"
   ],
   "c": 1,
   "kat": "Makna Kata"
  },
  {
   "q": "Upacara penyucian ke segara sane kalaksanayang olih umat Hindu sedurung Nyepi kawastanin...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/melasti.jpg",
   "o": [
    "Mabyakala",
    "Matur piuning",
    "Melasti",
    "Mepandes"
   ],
   "c": 2,
   "kat": "Makna Kata"
  },
  {
   "q": "Sarana upacara sane malakar don nyuh medaging bunga, kaanggen ngaturang banten ring sang hyang widhi inggih punika...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/canang.jpg",
   "o": [
    "Tumpeng",
    "Lamak",
    "Tamas",
    "Canang"
   ],
   "c": 3,
   "kat": "Makna Kata"
  },
  {
   "q": "Ngaturang banten saiban utawi ajengan nasi semengan kawastanin...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s08-ngejot-saiban.jpg",
   "o": [
    "Ngejot",
    "Melasti",
    "Maturan",
    "Melukat"
   ],
   "c": 0,
   "kat": "Makna Kata"
  },
  {
   "q": "Rerahinan Galungan, umat Hindu mekarya sarana upacara marupa tiing sane lengkung tur kahias antuk janur miwah hasil bumi kawastanin...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s12-penjor.jpg",
   "o": [
    "Lawar",
    "Penjor",
    "Tamiang",
    "Sate"
   ],
   "c": 1,
   "kat": "Makna Kata"
  },
  {
   "q": "Gambar ené madan apa?",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s11-pura-besakih.jpg",
   "o": [
    "Pura Ulun Danu",
    "Padmasana",
    "Pura Besakih",
    "Pura Tanah Lot"
   ],
   "c": 2,
   "kat": "Makna Kata"
  },
  {
   "q": "Gambar ené madan apa?",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/mebakti.jpg",
   "o": [
    "Melasti",
    "Ngejot",
    "Mepandes",
    "Mebakti"
   ],
   "c": 3,
   "kat": "Makna Kata"
  },
  {
   "q": "Gambar ené madan apa?",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s15-pura-tanah-lot.jpg",
   "o": [
    "Pura Tanah Lot",
    "Pura Besakih",
    "Pura Luhur Uluwatu",
    "Pura Taman Ayun"
   ],
   "c": 0,
   "kat": "Makna Kata"
  },
  {
   "q": "Aksara Bali ené wacén. Krunané madan apa?",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/aksara/soal4.jpg",
   "o": [
    "Matan ai",
    "Sampat",
    "Sampi",
    "Bulan"
   ],
   "c": 1,
   "kat": "Makna Kata"
  },
  {
   "q": "Putu Budi ngelah cita-cita dadi dokter. Dadi dokter geginane tuah....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s19-dokter-ngubadin-anak-gelem.jpg",
   "o": [
    "Ngae wewangunan",
    "Nyampur ubad",
    "Ngubadin anak gelem",
    "Menahin montor"
   ],
   "c": 2,
   "kat": "Penggunaan"
  },
  {
   "q": "Pianakne ane pertama suba ngajahin di SD. Anak ane geginane ngajahin di sekolah madan...",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s22-guru-ngajahin.jpg",
   "o": [
    "Satpam",
    "Pengacara",
    "Polisi",
    "Guru"
   ],
   "c": 3,
   "kat": "Penggunaan"
  },
  {
   "q": "Yening ada timpal ane ulung patutne....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/timpal.jpg",
   "o": [
    "Tulungin",
    "Kalahin",
    "Tolih",
    "Kedekin"
   ],
   "c": 0,
   "kat": "Penggunaan"
  },
  {
   "q": "Iraga patut nyaga kabresihan déwék lan lingkungan apang setata…",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s33-seger-bersih.jpg",
   "o": [
    "Daki",
    "Seger",
    "Kual",
    "Kumel"
   ],
   "c": 1,
   "kat": "Penggunaan"
  },
  {
   "q": "Iraga patutné... tekén ubuh-ubuhan.",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s38-sayang-ubuhan.jpg",
   "o": [
    "Tusing Demen",
    "Gedeg",
    "Sayang",
    "Pedih"
   ],
   "c": 2,
   "kat": "Penggunaan"
  },
  {
   "q": "Ngajak nyama patutne saling tulungin. Saling tulungin nyiriang idupe....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s16-adung-tolong.jpg",
   "o": [
    "Sugih",
    "Uyut",
    "Lacur",
    "Adung"
   ],
   "c": 3,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Ngomong sareng guru patut nganggen basa sane....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s20-alus-sopan-guru.jpg",
   "o": [
    "Alus tur sopan",
    "Keras",
    "Sengit",
    "Kasar"
   ],
   "c": 0,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Ring waktu mebersih kelas, iraga patut....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s21-gotong-royong-kelas.jpg",
   "o": [
    "Macepuk",
    "Gotong royong",
    "Melaib",
    "Nyingakin kemawon"
   ],
   "c": 1,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Contoh sane ngamargiang pelestarian alam inggih punika ....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/nanem-entik.jpg",
   "o": [
    "Ngusak alas",
    "Ngutang luhu ring tukad",
    "Nanem entik-entikan",
    "Nembak kedis"
   ],
   "c": 2,
   "kat": "Pemahaman Kontekstual"
  },
  {
   "q": "Ngutang luu patutné di....",
   "img": "https://dimassastra.github.io/Game-Lentera-Bali/foto/s32-tong-sampah.jpg",
   "o": [
    "Tukad",
    "Sémér",
    "Got",
    "Tong sampah"
   ],
   "c": 3,
   "kat": "Pemahaman Kontekstual"
  }
 ]
};

var DURASI = '30 menit';
var cacheGambar = {};

function ambilGambar(url) {
  if (!url) return null;
  if (cacheGambar.hasOwnProperty(url)) return cacheGambar[url];
  try {
    var r = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    cacheGambar[url] = (r.getResponseCode() === 200) ? r.getBlob() : null;
  } catch (e) {
    cacheGambar[url] = null;
  }
  return cacheGambar[url];
}

function buatSatuForm(kunci, judul, keterangan) {
  var form = FormApp.create(judul);
  form.setTitle(judul);
  form.setDescription(keterangan);
  form.setIsQuiz(true);
  form.setCollectEmail(false);
  form.setProgressBar(true);

  var namaItem = form.addTextItem();
  namaItem.setTitle('Nama Lengkap').setRequired(true);
  var kelasItem = form.addTextItem();
  kelasItem.setTitle('Kelas').setRequired(true);

  var soal = DATA[kunci];
  var katSebelumnya = null;
  for (var i = 0; i < soal.length; i++) {
    var s = soal[i];
    if (s.kat !== katSebelumnya) {
      katSebelumnya = s.kat;
      var jml = 0;
      for (var k = 0; k < soal.length; k++) if (soal[k].kat === s.kat) jml++;
      form.addSectionHeaderItem()
          .setTitle(s.kat)
          .setHelpText(jml + ' soal');
    }
    if (s.img) {
      var blob = ambilGambar(s.img);
      if (blob) form.addImageItem().setImage(blob).setAlignment(
          FormApp.Alignment.CENTER);
    }
    var item = form.addMultipleChoiceItem();
    item.setTitle((i + 1) + '. ' + s.q);
    item.setRequired(true);
    item.setPoints(5);
    var pilihan = [];
    for (var j = 0; j < s.o.length; j++) {
      pilihan.push(item.createChoice(s.o[j], j === s.c));
    }
    item.setChoices(pilihan);
  }

  Logger.log(judul);
  Logger.log('  isi   : ' + form.getPublishedUrl());
  Logger.log('  sunting: ' + form.getEditUrl());
  return form;
}

function buatKeduaForm() {
  buatSatuForm('pre', 'Pre-Test Literasi Basa Bali',
      'Waktu pengerjaan ' + DURASI + '. Pilih satu jawaban yang paling benar. ' +
      'Tes ini dikerjakan SEBELUM bermain game Lentera Bali.');
  buatSatuForm('post', 'Post-Test Literasi Basa Bali',
      'Waktu pengerjaan ' + DURASI + '. Pilih satu jawaban yang paling benar. ' +
      'Tes ini dikerjakan SESUDAH bermain game Lentera Bali.');
  Logger.log('selesai - dua form dibuat');
}
