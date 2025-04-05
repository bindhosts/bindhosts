# Kullanım Kılavuzu

## Terminal Üzerinden Kullanım
<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
     onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
     width="100%" alt="Terminal Usage Screenshot">

Magisk/KernelSU/APatch için bindhosts’un çeşitli seçeneklerine aşağıdaki yöntemlerle erişebilirsiniz:
- Termux (veya diğer yaygın terminal uygulamaları) üzerinden:
    ```shell
    > su
    > bindhosts
    ```

- SDK Platform Tools (root shell) üzerinden:
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Örnek
```
    bindhosts --action          Bu, bindhosts’un durumuna bağlı olarak IP’leri alma veya hosts dosyasını sıfırlama işlemini simüle eder
    bindhosts --tcpdump         Ağ modunuzdaki mevcut aktif IP adreslerini koklayacaktır (wifi veya veri, cloudflare vb. gibi hiçbir DNS hizmetinin kullanılmadığından emin olun)
    bindhosts --query <URL>     Hosts dosyasında desen araması yapar
    bindhosts --force-reset     Bindhosts’u zorla sıfırlar, yani hosts dosyasını sıfır IP’ye geri döndürür
    bindhosts --force-update    Güncellemeye zorlar
    bindhosts --custom-cron     Bindhosts için bir cronjob’un çalışacağı günün saatini tanımlar
    bindhosts --enable-cron     Bindhosts için cronjob görevini etkinleştirir ve şu anda kullandığınız listelerin IP’lerini güncellemek için varsayılan olarak sabah 10’da çalışır
    bindhosts --disable-cron    Daha önce ayarlanmış cronjob görevini devre dışı bırakır ve siler
    bindhosts --help            Yukarıdaki resimde ve metinde gösterilen her şeyi görüntüler
```

## Eylem (Action)
 Güncelleme ve sıfırlama arasında geçiş yapmak için eyleme (action) basın
 
<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
     onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
     width="100%" alt="Manager Action">

## WebUI
  Özel kurallarınızı, kaynaklarınızı, beyaz listenizi veya kara listenizi ekleyin
 
<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
     onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
     width="100%" alt="Manager WebUI">
     
     