#!/bin/sh
PATH=/data/adb/ap/bin:/data/adb/ksu/bin:/data/adb/magisk:$PATH
MODDIR="/data/adb/modules/bindhosts"
PERSISTENT_DIR="/data/adb/bindhosts"
. $MODDIR/utils.sh
. $MODDIR/mode.sh

# remove previous linked hosts file and link again
# hosts location might be different after reboot when user flash znhr/hfr
sh $MODDIR/bindhosts.sh --setup-link

# EOF
