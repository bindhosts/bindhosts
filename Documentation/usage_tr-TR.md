# Kullanım Kılavuzu

## Terminal üzerinden kullanım
![terminal_usage](screenshots/terminal_usage.png)

bindhosts için çeşitli seçeneklere, Magisk/KernelSU/APatch üzerinde görüntüde gösterildiği şekilde erişebilirsiniz.
- Termux (veya diğer benzer terminal uygulamaları) üzerinden
    ```shell
    > su
    > bindhosts
    ```

- SDK Platform Tools (root shell) üzerinden
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Örnek
```
bindhosts --action          Bu komut, bindhosts'un durumuna göre IP adreslerini almak veya hosts dosyasını sıfırlamak için bindhosts eylemini (action) simüle eder.
bindhosts --tcpdump         Şu anda aktif olan IP adreslerini ağ modunda (WiFi veya veri) tespit eder, Cloudflare gibi DNS servislerinin kullanılmadığından emin olun.
bindhosts --query <URL>     Hosts dosyasından bir URL sorgular.
bindhosts --force-reset     Bindhosts'u sıfırlamak için zorlayıcı reset yapar, yani hosts dosyasındaki IP adreslerini sıfırlar.
bindhosts --custom-cron     Bindhosts için bir cronjob çalıştırılacak zamanı tanımlar.
bindhosts --enable-cron     Bindhosts için cronjob görevini etkinleştirir, bu görev her gün saat 10'da (varsayılan zaman) kullandığınız listelerin IP adreslerini günceller.
bindhosts --disable-cron    Daha önce ayarlanmış bindhosts cronjob görevini devre dışı bırakır ve siler.
bindhosts --help            Yukarıda belirtilen her şeyi görüntüler, hem görselde hem de metin olarak.
```

## Eylem (Action)
 güncellemeyi ve sıfırlamayı değiştirmek için eyleme (action) basın
 
 ![manager_action](screenshots/manager_action.gif)

## WebUI
  özel kurallarınızı, kaynaklarınızı, beyaz listeyi veya kara listeyi ekleyin
 
 ![manager_action](screenshots/manager_webui.gif)

