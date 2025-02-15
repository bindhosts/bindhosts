# Gizleme Kılavuzu

## APatch
 APatch'te gizleme, [son sürüm](https://github.com/bmax121/APatch/releases/latest)de olduğunuz sürece düzgün çalışmalıdır.
 - Kök erişimini gizlemek istediğiniz uygulamalardan 'Değişiklikleri Hariç Tut' seçeneğini kullanın.
 - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) denylist'i zorunlu kılmayı etkinleştirin.

 Eski APatch, olası sorunlar nedeniyle önerilmez. Ancak, aşağıdakileri deneyebilirsiniz:
   - Değişiklikleri hariç tutun + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext) denylist'i zorunlu kılmayı etkinleştirin.
   - Artık tavsiye edilmemekle birlikte, yine de hosts_file_redirect kpm kullanmayı deneyebilirsiniz. [Kılavuz](https://github.com/bindhosts/bindhosts/issues/3)
   - hosts_file_redirect başarısız olursa, [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases) yükleyin.

## KernelSU
 KernelSU'da gizleme, aşağıdaki şartlar sağlandığı sürece düzgün çalışmalıdır:
  1. path_umount (GKI, backported) mevcut olmalıdır.
  2. Çakışan modüller olmamalıdır (örneğin, Magical Overlayfs).

 Öneriler:
  - Eğer çekirdek non-GKI ise ve path_umount eksikse, çekirdek geliştiricisinden bu özelliği [backport yapmasını](https://github.com/tiann/KernelSU/pull/1464) isteyin.
  - Alternatif olarak, [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases) yükleyin.

### Varyantlar (MKSU, KernelSU-NEXT)
 - MKSU için, [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) kullanabilirsiniz
 - KernelSU-NEXT için gizleme, (mod 6 üzerinden) normal şekilde çalışmalıdır.
 
### SuSFS
 - SuSFS için, normal şekilde çalışmalıdır.

## Magisk
 Magisk'te (ve türevlerinde, Alpha, Kitsune) gizleme normal şekilde çalışmalıdır.
 - Kök erişimini gizlemek istediğiniz uygulamaları denylist'e (reddetme listesi) ekleyin.
 - İsteğe bağlı olarak [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) da kullanabilirsiniz.

# SSS (Sıkça Sorulan Sorular)
 - Bu neden gerekli?
   - Bazı root tespit yöntemleri artık değiştirilmiş hosts dosyasını da kontrol ediyor.
 - Tespitleri nasıl kontrol edebilirim?
   - [Tespitleri nasıl kontrol edebileceğinizi](https://github.com/bindhosts/bindhosts/issues/4) okuyun.
 - APatch'te bind mount'a nasıl geçiş yapabilirim?
   - CI derlemelerini [buradan](https://nightly.link/bmax121/APatch/workflows/build/main/APatch) indirin.

## Terimler Sözlüğü
 - bind mount - APatch'in, Magisk tarafından kullanılan bir montaj yöntemi olan magic mount için kullandığı terim.

