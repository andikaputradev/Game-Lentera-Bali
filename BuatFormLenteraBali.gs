/**
 * Membuat Google Form kuis "Lentera Bali" -- soalnya PERSIS SAMA dengan game
 * di https://dimassastra.github.io/Game-Lentera-Bali
 *
 * CARA PAKAI (sekali saja):
 *   1. Buka  script.google.com  lalu klik "New project"
 *   2. Hapus isi editornya, tempel SELURUH berkas ini
 *   3. Klik Run (▶). Google akan minta izin -- pilih akunmu lalu Allow.
 *      (Kalau muncul "Google hasn't verified this app", klik Advanced ->
 *       Go to project. Ini skrip milikmu sendiri, aman.)
 *   4. Buka menu View > Logs. Tautan Form dan tautan edit-nya tercetak di sana.
 *
 * Bentuknya kuis otomatis: kunci jawaban sudah terpasang, tiap soal 10 poin,
 * dan nilainya keluar langsung setelah siswa mengirim jawaban.
 */

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
  nomor++; tambahSoal(form, nomor, 'Tuhan ring agama Hindu kawastanin...', ['Sang Hyang Widhi Wasa', 'Ratu Gede', 'Jero Gede', 'Mpu'], 'Sang Hyang Widhi Wasa', 'foto/padmasana.jpg');
  nomor++; tambahSoal(form, nomor, 'Umat Hindu nunas ica ring Sang Hyang Widhi antuk ngaturang...', ['Sesajen miwah banten', 'Pipis miwah perhiasan', 'Batik miwah anduk', 'Sepatu miwah tas'], 'Sesajen miwah banten', 'foto/banten.jpg');
  nomor++; tambahSoal(form, nomor, 'Manusia patut bakti miwah suksma ring Ida Sang Hyang Widhi Wasa santukan...', ['Ida sane ngasilang keneh', 'Ida sane ngaturang banten', 'Ida sane nyiptayang jagat miwah manusa', 'Ida sane mekarya pura'], 'Ida sane nyiptayang jagat miwah manusa', 'foto/subak.jpg');
  nomor++; tambahSoal(form, nomor, 'Rerahinan Saraswati, umat Hindu ngaturang banten ring...', ['Lontar miwah buku', 'Beras miwah taluh', 'Ayam miwah bebek', 'Candi miwah arca'], 'Lontar miwah buku', 'foto/lontar.jpg');
  nomor++; tambahSoal(form, nomor, 'Upacara penyucian ke segara sane kalaksanayang olih umat Hindu sedurung Nyepi kawastanin...', ['Melasti', 'Mepandes', 'Mabyakala', 'Matur piuning'], 'Melasti', 'foto/melasti.jpg');
  nomor++; tambahSoal(form, nomor, 'Sarana upacara sane malakar don nyuh medaging bunga, kaanggen ngaturang banten ring sang hyang widhi inggih punika...', ['Tamas', 'Canang', 'Tumpeng', 'Lamak'], 'Canang', 'foto/canang.jpg');
  nomor++; tambahSoal(form, nomor, 'Ngaturang banten saiban utawi ajengan nasi semengan kawastanin...', ['Maturan', 'Melukat', 'Ngejot', 'Melasti'], 'Ngejot', 'foto/saiban.jpg');
  nomor++; tambahSoal(form, nomor, 'Genah palinggihan Sang Hyang Widhi Wasa ring pura inggih punika...', ['Padmasana', 'Bale kulkul', 'Wantilan', 'Lumbung'], 'Padmasana', 'foto/padmasana.jpg');
  nomor++; tambahSoal(form, nomor, 'Rerahinan Galungan, umat Hindu mekarya sarana upacara marupa tiing sane lengkung tur kahias antuk janur miwah hasil bumi kawastanin...', ['Penjor', 'Tamiang', 'Sate', 'Lawar'], 'Penjor', 'foto/penjor.jpg');

  // -- soal ngadungang gambar (di game: tarik garis kata ke gambar) --
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Pura Besakih', 'foto/pura-besakih.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Penjor', 'foto/penjor.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Canang', 'foto/canang.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Mebakti', 'foto/mebakti.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Pura Besakih', 'Penjor', 'Canang', 'Mebakti', 'Pura Tanah Lot'], 'Pura Tanah Lot', 'foto/pura-tanah-lot.jpg');

  // ============ LEVEL 2: PAWONGAN ============
  form.addPageBreakItem().setTitle('Level 2: Pawongan')
      .setHelpText('10 soal pilihan ganda lan 5 soal ngadungang gambar.');
  nomor++; tambahSoal(form, nomor, 'Ngajak nyama patutne saling tulungin. Saling tulungin nyiriang idupe....', ['Sugih', 'Uyut', 'Lacur', 'Adung'], 'Adung', 'foto/gotong-royong.jpg');
  nomor++; tambahSoal(form, nomor, 'Rai demen masilihang teken timpale ane sing ngelah. Ento bacakan Solah ane....', ['Becik', 'Jele', 'Mayus', 'Lengit'], 'Becik', 'foto/timpal.jpg');
  nomor++; tambahSoal(form, nomor, 'Rerama sesai maang pitutur. Pitutur rerama patut....', ['Resepang', 'Kelidin', 'Saruin', 'Kalahin'], 'Resepang', 'foto/keluarga.jpg');
  nomor++; tambahSoal(form, nomor, 'Putu Budi ngelah cita-cita dadi dokter. Dadi dokter geginane tuah....', ['Nyampur ubad', 'Ngubadin anak gelem', 'Menahin montor', 'Ngae wewangunan'], 'Ngubadin anak gelem', 'foto/dokter.jpg');
  nomor++; tambahSoal(form, nomor, 'Ngomong sareng guru patut nganggen basa sane....', ['Kasar', 'Alus tur sopan', 'Keras', 'Sengit'], 'Alus tur sopan', 'foto/mebakti.jpg');
  nomor++; tambahSoal(form, nomor, 'Ring waktu mebersih kelas, iraga patut....', ['Gotong royong', 'Melaib', 'Nyingakin kemawon', 'Macepuk'], 'Gotong royong', 'foto/gotong-royong.jpg');
  nomor++; tambahSoal(form, nomor, 'Pianakne ane pertama suba ngajahin di SD. Anak ane geginane ngajahin di sekolah madan...', ['Guru', 'Satpam', 'Pengacara', 'Polisi'], 'Guru', 'foto/guru-murid.jpg');
  nomor++; tambahSoal(form, nomor, 'Tusing dadi lengit nulungin rerama magarapan. Lengit len raosne....', ['Jemet', 'Seleg', 'Mayus', 'Anteng'], 'Mayus', null);
  nomor++; tambahSoal(form, nomor, 'Yening ada timpal ane ulung patutne....', ['Kalahin', 'Tolih', 'Kedekin', 'Tulungin'], 'Tulungin', 'foto/timpal.jpg');
  nomor++; tambahSoal(form, nomor, 'Tresna asih metimpal. Tresna asih solah ane....', ['Melah', 'Corah', 'Jele', 'Gedeg'], 'Melah', 'foto/timpal.jpg');

  // -- soal ngadungang gambar (di game: tarik garis kata ke gambar) --
  nomor++; tambahSoal(form, nomor, 'Apaké balé gedé matampul abesik?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Pajeng (Payung)', 'foto/pajeng.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké ngamah acepok betek sesai?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Galeng (Bantal)', 'foto/galeng.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké anak cenik ngemu getih?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Klepon', 'foto/klepon.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké menék bajang, tuun tua?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Matan ai', 'foto/matan-ai.jpg');
  nomor++; tambahSoal(form, nomor, 'Apaké tolih ngejoh-ngejohang?', ['Pajeng (Payung)', 'Galeng (Bantal)', 'Klepon', 'Matan ai', 'Kuping (Telinga)'], 'Kuping (Telinga)', 'foto/kuping.jpg');

  // ============ LEVEL 3: PALEMAHAN ============
  form.addPageBreakItem().setTitle('Level 3: Palemahan')
      .setHelpText('10 soal pilihan ganda lan 5 soal ngadungang gambar.');
  nomor++; tambahSoal(form, nomor, 'Contoh sane ngamargiang pelestarian alam inggih punika ....', ['Ngutang luhu ring tukad', 'Nanem entik-entikan', 'Nembak kedis', 'Ngusak alas'], 'Nanem entik-entikan', 'foto/nanem-entik.jpg');
  nomor++; tambahSoal(form, nomor, 'Ngutang luu patutné di....', ['Tukad', 'Sémér', 'Got', 'Tong sampah'], 'Tong sampah', 'foto/tong-sampah.jpg');
  nomor++; tambahSoal(form, nomor, 'Iraga patut nyaga kabresihan déwék lan lingkungan apang setata…', ['Seger', 'Kual', 'Kumel', 'Daki'], 'Seger', 'foto/gotong-royong.jpg');
  nomor++; tambahSoal(form, nomor, 'I Putu demen nyampat di natahe. Nyampat kruna lingganyane…', ['Sampat', 'Sampate', 'Nyampat', 'Nyampatang'], 'Sampat', 'foto/sampat.jpg');
  nomor++; tambahSoal(form, nomor, 'Betén ené conto parilaksana hémat yéh…', ['ngematiang listrik yén suba tengai', 'tusing ngidupang AC masan ujan', 'negakin sepéda ka sekolah', 'ngematiang kran yén suba suud manjus'], 'ngematiang kran yén suba suud manjus', 'foto/kran-air.jpg');
  nomor++; tambahSoal(form, nomor, 'Yên suba hémat énergi lakar ngranayang hemat…', ['Nasi', 'Munyi', 'Prabéya', 'Bayu'], 'Prabéya', 'foto/hemat-listrik.jpg');
  nomor++; tambahSoal(form, nomor, 'Tiang ngubuh sampi di désa. Ngubuh patuh artiné…', ['Miara', 'Ngebus', 'Ngalih', 'Madep'], 'Miara', 'foto/sampi.jpg');
  nomor++; tambahSoal(form, nomor, 'Iraga patutné... tekén ubuh-ubuhan.', ['Gedeg', 'Sayang', 'Pedih', 'Tusing Demen'], 'Sayang', 'foto/sampi.jpg');
  nomor++; tambahSoal(form, nomor, 'Apang entik-entikané tusing layu patut…', ['Tumbeg', 'Abut', 'Tunjel', 'Siam'], 'Siam', 'foto/nyiram.jpg');
  nomor++; tambahSoal(form, nomor, 'Pidan anaké ngebuhang tanah di cariké nganggon buron sampi. Di zaman jani anaké ngebuhang tanah di carike nganggon...', ['Traktor', 'Kambing', 'HP', 'Robot'], 'Traktor', 'foto/traktor-sawah.jpg');

  // -- soal ngadungang gambar (di game: tarik garis kata ke gambar) --
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Subak', 'Tukad', 'Luu', 'Entik-entikan layu', 'Tong sampah'], 'Subak', 'foto/subak.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Subak', 'Tukad', 'Luu', 'Entik-entikan layu', 'Tong sampah'], 'Tukad', 'foto/tukad.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Subak', 'Tukad', 'Luu', 'Entik-entikan layu', 'Tong sampah'], 'Luu', 'foto/luu-tukad.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Subak', 'Tukad', 'Luu', 'Entik-entikan layu', 'Tong sampah'], 'Entik-entikan layu', 'foto/entik-layu.jpg');
  nomor++; tambahSoal(form, nomor, 'Gambar ené madan apa?', ['Subak', 'Tukad', 'Luu', 'Entik-entikan layu', 'Tong sampah'], 'Tong sampah', 'foto/tong-sampah.jpg');

  Logger.log('=================================================');
  Logger.log('Form dadi! Jumlah soal: ' + nomor);
  Logger.log('Tautan isi form  : ' + form.getPublishedUrl());
  Logger.log('Tautan edit form : ' + form.getEditUrl());
  Logger.log('=================================================');
  return form.getPublishedUrl();
}
