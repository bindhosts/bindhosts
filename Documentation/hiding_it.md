# Guida per nascondersi

## APatch

Nascondersi in APatch dovrebbe funzionare, a patto che tu sia sull'[ultima versione](https://github.com/bmax121/APatch/releases/latest)

- 'Escludi modifiche' alle app da cui vuoi nascondere il root.
- Installa NeoZygisk o ReZygisk come gestore della denylist
- O se usi ZygiskNext, abilita l'opzione enforce denylist
- O puoi installare NoHello o Zygisk Assistant su Zygisk Next

APatch Legacy è sconsigliato a causa di potenziali problemi. Tuttavia, puoi provare quanto segue:

- escludi modifiche + abilita la denylist di NeoZygisk, ReZygisk O ZygiskNext's
- O puoi installare NoHello o Zygisk Assistant
- sebbene questa soluzione non sia più consigliata, puoi comunque provare a utilizzare hosts_file_redirect kpm. [Tutorial](https://github.com/bindhosts/bindhosts/issues/3)
- se hosts_file_redirect fallisce, installare [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Nascondersi in KernelSU dovrebbe funzionare, a patto che:

1. hai path_umount (GKI, backported)
2. nessun modulo in conflitto (e.g. Magical Overlayfs)

Raccomandazioni:

- se il kernel non è gki e manca path_umount, chiedi allo sviluppatore del kernel di eseguire il [backport di questa funzionalità](https://github.com/tiann/KernelSU/pull/1464)
- Installa NeoZygisk o ReZygisk come gestore della denylist
- O se usi ZygiskNext, abilita l'opzione enforce denylist
- O puoi installare NoHello, Shamiko o Zygisk Assistant su Zygisk Next
- in alternativa, basta installare [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Varianti (MKSU, KernelSU-NEXT)

- Per MKSU, stesse raccomandazioni di KernelSU
- Per KernelSU-NEXT, l'occultamento funzionerà (tramite modalità 6)

### SuSFS

- Per SuSFS, dovrebbe funzionare

## Magisk

Nascondersi in Magisk (e cloni, Alpha e Kitsune) dovrebbe funzionare così com'è.

- Aggiungi le app da cui vuoi nascondere il root alla denylist.
- facoltativamente puoi anche usare Shamiko su Alpha

# FAQ

- Perché è necessario?
  - Alcune rilevazioni root ora includono e verificano la presenza di file hosts modificati.
- Come posso verificare la presenza di rilevamenti?
  - Leggi [come verificare i rilevamenti](https://github.com/bindhosts/bindhosts/issues/4)
- Come faccio a passare a bind mount su APatch?
  - ottieni [ultima versione](https://github.com/bmax121/APatch/releases/latest)

## Links

### Fornitori Zygisk

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)

### Componenti aggiuntivi Zygisk

- [NoHello](https://github.com/MhmRdd/NoHello)
- [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)
- [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
