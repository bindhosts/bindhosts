# Οδηγός Απόκρυψης

## APatch

Η απόκρυψη στο APatch θα πρέπει να λειτουργεί, αρκεί να έχετε την [τελευταία έκδοση]https://github.com/bmax121/APatch/releases/latest

- 'Εξαίρεση τροποποιήσεων' σε εφαρμογές από τις οποίες θέλετε να αποκρύψετε το root.
- Εγκαταστήστε είτε το NeoZygisk είτε το ReZygisk ως χειριστή denylist
- Ή αν χρησιμοποιείτε το ZygiskNext, ενεργοποιήστε το umount only

Το παλαιότερο APatch δεν συνιστάται λόγω πιθανών προβλημάτων. Ωστόσο, μπορείτε να δοκιμάσετε τα εξής:

- εξαίρεση τροποποιήσεων συν του NeoZygisk, είτε του ReZygisk Ή ZygiskNext το umount only
- Ή μπορείτε να εγκαταστήσετε είτε το NoHello είτε το Zygisk Assistant
- Ενώ αυτό δεν συνιστάται πλέον, μπορείτε να δοκιμάσετε να χρησιμοποιήσετε το hosts_file_redirect kpm. [Εκμάθηση](https://github.com/bindhosts/bindhosts/issues/3)
- Εάν το hosts_file_redirect αποτύχει, εγκαταστήστε το [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Η απόκρυψη στο KernelSU θα πρέπει να λειτουργεί μόνο υπό την προϋπόθεση ότι:

1. έχετε path_umount (GKI, backported)
2. χωρίς διένεξη με ενότητες (π.χ. Magical Overlayfs)

Προτάσεις:

- Εάν ο πυρήνας δεν είναι gki και ο πυρήνας δεν έχει path_umount, ζητήστε από τον προγραμματιστή του πυρήνα να [μεταφέρει αυτήν τη δυνατότητα](https://github.com/tiann/KernelSU/pull/1464)
- Εγκαταστήστε το NeoZygisk ή το ReZygisk ως χειριστή denylist
- Ή αν χρησιμοποιείτε το ZygiskNext, ενεργοποιήστε το umount only
- εναλλακτικά, απλώς εγκαταστήστε το [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Παραλλαγές (MKSU, KernelSU-NEXT)

- Για το MKSU, οι ίδιες συστάσεις με το KernelSU
- Για το KernelSU-NEXT, η απόκρυψη θα λειτουργήσει μόνο (μέσω της λειτουργίας 6)

### SuSFS

- Για το SuSFS, θα πρέπει απλώς να λειτουργεί

## Magisk

Η απόκρυψη στο Magisk (και κλώνους, Alpha, Kitsune) θα πρέπει να λειτουργεί ως έχει.

- Προσθέστε τις εφαρμογές από τις οποίες θέλετε να αποκρύψετε το root στη denylist.
- Προαιρετικά, μπορείτε επίσης να χρησιμοποιήσετε το Shamiko στο Alpha

# Συχνές Ερωτήσεις

- Γιατί χρειάζεται αυτό;
  - Ορισμένες ανιχνεύσεις root περιλαμβάνουν πλέον και ελέγχουν για τροποποιημένο αρχείο hosts.
- Πώς μπορώ να ελέγξω για ανιχνεύσεις;
  - Διαβάστε [πώς να ελέγξετε για ανιχνεύσεις](https://github.com/bindhosts/bindhosts/issues/4)
- Πώς μπορώ να μεταβώ στο bind mount στο APatch;
  - λήψη [τελευταία έκδοση](https://github.com/bmax121/APatch/releases/latest)

## Σύνδεσμοι

### Πάροχοι Zygisk

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
