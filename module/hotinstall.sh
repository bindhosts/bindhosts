#!/bin/sh
PATH=/data/adb/ap/bin:/data/adb/ksu/bin:/data/adb/magisk:$PATH
MODDIR="/data/adb/modules/bindhosts"
PERSISTENT_DIR="/data/adb/bindhosts"
. $MODDIR/utils.sh

sh "$MODDIR/post-fs-data.sh" > /dev/null 2>&1

if [ -f "$MODDIR/mode.sh" ]; then
	. "$MODDIR/mode.sh"
fi

# we cannot support these modes on hot install
case $operating_mode in
	0) echo "operating_mode=2" > "$MODDIR/mode.sh" ;;
	7) echo "operating_mode=2" > "$MODDIR/mode.sh" ;;
	8) echo "operating_mode=2" > "$MODDIR/mode.sh" ;;
esac

sh "$MODDIR/service.sh" > /dev/null 2>&1

echo "bindhosts: hot-install.sh done" >> /dev/kmsg

# EOF
