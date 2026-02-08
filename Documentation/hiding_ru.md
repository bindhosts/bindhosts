# Гайд по скрытию

## APatch

Скрытие в APatch должно просто работать, если у вас [последний релиз](https://github.com/bmax121/APatch/releases/latest)

- 'Исключить модификации' для приложений, от которых вы хотите скрыть рут.
- Установите NeoZygisk либо ReZygisk в качестве обработчика denylist
- ИЛИ, если вы используете ZygiskNext, включите umount only

Устаревший APatch не рекомендуется из-за потенциальных проблем. Но вы можете попробовать следующее:

- 'Исключить модификации' + либо NeoZygisk, либо ReZygisk, либо ZygiskNext umount only
- ЛИБО вы можете установить NoHello или Zygisk Assistant
- Несмотря на то, что это не рекомендуется, вы все еще можете попробовать hosts_file_redirect kpm. [Туториал](https://github.com/bindhosts/bindhosts/issues/3)
- Если hosts_file_redirect не работает, установите [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

## KernelSU

Скрытие в KernelSU должно просто работать, при условии что:

1. у вас есть path_umount (GKI, или бекпортирован)
2. Нету конфликтующих модулей (например Magical Overlayfs)

Рекомендации:

- Если ваше ядро не gki и отсутствует path_umount, попросите разработчика ядра [портировать данную функцию](https://github.com/tiann/KernelSU/pull/1464)
- Установите NeoZygisk или ReZygisk в качестве обработчика denylist
- ИЛИ, если вы используете ZygiskNext, включите umount only
- Как альтернатива, просто установите [ZN-hostsredirect](https://github.com/aviraxp/ZN-hostsredirect/releases)

### Варианты (MKSU, KernelSU-NEXT)

- Для MKSU, те же рекомендации как к KernelSU
- Для KernelSU-NEXT, скрытие должно просто работать (через 6 режим)

### SuSFS

- Для SuSFS, оно должно просто работать

## Magisk

Скрытие в Magisk (и клонах, Alpha, Kitsune) должно просто работать как есть.

- Добавьте приложения от которых вы хотите скрыть рут в denylist.
- (Опционально) Вы можете также использовать Shamiko в Alpha

# Вопрос/Ответ

- Зачем это нужно?
  - Некоторые обнаружения рута теперь включают в себя проверку на модифицированный файл hosts.
- Как я могу проверить на наличие обнаружений?
  - Прочитайте [Как проверять на обнаружения](https://github.com/bindhosts/bindhosts/issues/4)
- Как перейти на bind mount в APatch?
  - Скачайте [последний релиз](https://github.com/bmax121/APatch/releases/latest)

## Ссылки

### Модули для Zygisk

- [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
- [ReZygisk](https://github.com/PerformanC/ReZygisk)
- [ZygiskNext](https://github.com/Dr-TSNG/ZygiskNext)
