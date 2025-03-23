# modalità operative di bindhost
- Queste sono le modalità operative attualmente definite che vengono rilevate in modalità automatica o disponibili come opt-in
- Puoi cambiare la modalità operativa accedendo a [opzione sviluppatore](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116).

#### Glossario dei termini
 - magic mount - metodo di montaggio usato principalmente da magisk
 - susfs - abbreviazione di [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu), framework avanzato per nascondere il root fornito come patchset del kernel

---

## modalità=0
### modalità predefinita
 - **APatch** 
   - bind mount (magic mount)
   - compatibile con Adaway
   - Nascondersi: Escludi modifiche + Enforcement denylist di [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
 - **Magisk** 
   - magic mount  
   - compatibile con Adaway
   - Nascondersi: Denylist / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)  
 - **KernelSU** 
   - OverlayFS + path_umount, (magic mount? presto?)
   - non compatibile con Adaway
   - Nascondersi: umount modules (per non-GKI, eseguire backport path_umount)

---

## modalità=1
### ksu_susfs_bind
- susfs assisted mount --bind
- solo KernelSU
- richiede kernel con patch susfs e strumento userspace
- Compatibile con Adaway
- Nascondersi: **il migliore nella sua categoria poiché SuSFS gestisce lo smontaggio**

---

## modalità=2
### bindhost semplici
- mount --bind
- **Massima compatibilità**
- funziona effettivamente su tutti i gestori, ma non è davvero preferibile
- perde un bind mount, perde un file hosts modificato globalmente 
- selezionato quando APatch è su OverlayFS (modalità predefinita) in quanto offre una migliore compatibilità.
- compatibile con Adaway
- Nascondersi: essenzialmente non ci si nasconde, ha bisogno di assistenza

---

## modalità=3
### apatch_hfr, hosts_file_redirect
- reindirizzamento di /system/etc/hosts per uid 0
- solo APatch, richiede hosts_file_redirect KPM  
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)  
  - [guida-pratica](https://github.com/bindhosts/bindhosts/issues/3)
- NON funziona su tutte le configurazioni, incostante 
- non compatibile con Adaway 
- Nascondersi: buon metodo se FUNZIONA

---

## modalità=4
### zn_hostsredirect
- zygisk next injection
- l'uso è **incoraggiato** dall'autore (aviraxp)
> *"Injection is much better than mount in this usecase"* <div align="right"><em>-- aviraxp</em></div>
- dovrebbe funzionare su tutti i manager  
- Richiede:  
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)  
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)  
- non compatibile con Adaway 
- Nascondersi: buon metodo poiché non c'è alcun montaggio, ma dipende da altri moduli

---

## modalità=5
### ksu_susfs_open_redirect
- reindirizzamenti file in-kernel per uid sotto 2000
- solo KernelSU
- solo **OPT-IN**
- richiede kernel con patch susfs e strumento userspace  
- l'uso è **sconsigliato** dall'autore (simonpunk)
> *"openredirect will take more CPU cycle as well.."* <div align="right"><em>-- simonpunk</em></div>
- richiede SuSFS 1.5.1 o successivo  
- compatibile con Adaway
- Nascondersi: buon metodo ma probabilmente sprecherà più cicli della CPU

---

## modalità=6
### ksu_source_mod
- KernelSU try_umount montaggio assistito --bind
- richiede la modifica della fonte: [riferimento](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)  
- supportato su KernelSU NEXT 12183+ [riferimento](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **ATTENZIONE**: Conflitti con SuSFS. Non ti serve se puoi implementare SuSFS.
- compatibile con Adaway
- Nascondersi: buon metodo ma probabilmente puoi semplicemente implementare susfs.

---

## modalità=7
### generic_overlay
- montaggio overlayfs rw generico
- dovrebbe funzionare su tutti i manager 
- **OPT-IN** solo a causa della suscettibilità **terribilmente elevata** ai rilevamenti
- perde un montaggio overlayfs (con /data/adb upperdir), perde il file hosts modificato globalmente
- NON funzionerà probabilmente su APatch bind_mount / MKSU se l'utente ha f2fs /data casefolding nativo
- compatibile con Adaway
- Nascondersi: essenzialmente non ci si nasconde, ha bisogno di assistenza

---

## modalità=8
### ksu_susfs_overlay
- montaggio rw overlayfs assistito da susfs
- solo KernelSU
- richiede kernel con patch susfs e strumento userspace
- NON funzionerà probabilmente su APatch bind_mount / MKSU se l'utente ha f2fs /data casefolding nativo
- compatibile con Adaway
- Nascondersi: buon metodo ma ksu_susfs_bind è più semplice

---

## modalità=9
### ksu_susfs_bind_kstat
- mount --bind assistito da susfs + kstat spoofing
- solo KernelSU
- richiede kernel con patch susfs e strumento userspace
- **OPT-IN** solo perché è di nicchia
- compatibile con Adaway
- Nascondersi: **il migliore nella sua categoria poiché SuSFS gestisce lo smontaggio**

