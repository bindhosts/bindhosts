# Utilizzo

## Utilizzo tramite Terminale
<img src="https://github.com/bindhosts/bindhosts/blob/master/Documentation/screenshots/terminal_usage.png?raw=true" width="100%">

È possibile accedere alle varie opzioni come mostrato nell'immagine per bindhosts Magisk/KernelSU/APatch
- tramite Termux (o altre varie app terminali comuni)
    ```shell
    > su
    > bindhosts
    ```

- tramite SDK Platform Tools (shell root)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Esempio
```
    bindhosts --action          Questo simulerà l'azione di bindhosts per catturare gli IP o reimpostare il file host, a seconda dello stato in cui si trova bindhosts
    bindhosts --tcpdump         Analizzerà gli indirizzi IP attivi correnti sulla tua modalità di rete (Wi-Fi o dati, assicurati che non siano in uso servizi DNS come Cloudflare, ecc.)
    bindhosts --query <URL>     Controllare il file host per il pattern
    bindhosts --force-update    forzare un aggiornamento
    bindhosts --force-reset     Forzerà il ripristino di bindhosts, il che significa che reimposta il file hosts su zero ip
    bindhosts --custom-cron     Definisce l'ora del giorno per eseguire un cronjob per i bindhost
    bindhosts --enable-cron     Abilita l'attività cronjob per bindhosts per aggiornare gli IP degli elenchi attualmente in uso alle 10:00 (ora predefinita)
    bindhosts --disable-cron    Disabilita ed elimina l'attività cronjob impostata in precedenza per bindhosts
    bindhosts --help            Questo mostrerà tutto come mostrato sopra nell'immagine e nel testo
```

## Azione
 premere azione per attivare/disattivare l'aggiornamento e il ripristino
 
 <img src="https://github.com/bindhosts/bindhosts/blob/master/Documentation/screenshots/manager_action.gif?raw=true" width="100%">

## WebUI
  aggiungi le tue regole, fonti, whitelist o blacklist personalizzate
 
 <img src="https://github.com/bindhosts/bindhosts/blob/master/Documentation/screenshots/manager_webui.gif?raw=true" width="100%">

