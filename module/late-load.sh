#!/bin/sh
PATH=/data/adb/ap/bin:/data/adb/ksu/bin:/data/adb/magisk:$PATH
MODDIR="/data/adb/modules/bindhosts"
PERSISTENT_DIR="/data/adb/bindhosts"
. $MODDIR/utils.sh

sh "$MODDIR/post-fs-data.sh" > /dev/null 2>&1

echo "bindhosts: late-load.sh done" >> /dev/kmsg

# EOF
