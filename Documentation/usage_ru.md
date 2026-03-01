# Использование

## Использование через терминал

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Terminal Usage Screenshot">

Вы можете использовать различные опции как показано на картинке для bindhosts Magisk/KernelSU/APatch

- Через Termux (или другие стандартные приложения-терминалы)
    ```shell
    > su
    > bindhosts
    ```

- Через SDK Platform Tools (root shell)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Пример

```
    bindhosts --action          Симулирует действие bindhosts: подтянет IP адреса или сбросит hosts-файл (зависит от текущего состояния)
    bindhosts --tcpdump         Прослушивает активные IP-адреса в текущей сети (Wi-Fi или мобильная сеть, убедитесь что не используются DNS сервисы по типу Cloudflare)
    bindhosts --query <URL>          Проверить hosts файл на наличие указанного паттерна
    bindhosts --force-update    Принудительно обновить списки
    bindhosts --force-reset     Принудительно сбросит bindhosts, hosts файл будет очищен
    bindhosts --custom-cron     Задать своё время запуска cron-задания bindhosts
    bindhosts --enable-cron     Включить cron-задание: ежедневное обновление списков bindhosts в 10:00 (по умолчанию)
    bindhosts --disable-cron    Выключает и удаляет ранее созданное cron-задание bindhosts
    bindhosts --help            Покажет всё, как показано выше на картинке и в тексте
```

## Использование

Нажмите "Action" чтобы применить обновление и перезагрузить

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Manager Action">

## WebUI

Добавить свои правила, источники, черные или белые списки

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="Manager WebUI">
