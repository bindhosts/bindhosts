# Nutzung

## Nutzung über Terminal

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Terminal Usage Screenshot">

Sie können auf die verschiedenen Optionen zugreifen, wie in der Abbildung für bindhosts Magisk/KernelSU/APatch gezeigt

- über Termux (oder andere gängige Terminal-Apps)
      ```shell
      > su
      > bindhosts
      ```

- über SDK-Plattform-Tools (Root-Shell)
      ```shell
      > adb shell
      > su
      > bindhosts
      ```

### Beispiele

```
    bindhosts --action          Dies simuliert die Aktion von bindhosts, IPs abzurufen oder die Hosts-Datei zurückzusetzen, je nachdem, in welchem Zustand sich bindhosts befindet.
    bindhosts --tcpdump         Spürt die aktuell aktiven IP-Adressen in Ihrem Netzwerkmodus auf (WLAN oder Daten, stellen Sie sicher, dass keine DNS-Dienste wie Cloudflare usw. verwendet werden).
    bindhosts --query <URL>     Hosts-Datei auf Muster überprüfen
    bindhosts --force-update    ein Update erzwingen
    bindhosts --force-reset     Erzwingt einen Reset von bindhosts, d. h. die Hosts-Datei wird auf null IPs zurückgesetzt.
    bindhosts --custom-cron     Legt die Tageszeit fest, zu der ein Cronjob für Bindhosts ausgeführt werden soll.
    bindhosts --enable-cron     Aktiviert die Cronjob-Aufgabe für Bindhosts, um die IP-Adressen der derzeit verwendeten Listen um 10 Uhr morgens (Standardzeit) zu aktualisieren.
    bindhosts --disable-cron    Deaktiviert und löscht zuvor festgelegte Cronjob-Aufgaben für Bindhosts.
    bindhosts --help            Dadurch wird alles wie oben in Bild und Text dargestellt angezeigt.
```

## Aktion

drücken Sie die Aktion zum Umschalten von Update und Zurücksetzen

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Manager Action">

## WebUI

füge benutzerdefinierte Regeln, Quellen, Whitelist oder Blacklist hinzu

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="Manager WebUI">
