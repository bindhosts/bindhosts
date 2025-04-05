# bindhosts Çalışma Modları
- Bunlar şu anda otomatik olarak algılanan veya isteğe bağlı olarak seçilebilen tanımlı çalışma modlarıdır.
- Çalışma modunu [geliştirici seçeneğine](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116) erişerek değiştirebilirsiniz.

#### Terimler Sözlüğü
- magic mount - Magisk tarafından esas olarak kullanılan montaj yöntemi
- susfs - [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu) için kısaltma, kernel yama seti olarak sunulan gelişmiş root gizleme çerçevesi (framework)

---

## mod=0
### varsayılan mod
 - **APatch**
   - bind mount (magic mount)
   - Adaway ile uyumlu
   - Gizleme: Değişiklikleri Hariç Tut + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)'in enforce denylist'i
 - **Magisk**
   - magic mount
   - Adaway ile uyumlu
   - Gizleme: Denylist / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
 - **KernelSU**
   - OverlayFS + path_umount, (magic mount? yakında?)
   - Adaway ile uyumlu değil
   - Gizleme: umount modules (modüllerin bağlantısı kes) (GKI olmayanlar için lütfen path_umount'u backport edin)

---

## mod=1
### ksu_susfs_bind
- susfs destekli mount --bind
- Yalnızca KernelSU
- Susfs yamalı kernel ve userspace tool (kullanıcı alanı aracı) gerektirir
- Adaway ile uyumlu
- Gizleme: **SuSFS, unmount işlemini yönettiği için sınıfının en iyisi**

---

## mod=2
### sade bindhosts
- mount --bind
- **En yüksek uyumluluk**
- Tüm yöneticilerde (manager) çalışır, ancak pek tercih edilmez
- bind mount'u sızdırır, global olarak değiştirilmiş hosts dosyasını sızdırır
- APatch OverlayFS üzerindeyken seçilir (varsayılan mod), çünkü daha iyi uyumluluk sunar.
- Adaway ile uyumlu
- Gizleme: temelde gizleme yok, yardıma ihtiyaç duyar

---

## mod=3
### apatch_hfr, hosts_file_redirect
- uid 0 için /system/etc/hosts'un kernel içi yönlendirmesi
- Yalnızca APatch, hosts_file_redirect KPM gerektirir
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)
  - [Nasıl Yapılır Rehberi](https://github.com/bindhosts/bindhosts/issues/3)
- Her durumda çalışmaz, deneme-yanılma
- Adaway ile uyumlu değil
- Gizleme: ÇALIŞIRSA iyi bir yöntem

---

## mod=4
### zn_hostsredirect
- zygisk netd enjeksiyonu
- Kullanımı yazar (aviraxp) tarafından **teşvik edilir**
> *"Bu kullanım durumunda enjeksiyon, montajdan çok daha iyidir"* <div align="right"><em>-- aviraxp</em></div>
- Tüm yöneticilerde (manager) çalışmalıdır
- Gereklilikler:
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- Adaway ile uyumlu değil
- Gizleme: montaj olmadığı için iyi bir yöntem, ancak diğer modüllere bağlıdır

---

## mod=5
### ksu_susfs_open_redirect
- uid 2000 altındaki dosyalar için kernel içi yönlendirmeler
- Yalnızca KernelSU
- **SADECE OPT-IN**
- Susfs yamalı kernel ve userspace tool (kullanıcı alanı aracı) gerektirir
- Kullanımı yazar (simonpunk) tarafından **tavsiye edilmez**
> *"openredirect daha fazla CPU döngüsü tüketecek.."* <div align="right"><em>-- simonpunk</em></div>
- SuSFS 1.5.1 veya üstü gerektirir
- Adaway uyumlu
- Gizleme: iyi bir yöntem ancak muhtemelen daha fazla CPU döngüsü harcar

---

## mod=6
### ksu_source_mod
- KernelSU try_umount destekli mount --bind
- Kaynak değişikliği gerektirir: [referans](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)
- KernelSU NEXT 12183+ üzerinde desteklenir [referans](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **UYARI**: SuSFS ile çakışır. SuSFS'i uygulayabiliyorsanız buna ihtiyacınız yoktur.
- Adaway ile uyumlu
- Gizleme: iyi bir yöntem ancak muhtemelen susfs'i uygulayabilirsiniz.

---

## mod=7
### generic_overlay
- generic overlayfs rw mount
- Tüm yöneticilerde (manager) çalışmalıdır
- **SADECE OPT-IN** çünkü tespitlere karşı **aşırı derecede savunmasız**
- overlayfs mount'u sızdırır (/data/adb üst dizini ile), global olarak değiştirilmiş hosts dosyasını sızdırır
- Kullanıcının yerel f2fs /data büyük-küçük harf duyarlılığı varsa APatch bind_mount / MKSU üzerinde muhtemelen çalışmaz
- Adaway ile uyumlu
- Gizleme: temelde gizleme yok, yardıma ihtiyaç duyar

---

## mod=8
### ksu_susfs_overlay
- susfs destekli overlayfs rw mount
- Yalnızca KernelSU
- Susfs yamalı kernel ve userspace tool (kullanıcı alanı aracı) gerektirir
- Kullanıcının yerel f2fs /data büyük-küçük harf duyarlılığı varsa APatch bind_mount / MKSU üzerinde muhtemelen çalışmaz
- Adaway uyumlu
- Gizleme: iyi bir yöntem ancak ksu_susfs_bind daha kolay

---

## mod=9
### ksu_susfs_bind_kstat
- susfs destekli mount --bind + kstat spoofing
- Yalnızca KernelSU
- Susfs yamalı kernel ve userspace tool (kullanıcı alanı aracı) gerektirir
- **SADECE OPT-IN** çünkü niş bir kullanım
- Adaway ile uyumlu
- Gizleme: **SuSFS, unmount işlemini yönettiği için sınıfının en iyisi**

