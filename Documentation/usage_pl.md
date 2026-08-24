# Użytkowanie

## Użytkowanie przez terminal

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Zrzut ekranu przedstawiający użycie terminala">

Dostęp do różnych opcji bindhosts dla Magisk/KernelSU/APatch można uzyskać w sposób pokazany na ilustracji

- przez Termux (lub inną popularną aplikację terminalową)
    ```shell
    > su
    > bindhosts
    ```

- przez SDK Platform Tools (powłoka roota)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Przykład

```
    bindhosts --action          Symuluje użycie akcji bindhosts w celu pobrania adresów IP lub wyzerowania pliku hosts, zależnie od bieżącego stanu bindhosts
    bindhosts --tcpdump         Przechwytuje aktualnie aktywne adresy IP w używanym trybie sieciowym (Wi-Fi lub transmisja danych; upewnij się, że nie są używane usługi DNS, takie jak Cloudflare itp.)
    bindhosts --query <URL>     Sprawdza plik hosts pod kątem wzorca
    bindhosts --force-update    Wymusza aktualizację
    bindhosts --force-reset     Wymusza zresetowanie bindhosts, czyli zastąpienie adresów IP w pliku hosts adresami zerowymi
    bindhosts --custom-cron     Określa porę uruchamiania zadania cron dla bindhosts
    bindhosts --enable-cron     Włącza zadanie cron aktualizujące adresy IP z obecnie używanych list o godz. 10:00 (domyślna pora)
    bindhosts --disable-cron    Wyłącza i usuwa wcześniej skonfigurowane zadanie cron dla bindhosts
    bindhosts --help            Wyświetla wszystkie informacje pokazane powyżej na ilustracji i w tekście
```

## Akcja

naciśnij przycisk akcji, aby przełączać między aktualizacją a resetowaniem

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Akcja w menedżerze">

## WebUI

dodaj własne reguły, źródła, białą lub czarną listę

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="WebUI menedżera">
