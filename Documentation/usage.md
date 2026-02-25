# Usage

## Usage via Terminal

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Terminal Usage Screenshot">

You can access the various options as shown in the image for bindhosts Magisk/KernelSU/APatch

- via Termux (or other various common terminal apps)
    ```shell
    > su
    > bindhosts
    ```

- via SDK Platform Tools (root shell)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Example

```
    bindhosts --action          This will simulate bindhosts action to grab ips or reset the hosts file, depending on which state bindhosts is in
    bindhosts --tcpdump         Will sniff current active ip addresses on your network mode (wifi or data, make sure no DNS services are being used like cloudflare, etc.)
    bindhosts --query <URL>     Check hosts file for pattern
    bindhosts --force-update    force an update
    bindhosts --force-reset     Will force reset bindhosts, which means resets the hosts file to zero ips
    bindhosts --custom-cron     Defines time of day to run a cronjob for bindhosts
    bindhosts --enable-cron     Enables cronjob task for bindhosts to update the ips of the lists you are currently using at 10am (default time)
    bindhosts --disable-cron    Disables & deletes previously set cronjob task for bindhosts
    bindhosts --help            This will show everything as shown above in image and text
```

## Action

press action to toggle update and reset
 
<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Manager Action">

## WebUI

add your custom rules, sources, whitelist or blacklist
 
<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="Manager WebUI">
