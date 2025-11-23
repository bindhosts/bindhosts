#!/bin/sh
PATH=/data/adb/ap/bin:/data/adb/ksu/bin:/data/adb/magisk:$PATH
MODDIR="/data/adb/modules/bindhosts"
PERSISTENT_DIR="/data/adb/bindhosts"
. $MODDIR/utils.sh
SUSFS_BIN="/data/adb/ksu/bin/ksu_susfs"

# always try to prepare hosts file
if [ ! -f $MODDIR/system/etc/hosts ]; then
	mkdir -p $MODDIR/system/etc
	cat /system/etc/hosts > $MODDIR/system/etc/hosts
	printf "127.0.0.1 localhost\n::1 localhost\n" >> "$MODPATH/system/etc/hosts"
fi
hosts_set_perm "$MODDIR/system/etc/hosts"

# detect operating operating_modes

# normal operating_mode
# all managers? (citation needed) can operate at this operating_mode
# this assures that we have atleast a base operating operating_mode
mode=0

# plain bindhosts operating mode, no hides at all
# we enable this on apatch overlayfs, APatch litemode, MKSU nomount
# we now also do this on ksu that supports metamodule
# while it is basically hideless, this still works.
if { [ "$APATCH" = "true" ] && [ ! "$APATCH_BIND_MOUNT" = "true" ]; } || 
	{ [ "$APATCH_BIND_MOUNT" = "true" ] && [ -f /data/adb/.litemode_enable ]; } || 
	{ [ "$KSU_MAGIC_MOUNT" = "true" ] && [ -f /data/adb/ksu/.nomount ]; } ||
	{ [ "$KSU" = true ] && [ ! "$KSU_MAGIC_MOUNT" = true ] &&  [ "$KSU_VER_CODE" -ge 22098 ]; }; then
	mode=2
fi

# ksud kernel umount
# https://github.com/tiann/KernelSU/commit/4a18921bc00eb83ba3e60bec5672dfbc4d2bd9a2
if [ "$KSU" = true ] && /data/adb/ksud kernel 2>&1 | grep -q "umount" >/dev/null 2>&1; then
	echo "bindhosts: post-fs-data.sh - ksud with kernel umount found!" >> /dev/kmsg
	mode=10
fi

# we can force mode 2 if user has something that gives unconditional umount to /system/etc/hosts
# so far NeoZygisk, ReZygisk, NoHello, Zygisk Assistant does it
denylist_handlers="rezygisk zygisksu zygisk-assistant zygisk_nohello"
for module_name in $denylist_handlers; do
	if [ -d "/data/adb/modules/$module_name" ] && [ ! -f "/data/adb/modules/$module_name/disable" ] && 
		[ ! -f "/data/adb/modules/$module_name/remove" ]; then
		if [ "$module_name" = "zygisksu" ]; then
			if grep -q NeoZygisk /data/adb/modules/zygisksu/module.prop; then
				module_name="NeoZygisk"
			else
				continue;
			fi
		fi
		echo "bindhosts: post-fs-data.sh - $module_name found" >> /dev/kmsg
		mode=2
	fi
done

# on ZN 1.3.0 deducing DE / UM status at boot is now possible
# enforce_denylist:1 is DE
# enforce_denylist:2 is UM
zygisksu_dir="/data/adb/modules/zygisksu"
if [ -d "$zygisksu_dir" ] && [ ! -f "$zygisksu_dir/remove" ] && [ ! -f "$zygisksu_dir/disable" ]; then
	enforce_denylist_mode=$(cat /data/adb/zygisksu/denylist_enforce)
	if [ "$enforce_denylist_mode" -gt 0 ]; then 
		echo "bindhosts: post-fs-data.sh - ZygiskNext 1.3.0+ found with enforce_denylist $enforce_denylist_mode" >> /dev/kmsg
		mode=2
	fi
fi

# ksu next 12183
# ksu next added try_umount /system/etc/hosts recently
# lets try to add it onto the probe
if [ "$KSU_NEXT" = "true" ] && [ "$KSU_KERNEL_VER_CODE" -ge 12183 ]; then
	mode=6
fi

# ksu+susfs operating_mode
# handle probing for susfs 1.5.3+
if [ "$KSU" = true ] && [ -f ${SUSFS_BIN} ] &&
	${SUSFS_BIN} show enabled_features | grep -q "CONFIG_KSU_SUSFS_TRY_UMOUNT" >/dev/null 2>&1; then
	echo "bindhosts: post-fs-data.sh - susfs with try_umount found!" >> /dev/kmsg
	mode=1
fi

# hosts_file_redirect operating_mode
# this method is APatch only
# no other heuristic other than dmesg
if [ "$APATCH" = true ]; then
	dmesg | grep -q "hosts_file_redirect" && mode=3
fi

# ZN-hostsredirect operating_mode
# method works for all, requires zn-hostsredirect + zygisk-next
# while `znctl dump-zn` gives us an idea if znhr is running, 
# znhr starts at late service when we have to decide what to do NOW.
# we can only assume that it is on a working state
# here we unconditionally flag an operating_mode for it
if [ -d "/data/adb/modules/hostsredirect" ] && [ ! -f "/data/adb/modules/hostsredirect/disable" ] && [ ! -f "/data/adb/modules/hostsredirect/remove" ] &&
	[ -d "$zygisksu_dir" ] && [ ! -f "$zygisksu_dir/disable" ] && [ ! -f "$zygisksu_dir/remove" ]; then
	mode=4
fi

# override operating mode here
if [ -f /data/adb/bindhosts/mode_override.sh ]; then
	echo "bindhosts: post-fs-data.sh - mode_override found!" >> /dev/kmsg
	. /data/adb/bindhosts/mode_override.sh
fi

# write operating mode to mode.sh 
# service.sh will read it
echo "operating_mode=$mode" > $MODDIR/mode.sh

# skip_mount logic
# every mode other than 0 is skip_mount=1
skip_mount=1 
[ $mode = 0 ] && skip_mount=0

# we do it like this instead of doing mode=0, mode -ge 1
# since more modes will likely be added in the future
# and I will probably be using letters
[ $skip_mount = 0 ] && ( [ -f $MODDIR/skip_mount ] && rm $MODDIR/skip_mount )
[ $skip_mount = 1 ] && ( [ ! -f $MODDIR/skip_mount ] && touch $MODDIR/skip_mount )

# disable all other hosts module
disable_hosts_modules_verbose=2
disable_hosts_modules

# detect root manager
# Take note of capitalization when using them!
# official names are used!
[ "$APATCH" = true ] && current_manager="APatch"
[ "$KSU" = true ] && current_manager="KernelSU"
[ ! "$APATCH" = true ] && [ ! "$KSU" = true ] && current_manager="Magisk"
[ -f "$PERSISTENT_DIR/root_manager.sh" ] && . "$PERSISTENT_DIR/root_manager.sh"
# this will likely never happen but just to be sure
if [ ! "$current_manager" = "$manager" ]; then
	echo "manager=$current_manager" > "$PERSISTENT_DIR/root_manager.sh"
fi

# debugging
echo "bindhosts: post-fs-data.sh - probing done" >> /dev/kmsg

# EOF
