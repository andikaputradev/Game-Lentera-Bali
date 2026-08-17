#!/usr/bin/env python3
"""Bagi 45 soal game jadi PRE-TEST dan POST-TEST menurut kisi-kisi literasi.

Kisi-kisi yang diminta (tiap tes, total 20 soal, 30 menit):
    Makna Kata            10 soal
    Penggunaan             5 soal
    Pemahaman Kontekstual  5 soal

Lima soal yang DIBUANG: soal mencocokkan AKSARA BALI (gambar-ke-gambar).
Alasannya bukan karena sulit, tapi karena ia menguji pengenalan AKSARA -
kemampuan yang tidak ada dalam ketiga indikator di atas. Selain itu Google Form
tidak punya format mencocokkan gambar-ke-gambar.

Penetapan kategori dan tingkat kesulitan di bawah ini adalah PENILAIAN, bukan
hitungan otomatis. Ditulis terbuka supaya bisa diperiksa dan diubah.
"""
import io
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SKRAP = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# KATEGORI  : makna | penggunaan | kontekstual
# SULIT     : 1 (paling mudah) .. 5 (paling sulit)
# TES       : pre | post
#
# Aturan yang dipakai saat membagi:
#   * post-test dibuat lebih mudah -> soal ber-SULIT tinggi masuk pre-test
#   * kruna yang DIAJARKAN game (ada di Pustaka) cenderung lebih mudah
#   * cecimpedan (teka-teki) adalah yang tersulit: ia menuntut penalaran,
#     bukan sekadar tahu arti kata -> semuanya masuk pre-test
#   * jawaban yang sama tidak boleh muncul dua kali dalam satu tes
#     (Canang dan Penjor muncul sebagai soal PG sekaligus soal gambar)
# ---------------------------------------------------------------------------
TETAPAN = {
    # --- Level 1 Parahyangan, pilihan ganda ---
    1:  ('makna',       2, 'post', 'Pura - kruna diajarkan, kalimat pendek'),
    2:  ('makna',       2, 'post', 'Sang Hyang Widhi Wasa - istilah paling dikenal'),
    3:  ('kontekstual', 4, 'pre',  'menghubungkan sarana upacara dengan tujuan'),
    4:  ('kontekstual', 5, 'pre',  'kalimat terpanjang, alasan abstrak'),
    5:  ('kontekstual', 3, 'pre',  'Saraswati; ditukar dengan #16 agar post tidak didominasi Parahyangan'),
    6:  ('makna',       2, 'post', 'Melasti - kruna diajarkan'),
    7:  ('makna',       2, 'post', 'Canang - kruna diajarkan, sehari-hari'),
    8:  ('makna',       3, 'post', 'Ngejot - kruna diajarkan'),
    9:  ('makna',       3, 'pre',  'Padmasana - istilah lebih teknis'),
    10: ('makna',       2, 'post', 'Penjor - kruna diajarkan, sangat dikenal'),
    # --- Level 1, soal gambar (jadi: "Gambar ené madan apa?") ---
    11: ('makna',       2, 'post', 'foto Pura Besakih -> nama'),
    12: ('makna',       2, 'pre',  'foto Penjor; kembaran soal 10 -> tes berbeda'),
    13: ('makna',       2, 'pre',  'foto Canang; kembaran soal 7 -> tes berbeda'),
    14: ('makna',       3, 'post', 'foto Mebakti -> nama kegiatan'),
    15: ('makna',       2, 'post', 'foto Pura Tanah Lot -> nama'),

    # --- Level 2 Pawongan, pilihan ganda ---
    16: ('kontekstual', 4, 'post', 'saling tulungin -> nilai adung; ditukar dengan #5'),
    17: ('penggunaan',  3, 'pre',  'melengkapi solah: becik'),
    18: ('penggunaan',  4, 'pre',  'resepang - kruna kurang lazim bagi anak'),
    19: ('penggunaan',  2, 'post', 'pekerjaan dokter - sangat konkret'),
    20: ('kontekstual', 3, 'post', 'basa alus kepada guru - inti Pawongan'),
    21: ('kontekstual', 2, 'post', 'gotong royong di kelas - konkret'),
    22: ('penggunaan',  2, 'post', 'guru - kruna diajarkan'),
    23: ('makna',       4, 'buang', 'sinonim lengit = mayus - digantikan soal aksara'),
    47: ('makna',       4, 'post', 'AKSARA: sampat - kruna diajarkan, jadi lebih terbaca'),
    24: ('penggunaan',  2, 'post', 'timpal ulung -> tulungin'),
    25: ('penggunaan',  3, 'pre',  'tresna asih -> melah'),
    # --- Level 2, cecimpedan (teka-teki) - TERSULIT, semua ke pre-test ---
    26: ('makna',       5, 'pre',  'cecimpedan: pajeng'),
    27: ('makna',       5, 'pre',  'cecimpedan: galeng'),
    28: ('makna',       5, 'pre',  'cecimpedan: klepon'),
    29: ('makna',       5, 'pre',  'cecimpedan: matan ai'),
    30: ('makna',       5, 'buang', 'cecimpedan: kuping - digantikan soal aksara'),
    46: ('makna',       5, 'pre',  'AKSARA: sampi - membaca aksara Bali'),

    # --- Level 3 Palemahan, pilihan ganda ---
    31: ('kontekstual', 2, 'post', 'nanem entik-entikan - konkret'),
    32: ('kontekstual', 2, 'post', 'buang sampah di tong sampah - konkret'),
    33: ('penggunaan',  2, 'post', 'jaga kebersihan -> seger'),
    34: ('penggunaan',  5, 'pre',  'kruna lingga - soal tata bahasa, abstrak'),
    35: ('kontekstual', 4, 'pre',  'hemat air - empat pilihan panjang'),
    36: ('makna',       4, 'pre',  'prabéya - jarang dipakai anak; dipindah ke pre agar Makna Kata pas 10/10'),
    37: ('makna',       4, 'pre',  'sinonim ngubuh = miara'),
    38: ('penggunaan',  2, 'post', 'sayang teken ubuh-ubuhan'),
    39: ('penggunaan',  3, 'pre',  'siam - kruna diajarkan'),
    40: ('kontekstual', 4, 'pre',  'traktor menggantikan sampi - butuh nalar sejarah'),
}

