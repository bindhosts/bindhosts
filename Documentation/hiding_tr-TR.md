# Gizleme Kılavuzu

## APatch
APatch'te gizleme, [en son sürümde](https://github.com/bmax121/APatch/releases/latest) olduğunuz sürece sorunsuz çalışmalıdır:
- Root'u gizlemek istediğiniz uygulamaları 'Değişiklikleri Hariç Tut' listesine ekleyin.
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)'in kara liste uygulamasını etkinleştirin.

Eski APatch kullanımı, olası sorunlar nedeniyle önerilmez. Ancak şu adımları deneyebilirsiniz:
  - Değişiklikleri hariç tut + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)'in kara liste uygulamasını etkinleştirin.
  - Artık önerilmese de, hosts_file_redirect kpm kullanmayı deneyebilirsiniz. [Rehber](https://github.com/bindhosts/bindhosts/issues/3)
  - Eğer hosts_file_redirect başarısız olursa, [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases) kurun.

## KernelSU
KernelSU'da gizleme şu şartlar sağlandığında sorunsuz çalışır:
  1. path_umount'a sahip olmanız (GKI, geri taşınmış)
  2. Çakışan modül bulunmaması (ör. Magical OverlayFS)

Öneriler:
  - Eğer çekirdek GKI değilse ve path_umount eksikse, çekirdek geliştiricisinden [bu özelliği geri taşımasını](https://github.com/tiann/KernelSU/pull/1464) isteyin.
  - Alternatif olarak, sadece [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases) kurun.

### Varyantlar (MKSU, KernelSU-NEXT)
- MKSU için [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) kullanabilirsiniz.
- KernelSU-NEXT için gizleme doğrudan çalışır (mod 6 ile).

### SuSFS
- SuSFS için doğrudan çalışır.

## Magisk
Magisk'te (ve klonlarında: Alpha, Kitsune) gizleme olduğu gibi çalışır.
- Root'u gizlemek istediğiniz uygulamaları kara listeye ekleyin.
- İsteğe bağlı olarak [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) da kullanabilirsiniz.

# SSS
- Bu neden gerekli?
  - Bazı root tespitleri artık hosts dosyasının değiştirilip değiştirilmediğini kontrol ediyor.
- Tespitleri nasıl kontrol ederim?
  - [Tespit kontrolü nasıl yapılır](https://github.com/bindhosts/bindhosts/issues/4) okuyun.
- APatch'te bağlama montajına nasıl geçerim?
  - CI yapılarını [buradan](https://nightly.link/bmax121/APatch/workflows/build/main/APatch) alın.

## Terimler Sözlüğü
- bağlama montajı - APatch'in sihirli montaj için kullandığı terim, esas olarak Magisk tarafından kullanılan montaj yöntemi.