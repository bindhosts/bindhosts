# Penggunaan

## Penggunaan melalui Terminal

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Terminal Usage Screenshot">

Anda dapat mengakses berbagai opsi seperti yang ditunjukkan pada gambar untuk bindhosts Magisk/KernelSU/APatch

- melalui Termux (atau berbagai aplikasi terminal umum lainnya)
    ```shell
    > su
    > bindhosts
    ```

- melalui SDK Platform Tools (root shell)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Contoh

```
    bindhosts --action          Ini akan mensimulasikan aksi bindhosts untuk mengambil ip atau mengatur ulang berkas hosts, tergantung pada status bindhosts saat ini
    bindhosts --tcpdump         Akan melacak alamat ip aktif saat ini pada mode jaringan Anda (wifi atau data, memastikan tidak ada layanan DNS yang digunakan seperti cloudflare, dll.)
    bindhosts --query <URL>     Periksa berkas hosts untuk pola tertentu
    bindhosts --force-update    Memaksa pembaruan
    bindhosts --force-reset     Akan memaksa atur ulang bindhosts, yang berarti mengatur ulang berkas hosts tanpa ip sama sekali
    bindhosts --custom-cron     Menentukan waktu tertentu dalam sehari untuk menjalankan tugas cronjob bindhosts
    bindhosts --enable-cron     Mengaktifkan tugas cronjob bindhosts untuk memperbarui ip dari daftar yang sedang Anda gunakan pada pukul 10 pagi (waktu default)
    bindhosts --disable-cron    Menonaktifkan & menghapus tugas cronjob yang ditetapkan sebelumnya untuk bindhosts
    bindhosts --help            Ini akan menampilkan semua informasi seperti yang ditunjukkan di atas dalam gambar dan teks
```

## Aksi

ketuk aksi untuk mengaktifkan pembaruan dan mengatur ulang

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Manager Action">

## WebUI

tambahkan aturan khusus, sumber, daftar putih, atau daftar hitam Anda

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="Manager WebUI">
