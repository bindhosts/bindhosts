# Uso

## Uso vía Terminal

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Terminal Usage Screenshot">

Puedes acceder a las distintas opciones como se muestra en la imagen para bindhosts Magisk/KernelSU/APatch

- vía Termux (u otras aplicaciones comunes de terminal)
    ```shell
    > su
    > bindhosts
    ```

- vía SDK Platform Tools (root shell)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Ejemplo

```
    bindhosts --action Esto simulará la acción bindhosts para agarrar ips o restablecer el archivo hosts, dependiendo del estado de los bindhosts en
    bindhosts --tcpdump sniff las direcciones IP activas actuales en su modo de red (wifi o datos, asegurarse de que no se están utilizando servicios DNS como cloudflare, etc.
    bindhosts --query <URL>     Comprueba el patrón
    bindhosts --force-update forzar una actualización
    bindhosts --force-reset Forzará reiniciar bindhosts, lo que significa restablecer el archivo hosts a cero ips
    bindhosts --custom-cron Define la hora del día para ejecutar un cronjob para bindhosts
    bindhosts --enable-cron Activa tareas cronjob para bindhosts para actualizar las ips de las listas que estás usando actualmente a las 10am (hora predeterminada)
    bindhosts --disable-cron Disables y elimina previamente definidas tareas cronjob para bindhosts
    bindhosts --help Esto mostrará todo como se muestra arriba en la imagen y el texto
```

## Action

presiona el botón 'acción' para actualizar y restablecer

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Manager Action">

## WebUI

añade tus reglas personalizadas, fuentes, lista blanca o lista negra

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="Manager WebUI">
