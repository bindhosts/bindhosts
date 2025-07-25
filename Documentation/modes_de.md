# bindhosts Betriebsmodi

- Dies sind derzeit definierte Betriebsmodi, die entweder automatisch geprüft werden oder als Opt-in verfügbar sind
- Du kannst den Betriebsmodus ändern, indem du die [Entwickleroption](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116) nutzt.

#### Glossar der Begriffe

- magic mount – eine Mount-Methode, die hauptsächlich von Magisk verwendet wird.
- SuSFS – Abkürzung für [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu), ein fortschrittliches Framework zum Verbergen von Root-Zugriffen, das als Kernel-Patchset bereitgestellt wird.

---

## Modus=0

### Standardmodus

- **APatch**
  - bind mount (magic mount)
  - Adaway-kompatibel
  - Verstecken: Änderungen ausschließen + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)s Enforce Denylist
- **Magisk**
  - magic mount
  - Adaway-kompatibel
  - Verstecken: Denylist / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- **KernelSU**
  - OverlayFS + path_umount, (magic mount? demnächst?)
  - Keine Adaway-Kompatibilität
  - Verstecken: umount-Module (für Nicht-GKI bitte path_umount zurückportieren)

---

## Modus=1

### ksu_susfs_bind

- susfs-unterstützte Einbindung --bind
- Nur KernelSU
- Erfordert einen mit SuSFS gepatchten Kernel und ein Userspace-Tool
- Adaway-kompatibel
- Verstecken: **Klassenbester, da SuSFS das Aushängen übernimmt**

---

## Modus=2

### Einfaches Bindhosts

- mount --bind
- **Höchste Kompatibilität**
- Funktioniert tatsächlich bei allen Managern.
- Wenn keine Unterstützung erfolgt, kommt es zu einer Bind-Mount-Lücke und einer global geänderten Hosts-Datei.
- Wird ausgewählt, wenn APatch auf OverlayFS (Standardmodus) läuft, da es eine bessere Kompatibilität bietet.
- Wird ausgewählt, wenn ein bekannter „Denylist-Handler“ gefunden wird.
- Adaway-kompatibel
- Verstecken: erfordert Unterstützung beim Verstecken

---

## Modus=3

### apatch_hfr, hosts_file_redirect

- Kernel-interne Umleitung von /system/etc/hosts für uid 0
- Nur APatch, erfordert hosts_file_redirect KPM
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)
  - [Anleitung](https://github.com/bindhosts/bindhosts/issues/3)
- Funktioniert NICHT bei allen Konfigurationen, eher zufällig
- Keine Adaway-Kompatibilität
- Verstecken: eine gute Methode, wenn sie FUNKTIONIERT

---

## Modus=4

### zn_hostsredirect

- Zygisk netd-Injektion
- Die Verwendung wird vom Autor **empfohlen** (aviraxp)

> _"In diesem Anwendungsfall ist Injection viel besser als Mount"_ <div align="right"><em>-- aviraxp</em></div>

- sollte bei allen Managern funktionieren
- Benötigt:
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- Keine Adaway-Kompatibilität
- Verstecken: gute Methode, da es überhaupt keine Halterung gibt, aber es hängt von anderen Modulen ab

---

## Modus=5

### ksu_susfs_open_redirect

- Datei-Umleitungen im Kernel für UIDs unter 2000
- Nur KernelSU
- Nur **OPT-IN**
- Erfordert einen mit SuSFS gepatchten Kernel und ein Userspace-Tool
- Die Verwendung wird vom Autor (simonpunk) **nicht empfohlen**

> _"openredirect benötigt ebenfalls mehr CPU-Leistung.."_ <div align="right"><em>-- simonpunk</em></div>

- Erfordert SuSFS 1.5.1 oder höher
- Adaway-kompatibel
- Verstecken: gute Methode, verschwendet aber wahrscheinlich mehr CPU-Zyklen

---

## Modus=6

### ksu_source_mod

- KernelSU try_umount unterstützte Einbindung --bind
- Erfordert eine Änderung der Quelle: [Referenz](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)
- Unterstützt ab KernelSU NEXT 12183+ [Referenz](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **WARNUNG**: Konflikte mit SuSFS. Sie benötigen dies nicht, wenn Sie SuSFS implementieren können.
- Adaway-kompatibel
- Verstecken: gute Methode, aber Sie können wahrscheinlich einfach SuSFS implementieren.

---

## Modus=7

### generic_overlay

- Generisches Overlayfs-rw-Mount
- sollte bei allen Managern funktionieren
- **OPT-IN** nur aufgrund der **extrem hohen** Anfälligkeit für Erkennungen
- Leckt eine Overlayfs-Einbindung (mit /data/adb als übergeordnetem Verzeichnis), leckt global geänderte Hosts-Datei
- Es ist unwahrscheinlich, dass APatch bind_mount / MKSU funktioniert, wenn der Benutzer natives f2fs /data casefolding verwendet
- Adaway-kompatibel
- Verstecken: Im Wesentlichen kein Verstecken, benötigt Unterstützung

---

## Modus=8

### ksu_susfs_overlay

- SuSFS-unterstützte Overlayfs-rw-Einbindung
- Nur KernelSU
- Erfordert einen mit SuSFS gepatchten Kernel und ein Userspace-Tool
- Es ist unwahrscheinlich, dass APatch bind_mount / MKSU funktioniert, wenn der Benutzer natives f2fs /data casefolding verwendet
- Adaway-kompatibel
- Verstecken: gute Methode, aber ksu_susfs_bind ist einfacher

---

## Modus=9

### ksu_susfs_bind_kstat

- SuSFS-unterstützte Einbindung --bind + kstat-Spoofing
- Nur KernelSU
- Erfordert einen mit SuSFS gepatchten Kernel und ein Userspace-Tool
- **OPT-IN** nur aufgrund der Nischencharakteristik
- Adaway-kompatibel
- Verstecken: **Klassenbester, da SuSFS das Aushängen übernimmt**

