# Tryby działania bindhosts

- Poniżej opisano obecnie zdefiniowane tryby działania, które są wykrywane automatycznie lub dostępne po ręcznym włączeniu
- Tryb działania można zmienić za pomocą [opcji deweloperskiej](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116).

#### Słownik pojęć

- magic mount — metoda montowania używana głównie przez Magisk
- susfs — skrót od [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu), zaawansowanego mechanizmu ukrywania roota dostarczanego jako zestaw poprawek jądra

---

## mode=0

### tryb domyślny

- **APatch**
  - bind mount (magic mount)
  - Zgodność z AdAway
  - Ukrywanie: Exclude Modifications + wyłącznie umount z [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- **Magisk**
  - magic mount
  - Zgodność z AdAway
  - Ukrywanie: DenyList / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- **KernelSU**
  - OverlayFS + path_umount (magic mount? wkrótce?)
  - Brak zgodności z AdAway
  - Ukrywanie: odmontowywanie modułów (w przypadku jądra innego niż GKI należy przenieść path_umount)

---

## mode=1

### ksu_susfs_bind

- mount --bind wspomagany przez susfs
- Tylko KernelSU
- Wymaga jądra z poprawkami susfs oraz narzędzia przestrzeni użytkownika
- Zgodność z AdAway
- Ukrywanie: SuSFS obsługuje odmontowanie

---

## mode=2

### zwykły bindhosts

- mount --bind
- **Najwyższa zgodność**
- Działa ze wszystkimi menedżerami.
- Bez dodatkowego wsparcia ujawnia montowanie bind oraz globalnie zmodyfikowany plik hosts.
- Wybierany, gdy APatch używa OverlayFS (tryb domyślny), ponieważ zapewnia lepszą zgodność.
- Wybierany po wykryciu znanego „modułu obsługującego DenyList”.
- Zgodność z AdAway
- Ukrywanie: wymaga wspomaganego ukrywania

---

## mode=3

### apatch_hfr, hosts_file_redirect

- przekierowanie /system/etc/hosts w jądrze dla UID 0
- Tylko APatch; wymaga modułu KPM hosts_file_redirect
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)
  - [Instrukcja](https://github.com/bindhosts/bindhosts/issues/3)
- NIE działa we wszystkich konfiguracjach; skuteczność jest nieprzewidywalna
- Brak zgodności z AdAway
- Ukrywanie: dobra metoda, JEŻELI działa

---

## mode=4

### zn_hostsredirect

- wstrzykiwanie do netd przez Zygisk
- autor (aviraxp) **zaleca** korzystanie z tej metody

> _„W tym zastosowaniu wstrzykiwanie jest znacznie lepsze niż montowanie”_ <div align="right"><em>— aviraxp</em></div>

- powinien działać ze wszystkimi menedżerami
- Wymaga:
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- Brak zgodności z AdAway
- Ukrywanie: dobra metoda, ponieważ nie występuje żadne montowanie, ale zależy od innych modułów

---

## mode=5

### ksu_susfs_open_redirect

- przekierowania plików w jądrze dla UID poniżej 2000
- Tylko KernelSU
- wyłącznie po ręcznym **WŁĄCZENIU**
- Wymaga jądra z poprawkami susfs oraz narzędzia przestrzeni użytkownika
- autor (simonpunk) **odradza** korzystanie z tej metody

> _„openredirect zużywa również więcej cykli procesora…”_ <div align="right"><em>— simonpunk</em></div>

- Wymaga SuSFS 1.5.1 lub nowszego
- Zgodność z AdAway
- Ukrywanie: dobra metoda, ale prawdopodobnie zużywa więcej cykli procesora

---

## mode=6

### ksu_source_mod

- mount --bind wspomagany przez try_umount z KernelSU
- Wymaga modyfikacji kodu źródłowego: [odnośnik](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)
- Obsługiwany w KernelSU NEXT 12183 lub nowszym: [odnośnik](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **OSTRZEŻENIE**: powoduje konflikt z SuSFS. Nie jest potrzebny, jeżeli można zaimplementować SuSFS.
- Zgodność z AdAway
- Ukrywanie: dobra metoda, ale prawdopodobnie lepiej po prostu zaimplementować susfs.

---

## mode=7

### generic_overlay

- ogólne montowanie OverlayFS w trybie odczytu i zapisu
- powinien działać ze wszystkimi menedżerami
- wyłącznie po ręcznym **WŁĄCZENIU** ze względu na **wyjątkowo dużą** podatność na wykrycie
- ujawnia montowanie OverlayFS (z katalogiem upperdir w /data/adb) oraz globalnie zmodyfikowany plik hosts
- prawdopodobnie NIE zadziała z APatch bind_mount / MKSU, jeżeli użytkownik korzysta z natywnego casefoldingu F2FS dla /data
- Zgodność z AdAway
- Ukrywanie: praktycznie brak ukrywania; wymaga dodatkowego wsparcia

---

## mode=8

### ksu_susfs_overlay

- montowanie OverlayFS w trybie odczytu i zapisu wspomagane przez susfs
- Tylko KernelSU
- Wymaga jądra z poprawkami susfs oraz narzędzia przestrzeni użytkownika
- prawdopodobnie NIE zadziała z APatch bind_mount / MKSU, jeżeli użytkownik korzysta z natywnego casefoldingu F2FS dla /data
- Zgodność z AdAway
- Ukrywanie: dobra metoda, ale ksu_susfs_bind jest prostszy

---

## mode=9

### ksu_susfs_bind_kstat

- mount --bind wspomagany przez susfs + fałszowanie kstat
- Tylko KernelSU
- Wymaga jądra z poprawkami susfs oraz narzędzia przestrzeni użytkownika
- wyłącznie po ręcznym **WŁĄCZENIU**, ponieważ jest to rozwiązanie niszowe
- Zgodność z AdAway
- Ukrywanie: SuSFS obsługuje odmontowanie

---

## mode=10

### ksud_kernel_umount

- mount --bind + odmontowanie wspomagane przez jądro
- Tylko KernelSU
- Wymaga KernelSU 22106 lub nowszego
- Zgodność z AdAway
- Ukrywanie: KernelSU obsługuje odmontowanie.

