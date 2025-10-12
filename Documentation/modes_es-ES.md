# modos de funcionamiento de bindhosts

- Estos son actualmente los modos de operación definidos que son probados en auto o disponibles como opt-in
- Puedes cambiar el modo de funcionamiento accediendo a [opciones de desarrollador](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116).

#### Glosario de términos

- magic mount - método de montaje utilizado principalmente por magisk
- susfs - abreviatura de [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu), framework avanzado de ocultación de root proporcionado como un conjunto de parches en el kernel

---

## modo=0

### Modo predeterminado

- **APatch**
  - bind mount (magic mount)
  - Compatible con Adaway
  - Ocultación: Excluir modificaciones + habilitar lista de negación de [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- **Magisk**
  - magic mount
  - Compatible con Adaway
  - Ocultación: Lista de Denegación / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- **KernelSU**
  - OverlayFS + path_umount, (magic mount? pronto?)
  - Sin compatibilidad con Adaway
  - Oculta: desmontar módulos (para no GKI, por favor haga backport path_umount)

---

## modo=1

### ksu_susfs_bind

- susfs assisted mount --bind
- Sólo KernelSU
- Requiere susfs-parchado en el kernel y userspace tool
- Compatible con Adaway
- Ocultación: **lo mejor de su clase ya que SuSFS maneja el desmontaje**

---

## modo=2

### plain bindhosts

- mount --bind
- **Alta compatibilidad**
- Actualmente funciona en todos los administradores root
- filtrará un montaje de enlace y un archivo de hosts modificado globalmente si no se asiste.
- seleccionado cuando APatch está en OverlayFS (modo predeterminado) ya que ofrece una mejor compatibilidad.
- seleccionado cuando se encuentre un conocido "gestor de lista de denegación".
- Compatible con Adaway
- Ocultación: requiere ocultación asistida

---

## modo=3

### apatch_hfr, hosts_file_redirect

- redirección en el kernel de /system/etc/hosts para uid 0
- Sólo APatch, requiere KPM de hosts_file_redirect
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)
  - [Guia](https://github.com/bindhosts/bindhosts/issues/3)
- NO funciona en todas las configuraciones, irregular
- Sin compatibilidad con Adaway
- Ocultación: buen método si es que funciona

---

## modo=4

### zn_hostsredirect

- zygisk netd injection
- uso **recomendado** por el autor (aviraxp)

> _"Inyección es mucho mejor que el montaje en este caso"_ <div align="right"><em>-- aviraxp</em></div>

- debería funcionar en todos los administradores root
- Requiere:
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- Sin compatibilidad con Adaway
- Ocultación: buen método ya que no hay montaje, pero depende de otros módulos

---

## modo=5

### ksu_susfs_open_redirect

- redirecciones de archivos en el kernel para uid por debajo del 2000
- Sólo KernelSU
- **OPT-IN** solamente
- Requiere susfs-parchado en el kernel y userspace tool
- el uso **no es recomendado** por el autor (simonpunk)

> _"openredirect también usará mas CPU.."_ <div align="right"><em>-- simonpunk</em></div>

- Requiere SuSFS 1.5.1 o superior
- Compatible con Adaway
- Ocultación: buen método, pero probablemente desperdiciará más ciclos de la cpu

---

## modo=6

### ksu_source_mod

- KernelSU try_umount assisted mount --bind
- Requiere modificación de la fuente: [referencia](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)
- Compatible en KernelSU NEXT 12183+ [referencia](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **ADVERTENCIA**: Conflicto con SuSFS. No necesitas esto si puedes implementar SuSFS.
- Compatible con Adaway
- Ocultos: buen método, pero probablemente sólo se pueden implementar susfs.

---

## modo=7

### generic_overlay

- generic overlayfs rw mount
- debería funcionar en todos los administradores root
- **OPT-IN** solamente, debido a una susceptabilidad **terriblemente alta** a las detecciones
- filtra un montaje overlayfs (con /data/adb upperdir), filtra un archivo hosts globalmente modificado
- Probablemente NO funcionará en APatch bind_mount / MKSU si el usuario tiene f2fs /data casefolding
- Compatible con Adaway
- Ocultación: básicamente no hay ocultamiento, necesita ayuda

---

## modo=8

### ksu_susfs_overlay

- overlaysfs rw mount asistido por susfs
- Sólo KernelSU
- Requiere susfs-parchado en el kernel y userspace tool
- Probablemente NO funcionará en APatch bind_mount / MKSU si el usuario tiene f2fs /data casefolding
- Compatible con Adaway
- Ocultación: buen método, pero ksu_susfs_bind es más fácil

---

## modo=9

### ksu_susfs_bind_kstat

- susfs montura asistida --bind + spoofing de kstat
- Sólo KernelSU
- Requiere susfs-parchado en el kernel y userspace tool
- **OPT-IN** sólo porque es agradable
- Compatible con Adaway
- Ocultación: **lo mejor de su clase ya que SuSFS maneja el desmontaje**

