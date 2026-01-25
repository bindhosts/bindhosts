# Panduan Penyembunyian

## APatch

Penyembunyian di APatch seharusnya berfungsi, asalkan anda menggunakan [rilis terbaru](https://github.com/bmax121/APatch/releases/latest)

- 'Kecualikan Modifikasi' pada aplikasi yang root-nya ingin anda sembunyikan.
- Pasang NeoZygisk atau ReZygisk sebagai penangan daftar tolak
- ATAU jika anda menggunankan ZygiskNext, aktifan hanya unmount

APatch lama tidak direkomendasikan karena potensi masalah. Namun, anda dapat mencoba hal berikut ini:

- kecualikan modifikasi ditambah salah satu dari NeoZygisk, ReZygisk ATAU milik ZygiskNext hanya unmount
- ATAU anda dapat memasang NoHello atau Zygisk Assistant
- meskipun ini tidak direkomendasikan lagi, anda masih dapat mencoba menggunakan kpm hosts_file_redirect. [Tutorial](https://github.com/bindhosts/bindhosts/issues/3)
- jika hosts_file_redirect gagal, pasang [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Penyembunyian di KernelSU seharusnya berfungsi, asalkan:

1. anda memiliki path_umount (GKI, di-backport)
2. tidak ada modul yang saling bertentangan (misal Magical OverlayFS)

Rekomendasi:

- jika kernel non-gki dan kernel tidak memiliki path_umount, minta pengembang kernel untuk [mem-backport fitur ini](https://github.com/tiann/KernelSU/pull/1464)
- Pasang NeoZygisk atau ReZygisk sebagai penangan daftar tolak
- ATAU jika anda menggunakan ZygiskNext, aktifkan hanya unmount
- alternatifnya, cukup pasang [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Varian (MKSU, KernelSU-NEXT)

- Untuk MKSU, rekomendasi yang sama seperti KernelSU
- Untuk KernelSU-NEXT, penyembunyian akan berfungsi (melalui mode 6)

### SuSFS

- Untuk SuSFS, itu seharusnya berfungsi

## Magisk

Penyembunyian di Magisk (dan klon, Alpha, Kitsune) seharusnya berfungsi sebagaimana mestinya.

- Tambahkan aplikasi yang ingin anda sembunyikan akses rootnya ke daftar tolak.
- opsional anda juga dapat menggunakan Shamiko di Alpha

# Tanya Jawab

- Mengapa ini dibutuhkan?
  - beberapa deteksi root sekarang menyertakan dan memeriksa file host yang dimodifikasi.
- Bagaimana cara memeriksa deteksi nya?
  - Baca [cara memeriksa deteksi](https://github.com/bindhosts/bindhosts/issues/4)
- Bagaimana cara saya berpindah ke bind mount pada APatch?
  - dapatkan [rilis terbaru](https://github.com/bmax121/APatch/releases/latest)

## Tautan

### Penyedia Zygisk

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
