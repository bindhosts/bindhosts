# Versteck-Anleitung

## APatch

Das Verstecken in APatch sollte einfach funktionieren, vorausgesetzt du nutzt die [neueste Version](https://github.com/bmax121/APatch/releases/latest)

- 'Änderungen ausklammern' für Apps, vor denen Root versteckt werden soll.
- aktiviere [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)'s Durchsetzungsverweigerliste
- ODER du kannst entweder [NoHello](https://github.com/MhmRdd/NoHello) oder [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant) installieren

Von Legacy APatch wird wegen möglicher Probleme abgeraten. Du kannst jedoch folgendes versuchen:

- Änderungen ausschließen + [ZygiskNext]aktivieren (https://github.com/Dr-TSNG/ZygiskNext)'s Durchsetzungsverweigerungsliste
- obwohl dies nicht mehr empfohlen wird, kannst du trotzdem versuchen, hosts_file_redirect kpm zu verwenden.
- obwohl dies nicht mehr empfohlen wird, kannst du trotzdem versuchen, hosts_file_redirect kpm zu verwenden. [Anleitung](https://github.com/bindhosts/bindhosts/issues/3)
- wenn hosts_file_redirect fehlschlägt, installiere [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Verstecken in KernelSU sollte einfach funktionieren, vorausgesetzt, dass:

1. du hast path_umount (GKI, zurückportiert)
2. keine widersprüchlichen Module (z.B. Magische Overlayfs)

Empfehlungen:

- wenn der Kernel nicht-gki ist und der Kernel path_umount fehlt, fragen Sie den Kernel-Entwickler [dieses Feature zurückzuportieren](https://github.com/tiann/KernelSU/pull/1464)
- ODER du kannst entweder [NoHello](https://github.com/MhmRdd/NoHello), [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) oder [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant) installieren
- alternativ einfach [ZN-hostsredirect]installieren (https://github.com/aviraxp/ZN-hostsredirect/releases)

### Varianten (MKSU, KernelSU-NEXT)

- Für MKSU kannst du [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) verwenden
- Für KernelSU-NEXT funktioniert das Verstecken einfach (via Modus 6)

### SuSFS

- Für SuSFS sollte es einfach funktionieren

## Magisk

Das Verstecken in Magisk (und Klone, Alpha, Kitsune) sollte genauso funktionieren wie es ist.

- Füge die Apps, vor denen Root versteckt werden soll, der Verweigerungsliste hinzu.
- optional kannst du auch [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) benutzen

# Häufig gestellte Fragen

- Warum ist das notwendig?
  - einige Root-Erkennungen prüfen nun auf modifizierte Hosts-Datei.
- Wie kann ich nach Erkennungen suchen?
  - Lies [wie man nach Erkennungen sucht](https://github.com/bindhosts/bindhosts/issues/4)
- Wie kann ich zu „bind mount” auf APatch wechseln?
  - CI-Builds erhältst du [hier](https://nightly.link/bmax121/APatch/workflows/build/main/APatch)

## Begriffe Glossar

- bind mount - APatchs Begriff für 'magic mount' die Montagemethode, welche hauptsächlich von Magisk verwendet wird.
