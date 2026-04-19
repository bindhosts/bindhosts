# Panduan Penyembunyian

## APatch

Penyembunyian di APatch seharusnya berfungsi, asalkan Anda menggunakan [rilis terbaru](https://github.com/bmax121/APatch/releases/latest)

- 'Kecualikan Modifikasi' pada aplikasi yang root-nya ingin Anda sembunyikan.
- Pasang salah satu dari NeoZygisk atau ReZygisk sebagai penangan denylist
- ATAU jika Anda menggunakan ZygiskNext, aktifan hanya unmount

APatch Legacy tidak disarankan karena potensi masalah. Namun, Anda dapat mencoba hal berikut ini:

- kecualikan modifikasi + salah satu dari NeoZygisk, ReZygisk ATAU fitur hanya unmount milik ZygiskNext
- ATAU Anda dapat memasang NoHello atau Zygisk Assistant
- meskipun ini tidak disarankan lagi, Anda masih dapat mencoba menggunakan kpm hosts_file_redirect. [Tutorial](https://github.com/bindhosts/bindhosts/issues/3)
- jika hosts_file_redirect gagal, pasang [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Penyembunyian di KernelSU seharusnya berfungsi, asalkan:

1. Anda memiliki path_umount (GKI, di-backport)
2. tidak ada modul yang saling bertentangan (misal Magical OverlayFS)

Saran:

- jika kernel non-gki dan kernel tidak memiliki path_umount, minta pengembang kernel untuk [mem-backport fitur ini](https://github.com/tiann/KernelSU/pull/1464)
- Pasang antara NeoZygisk atau ReZygisk sebagai penangan denylist
- ATAU jika Anda menggunakan ZygiskNext, aktifkan hanya unmount
- alternatifnya, cukup pasang [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Varian (MKSU, KernelSU-NEXT)

- Untuk MKSU, saran yang sama seperti KernelSU
- Untuk KernelSU-NEXT, penyembunyian akan berfungsi (melalui mode 6)

### SuSFS

- Untuk SuSFS, itu seharusnya berfungsi

## Magisk

Penyembunyian di Magisk (dan klon, Alpha, Kitsune) seharusnya berfungsi sebagaimana mestinya.

- Tambahkan aplikasi yang ingin Anda sembunyikan akses rootnya ke denylist.
- opsional Anda juga dapat menggunakan Shamiko di Alpha

# Tanya Jawab

- Mengapa ini dibutuhkan?
  - beberapa deteksi root sekarang menyertakan dan memeriksa berkas hosts yang dimodifikasi.
- Bagaimana cara memeriksa deteksi nya?
  - Baca [cara memeriksa deteksi](https://github.com/bindhosts/bindhosts/issues/4)
- Bagaimana cara saya berpindah ke bind mount pada APatch?
  - dapatkan [rilis terbaru](https://github.com/bmax121/APatch/releases/latest)

## Tautan

### Penyedia Zygisk

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
