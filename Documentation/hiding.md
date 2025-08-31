# Hiding Guide

## APatch

Hiding in APatch should just work, provided you are on [latest release](https://github.com/bmax121/APatch/releases/latest)

- 'Exclude Modifications' to apps you want to hide root from.
- Install [ReZygisk](https://github.com/PerformanC/ReZygisk) as denylist handler
- OR if you use [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext), enable enforce denylist
- OR you can install either [NoHello](https://github.com/MhmRdd/NoHello) or [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)

Legacy APatch is discouraged due to potential issues. However, you can try the following:

- exclude modifications + [ReZygisk](https://github.com/PerformanC/ReZygisk) OR [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)'s enforce denylist
- OR you can install either [NoHello](https://github.com/MhmRdd/NoHello) or [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- while this is not recommended anymore, you can still try to use hosts_file_redirect kpm. [Tutorial](https://github.com/bindhosts/bindhosts/issues/3)
- if hosts_file_redirect fails, install [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Hiding in KernelSU should just work, provided that:

1. you have path_umount (GKI, backported)
2. no conflicing modules (e.g. Magical Overlayfs)

Recommendations:

- if kernel is non-gki and kernel lacks path_umount, ask kernel dev to [backport this feature](https://github.com/tiann/KernelSU/pull/1464)
- Install [ReZygisk](https://github.com/PerformanC/ReZygisk) as denylist handler
- OR if you use [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext), enable enforce denylist
- OR you can install either [NoHello](https://github.com/MhmRdd/NoHello), [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/) or [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- alternatively, just install [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Variants (MKSU, KernelSU-NEXT)

- For MKSU, you can use [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)
- For KernelSU-NEXT, hiding will just work (via mode 6)

### SuSFS

- For SuSFS, it should just work

## Magisk

Hiding in Magisk (and clones, Alpha, Kitsune) should just work as is.

- Add the apps you want to hide root from to the denylist.
- optionally you can also use [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases/)

# FAQ

- Why is this needed?
  - some root detections now includes and check for modified hosts file.
- How do I check for detections?
  - Read [how to check for detections](https://github.com/bindhosts/bindhosts/issues/4)
- How do I move to bind mount on APatch?
  - get ci builds [here](https://nightly.link/bmax121/APatch/workflows/build/main/APatch)

## Glossary of terms

- bind mount - APatch's term for magic mount, mounting method primarily used by Magisk.
