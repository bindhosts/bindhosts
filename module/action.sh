#!/usr/bin/env sh
PATH=$PATH:/data/adb/ap/bin:/data/adb/magisk:/data/adb/ksu/bin
MODDIR="/data/adb/modules/bindhosts"
PERSISTENT_DIR="/data/adb/bindhosts"
source $MODDIR/mode.sh

# grab own info (version)
versionCode=$(grep versionCode $MODDIR/module.prop | sed 's/versionCode=//g' )

# test out writables, prefer tmpfs
folder=$MODDIR
[ -w /sbin ] && folder=/sbin
[ -w /debug_ramdisk ] && folder=/debug_ramdisk


echo "[+] bindhosts v$versionCode"
echo "[%] action.sh"
echo "[%] standalone hosts-based-adblocking implementation"

[ -f $MODDIR/disable ] && {
	echo "[*] not running since module has been disabled"
	string="description=status: disabled ❌ | $(date)"
        sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
	sleep 1
	exit 0
}

# just in case user deletes them
# persistence
if [ ! -d /data/adb/bindhosts ] ; then
	mkdir -p $PERSISTENT_DIR
fi
files="custom.txt blacklist.txt sources.txt whitelist.txt"
for i in $files ; do
	if [ ! -f $PERSISTENT_DIR/$i ]; then
		# dont do anything weird, probably intentional
		echo "#" > $PERSISTENT_DIR/$i
	fi
done

adaway_warn() {
	pm path org.adaway > /dev/null 2>&1 && echo "[-] 🚨 Current operation mode may not work with AdAway 📛"
}

# impl def for changing variables
target_hostsfile="$MODDIR/system/etc/hosts"
helper_mode=""

case $operating_mode in
	0)
		# this is how it was on 163s
		if command -v ksud >/dev/null 2>&1 || command -v apd >/dev/null 2>&1 ; then
			adaway_warn
		fi
	;;
	1) 
	target_hostsfile="/system/etc/hosts"
	;;
	2) true ;;
	3) 
	target_hostsfile="/data/adb/hosts"
	helper_mode="| hosts_file_redirect 💉"
	adaway_warn
	;;
	4) 
	target_hostsfile="/data/adb/hostsredirect/hosts"
	helper_mode="| ZN-hostsredirect 💉"
	adaway_warn
	;;
	5) true ;;
	6)
	target_hostsfile="/system/etc/hosts"
	;;
	*) true ;; # catch invalid modes
esac

if [ -w $target_hostsfile ] ; then
	# probe for downloaders
     	# low pref, no ssl, b-b-b-b-but that libera/freenode(rip) meme
     	# https doesn't hide the fact that i'm using https so that's why i don't use encryption because everyone is trying to crack encryption so i just don't use encryption because no one is looking at unencrypted data because everyone wants encrypted data to crack
        busybox | grep -q wget && alias download='busybox wget -T 10 --no-check-certificate -qO -'
        # higher pref, most of the times has ssl on android
        which curl > /dev/null 2>&1 && alias download='curl --connect-timeout 10 -s'
else
	# no fucking way
	echo "[x] unwritable hosts file 😭 needs correction 💢"
	sleep 1
	exit 0
fi

##### functions
illusion () {
	x=$((RANDOM%4 + 6)); while [ $x -gt 1 ] ; do echo '[.]' ; sleep 0.1 ; x=$((x-1)) ; done &
}

