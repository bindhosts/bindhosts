# Guía para ocultar

## APatch

Ocultar en APatch debería funcionar, siempre y cuando estés en la [última versión](https://github.com/bmax121/APatch/releases/latest)

- 'Excluir modificaciones' a las aplicaciones de las que desea ocultar root.
- Instalar NeoZygisk o ReZygisk como controlador de la lista de denegación
- O si utiliza ZygiskNext, habilite la lista de denegacion
- O puede instalar [NoHello](https://github.com/MhmRdd/NoHello) o [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)

APatch Legacy no se recomienda debido a problemas potenciales. Sin embargo, puedes probar lo siguiente:

- Excluir modificaciones + habilitar lista de negación de [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- O puede instalar [NoHello](https://github.com/MhmRdd/NoHello) o [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- Mientras que esto ya no se recomienda, todavía puede intentar usar hosts_file_redirect kpm. [Tutorial](https://github.com/bindhosts/bindhosts/issues/3)
- si hosts_file_redirect falla, instala [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Ocultar en KernelSu solo debería funcionar, siempre que:

1. tengas path_umount (GKI, backported)
2. No tengas módulos en conflicto (ej. Magical Overlaysfs)

Recomendaciones:

- si el kernel no es gki y carece de path_umount, pregunte al dev del kernel que [haga backport a esta característica](https://github.com/tiann/KernelSU/pull/1464)
- Instalar NeoZygisk o ReZygisk como controlador de la lista de denegación
- O si utiliza ZygiskNext, habilite la lista de denegacion
- O puedes instalar [NoHello](https://github.com/MhmRdd/NoHello), [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) o [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- Alternativamente, simplemente instale [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Variantes (MKSU, KernelSU-NEXT)

- Para MKSU, las mismas recomendaciones que KernelSU
- Para KernelSU-NEXT, la ocultación funcionará (vía modo 6)

### SuSFS

- Para SuSFS, debería funcionar

## Magisk

Ocultar en Magisk (y clones, Alpha, Kitsune) debe funcionar como es.

- Añada las aplicaciones de las que desea ocultar root a la lista de denegación.
- opcionalmente también puedes usar Shamiko en Alpha

# Preguntas Frecuentes (FAQ)

- ¿Por qué se necesita esto?
  - Algunas detecciones de root ahora incluyen y comprueban si se ha modificado el archivo de hosts.
- ¿Cómo puedo comprobar si hay detecciones?
  - Lee [cómo comprobar si hay detecciones](https://github.com/bindhosts/bindhosts/issues/4)
- ¿Cómo puedo hago para enlazar el montaje en APatch?
  - Obten la [última versión](https://github.com/bmax121/APatch/releases/latest)

## Links

### Proveedores de Zygisk

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- Activa la lista de denegación de [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)

### Zygisk addons

- [NoHello](https://github.com/MhmRdd/NoHello)
- opcionalmente también puedes usar [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)
- Para MKSU, puedes usar [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)
