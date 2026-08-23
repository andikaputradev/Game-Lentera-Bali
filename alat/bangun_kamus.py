# -*- coding: utf-8 -*-
"""Bangun data Kamus Basa Bali dari dokumen Kosa Basa (.docx) -> kamus/kamus.json,
kamus/CAKUPAN.md, kamus/belum-ada-arti.json, dan baris `const KAMUS` di index.html.

Pakai:  python alat/bangun_kamus.py [jalur/Kosa Basa.docx]
Format dokumen: satu baris per kata  "Kruna = arti"; judul "Adan Dina/Rahina" dan
"Adan Angka" memulai kelompok nama hari dan bilangan. Kata ganda dibuang.
"""
import zipfile, re, json, io, sys, os, unicodedata
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DOCX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.expanduser('~'), 'Downloads', 'Kosa Basa.docx')
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

z = zipfile.ZipFile(DOCX)
xml = z.read('word/document.xml').decode('utf8')
paras = [''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, flags=re.S)).strip()
         for p in re.findall(r'<w:p[ >].*?</w:p>', xml, flags=re.S)]
paras = [p for p in paras if p]

# --- pembagian kelompok berdasarkan judul di dokumen ---
KELOMPOK = {'kata': 'Kosa Basa', 'dina': 'Adan Dina / Rahina', 'angka': 'Adan Angka'}
grup = 'kata'
baris = []   # (grup, kiri, kanan)
for p in paras:
    low = p.lower()
    if low.startswith('kosa basa'): grup = 'kata'; continue
    if low.startswith('adan dina'): grup = 'dina'; continue
    if low.startswith('adan angka'): grup = 'angka'; continue
    if '=' not in p: print('LEWAT (tanpa =):', p); continue
    kiri, kanan = [x.strip() for x in p.split('=', 1)]
    baris.append((grup, kiri, kanan))

# --- pembakuan ejaan Indonesia (KBBI) untuk 3 kata; selebihnya apa adanya ---
BAKU = {'males': 'malas', 'pertunjukkan': 'pertunjukan', 'naséhat': 'nasihat'}
ANGKA_KATA = {1:'satu',2:'dua',3:'tiga',4:'empat',5:'lima',6:'enam',7:'tujuh',8:'delapan',9:'sembilan',10:'sepuluh',
              11:'sebelas',12:'dua belas',13:'tiga belas',14:'empat belas',15:'lima belas',16:'enam belas',17:'tujuh belas',
              18:'delapan belas',19:'sembilan belas',20:'dua puluh',30:'tiga puluh',40:'empat puluh',50:'lima puluh',
              75:'tujuh puluh lima',100:'seratus'}

# foto & suara yang sudah ada di repo dan cocok persis dengan kata di dokumen
MEDIA = {
    'mebakti':  ('mebakti', 'mebakti'),
    'rerama':   ('keluarga', 'rerama'),
    'nyampat':  ('sampat', 'nyampat'),
    'prabeya':  ('s36-prabeya-hemat', 'prabeya'),
    'timpal':   ('timpal', None),
    'mamula':   ('nanem-entik', None),
    'luhu':     ('luu-tukad', None),
    'miara':    ('sampi', None),
    'ngajahin': ('s22-guru-ngajahin', None),
}

def rapikan_kata(k):
    # "Jemet/anteng" -> "Jemet / Anteng"; "Dura negara" tetap
    bagian = [b.strip() for b in k.split('/')]
    bagian = [b[:1].upper() + b[1:] for b in bagian]
    return ' / '.join(bagian)

