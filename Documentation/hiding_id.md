# Panduan Penyembunyian

## APatch

Penyembunyian di APatch seharusnya berfungsi, asalkan anda menggunakan [rilis terbaru](https://github.com/bmax121/APatch/releases/latest)

- 'Kecualikan Modifikasi' pada aplikasi yang root-nya ingin anda sembunyikan.
- aktifkan [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) paksa daftar tolak
- ATAU anda dapat memasang [NoHello](https://github.com/MhmRdd/NoHello) atau [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)

APatch lama tidak direkomendasikan karena potensi masalah. Namun, anda dapat mencoba hal berikut ini:

- kecualikan modifikasi + aktifkan [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) paksa daftar tolak
- ATAU anda dapat memasang [NoHello](https://github.com/MhmRdd/NoHello) atau [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- meskipun ini tidak direkomendasikan lagi, anda masih dapat mencoba menggunakan kpm hosts_file_redirect. [Tutorial](https://github.com/bindhosts/bindhosts/issues/3)
- jika hosts_file_redirect gagal, pasang [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Penyembunyian di KernelSU seharusnya berfungsi, asalkan:

1. anda memiliki path_umount (GKI, di-backport)
2. tidak ada modul yang saling bertentangan (misal Magical OverlayFS)

Rekomendasi:

- jika kernel non-gki dan kernel tidak memiliki path_umount, minta pengembang kernel untuk [mem-backport fitur ini](https://github.com/tiann/KernelSU/pull/1464)
- ATAU anda dapat memasang [NoHello](https://github.com/MhmRdd/NoHello), [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) atau [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- alternatifnya, cukup pasang [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Varian (MKSU, KernelSU-NEXT)

- Untuk MKSU, anda dapat menggunakan [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)
- Untuk KernelSU-NEXT, penyembunyian akan berfungsi (melalui mode 6)

### SuSFS

- Untuk SuSFS, itu seharusnya berfungsi

## Magisk

Penyembunyian di Magisk (dan klon, Alpha, Kitsune) seharusnya berfungsi sebagaimana mestinya.

- Tambahkan aplikasi yang ingin anda sembunyikan akses rootnya ke daftar tolak.
- secara opsional anda juga dapat menggunakan [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)

# Tanya Jawab

- Mengapa ini dibutuhkan?
  - beberapa deteksi root sekarang menyertakan dan memeriksa file host yang dimodifikasi.
- Bagaimana cara memeriksa deteksi nya?
  - Baca [cara memeriksa deteksi](https://github.com/bindhosts/bindhosts/issues/4)
- Bagaimana cara saya berpindah ke bind mount pada APatch?
  - dapatkan build ci [di sini](https://nightly.link/bmax121/APatch/workflows/build/main/APatch)

## Daftar istilah

- bind mount - Istilah APatch untuk magic mount, metode mount yang terutama digunakan oleh Magisk.
