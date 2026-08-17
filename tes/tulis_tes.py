#!/usr/bin/env python3
"""Tulis dua keluaran dari hasil pembagian: dokumen soal dan skrip Google Form."""
import io
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
SKRAP = os.path.dirname(os.path.abspath(__file__))
REPO = r'C:\Users\DIMAS\Documents\Claude\Game-Lentera-Bali'
TES_DIR = os.path.join(REPO, 'tes')
BASIS = 'https://dimassastra.github.io/Game-Lentera-Bali/'

NAMA_KAT = {'makna': 'Makna Kata', 'penggunaan': 'Penggunaan',
            'kontekstual': 'Pemahaman Kontekstual'}
URUT = ['makna', 'penggunaan', 'kontekstual']
HURUF = 'ABCD'


def dokumen(tes):
    b = []
    b.append('# Pre-Test & Post-Test — Literasi Basa Bali\n')
    b.append('Diambil dari 45 soal game Lentera Bali.\n')
    b.append('**Yang dibuang (5 soal):** lima soal mencocokkan aksara Bali '
             'gambar-ke-gambar. Google Form tidak punya format itu, dan sebagai '
             'soal ia menguji pengenalan aksara — di luar ketiga indikator.\n')
    b.append('**Yang dikembalikan (2 soal):** satu soal aksara per tes, ditulis '
             'ulang jadi pilihan ganda (gambar aksara → nama krunanya). Supaya '
             'jumlahnya tetap 20 dan kisi-kisi tetap 10/5/5, dua soal Makna Kata '
             'lain diganti: cecimpedan *kuping* di pre-test dan sinonim '
             '*lengit = mayus* di post-test.\n')
    b.append('**Letak kunci jawaban digilir A–B–C–D.** Tanpa itu 11 dari 20 kunci '
             'pre-test menumpuk di pilihan A, dan anak yang menjawab A terus akan '
             'unggul atas yang menebak acak.\n')
    b.append('**Empat soal cecimpedan sengaja tanpa gambar** — di game, gambarnya '
             'adalah jawabannya, jadi menampilkannya akan membocorkan jawaban.\n')
    b.append('| | Pre-Test | Post-Test |')
    b.append('|---|---|---|')
    for kat in URUT:
        b.append(f'| {NAMA_KAT[kat]} | '
                 f'{sum(1 for x in tes["pre"] if x["kategori"] == kat)} soal | '
                 f'{sum(1 for x in tes["post"] if x["kategori"] == kat)} soal |')
    for m in ('pre', 'post'):
        pass
    b.append(f'| **Total** | **{len(tes["pre"])} soal** | **{len(tes["post"])} soal** |')
    b.append('| Durasi | 30 menit | 30 menit |')
    b.append(f'| Rata-rata kesulitan | '
             f'{sum(x["sulit"] for x in tes["pre"])/len(tes["pre"]):.2f} / 5 | '
             f'{sum(x["sulit"] for x in tes["post"])/len(tes["post"]):.2f} / 5 |')
    for m in ('pre', 'post'):
        thk = {}
        for x in tes[m]:
            thk[x['thk']] = thk.get(x['thk'], 0) + 1
    b.append('')
    b.append('Sebaran Tri Hita Karana — Pre: ' +
             ', '.join(f'{k} {sum(1 for x in tes["pre"] if x["thk"] == k)}'
                       for k in ('Parahyangan', 'Pawongan', 'Palemahan')) +
             '  ·  Post: ' +
             ', '.join(f'{k} {sum(1 for x in tes["post"] if x["thk"] == k)}'
                       for k in ('Parahyangan', 'Pawongan', 'Palemahan')))
    b.append('')

    for m, judul in (('pre', 'PRE-TEST'), ('post', 'POST-TEST')):
        b.append(f'\n---\n\n## {judul}\n')
        b.append('Nama: ______________________  Kelas: __________  '
                 'Waktu: 30 menit\n')
        n = 0
        kat_kini = None
        for x in tes[m]:
            if x['kategori'] != kat_kini:
                kat_kini = x['kategori']
                jml = sum(1 for y in tes[m] if y['kategori'] == kat_kini)
                b.append(f'\n### {NAMA_KAT[kat_kini]} ({jml} soal)\n')
            n += 1
            b.append(f'**{n}.** {x["q"]}')
            if x['img']:
                b.append(f'   ![]({BASIS}{x["img"]})')
            for i, o in enumerate(x['o']):
                b.append(f'   {HURUF[i]}. {o}')
            b.append('')
        b.append(f'\n**Kunci jawaban {judul}**\n')
        baris = []
        for i, x in enumerate(tes[m], 1):
            baris.append(f'{i}.{HURUF[x["c"]]}')
        for i in range(0, len(baris), 10):
            b.append('   ' + '  '.join(baris[i:i + 10]))
        b.append('')
        b.append(f'\n**Asal soal & alasan penempatan ({judul})**\n')
        b.append('| No | Soal asal | Kategori | THK | Sulit | Alasan |')
        b.append('|---|---|---|---|---|---|')
        for i, x in enumerate(tes[m], 1):
            b.append(f'| {i} | #{x["asal"]} | {NAMA_KAT[x["kategori"]]} | '
                     f'{x["thk"]} | {x["sulit"]}/5 | {x["alasan"]} |')
    return '\n'.join(b)


def apps_script(tes):
    data = {m: [{'q': x['q'], 'img': (BASIS + x['img']) if x['img'] else None,
                 'o': x['o'], 'c': x['c'], 'kat': NAMA_KAT[x['kategori']]}
                for x in tes[m]] for m in ('pre', 'post')}
    return '''/**
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
var DATA = %s;

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
''' % json.dumps(data, ensure_ascii=False, indent=1)


def main():
    tes = json.load(io.open(os.path.join(SKRAP, 'pre-post.json'), encoding='utf-8'))
    os.makedirs(TES_DIR, exist_ok=True)
    d = os.path.join(TES_DIR, 'PRETEST-POSTTEST.md')
    io.open(d, 'w', encoding='utf-8', newline='\n').write(dokumen(tes))
    g = os.path.join(TES_DIR, 'BuatFormPrePost.gs')
    io.open(g, 'w', encoding='utf-8', newline='\n').write(apps_script(tes))
    for p in (d, g):
        print(f'{os.path.basename(p):26s} {os.path.getsize(p)//1024} KB')
    bergambar = {m: sum(1 for x in tes[m] if x['img']) for m in tes}
    print(f'\nsoal bergambar: pre {bergambar["pre"]}/20, post {bergambar["post"]}/20')


if __name__ == '__main__':
    main()