def kunci_urut(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')

entri = []
sudah = set()
for grup, kiri, kanan in baris:
    k = rapikan_kata(kiri)
    a = BAKU.get(kanan, kanan)
    kunci = (grup, kunci_urut(k))
    if kunci in sudah: print('DUPLIKAT dibuang:', k, '=', a); continue
    sudah.add(kunci)
    e = {'k': k, 'a': a, 'g': grup, 's': 'Kosa Basa'}
    if grup == 'angka':
        n = int(re.sub(r'\D', '', a))
        e['a'] = '%d (%s)' % (n, ANGKA_KATA[n]) if n in ANGKA_KATA else a
        e['j'] = 'adan angka'
    elif grup == 'dina':
        e['j'] = 'adan dina'
    m = MEDIA.get(kunci_urut(k.split(' / ')[0]))
    if m:
        if m[0]: e['f'] = m[0]
        if m[1]: e['u'] = m[1]
    entri.append(e)

# urutkan: kata -> abjad; dina & angka -> sesuai dokumen
kata = sorted([e for e in entri if e['g'] == 'kata'], key=lambda e: kunci_urut(e['k']))
dina = [e for e in entri if e['g'] == 'dina']
angka = [e for e in entri if e['g'] == 'angka']
semua = kata + dina + angka
print('kata=%d dina=%d angka=%d total=%d' % (len(kata), len(dina), len(angka), len(semua)))

# --- kamus/kamus.json (berkas data yang bisa dibaca manusia) ---
rapi = [{'k': e['k'], 'arti': e['a'], 'kelompok': KELOMPOK[e['g']], 'sumber': 'Kosa Basa.docx',
         'foto': e.get('f'), 'au': e.get('u')} for e in semua]
with open(os.path.join(REPO, 'kamus', 'kamus.json'), 'w', encoding='utf8') as f:
    json.dump(rapi, f, ensure_ascii=False, indent=1)

# --- baris const KAMUS di index.html ---
kompak = json.dumps(semua, ensure_ascii=False, separators=(',', ':'))
path = os.path.join(REPO, 'index.html')
src = open(path, encoding='utf8', newline='').read()
pola = re.compile(r'^  const KAMUS = \[.*?\];$', re.M | re.S)
assert len(pola.findall(src)) == 1, 'const KAMUS tidak unik/tidak ketemu'
src = pola.sub(lambda m: '  const KAMUS = ' + kompak + ';', src)
open(path, 'w', encoding='utf8', newline='').write(src)
print('index.html: const KAMUS diganti (%d byte)' % len(kompak))

# --- cakupan kosakata soal (untuk kamus/CAKUPAN.md & belum-ada-arti.json) ---
blok = re.search(r'const quizDatabase = \{.*?\n  \};', src, flags=re.S).group(0)
teks = re.findall(r'\bq: "(.*?)"', blok) + re.findall(r'\btext: "(.*?)"', blok)
for o in re.findall(r'\bo: \[(.*?)\]', blok):
    teks += re.findall(r'"(.*?)"', o)
hit = Counter()
for t in teks:
    for w in re.findall(r"[A-Za-zÀ-ÿ'\-]+", t):
        w = w.strip("'-").lower()
        if len(w) >= 2: hit[w] += 1
kamus_kata = set()
for e in semua:
    for b in e['k'].split(' / '):
        kamus_kata.add(kunci_urut(b))
        kamus_kata.add(b.lower())
tertutup = [w for w in hit if w in kamus_kata or kunci_urut(w) in kamus_kata]
belum = [(w, n) for w, n in hit.most_common() if w not in kamus_kata and kunci_urut(w) not in kamus_kata]
print('kata unik soal=%d tertutup=%d belum=%d' % (len(hit), len(tertutup), len(belum)))
with open(os.path.join(REPO, 'kamus', 'belum-ada-arti.json'), 'w', encoding='utf8') as f:
    json.dump([{'kruna': w, 'muncul': n, 'arti': ''} for w, n in belum], f, ensure_ascii=False, indent=1)
md = ['# Kamus Basa Bali — cakupan dan kekurangan', '',
      'Kamus di dalam game berisi **%d kruna**, seluruhnya dari berkas **Kosa Basa.docx** (daftar kosakata dari guru), dalam tiga kelompok:' % len(semua), '',
      '- **Kosa Basa** — %d kruna (urut abjad)' % len(kata),
      '- **Adan Dina / Rahina** — %d nama hari' % len(dina),
      '- **Adan Angka** — %d bilangan' % len(angka), '',
      'Pembakuan ejaan Indonesia yang dilakukan: ' + ', '.join('"%s" → "%s"' % kv for kv in BAKU.items()) + '. Satu entri ganda di dokumen ("Nganggo") dibuang.', '',
      'Dibangun ulang dengan `python alat/bangun_kamus.py [jalur .docx]`; ganti dokumennya lalu jalankan lagi untuk memperbarui.', '',
      'Kosakata di soal: **%d kata unik**. Yang sudah tertutup kamus: **%d** (%d%%).' % (len(hit), len(tertutup), round(100*len(tertutup)/len(hit))), '',
      '## Kruna yang BELUM ada artinya', '',
      'Diurut dari yang paling sering muncul di soal — isi dari atas kalau waktunya terbatas. Kolom "muncul" = berapa kali kata itu dipakai di soal atau pilihan jawaban.', '',
      '| muncul | kruna | arti (isi di sini) |', '|---|---|---|']
md += ['| %dx | %s | |' % (n, w) for w, n in belum]
open(os.path.join(REPO, 'kamus', 'CAKUPAN.md'), 'w', encoding='utf8').write('\n'.join(md) + '\n')
print('CAKUPAN.md & belum-ada-arti.json diperbarui')
