# Teks Play Store — Lentera Bali

Semua angka di bawah diambil dari kode yang sedang tayang, bukan perkiraan.
Batas Play Console: judul 30 karakter, deskripsi singkat 80, deskripsi lengkap 4000.

---

## Judul aplikasi (23 karakter)

```
Lentera Bali: Basa Bali
```

Cadangan kalau ingin lebih pendek: `Lentera Bali` (12 karakter).

---

## Deskripsi Singkat (76 karakter)

```
Game belajar Basa Bali untuk SD: kuis, kamus 103 kruna, dan materi bersuara.
```

Cadangan (78 karakter):

```
Belajar Basa Bali lewat kuis, kamus, dan materi bersuara. Bisa dipakai luring.
```

---

## Deskripsi Aplikasi (1.780 karakter)

```
Lentera Bali mengajak anak SD belajar Basa Bali sambil bermain, ditemani dua sahabat kecil: Putu dan Ni Luh.

Seluruh isinya disusun mengikuti Tri Hita Karana, tiga jalan menjaga keharmonisan hidup orang Bali:

• Parahyangan — hubungan manusia dengan Sang Hyang Widhi: pura, canang, banten, penjor, Melasti.
• Pawongan — hubungan manusia dengan sesama: saling tulungin, gotong royong, basa alus, cecimpedan (teka-teki).
• Palemahan — hubungan manusia dengan alam: menjaga kebersihan, hemat air, sampi, dan subak.

APA SAJA DI DALAMNYA

• 45 soal berjenjang — 30 pilihan ganda dan 15 soal mencocokkan gambar dengan cara menarik garis.
• Kamus Basa Bali berisi 103 kruna: kosakata harian, nama hari (Redite sampai Saniscara), dan bilangan (Sa, Dua, Telu, sampai Satus). Bisa dicari dua arah — ketik krunanya atau ketik artinya dalam Bahasa Indonesia.
• Pustaka bergambar: 9 materi berisi 32 kruna, lengkap dengan foto asli dan penjelasan singkat.
• Suara Basa Bali di setiap soal dan setiap kata, supaya anak tahu cara melafalkannya, bukan hanya membacanya.
• Aksara Bali ditampilkan dengan huruf yang benar, bukan gambar.
• Petualangan 360° untuk menjelajahi tempat budaya Bali setelah menyelesaikan sebuah tingkat.

DIRANCANG UNTUK ANAK

• Tanpa iklan, tanpa pembelian dalam aplikasi, tanpa pendaftaran akun.
• Tidak mengumpulkan data. Nama, kelas, dan skor hanya tersimpan di perangkat.
• Bisa dimainkan tanpa sinyal — cocok untuk sekolah yang jaringannya sulit. (Khusus petualangan 360° tetap memerlukan internet.)
• Tampilan tegak, tombol besar, dan huruf yang nyaman dibaca di HP sederhana.

Seluruh foto di dalam aplikasi adalah foto asli berlisensi Creative Commons, dan sumbernya dicantumkan pada halaman Sumber Foto di dalam Pustaka.

Dumogi mapikenoh — semoga bermanfaat.
```

---

## Catatan untuk pengisian Play Console

Jawaban di bawah didasarkan pada kode, jadi aman dipakai mengisi formulir.

**Data safety / Keamanan data — jawab "tidak mengumpulkan data".**
Aplikasi hanya menulis ke penyimpanan lokal peramban: `playerName`, `playerClass`,
`highScore`, `scoreHistory`, `unlockedLevel`, `muted`. Tidak ada satu pun
permintaan jaringan yang mengirim data keluar.

**Kategori:** Edukasi. **Rating konten:** untuk Semua Umur.

**Target audiens:** anak-anak (SD). Karena itu berlaku kebijakan Families —
pastikan tidak menambahkan iklan atau analitik pihak ketiga di kemudian hari.

**Perlu diungkap:** fitur petualangan 360° memuat halaman pihak ketiga
(viewer.virtualtoureasy.com) di dalam aplikasi dan memerlukan internet.
Kebijakan Families membatasi konten web pihak ketiga, jadi siapkan penjelasan
saat peninjauan — atau matikan fitur itu untuk rilis pertama bila ingin aman.

**Aplikasi ini masih berupa situs web (PWA).** Untuk masuk Play Store perlu
dibungkus lebih dulu, umumnya dengan Trusted Web Activity (Bubblewrap) yang
menghasilkan berkas AAB dari `manifest.json`. Ikon dan nama sudah tersedia di
`manifest.json` dan folder `ikon/`.
