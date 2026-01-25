# Gizleme Kılavuzu

## APatch

APatch'te gizleme, [en son sürümde](https://github.com/bmax121/APatch/releases/latest) olduğunuz sürece sorunsuz çalışmalıdır:

- Root'u gizlemek istediğiniz uygulamaları 'Değişiklikleri Hariç Tut' listesine ekleyin.
- Denylist işleyicisi olarak NeoZygisk veya ReZygisk yükleyin
- VEYA ZygiskNext kullanıyorsanız, "yalnızca bağlantıyı kes" (umount only) özelliğini etkinleştirin

Eski APatch kullanımı, olası sorunlar nedeniyle önerilmez. Ancak şu adımları deneyebilirsiniz:

- modifikasyonları ve ayrıca NeoZygisk, ReZygisk VEYA ZygiskNext'in "yalnızca bağlantı kesme" özelliğini hariç tutun
- YA DA NoHello veya Zygisk Assistant yükleyebilirsiniz
- Artık önerilmesede, hosts_file_redirect kpm kullanmayı deneyebilirsiniz. [Rehber](https://github.com/bindhosts/bindhosts/issues/3)
- Eğer hosts_file_redirect başarısız olursa, [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases) kurun.

## KernelSU

KernelSU'da gizleme şu şartlar sağlandığında sorunsuz çalışır:

1. path_umount'a sahip olmanız (GKI, backport edilmiş)
2. Çakışan modül bulunmaması (ör. Magical OverlayFS)

Öneriler:

- Eğer kernel GKI değilse ve path_umount eksikse, çekirdek geliştiricisinden [bu özelliği backport etmesini](https://github.com/tiann/KernelSU/pull/1464) isteyin.
- Denylist işleyicisi olarak NeoZygisk veya ReZygisk yükleyin
- VEYA ZygiskNext kullanıyorsanız, "yalnızca bağlantıyı kes" (umount only) özelliğini etkinleştirin
- Alternatif olarak, sadece [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases) kurun.

### Varyantlar (MKSU, KernelSU-NEXT)

- MKSU için, KernelSU ile aynı öneriler geçerlidir
- KernelSU-NEXT için gizleme doğrudan çalışır (mod 6 ile).

### SuSFS

- SuSFS için doğrudan çalışır.

## Magisk

Magisk'te (ve klonlarında: Alpha, Kitsune) gizleme olduğu gibi çalışır.

- Root'u gizlemek istediğiniz uygulamaları denylist'e ekleyin.
- i̇steğe bağlı olarak Alpha sürümünde Shamiko da kullanabilirsiniz

# SSS

- Bu neden gerekli?
  - Bazı root tespitleri artık hosts dosyasının değiştirilip değiştirilmediğini kontrol ediyor.
- Tespitleri nasıl kontrol ederim?
  - [Tespit kontrolü nasıl yapılır](https://github.com/bindhosts/bindhosts/issues/4)'ı okuyun.
- APatch'te bind mount'a nasıl geçerim?
  - [son sürümü](https://github.com/bmax121/APatch/releases/latest) edinin

## Bağlantılar

### Zygisk sağlayıcıları

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)'in kara liste uygulamasını etkinleştirin.
