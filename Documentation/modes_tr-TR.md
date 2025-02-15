# bindhosts çalışma modları
- Bunlar, otomatik olarak test edilen veya isteğe bağlı olarak kullanılabilen şu anda tanımlı çalışma modlarıdır.
- Çalışma modunu, [geliştirici seçeneğine](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116) erişerek değiştirebilirsiniz.

#### Terimler Sözlüğü
 - magic mount - Başlıca Magisk tarafından kullanılan montaj yöntemi.
 - susfs - [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu) için kısaltma, bir kernel yaması seti olarak sunulan gelişmiş root-gizleme çerçevesi (framework).

---

## mode=0
### varsayılan mod
 - **APatch** 
   - bind mount (magic mount)
   - Adaway ile uyumlu
   - Gizleme: Değişiklikleri Hariç Tut + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) denylist'i zorunlu kıl
 - **Magisk** 
   - magic mount  
   - Adaway ile uyumlu
   - Gizleme: Denylist (Reddetme Listesi) / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
 - **KernelSU** 
   - OverlayFS + path_umount, (magic mount? yakında?)
   - Adaway uyumluluğu yok
   - Gizleme: umount modülleri (non-GKI için, lütfen path_umount'u backport yapın)

---

## mode=1
### ksu_susfs_bind
- susfs destekli mount --bind
- Sadece KernelSU
- susfs yamalı çekirdek (kernel) ve kullanıcı alanı aracı (userspace tool) gereklidir
- Adaway ile uyumlu  
- Gizleme: **Sınıfının en iyisi, çünkü SuSFS unmount işlemini yönetir**

---

## mode=2
### plain bindhosts
- mount --bind
- **En yüksek uyumluluk**
- Aslında tüm yöneticilerde çalışır, ancak pek tercih edilmez
- Bind mount sızdırır, sistem genelinde değiştirilmiş hosts dosyasını sızdırır
- APatch, varsayılan mod olan OverlayFS üzerindeyken seçilir çünkü daha iyi uyumluluk sağlar
- Adaway ile uyumlu
- Gizleme: Temelde gizleme yok, desteğe ihtiyaç duyar

---

## mode=3
### apatch_hfr, hosts_file_redirect
- uid 0 için /system/etc/hosts dosyasının çekirdek içi yönlendirilmesi
- Sadece APatch, hosts_file_redirect KPM gerektirir 
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)  
  - [Kullanım Kılavuzu](https://github.com/bindhosts/bindhosts/issues/3)
- Tüm kurulumlarda çalışmaz, bazen işe yarar bazen yaramaz
- Adaway uyumluluğu yok
- Gizleme: ÇALIŞIYORSA iyi bir yöntem

---

## mode=4
### zn_hostsredirect
- zygisk netd enjeksiyonu
- Kullanımı **yazar (aviraxp) tarafından önerilmektedir**
> *"Injection is much better than mount in this usecase"* <br> *"Bu kullanım senaryosunda enjeksiyon, mount'tan çok daha iyidir"* <div align="right"><em>-- aviraxp</em></div>
- Tüm yöneticilerde çalışmalıdır  
- Gereksinimler:  
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)  
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)  
- Adaway uyumluluğu yok 
- Gizleme: Hiçbir mount yapılmadığı için iyi bir yöntemdir, ancak diğer modüllere bağlıdır.

---

## mode=5
### ksu_susfs_open_redirect
- 2000'den düşük uid'ler için çekirdek (kernel) içi dosya yönlendirmeleri
- Sadece KernelSU
- Sadece **manuel geçiş** ile etkinleştirilebilir 
- susfs yamalı çekirdek (kernel) ve kullanıcı alanı aracı (userspace tool) gereklidir
- Kullanımı yazar (simonpunk) tarafından **önerilmez**
> *"openredirect will take more CPU cycle as well.."* <br> *"openredirect daha fazla CPU döngüsü gerektirecektir..."* <div align="right"><em>-- simonpunk</em></div>
- SuSFS 1.5.1 veya daha yenisi gereklidir 
- Adaway ile uyumlu
- Gizleme: iyi bir yöntem fakat muhtemelen daha fazla CPU kaynağı harcayacaktır

---

## mode=6
### ksu_source_mod
- KernelSU try_umount destekli mount --bind
- Kaynak modifikasyonu gereklidir: [referans](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)
- KernelSU NEXT 12183+ tarafından desteklenmektedir [referans](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **UYARI**: SuSFS ile çakışır. Eğer SuSFS'yi uygulayabiliyorsanız buna ihtiyacınız yoktur.
- Adaway ile uyumlu
- Gizleme: İyi bir yöntem, ancak muhtemelen sadece susfs'yi uygulayabilirsiniz.

---

## mode=7
### generic_overlay
- genel overlayfs rw mount
- tüm yöneticilerde çalışması gerekir
- Sadece **manuel geçiş** ile etkinleştirilebilir, çünkü **aşırı yüksek** tespit edilme hassasiyetine sahiptir
- overlayfs mount sızdırır (/data/adb üst diziniyle birlikte), sistem genelinde değiştirilmiş hosts dosyasını sızdırır
- Kullanıcıda native f2fs /data casefolding varsa, büyük olasılıkla APatch bind_mount / MKSU üzerinde çalışmaz
- Adaway ile uyumlu
- Gizleme: Temelde gizleme yok, desteğe ihtiyaç duyar

---

## mode=8
### ksu_susfs_overlay
- susfs destekli overlayfs rw mount
- Sadece KernelSU  
- susfs yamalı çekirdek (kernel) ve kullanıcı alanı aracı (userspace tool) gereklidir
- Kullanıcıda native f2fs /data casefolding varsa, büyük olasılıkla APatch bind_mount / MKSU üzerinde çalışmaz
- Adaway ile uyumlu
- Gizleme: İyi bir yöntem fakat ksu_susfs_bind daha kolaydır

---

## mode=9
### ksu_susfs_bind_kstat
- susfs destekli mount --bind + kstat sahtekarlığı (spoofing)
- Sadece KernelSU 
- susfs yamalı çekirdek (kernel) ve kullanıcı alanı aracı (userspace tool) gereklidir
- Sadece **manuel geçiş** ile etkinleştirilebilir çünkü özel bir özelliktir
- Adaway ile uyumlu
- Gizleme: **Sınıfının en iyisi, çünkü SuSFS unmount işlemini yönetir**

