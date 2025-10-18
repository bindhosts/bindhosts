# Χρήση

## Χρήση μέσω Τερματικού

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Terminal Usage Screenshot">

Μπορείτε να αποκτήσετε πρόσβαση στις διάφορες επιλογές όπως φαίνεται στην εικόνα για το bindhosts Magisk/KernelSU/APatch

- μέσω Termux (ή άλλων διαφόρων κοινών εφαρμογών τερματικού)
    ```shell
    > su
    > bindhosts
    ```

- μέσω SDK Platform Tools (κέλυφος root)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Παράδειγμα

```
    bindhosts --action          Αυτό θα προσομοιώσει την ενέργεια του bindhosts για να πάρει τα ips ή να επαναφέρει το αρχείο hosts, ανάλογα με την κατάσταση στην οποία βρίσκεται το bindhosts
    bindhosts --tcpdump         Θα ανιχνεύσει τις τρέχουσες ενεργές διευθύνσεις IP στη λειτουργία δικτύου σας (wifi ή δεδομένα, βεβαιωθείτε ότι δεν χρησιμοποιούνται υπηρεσίες DNS όπως cloudflare, κ.λπ.)
    bindhosts --query <URL>     Ελέγχος αρχείου hosts για μοτίβο
    bindhosts --force-update    επιβολή ενημέρωσης
    bindhosts --force-reset     Θα επιβάλει επαναφορά του bindhosts, που σημαίνει ότι επαναφέρει το αρχείο hosts σε μηδενικές ips
    bindhosts --custom-cron     Ορίζει την ώρα της ημέρας για την εκτέλεση ενός cronjob για το bindhosts
    bindhosts --enable-cron     Ενεργοποιεί την εργασία cronjob για το bindhosts για να ενημερώσει τις διευθύνσεις ips των λιστών που χρησιμοποιείτε αυτήν τη στιγμή στις 10 π.μ. (προεπιλεγμένη ώρα)
    bindhosts --disable-cron    Απενεργοποιεί & διαγράφει την προηγούμενη ορισμένη εργασία cronjob για το bindhosts
    bindhosts --help            Αυτό θα εμφανίσει όλα όσα φαίνονται παραπάνω στην εικόνα και το κείμενο
```

## Ενέργεια

πατήστε ενέργεια για εναλλαγή ενημέρωσης και επαναφοράς

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Manager Action">

## WebUI

προσθέστε τους προσαρμοσμένους κανόνες, τις πηγές, τη λίστα επιτρεπόμενων ή τη λίστα αποκλεισμένων

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="Manager WebUI">
