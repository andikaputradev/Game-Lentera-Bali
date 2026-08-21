# Kamus Basa Bali — cakupan dan kekurangan

Kamus di dalam game berisi **69 kruna**, dari tiga sanad:

- **Pustaka** — 32 kruna
- **Wikikamus** — 31 kruna
- **Soal** — 6 kruna

Kosakata di soal: **326 kata unik**. Yang sudah tertutup kamus: **71** (21%).

## Kruna yang BELUM ada artinya

Diurut dari yang paling sering muncul di soal — isi dari atas kalau waktunya terbatas. Kolom "muncul" = berapa kali kata itu dipakai di soal atau pilihan jawaban.

| muncul | kruna | arti (isi di sini) |
|---|---|---|
| 11x | miwah | |
| 9x | sane | |
| 8x | ring | |
| 6x | patut | |
| 6x | hindu | |
| 6x | ane | |
| 5x | umat | |
| 5x | ngaturang | |
| 5x | kawastanin | |
| 5x | apaké | |
| 4x | suba | |
| 3x | upacara | |
| 3x | sekolah | |
| 3x | punika | |
| 3x | lengit | |
| 3x | demen | |
| 3x | dadi | |
| 2x | yén | |
| 2x | utawi | |
| 2x | tur | |
| 2x | tolih | |
| 2x | solah | |
| 2x | sesai | |
| 2x | sarana | |
| 2x | rerahinan | |
| 2x | putu | |
| 2x | pitutur | |
| 2x | patutné | |
| 2x | patutne | |
| 2x | ngutang | |
| 2x | ngubuh | |
| 2x | ngelah | |
| 2x | ngebuhang | |
| 2x | nganggon | |
| 2x | ngajahin | |
| 2x | nasi | |
| 2x | mekarya | |
| 2x | maturan | |
| 2x | kalahin | |
| 2x | jele | |
| 2x | hémat | |
| 2x | genah | |
| 2x | geginane | |
| 2x | entik | |
| 2x | cita | |
| 2x | bale | |
| 2x | apang | |
| 2x | antuk | |
| 2x | anaké | |
| 1x | énergi | |
| 1x | zaman | |
| 1x | yên | |
| 1x | yening | |
| 1x | wewidangan | |
| 1x | wewangunan | |
| 1x | wantilan | |
| 1x | waktu | |
| 1x | uyut | |
| 1x | ubuhan | |
| 1x | ubuh | |

_...dan 195 kruna lain yang muncul 1–2 kali._

## Cara menambahkannya

Isi tabel di atas, lalu kirimkan kembali — entri baru akan ditandai sanad **Guru** di dalam aplikasi, terpisah dari Wikikamus dan Pustaka, supaya jelas mana yang datang dari siapa.

## Kenapa tidak memakai API kamus

- **BASAbali Wiki** (dictionary.basabali.org) adalah sumber terbaik untuk basa Bali, tapi ia berada di balik Cloudflare: permintaan dari luar peramban dijawab **403**, jadi tidak bisa dipanggil dari dalam game.

- **Wiktionary Bali** (ban.wiktionary) belum jadi wiki tersendiri — masih di Wikimedia Incubator.

- **Wikikamus Indonesia** (id.wiktionary) bisa dipanggil dan mengizinkan CORS, tapi dari 326 kata soal hanya **34** yang punya bagian `{{bahasa|ban}}`. Ke-34 itulah yang dipakai, diunduh sekali lalu disimpan ke dalam berkas.

- Menyimpan datanya di dalam aplikasi juga berarti **kamus tetap bisa dibuka tanpa sinyal** — di sekolah itu yang menentukan.
