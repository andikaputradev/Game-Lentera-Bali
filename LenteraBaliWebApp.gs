/**
 * WEB APP "Lentera Bali" - supaya Google Form bisa dibuat dari jarak jauh,
 * tanpa membuka editor Apps Script lagi.
 *
 * CARA PASANG (sekali saja, sekitar 2 menit):
 *   1. Buka proyek Apps Script-mu, hapus isi Code.gs, tempel SELURUH berkas ini.
 *   2. Ganti nilai KUNCI di bawah dengan kata sandi bebas buatanmu sendiri.
 *   3. Klik Deploy > New deployment > pilih tipe "Web app".
 *        Execute as        : Me (dimaspramudyasastra1@gmail.com)
 *        Who has access    : Anyone
 *      Klik Deploy, lalu SALIN "Web app URL" yang muncul.
 *   4. Berikan URL itu kepadaku.
 *
 * Setelah itu satu permintaan HTTP sudah cukup untuk membuat Form baru:
 *   <URL>?kunci=KUNCIMU&aksi=buat
 * dan balasannya berisi tautan Form-nya dalam bentuk JSON.
 *
 * "Who has access: Anyone" berarti siapa pun yang tahu URL-nya bisa
 * memanggilnya - karena itu ada KUNCI. Jangan sebarkan URL beserta kuncinya.
 * Kalau kuncinya bocor, ganti nilainya lalu Deploy ulang.
 */

var KUNCI = 'gantiIniDenganKataSandiBebas';

function doGet(e) {
  return tangani(e);
}

function doPost(e) {
  return tangani(e);
}

function tangani(e) {
  var p = (e && e.parameter) || {};
  if (p.kunci !== KUNCI) {
    return balas({ ok: false, galat: 'kunci salah' });
  }
  try {
    if (p.aksi === 'daftar') {
      return balas({ ok: true, form: daftarForm() });
    }
    if (p.aksi === 'hapus' && p.id) {
      DriveApp.getFileById(p.id).setTrashed(true);
      return balas({ ok: true, dihapus: p.id });
    }
    // aksi bawaan: buat form baru
    var hasil = buatFormLenteraBali();
    return balas({ ok: true, isi: hasil.isi, edit: hasil.edit, soal: hasil.soal });
  } catch (err) {
    return balas({ ok: false, galat: String(err) });
  }
}

function balas(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
}

/** Daftar Form "Kuis Lentera Bali" yang sudah ada, supaya yang lama bisa dibereskan. */
function daftarForm() {
  var out = [];
  var it = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
  while (it.hasNext()) {
    var f = it.next();
    if (f.getName().indexOf('Lentera Bali') >= 0) {
      out.push({ id: f.getId(), nama: f.getName(), dibuat: f.getDateCreated().toISOString() });
    }
  }
  return out;
}

