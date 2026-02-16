# режимы работы bindhosts

- В настоящее время определены режимы работы, которые либо проверяются автоматически, либо доступны по выбору
- Вы можете изменить режим работы, перейдя в [опции для разработчиков](https://github.com/bindhosts/bindhosts/issues/10#issue-2703531116).

#### Словарь терминов

- magic mount — метод монтирования, используемый в основном Magisk
- susfs — сокращение от [susfs4ksu](https://gitlab.com/simonpunk/susfs4ksu), расширенная платформа для сокрытия root-доступа, предоставляемая в виде набора патчей ядра

---

## режим=0

### режим по умолчанию

- **APatch**
  - bind mount (magic mount)
  - Совместим с AdAway
  - Скрытие: 'Исключить модификации' + [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)'s umount only
- **Magisk**
  - magic mount
  - Совместим с AdAway
  - Скрытие: Denylist / [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases) / [Zygisk Assistant](https://github.com/snake-4/Zygisk-Assistant)
- **KernelSU**
  - OverlayFS + path_umount, (magic mount? скоро?)
  - Не совместим с AdAway
  - Скрытие: размонтирование модулей (для non-GKI, пожалуйста, бэкпортируйте path_umount)

---

## режим=1

### ksu_susfs_bind

- mount --bind, при поддержке SuSFS
- Только для KernelSU
- Требует ядра с патчами SuSFS и userspace окружение
- Совместим с AdAway
- Скрытие: SuSFS выполняет размонтирование

---

## Режим 2

### простой bindhosts

- mount --bind
- **Самая высокая совместимость**
- Фактически работает со всеми менеджерами.
- Будет утечка bind mount и глобально модифицированного hosts файла, если используется без поддержки.
- Выбрано когда APatch на OverlayFS (стандартный режим) так как он дает большую совместимость.
- Выбрано когда известный обработчик denylist найден.
- Поддержка Adaway
- Скрытие: требуется поддержка в скрытии

---

## Режим 3

### aparch_hrf, hosts_file_redirect

- Перенаправление внутри ядра /system/etc/hosts для uid 0
- Только APatch, требуется hosts_file_redirect KPM
  - [hosts_file_redirect](https://github.com/AndroidPatch/kpm/blob/main/src/hosts_file_redirect/)
  - [Гайд](https://github.com/bindhosts/bindhosts/issues/3)
- НЕ работает на всех сетапах, работает нестабильно
- Несовместим с AdAway
- Скрытие: хороший метод если РАБОТАЕТ

---

## Режим 4

### zn-hostsredirect

- инжект zygisk netd
- **Рекомендуется** использование автором (aviraxp)

> _"Инжект лучше чем монтирование в данном случае"_ <div align="right"><em>-- aviraxp</em></div>

- Должно работать на всех менеджерах
- Требования:
  - [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect)
  - [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
- Несовместим с AdAway
- Скрытие: хороший метод т.к. монтирование отсутствует вообще, но зависит от других модулей.

---

## Режим 5

### ksu_susfs_open_redirect

- Перенаправление внутри ядра для uid ниже 2000
- Только для KernelSU
- **ВКЛЮЧАЕТСЯ ВРУЧНУЮ**
- Требует ядра с патчами SuSFS и userspace окружение
- Использование **не рекомендуется** автором (simonpunk)

> _"openredirect также потребует больше циклов процессора.."_ <div align="right"><em>-- simonpunk</em></div>

- Требуется SuSFS 1.5.1 или выше
- Совместим с AdAway
- Скрытие: хороший метод, но скорее всего потратит больше циклов процессора

---

## Режим 6

### ksu_source_mod

- mount --bind, использует KernelSU try_umount
- Требуется модификация источника: [пример](https://github.com/tiann/KernelSU/commit/2b2b0733d7c57324b742c017c302fc2c411fe0eb)
- Поддерживается на KernelSU NEXT 12183+ [пример](https://github.com/rifsxd/KernelSU-Next/commit/9f30b48e559fb5ddfd088c933af147714841d673)
- **ВАРНИНГ**: Конфликтует с SuSFS. Вам это не нужно, если вы можете реализовать SuSFS.
- Совместим с AdAway
- Скрытие: хороший метод, но скорее всего вы можете просто реализовать SuSFS.

---

## mode=7

### generic_overlay

- универсальное overlayfs rw монтирование
- должно работать на всех менеджерах
- **ВКЛЮЧАЕТСЯ ВРУЧНУЮ** из-за **ужасно высокой** восприимчивости к обнаружениям
- создаёт утечку overlayfs монтирования (с /data/adb upperdir), создаёт утечку глобально изменённого hosts файла
- скорее всего НЕ будет работать на APatch bind_mount / MKSU если у пользователя есть нативный f2fs /data casefolding
- Совместим с AdAway
- Скрытие: по сути нет скрытия, нужна поддержка

---

## mode=8

### ksu_susfs_overlay

- overlayfs rw монтирование, при поддержке susfs
- Только для KernelSU
- Требует ядра с патчами SuSFS и userspace окружение
- скорее всего НЕ будет работать на APatch bind_mount / MKSU если у пользователя есть нативный f2fs /data casefolding
- Совместим с AdAway
- Скрытие: хороший метод, но ksu_susfs_bind проще

---

## mode=9

### ksu_susfs_bind_kstat

- mount --bind при поддержке SuSFS, подмена kstat
- Только для KernelSU
- Требует ядра с патчами SuSFS и userspace окружение
- **ВКЛЮЧАЕТСЯ ВРУЧНУЮ** только потому что является нишевым
- Совместим с AdAway
- Скрытие: SuSFS выполняет размонтирование

---

## mode=10

### ksud_kernel_umount

- mount --bind + размонтирование на уровне ядра
- Только для KernelSU
- Требует KernelSU 22106+
- Совместим с AdAway
- Скрытие: KernelSU выполняет размонтирование.

