# Przewodnik po ukrywaniu

## APatch

Ukrywanie w APatch powinno działać bez dodatkowej konfiguracji pod warunkiem używania [najnowszej wersji](https://github.com/bmax121/APatch/releases/latest)

- Włącz opcję „Exclude Modifications” dla aplikacji, przed którymi chcesz ukryć roota.
- Zainstaluj NeoZygisk albo ReZygisk jako moduł obsługujący DenyList
- LUB, jeżeli używasz ZygiskNext, włącz wyłącznie umount

Korzystanie ze starszej wersji APatch jest odradzane ze względu na potencjalne problemy. Można jednak wypróbować następujące rozwiązania:

- włącz Exclude Modifications oraz NeoZygisk, ReZygisk ALBO wyłącznie umount z ZygiskNext
- LUB zainstaluj NoHello albo Zygisk Assistant
- chociaż nie jest to już zalecane, nadal można spróbować użyć modułu KPM hosts_file_redirect. [Samouczek](https://github.com/bindhosts/bindhosts/issues/3)
- jeżeli hosts_file_redirect nie działa, zainstaluj [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Ukrywanie w KernelSU powinno działać bez dodatkowej konfiguracji pod warunkiem, że:

1. dostępna jest funkcja path_umount (GKI lub przeniesiona poprawka)
2. nie występują moduły powodujące konflikt (np. Magical OverlayFS)

Zalecenia:

- jeżeli jądro nie jest GKI i nie obsługuje path_umount, poproś jego dewelopera o [przeniesienie tej funkcji](https://github.com/tiann/KernelSU/pull/1464)
- Zainstaluj NeoZygisk albo ReZygisk jako moduł obsługujący DenyList
- LUB, jeżeli używasz ZygiskNext, włącz wyłącznie umount
- alternatywnie zainstaluj [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Warianty (MKSU, KernelSU-NEXT)

- W przypadku MKSU obowiązują te same zalecenia co dla KernelSU
- W KernelSU-NEXT ukrywanie powinno działać bez dodatkowej konfiguracji (w trybie 6)

### SuSFS

- W przypadku SuSFS wszystko powinno działać bez dodatkowej konfiguracji

## Magisk

Ukrywanie w Magisk (oraz jego odmianach: Alpha i Kitsune) powinno działać bez dodatkowej konfiguracji.

- Dodaj do DenyList aplikacje, przed którymi chcesz ukryć roota.
- opcjonalnie w Alpha można również użyć Shamiko

# FAQ

- Dlaczego jest to potrzebne?
  - niektóre mechanizmy wykrywania roota sprawdzają obecnie również, czy plik hosts został zmodyfikowany.
- Jak sprawdzić, czy modyfikacje są wykrywane?
  - Przeczytaj [instrukcję sprawdzania wykrywania](https://github.com/bindhosts/bindhosts/issues/4)
- Jak przejść na bind mount w APatch?
  - zainstaluj [najnowszą wersję](https://github.com/bmax121/APatch/releases/latest)

## Łącza

### Implementacje Zygisk

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
