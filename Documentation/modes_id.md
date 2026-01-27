# mode operasi bindhosts

- Ini adalah mode operasi yang saat ini didefinisikan yang diperiksa secara otomatis atau diaktifkan secara manual oleh pengguna
- Anda dapat mengubah mode operasi dengan mengakses [opsi pengembang](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116).

#### Daftar istilah

- magic mount - metode mount yang terutama digunakan oleh magisk
- susfs - singkatan dari [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu), kerangka kerja penyembunyian root tingkat lanjut yang disediakan sebagai patchset kernel

---

## mode=0

### mode default

- **APatch**
  - bind mount (magic mount)
  - kompatibel dengan Adaway
  - Penyembunyian: Kecualikan Modifikasi + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) hanya unmount
- **Magisk**
  - magic mount
  - kompatibel dengan Adaway
  - Penyembunyian: Daftar tolak / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- **KernelSU**
  - OverlayFS + path_umount, (magic mount? segera?)
  - Tidak ada kompatibilitas Adaway
  - Penyembunyian: umount modul (untuk non-GKI, tolong backport path_umount)

---

## mode=1

### ksu_susfs_bind

- mount --bind yang dibantu susfs
- KernelSU saja
- Memerlukan kernel yang ditambal susfs dan alat userspace
- kompatibel dengan Adaway
- Penyembunyian: SuSFS menangani unmount

---

## mode=2

### bindhosts biasa

- mount --bind
- **Kompatibilitas tertinggi**
- Sebenarnya berfungsi pada semua manajer.
- akan membocorkan bind mount dan file hosts yang dimodifikasi secara global jika tidak ditangani.
- dipilih saat APatch berada di OverlayFS (mode default) karena menawarkan kompatibilitas yang lebih baik.
- dipilih ketika "penanganan daftar tolak" yang diketahui ditemukan.
- kompatibel dengan Adaway
- Penyembunyian: memerlukan bantuan penyembunyian

---

## mode=3

### apatch_hfr, hosts_file_redirect

- pengalihan /system/etc/hosts di dalam kernel untuk uid 0
- APatch saja, memerlukan KPM hosts_file_redirect
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)
  - [Panduan Cara](https://github.com/bindhosts/bindhosts/issues/3)
- TIDAK berfungsi pada semua pengaturan, tidak menentu
- Tidak ada kompatibilitas Adaway
- Penyembunyian: metode yang bagus jika BERHASIL

---

## mode=4

### zn_hostsredirect

- injeksi zygisk netd
- Penggunaan **disarankan** oleh pengembang (aviraxp)

> _"Injection jauh lebih baik daripada mount dalam kasus penggunaan ini"_ <div align="right"><em>-- aviraxp</em></div>

- seharusnya bekerja pada semua manajer
- Memerlukan:
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- Tidak ada kompatibilitas Adaway
- Penyembunyian: metode yang bagus karena tidak ada mount sama sekali, tetapi tergantung pada modul lain

---

## mode=5

### ksu_susfs_open_redirect

- pengalihan file dalam kernel untuk uid di bawah 2000
- KernelSU saja
- **OPT-IN** saja
- Memerlukan kernel yang ditambal susfs dan alat userspace
- penggunaan **tidak disarankan** oleh pengembang (simonpunk)

> _"openredirect juga akan membutuhkan lebih banyak siklus CPU.."_ <div align="right"><em>-- simonpunk</em></div>

- Memerlukan SuSFS 1.5.1 atau lebih baru
- kompatibel dengan Adaway
- Penyembunyian: metode yang bagus tetapi kemungkinan akan menguras lebih banyak siklus CPU

---

## mode=6

### ksu_source_mod

- mount --bind yang dibantu try_umount KernelSU
- Memerlukan modifikasi sumber: [referensi](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)
- Didukung pada KernelSU NEXT 12183+: [referensi](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **PERINGATAN**: Konflik dengan SuSFS. Anda tidak memerlukan ini jika anda dapat mengimplementasikan SuSFS.
- kompatibel dengan Adaway
- Penyembunyian: metode yang bagus tetapi anda mungkin cukup mengimplementasikan susfs.

---

## mode=7

### generic_overlay

- mount overlayfs rw generik
- seharusnya berfungsi pada semua manajer
- hanya tersedia **OPT-IN** karena kerentanan yang **sangat tinggi** terhadap deteksi
- membocorkan mount overlayfs (dengan /data/adb upperdir), membocorkan file host yang dimodifikasi secara global
- kemungkinan TIDAK berfungsi pada APatch bind_mount / MKSU jika pengguna mempunyai bawaan /data f2fs casefolding
- kompatibel dengan Adaway
- Penyembunyian: pada dasarnya tidak ada penyembunyian, butuh bantuan

---

## mode=8

### ksu_susfs_overlay

- mount overlayfs rw dibantu susfs
- KernelSU saja
- Memerlukan kernel yang ditambal susfs dan alat userspace
- kemungkinan TIDAK bekerja pada APatch bind_mount / MKSU jika pengguna mempunyai bawaan /data f2fs casefolding
- kompatibel dengan Adaway
- Penyembunyiaan: metode yang bagus tetapi ksu_susfs_bind lebih mudah

---

## mode=9

### ksu_susfs_bind_kstat

- mount --bind dibantu susfs + spoofing kstat
- KernelSU saja
- Memerlukan kernel yang ditambal susfs dan alat userspace
- Hanya tersedia **OPT-IN** karena bersifat khusus
- kompatibel dengan Adaway
- Penyembunyian: SuSFS menangani unmount

---

## mode=10

### ksud_kernel_umount

- mount --bind + kernel bantuan umount
- KernelSU saja
- Membutuhkan KernelSU 22106+
- kompatibel dengan Adaway
- Penyembunyian: KernelSU menangani unmount.