DIBUANG = {41: 'aksara Bali', 42: 'aksara Bali', 43: 'aksara Bali',
           44: 'aksara Bali', 45: 'aksara Bali'}

# Soal gambar diubah jadi pilihan ganda supaya bisa dipakai di Google Form.
GAMBAR = {
    11: ('Gambar ené madan apa?', 'foto/s11-pura-besakih.jpg',
         ['Pura Besakih', 'Pura Tanah Lot', 'Pura Ulun Danu', 'Padmasana'], 0),
    12: ('Gambar ené madan apa?', 'foto/s12-penjor.jpg',
         ['Penjor', 'Lamak', 'Tamiang', 'Sate'], 0),
    13: ('Gambar ené madan apa?', 'foto/canang.jpg',
         ['Canang', 'Tamas', 'Tumpeng', 'Lamak'], 0),
    14: ('Gambar ené madan apa?', 'foto/mebakti.jpg',
         ['Mebakti', 'Melasti', 'Ngejot', 'Mepandes'], 0),
    15: ('Gambar ené madan apa?', 'foto/s15-pura-tanah-lot.jpg',
         ['Pura Tanah Lot', 'Pura Besakih', 'Pura Luhur Uluwatu', 'Pura Taman Ayun'], 0),
    26: ('Apaké balé gedé matampul abesik?', None,
         ['Pajeng', 'Galeng', 'Kuping', 'Klepon'], 0),
    27: ('Apaké ngamah acepok betek sesai?', None,
         ['Galeng', 'Pajeng', 'Sampi', 'Tukad'], 0),
    28: ('Apaké anak cenik ngemu getih?', None,
         ['Klepon', 'Canang', 'Penjor', 'Banten'], 0),
    29: ('Apaké menék bajang, tuun tua?', None,
         ['Matan ai', 'Bulan', 'Tukad', 'Pajeng'], 0),
    30: ('Apaké tolih ngejoh-ngejohang?', None,
         ['Kuping', 'Mata', 'Cunguh', 'Lima'], 0),
}

# Bacaan tiap aksara diperiksa dua arah: dari gambar pasangannya di game
# (soal3 berpasangan dengan foto sampi) dan dari BuatFormLenteraBali.gs.
AKSARA = {
    46: ('Aksara Bali ené wacén. Krunané madan apa?', 'foto/aksara/soal3.jpg',
         ['Sampi', 'Bulan', 'Bintang', 'Sampat'], 0, '3', 'Palemahan'),
    47: ('Aksara Bali ené wacén. Krunané madan apa?', 'foto/aksara/soal4.jpg',
         ['Sampat', 'Sampi', 'Bulan', 'Matan ai'], 0, '3', 'Palemahan'),
}

