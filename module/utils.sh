#!/bin/sh
# since we only need it for hosts
hosts_set_perm() {
	if [ -z "$1" ]; then
		return
	fi
	busybox chmod "644" "$1"
	busybox chown "root:root" "$1"
	busybox chcon --reference="/system" "$1"
}

# simple af writable dir lookup
find_rwdir() {
	rwdir=$MODDIR
	[ -w /sbin ] && rwdir=/sbin
	[ -w /debug_ramdisk ] && rwdir=/debug_ramdisk
}

disable_hosts_modules() {
	for module in /data/adb/modules/*; do
	id=$(basename "$module")
		if [ "$id" != "bindhosts" ] && [ -f "$module/system/etc/hosts" ] && [ ! -f "$module/disable" ]; then
			# verbose on stdout
			[ "$disable_hosts_modules_verbose" = 1 ]  && { 
				echo "[!] Conflicting module found!"
				echo "[-] Disabling $id"
			}
			# verbose on dmesg
			[ "$disable_hosts_modules_verbose" = 2 ]  && { 
				echo "bindhosts/utils: disable_hosts_modules: conflicting module named $id found! disabling." >> /dev/kmsg
			}
			touch "$module/disable"
		fi
	done
}

# EOF