adblock() {
	# sources	
	echo "[+] processing sources"
	grep -v "#" $PERSISTENT_DIR/sources.txt | grep http > /dev/null || {
			echo "[x] no sources found 😭" 
			echo "[x] sources.txt needs correction 💢"
			sleep 1
			exit 0
			}
	illusion
	for url in $(grep -v "#" $PERSISTENT_DIR/sources.txt | grep http) ; do 
		echo "[+] grabbing.."
		echo "[>] $url"
		download "$url" >> $folder/temphosts || echo "[x] failed downloading $url"
		 # add a newline incase they dont
		echo "" >> $folder/temphosts
	done
	# localhost
	printf "127.0.0.1 localhost\n::1 localhost\n" > $target_hostsfile
	# always restore user's custom rules
	grep -v "#" $PERSISTENT_DIR/custom.txt >> $target_hostsfile
	# blacklist.txt
	for i in $(grep -v "#" $PERSISTENT_DIR/blacklist.txt ); do echo "0.0.0.0 $i" >> $folder/temphosts; done
	# whitelist.txt
	echo "[+] processing whitelist"
	# how do i do this better?
	for i in $(grep -v "#" $PERSISTENT_DIR/whitelist.txt); do echo "0.0.0.0 $i" ; done > $folder/tempwhitelist
	# optimization thanks to Earnestly from #bash on libera, TIL something 
	# sed strip out everything with #, double space to single space, replace all 127.0.0.1 to 0.0.0.0
	# then sort uniq, then grep out whitelist.txt from it
	sed '/#/d; s/  / /g; /^$/d; s/127.0.0.1/0.0.0.0/' $folder/temphosts | sort -u | grep -Fxvf $folder/tempwhitelist | busybox dos2unix >> $target_hostsfile
	# mark it, will be read by service.sh to deduce
	echo "# bindhosts v$versionCode" >> $target_hostsfile
}

reset() {
	echo "[+] reset toggled!" 
	# localhost
	printf "127.0.0.1 localhost\n::1 localhost\n" > $target_hostsfile
	# always restore user's custom rules
	grep -v "#" $PERSISTENT_DIR/custom.txt >> $target_hostsfile
        string="description=status: active ✅"
        sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
        illusion
        sleep 1
        echo "[+] hosts file reset!"
        # reset state
        rm $PERSISTENT_DIR/bindhosts_state
        sleep 1
}
run() {
	adblock
	illusion
	sleep 1
	echo "[+] blocked: $(grep -c "0.0.0.0" $target_hostsfile ) | custom: $( grep -vEc "0.0.0.0| localhost|#" $target_hostsfile )"
	string="description=status: active ✅ | blocked: $(grep -c "0.0.0.0" $target_hostsfile ) 🚫 | custom: $( grep -vEc "0.0.0.0| localhost|#" $target_hostsfile ) 🤖 $helper_mode"
	sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
	# ready for reset again
	(cd $PERSISTENT_DIR ; (cat blacklist.txt custom.txt sources.txt whitelist.txt ; date +%F) | md5sum | cut -f1 -d " " > $PERSISTENT_DIR/bindhosts_state )
	# cleanup
	rm -f $folder/temphosts $folder/tempwhitelist
	sleep 1
}

# adaway is installed and hosts are modified by adaway, dont overthrow
pm path org.adaway > /dev/null 2>&1 && grep -q "generated by AdAway" /system/etc/hosts && {
	# adaway coex
	string="description=status: active ✅ | 🛑 AdAway 🕊️"
	sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
	echo "[*] 🚨 hosts modified by Adaway 🛑"
	echo "[*] assuming coexistence operation"
	echo "[*] please reset hosts in Adaway before continuing"
	sleep 1
	exit 0
}

# toggle
if [ -f $PERSISTENT_DIR/bindhosts_state ]; then
	# handle rule changes, add date change detect, I guess a change of 1 day to update is sane.
	newhash=$(cd $PERSISTENT_DIR ; (cat blacklist.txt custom.txt sources.txt whitelist.txt ; date +%F) | md5sum | cut -f1 -d " ")
	oldhash=$(cat $PERSISTENT_DIR/bindhosts_state)
	if [ $newhash == $oldhash ]; then
		# well if theres no rule change, user just wants to disable adblocking
		reset
	else
		echo "[+] rule change detected!"
		echo "[*] new: $newhash"
		echo "[*] old: $oldhash"
		run
	fi
else
	# basically if no bindhosts_state and hosts file is marked just update, its a reinstall
	grep -q "# bindhosts v" $target_hostsfile && echo "[+] update triggered!"
	# normal flow
	run
fi

# EOF
