// Bangun berkas Apps Script (.gs) yang membuat Google Form berisi soal
// PERSIS SAMA dengan yang ada di game. Soal, pilihan, urutan, dan kunci
// jawaban diambil langsung dari index.html supaya tidak mungkin melenceng.
const fs = require('fs');

const HTML = process.argv[2];
const BASE = 'https://dimassastra.github.io/Game-Lentera-Bali';
const src = fs.readFileSync(HTML, 'utf8');

function blok(awal, akhir) {
  const i = src.indexOf(awal), j = src.indexOf(akhir, i);
  return src.slice(i + awal.length, j).replace(/\s*;\s*$/, '');
}
const db = eval('(' + blok('const quizDatabase = ', 'const arDatabaseLinks') + ')');
const NAMA = { 1: 'Parahyangan', 2: 'Pawongan', 3: 'Palemahan' };

const bagian = [];
for (const lvl of Object.keys(db)) {
  const pg = [], cocok = [];
  db[lvl].forEach((q, idx) => {
    if (q.q) {
      pg.push({ soal: q.q, pilihan: q.o, benar: q.o[q.c], img: q.img, idx });
    } else {
      cocok.push({ teks: q.text, label: q.answerLabel || q.text, img: q.img, idx });
    }
  });
  // Soal mencocokkan di game = tarik garis kata <-> gambar. Di Form itu tidak
  // ada, jadi diubah jadi pilihan ganda: gambarnya ditampilkan, pilihannya
  // adalah kelima kata dari level yang sama. Isinya tetap persis sama.
  const semuaLabel = cocok.map(c => c.label);
  // Level Pawongan memakai CECIMPEDAN (teka-teki): teka-tekinya dipakai apa
  // adanya sebagai pertanyaan supaya isinya tidak hilang. Level lain cukup
  // "gambar ené madan apa?" karena teks kirinya memang kata itu sendiri.
  const cocokPG = cocok.map(c => ({
    soal: (c.teks && c.teks !== c.label) ? c.teks : 'Gambar ené madan apa?',
    pilihan: semuaLabel,
    benar: c.label,
    img: c.img,
    idx: c.idx,
  }));
  bagian.push({ lvl: +lvl, nama: NAMA[lvl], pg, cocok: cocokPG });
}

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');

let g = `/**
 * Membuat Google Form kuis "Lentera Bali" -- soalnya PERSIS SAMA dengan game
 * di ${BASE}
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
      'Soalne pateh sareng game Lentera Bali.\\n\\n' +
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

  var BASE = '${BASE}';

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
`;

for (const b of bagian) {
  g += `
  // ============ LEVEL ${b.lvl}: ${b.nama.toUpperCase()} ============
  form.addPageBreakItem().setTitle('Level ${b.lvl}: ${b.nama}')
      .setHelpText('${b.pg.length} soal pilihan ganda lan ${b.cocok.length} soal ngadungang gambar.');
`;
  for (const q of b.pg) {
    g += `  nomor++; tambahSoal(form, nomor, '${esc(q.soal)}', [${q.pilihan.map(p => `'${esc(p)}'`).join(', ')}], '${esc(q.benar)}', ${q.img ? `'${q.img}'` : 'null'});\n`;
  }
  g += `\n  // -- soal ngadungang gambar (di game: tarik garis kata ke gambar) --\n`;
  for (const q of b.cocok) {
    g += `  nomor++; tambahSoal(form, nomor, '${esc(q.soal)}', [${q.pilihan.map(p => `'${esc(p)}'`).join(', ')}], '${esc(q.benar)}', '${q.img}');\n`;
  }
}

g += `
  Logger.log('=================================================');
  Logger.log('Form dadi! Jumlah soal: ' + nomor);
  Logger.log('Tautan isi form  : ' + form.getPublishedUrl());
  Logger.log('Tautan edit form : ' + form.getEditUrl());
  Logger.log('=================================================');
  return form.getPublishedUrl();
}
`;

const out = process.argv[3] || 'BuatFormLenteraBali.gs';
fs.writeFileSync(out, g, 'utf8');
const totalPG = bagian.reduce((a, b) => a + b.pg.length, 0);
const totalC = bagian.reduce((a, b) => a + b.cocok.length, 0);
console.log(`${out} ditulis: ${totalPG} soal pilihan ganda + ${totalC} soal mencocokkan = ${totalPG + totalC} soal`);
bagian.forEach(b => console.log(`  Level ${b.lvl} ${b.nama}: ${b.pg.length} PG + ${b.cocok.length} cocok`));