function buatFormLenteraBali() {
  var form = FormApp.create('Kuis Lentera Bali — Belajar Basa Bali');
  form.setDescription(
      'Kuis basa Bali kaanggen ngajahin kruna Bali ring alit-alite. ' +
      'Soalne pateh sareng game Lentera Bali.\n\n' +
      'Isi adanne dumun, raris jawab soale. Sami wenten 45 soal.');
  form.setIsQuiz(true);
  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setShuffleQuestions(false);

  // --- identitas siswa ---
  form.addTextItem().setTitle('Adan (Nama)').setRequired(true);
  var kelas = form.addMultipleChoiceItem();
  kelas.setTitle('Kelas').setRequired(true)
       .setChoiceValues(['Kelas 1','Kelas 2','Kelas 3','Kelas 4','Kelas 5','Kelas 6']);

  var BASE = 'https://dimassastra.github.io/Game-Lentera-Bali';

  // Beberapa soal memakai gambar yang sama. Simpan yang sudah diunduh supaya
  // tidak menarik berkas yang sama dua kali (Apps Script punya batas waktu).
  var simpananGambar = {};
  function ambilGambar(nama) {
    if (!(nama in simpananGambar)) {
      try {
        simpananGambar[nama] = UrlFetchApp.fetch(BASE + '/' + encodeURI(nama)).getBlob();
      } catch (e) {
        Logger.log('gambar gagal dimuat: ' + nama + ' -> ' + e);
        simpananGambar[nama] = null;
      }
    }
    return simpananGambar[nama];
  }

  function tambahSoal(form, nomor, judul, pilihan, benar, gambar) {
    if (gambar) {
      var blob = ambilGambar(gambar);
      if (blob) {
        form.addImageItem().setImage(blob).setTitle('Gambar soal nomor ' + nomor)
            .setAlignment(FormApp.Alignment.CENTER).setWidth(400);
      }
    }
    var item = form.addMultipleChoiceItem();
    item.setTitle(nomor + '. ' + judul).setRequired(true).setPoints(10);
    var opsi = [];
    for (var i = 0; i < pilihan.length; i++) {
      opsi.push(item.createChoice(pilihan[i], pilihan[i] === benar));
    }
    item.setChoices(opsi);
    item.setFeedbackForCorrect(
        FormApp.createFeedback().setText('Beneh! 👍').build());
    item.setFeedbackForIncorrect(
        FormApp.createFeedback().setText('Durung beneh. Jawaban sane patut: ' + benar).build());
  }

  var nomor = 0;

  // ============ LEVEL 1: PARAHYANGAN ============
  form.addPageBreakItem().setTitle('Level 1: Parahyangan')
      .setHelpText('10 soal pilihan ganda lan 5 soal ngadungang gambar.');
  nomor++; tambahSoal(form, nomor, 'Wewidangan utawi genah suci anggen umat Hindu maturan kawastanin...', ['Pura', 'Bale banjar', 'Sekolah', 'Pasar'], 'Pura', 'foto/pura.jpg');
  nomor++; tambahSoal(form, nomor, 'Tuhan ring agama Hindu kawastanin...', ['Sang Hyang Widhi Wasa', 'Ratu Gede', 'Jero Gede', 'Mpu'], 'Sang Hyang Widhi Wasa', null);
  nomor++; tambahSoal(form, nomor, 'Umat Hindu nunas ica ring Sang Hyang Widhi antuk ngaturang...', ['Sesajen miwah banten', 'Pipis miwah perhiasan', 'Batik miwah anduk', 'Sepatu miwah tas'], 'Sesajen miwah banten', 'foto/banten.jpg');
  nomor++; tambahSoal(form, nomor, 'Manusia patut bakti miwah suksma ring Ida Sang Hyang Widhi Wasa santukan...', ['Ida sane ngasilang keneh', 'Ida sane ngaturang banten', 'Ida sane nyiptayang jagat miwah manusa', 'Ida sane mekarya pura'], 'Ida sane nyiptayang jagat miwah manusa', 'foto/s04-alam-manusa-ciptaan.jpg');
  nomor++; tambahSoal(form, nomor, 'Rerahinan Saraswati, umat Hindu ngaturang banten ring...', ['Lontar miwah buku', 'Beras miwah taluh', 'Ayam miwah bebek', 'Candi miwah arca'], 'Lontar miwah buku', 'foto/s05-lontar-saraswati.jpg');
  nomor++; tambahSoal(form, nomor, 'Upacara penyucian ke segara sane kalaksanayang olih umat Hindu sedurung Nyepi kawastanin...', ['Melasti', 'Mepandes', 'Mabyakala', 'Matur piuning'], 'Melasti', 'foto/melasti.jpg');
  nomor++; tambahSoal(form, nomor, 'Sarana upacara sane malakar don nyuh medaging bunga, kaanggen ngaturang banten ring sang hyang widhi inggih punika...', ['Tamas', 'Canang', 'Tumpeng', 'Lamak'], 'Canang', 'foto/canang.jpg');
  nomor++; tambahSoal(form, nomor, 'Ngaturang banten saiban utawi ajengan nasi semengan kawastanin...', ['Maturan', 'Melukat', 'Ngejot', 'Melasti'], 'Ngejot', 'foto/s08-ngejot-saiban.jpg');
  nomor++; tambahSoal(form, nomor, 'Genah palinggihan Sang Hyang Widhi Wasa ring pura inggih punika...', ['Padmasana', 'Bale kulkul', 'Wantilan', 'Lumbung'], 'Padmasana', 'foto/padmasana.jpg');
  nomor++; tambahSoal(form, nomor, 'Rerahinan Galungan, umat Hindu mekarya sarana upacara marupa tiing sane lengkung tur kahias antuk janur miwah hasil bumi kawastanin...', ['Penjor', 'Tamiang', 'Sate', 'Lawar'], 'Penjor', 'foto/penjor.jpg');

  // -- soal ngadungang gambar (di game: tarik garis kata ke gambar) --
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Pura Besakih', 'foto/s11-pura-besakih.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Penjor', 'foto/s12-penjor.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Canang', 'foto/s13-canang-sari-detail.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Mebakti', 'foto/mebakti.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Pura Tanah Lot', 'foto/s15-pura-tanah-lot.jpg');

  // ============ LEVEL 2: PAWONGAN ============
  form.addPageBreakItem().setTitle('Level 2: Pawongan')
      .setHelpText('10 soal pilihan ganda lan 5 soal ngadungang gambar.');
  nomor++; tambahSoal(form, nomor, 'Ngajak nyama patutne saling tulungin. Saling tulungin nyiriang idupe....', ['Sugih', 'Uyut', 'Lacur', 'Adung'], 'Adung', 'foto/s16-adung-megibung.jpg');
  nomor++; tambahSoal(form, nomor, 'Rai demen masilihang teken timpale ane sing ngelah. Ento bacakan Solah ane....', ['Becik', 'Jele', 'Mayus', 'Lengit'], 'Becik', null);
  nomor++; tambahSoal(form, nomor, 'Rerama sesai maang pitutur. Pitutur rerama patut....', ['Resepang', 'Kelidin', 'Saruin', 'Kalahin'], 'Resepang', 'foto/keluarga.jpg');
  nomor++; tambahSoal(form, nomor, 'Putu Budi ngelah cita-cita dadi dokter. Dadi dokter geginane tuah....', ['Nyampur ubad', 'Ngubadin anak gelem', 'Menahin montor', 'Ngae wewangunan'], 'Ngubadin anak gelem', 'foto/s19-dokter-ngubadin-anak-gelem.jpg');
  nomor++; tambahSoal(form, nomor, 'Ngomong sareng guru patut nganggen basa sane....', ['Kasar', 'Alus tur sopan', 'Keras', 'Sengit'], 'Alus tur sopan', null);
  nomor++; tambahSoal(form, nomor, 'Ring waktu mebersih kelas, iraga patut....', ['Gotong royong', 'Melaib', 'Nyingakin kemawon', 'Macepuk'], 'Gotong royong', 'foto/gotong-royong.jpg');
  nomor++; tambahSoal(form, nomor, 'Pianakne ane pertama suba ngajahin di SD. Anak ane geginane ngajahin di sekolah madan...', ['Guru', 'Satpam', 'Pengacara', 'Polisi'], 'Guru', 'foto/s22-guru-ngajahin.jpg');
  nomor++; tambahSoal(form, nomor, 'Tusing dadi lengit nulungin rerama magarapan. Lengit len raosne....', ['Jemet', 'Seleg', 'Mayus', 'Anteng'], 'Mayus', null);
  nomor++; tambahSoal(form, nomor, 'Yening ada timpal ane ulung patutne....', ['Kalahin', 'Tolih', 'Kedekin', 'Tulungin'], 'Tulungin', 'foto/timpal.jpg');
  nomor++; tambahSoal(form, nomor, 'Tresna asih metimpal. Tresna asih solah ane....', ['Melah', 'Corah', 'Jele', 'Gedeg'], 'Melah', null);

  // -- soal ngadungang gambar (di game: tarik garis kata ke gambar) --
  nomor++; tambahSoal(form, nomor, 'Apaké balé gedé matampul abesik?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Pajeng (Payung)', 'foto/pajeng.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké ngamah acepok betek sesai?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Galeng (Bantal)', 'foto/galeng.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké anak cenik ngemu getih?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Klepon', 'foto/klepon.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké menék bajang, tuun tua?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Matan ai', 'foto/matan-ai.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké tolih ngejoh-ngejohang?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Kuping (Telinga)', 'foto/s30-kuping-telinga-anak.jpg');

  // ============ LEVEL 3: PALEMAHAN ============
  form.addPageBreakItem().setTitle('Level 3: Palemahan')
      .setHelpText('10 soal pilihan ganda lan 5 soal ngadungang gambar.');
  nomor++; tambahSoal(form, nomor, 'Contoh sane ngamargiang pelestarian alam inggih punika ....', ['Ngutang luhu ring tukad', 'Nanem entik-entikan', 'Nembak kedis', 'Ngusak alas'], 'Nanem entik-entikan', 'foto/nanem-entik.jpg');
  nomor++; tambahSoal(form, nomor, 'Ngutang luu patutné di....', ['Tukad', 'Sémér', 'Got', 'Tong sampah'], 'Tong sampah', 'foto/s32-tong-sampah.jpg');
  nomor++; tambahSoal(form, nomor, 'Iraga patut nyaga kabresihan déwék lan lingkungan apang setata…', ['Seger', 'Kual', 'Kumel', 'Daki'], 'Seger', null);
  nomor++; tambahSoal(form, nomor, 'I Putu demen nyampat di natahe. Nyampat kruna lingganyane…', ['Sampat', 'Sampate', 'Nyampat', 'Nyampatang'], 'Sampat', 'foto/sampat.jpg');
  nomor++; tambahSoal(form, nomor, 'Betén ené conto parilaksana hémat yéh…', ['ngematiang listrik yén suba tengai', 'tusing ngidupang AC masan ujan', 'negakin sepéda ka sekolah', 'ngematiang kran yén suba suud manjus'], 'ngematiang kran yén suba suud manjus', 'foto/s35-ngematiang-kran.jpg');
  nomor++; tambahSoal(form, nomor, 'Yên suba hémat énergi lakar ngranayang hemat…', ['Nasi', 'Munyi', 'Prabéya', 'Bayu'], 'Prabéya', 'foto/s36-hemat-prabeya-celengan.jpg');
  nomor++; tambahSoal(form, nomor, 'Tiang ngubuh sampi di désa. Ngubuh patuh artiné…', ['Miara', 'Ngebus', 'Ngalih', 'Madep'], 'Miara', 'foto/sampi.jpg');
  nomor++; tambahSoal(form, nomor, 'Iraga patutné... tekén ubuh-ubuhan.', ['Gedeg', 'Sayang', 'Pedih', 'Tusing Demen'], 'Sayang', 'foto/s38-sayang-ubuhan.jpg');
  nomor++; tambahSoal(form, nomor, 'Apang entik-entikané tusing layu patut…', ['Tumbeg', 'Abut', 'Tunjel', 'Siam'], 'Siam', 'foto/nyiram.jpg');
  nomor++; tambahSoal(form, nomor, 'Pidan anaké ngebuhang tanah di cariké nganggon buron sampi. Di zaman jani anaké ngebuhang tanah di carike nganggon...', ['Traktor', 'Kambing', 'HP', 'Robot'], 'Traktor', 'foto/traktor-sawah.jpg');

  // -- soal ngadungang gambar (di game: tarik garis kata ke gambar) --
  nomor++; tambahSoal(form, nomor, 'Aksara Bali ené wacén. Krunané madan apa?', ['Bulan', 'Bintang', 'Sampi', 'Sampat', 'Matan ai'], 'Bulan', 'foto/aksara/soal1.jpg');
  nomor++; tambahSoal(form, nomor, 'Aksara Bali ené wacén. Krunané madan apa?', ['Bulan', 'Bintang', 'Sampi', 'Sampat', 'Matan ai'], 'Bintang', 'foto/aksara/soal2.jpg');
  nomor++; tambahSoal(form, nomor, 'Aksara Bali ené wacén. Krunané madan apa?', ['Bulan', 'Bintang', 'Sampi', 'Sampat', 'Matan ai'], 'Sampi', 'foto/aksara/soal3.jpg');
  nomor++; tambahSoal(form, nomor, 'Aksara Bali ené wacén. Krunané madan apa?', ['Bulan', 'Bintang', 'Sampi', 'Sampat', 'Matan ai'], 'Sampat', 'foto/aksara/soal4.jpg');
  nomor++; tambahSoal(form, nomor, 'Aksara Bali ené wacén. Krunané madan apa?', ['Bulan', 'Bintang', 'Sampi', 'Sampat', 'Matan ai'], 'Matan ai', 'foto/aksara/soal5.jpg');

  Logger.log('Form dadi! Jumlah soal: ' + nomor);
  return {
    soal: nomor,
    isi: form.getPublishedUrl(),
    edit: form.getEditUrl()
  };
}
