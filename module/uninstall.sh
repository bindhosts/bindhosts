#!/bin/sh
# delete settings
rm -rf /data/adb/bindhosts
# delete symlink, ap/ksu
rm /data/adb/ap/bin/bindhosts 
rm /data/adb/ksu/bin/bindhosts
# cleanup for helper modes
# hfr
[ -f /data/adb/hosts ] && printf "127.0.0.1 localhost\n::1 localhost\n" > /data/adb/hosts
# znhr
[ -f /data/adb/hostsredirect/hosts ] && printf "127.0.0.1 localhost\n::1 localhost\n" > /data/adb/hostsredirect/hosts

# uninstall bindhosts app if installed
pm path "$APP_PACKAGE" > /dev/null 2>&1 && pm uninstall me.itejo443.bindhosts

# EOF
