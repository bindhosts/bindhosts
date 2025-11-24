# Hiding Guide

## APatch

Hiding in APatch should just work, provided you are on [latest release](https://github.com/bmax121/APatch/releases/latest)

- 'Exclude Modifications' to apps you want to hide root from.
- Install either NeoZygisk or ReZygisk as denylist handler
- OR if you use ZygiskNext, enable umount only

Legacy APatch is discouraged due to potential issues. However, you can try the following:

- exclude modifications plus either NeoZygisk, ReZygisk OR ZygiskNext's umount only
- OR you can install either NoHello or Zygisk Assistant
- while this is not recommended anymore, you can still try to use hosts_file_redirect kpm. [Tutorial](https://github.com/bindhosts/bindhosts/issues/3)
- if hosts_file_redirect fails, install [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Hiding in KernelSU should just work, provided that:

1. you have path_umount (GKI, backported)
2. no conflicing modules (e.g. Magical Overlayfs)

Recommendations:

- if kernel is non-gki and kernel lacks path_umount, ask kernel dev to [backport this feature](https://github.com/tiann/KernelSU/pull/1464)
- Install NeoZygisk or ReZygisk as denylist handler
- OR if you use ZygiskNext, enable umount only
- alternatively, just install [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Variants (MKSU, KernelSU-NEXT)

- For MKSU, same recommendations as KernelSU
- For KernelSU-NEXT, hiding will just work (via mode 6)

### SuSFS

- For SuSFS, it should just work

## Magisk

Hiding in Magisk (and clones, Alpha, Kitsune) should just work as is.

- Add the apps you want to hide root from to the denylist.
- optionally you can also use Shamiko on Alpha

# FAQ

- Why is this needed?
  - some root detections now includes and check for modified hosts file.
- How do I check for detections?
  - Read [how to check for detections](https://github.com/bindhosts/bindhosts/issues/4)
- How do I move to bind mount on APatch?
  - get [latest release](https://github.com/bmax121/APatch/releases/latest)

## Links

### Zygisk providers
- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