URUT = ['makna', 'penggunaan', 'kontekstual']
NAMA_KAT = {'makna': 'Makna Kata', 'penggunaan': 'Penggunaan',
            'kontekstual': 'Pemahaman Kontekstual'}
TARGET = {'makna': 10, 'penggunaan': 5, 'kontekstual': 5}


def muat():
    return json.load(io.open(os.path.join(SKRAP, 'soal45.json'), encoding='utf-8'))


def rakit():
    asli = {x['no']: x for x in muat()}
    tes = {'pre': [], 'post': []}
    for no, (kat, sulit, mana, alasan) in sorted(TETAPAN.items()):
        if mana == 'buang':
            continue
        if no in AKSARA:
            q, img, opsi, benar, lv, thk = AKSARA[no]
        else:
            a = asli[no]
            lv, thk = a['level'], a['thk']
            if no in GAMBAR:
                q, img, opsi, benar = GAMBAR[no]
            else:
                q, img, opsi, benar = a['q'], a.get('img'), a['o'], a['c']
        tes[mana].append({'asal': no, 'kategori': kat, 'sulit': sulit,
                          'alasan': alasan, 'thk': thk, 'level': lv,
                          'q': q, 'img': img, 'o': opsi, 'c': benar})
    for m in tes:
        tes[m].sort(key=lambda x: (URUT.index(x['kategori']), x['asal']))
        seimbangkan_kunci(tes[m])
    return tes


def seimbangkan_kunci(daftar):
    """Putar urutan pilihan supaya kunci jatuh bergilir A, B, C, D.

    Tanpa ini 11 dari 20 kunci pre-test menumpuk di pilihan A - anak yang
    menjawab A terus akan dapat nilai lebih tinggi daripada yang menebak acak,
    dan itu merusak tes sebagai alat ukur. Penggiliran ini pasti, bukan acak,
    jadi hasilnya sama setiap kali skrip dijalankan.
    """
    for i, x in enumerate(daftar):
        tujuan = i % 4
        if len(x['o']) != 4:
            continue
        geser = (tujuan - x['c']) % 4
        if geser:
            x['o'] = x['o'][-geser:] + x['o'][:-geser]
            x['c'] = tujuan


def periksa(tes):
    galat = []
    for m, daftar in tes.items():
        if len(daftar) != 20:
            galat.append(f'{m}: {len(daftar)} soal, seharusnya 20')
        for kat, n in TARGET.items():
            ada = sum(1 for x in daftar if x['kategori'] == kat)
            if ada != n:
                galat.append(f'{m}/{NAMA_KAT[kat]}: {ada} soal, seharusnya {n}')
        jawab = [x['o'][x['c']] for x in daftar]
        kembar = {j for j in jawab if jawab.count(j) > 1}
        if kembar:
            galat.append(f'{m}: jawaban kembar dalam satu tes -> {kembar}')
        letak = [x['c'] for x in daftar]
        for k in range(4):
            if letak.count(k) != len(daftar) // 4:
                galat.append(f'{m}: kunci di pilihan {"ABCD"[k]} ada '
                             f'{letak.count(k)}, seharusnya {len(daftar)//4}')
        for x in daftar:
            if x['c'] is None or not (0 <= x['c'] < len(x['o'])):
                galat.append(f"{m}: soal asal #{x['asal']} kunci jawaban tidak sah")
            if len(x['o']) != 4:
                galat.append(f"{m}: soal asal #{x['asal']} punya {len(x['o'])} pilihan")
    return galat


def main():
    tes = rakit()
    galat = periksa(tes)
    for m in ('pre', 'post'):
        d = tes[m]
        rata = sum(x['sulit'] for x in d) / len(d)
        thk = {}
        for x in d:
            thk[x['thk']] = thk.get(x['thk'], 0) + 1
        print(f'=== {m.upper()}-TEST  ({len(d)} soal) ===')
        for kat in URUT:
            n = [x for x in d if x['kategori'] == kat]
            print(f'  {NAMA_KAT[kat]:22s} {len(n):2d} soal   '
                  f'rata-rata sulit {sum(x["sulit"] for x in n)/len(n):.1f}')
        print(f'  Tri Hita Karana      : ' +
              '  '.join(f'{k} {v}' for k, v in sorted(thk.items())))
        print(f'  RATA-RATA KESULITAN  : {rata:.2f} / 5\n')
    print('soal dibuang:', ', '.join(f'#{k} ({v})' for k, v in DIBUANG.items()))
    print('\npemeriksaan:', 'LOLOS' if not galat else 'GAGAL')
    for g in galat:
        print('  !', g)
    json.dump(tes, io.open(os.path.join(SKRAP, 'pre-post.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
