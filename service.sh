#!/usr/bin/env sh
MODDIR="/data/adb/modules/bindhosts"

#susfs >=110 support
SUSFS_BIN=/data/adb/ksu/bin/ksu_susfs

until [ "$(getprop sys.boot_completed)" == "1" ]; do
    sleep 1
done


ls $MODDIR/system/etc/hosts > /dev/null || cat /system/etc/hosts > $MODDIR/system/etc/hosts
chcon -r u:object_r:system_file:s0 "$MODDIR/system/etc/hosts"
chmod 644 $MODDIR/system/etc/hosts

# mount --bind only on ksu/apatch, magisk will auto leverage magisk mount
if [ ${KSU} = true ] || [ ${APATCH} = true ] ; then
	# no need to check, let it fail
	# if susfs exists, leverage it
	${SUSFS_BIN} add_sus_kstat '/system/etc/hosts'
	mount -o bind "$MODDIR/system/etc/hosts" /system/etc/hosts
	${SUSFS_BIN} update_sus_kstat '/system/etc/hosts'
	${SUSFS_BIN} add_try_umount /system/etc/hosts 1
	# legacy susfs
	${SUSFS_BIN} add_try_umount /system/etc/hosts > /dev/null 2>&1
fi


sleep 1



if [ -w /system/etc/hosts ] ; then
	echo "bindhosts: service.sh - active ✅" >> /dev/kmsg
	# default string
	string="description=status: active ✅"
	# readout if action.sh did something
	string="description=status: active ✅ | blocked: $(grep -c "0.0.0.0" /system/etc/hosts ) 🚫 | custom: $( grep -vEc "0.0.0.0| localhost|#" /system/etc/hosts ) 🤖 "
	# read out if Adaway did something 
	grep -q "generated by AdAway" /system/etc/hosts && string="description=status: active ✅ | 🛑 AdAway 🕊️"
	# write it
	sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
else
	sed -i 's/^description=.*/description=status: failed 😭 needs correction 💢/g' $MODDIR/module.prop
fi

# EOF
