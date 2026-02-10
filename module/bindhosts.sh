#!/bin/sh
PATH=/data/adb/ap/bin:/data/adb/ksu/bin:/data/adb/magisk:/data/data/com.termux/files/usr/bin:$PATH
MODDIR="/data/adb/modules/bindhosts"
PERSISTENT_DIR="/data/adb/bindhosts"
. $MODDIR/utils.sh
. $MODDIR/mode.sh

# bindhosts.sh
# bindhosts' processing backend

# grab own info (version)
versionCode=$(grep versionCode $MODDIR/module.prop | sed 's/versionCode=//g' )

# look for writable dir
rwdir=$MODDIR
[ -w /dev ] && rwdir=/dev

if [ -z "$WEBUI_QUIET" ]; then
	echo "[+] bindhosts v$versionCode"
	echo "[%] bindhosts.sh"
	echo "[%] standalone hosts-based-adblocking implementation"
	echo "[%] mode: $operating_mode | rwdir: $rwdir "
fi

[ -f $MODDIR/disable ] && {
	echo "[*] not running since module has been disabled"
	string="description=status: disabled ❌ | $(date)"
        sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
	return
}

# just in case user deletes them
# persistence
[ ! -d /data/adb/bindhosts ] && mkdir -p $PERSISTENT_DIR
files="custom.txt blacklist.txt sources.txt whitelist.txt"
for i in $files ; do
	# if file doesnt exist, write dummy
	[ ! -f "$PERSISTENT_DIR/$i" ] && echo "#" > "$PERSISTENT_DIR/$i"
done

adaway_warn() {
	pm path org.adaway > /dev/null 2>&1 && echo "[-] 🚨 Current operation mode may not work with AdAway 📛"
}

# impl def for changing variables
target_hostsfile="$MODDIR/system/etc/hosts"
helper_mode=""

# we can just remove the other unmodified modes
# and have them fall to * but im gonna leave it 
# here for clarity
case $operating_mode in
	0) if [ -f /data/adb/ksu/modules.img ] || [ -f /data/adb/ap/modules.img ]; then adaway_warn ; fi ;;
	1) true ;;
	2) true ;;
	3) target_hostsfile="/data/adb/hosts" ; helper_mode="| hosts_file_redirect 💉" ; adaway_warn ;;
	4) target_hostsfile="/data/adb/hostsredirect/hosts" ; helper_mode="| ZN-hostsredirect 💉" ; adaway_warn ;;
	5) true ;;
	6) true ;;
	7) target_hostsfile="/system/etc/hosts" ;;
	8) target_hostsfile="/system/etc/hosts" ;;
	9) true ;;
	*) true ;; # catch invalid modes
esac

# check hosts file if writable, if not, warn and exit
if [ ! -w $target_hostsfile ] ; then
	# no fucking way
	echo "[x] unwritable hosts file 😭 needs correction 💢"
	string="description=status: unwritable hosts file 😭 needs correction 💢"
        sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
	return
fi

##### functions
illusion () {
	x=$(($$%4 + 4)); while [ $x -gt 1 ] ; do echo '[.]' ; sleep 0.1 ; x=$((x-1)) ; done &
}

run_crond() {
	[ ! -d "$PERSISTENT_DIR/crontabs" ] && {
		mkdir "$PERSISTENT_DIR/crontabs"
		echo "[+] running crond"
		busybox crond -bc "$PERSISTENT_DIR/crontabs" -L /dev/null
	}
}

_month_txt2dec() {
	txt2dec_month="$1"
	case "$( echo "$txt2dec_month" | tr "[:lower:]" "[:upper:]" )" in
		JAN) echo 1 ;;
		FEB) echo 2 ;;
		MAR) echo 3 ;;
		APR) echo 4 ;;
		MAY) echo 5 ;;
		JUN) echo 6 ;;
		JUL) echo 7 ;;
		AUG) echo 8 ;;
		SEP) echo 9 ;;
		OCT) echo 10 ;;
		NOV) echo 11 ;;
		DEC) echo 12 ;;
		*) echo "$txt2dec_month" ;; # Return unconverted if parameter is not JAN-DEC
	esac
}

_day_txt2dec() {
	txt2dec_day="$1"
	case "$( echo "$txt2dec_day" | tr "[:lower:]" "[:upper:]" )" in
		SUN) echo 0 ;;
		MON) echo 1 ;;
		TUE) echo 2 ;;
		WED) echo 3 ;;
		THU) echo 4 ;;
		FRI) echo 5 ;;
		SAT) echo 6 ;;
		*) echo "$txt2dec_day" ;; # Return unconverted if parameter is not SUN-SAT
	esac
}

_is_valid_cron_arg() { # return value: 0 = true, 1 = false
(
	x="$1"
	valid_cron_arg="$2"
	len=${#valid_cron_arg}
	complex_check=false
	[ "$len" -lt 1 ] && return 1 # End check if arg is empty
	if [ "$len" -eq 1 ]; then
		# End check if 1-char arg is not * or digit
		[ "$(echo "$valid_cron_arg" | tr -d "\*[:digit:]" | wc -w)" -gt 0 ] && return 1
		# Additional check if arg is a number
		if (echo "$valid_cron_arg" | grep -q "[[:digit:]]"); then
			case "$x" in
				3) [ "$valid_cron_arg" -lt 1 ] && return 1 ;;
				4) [ "$valid_cron_arg" -lt 1 ] && return 1 ;;
				5) [ "$valid_cron_arg" -lt 0 ] || [ "$valid_cron_arg" -gt 7 ] && return 1 ;;
			esac
		fi
	elif [ "$len" -eq 2 ]; then
		# End check if 2-char arg is not a number
		[ "$(echo "$valid_cron_arg" | tr -d "[:digit:]" | wc -w)" -gt 0 ] && return 1
		case "$x" in
			1) [ "$valid_cron_arg" -lt 0 ] || [ "$valid_cron_arg" -gt 59 ] && return 1 ;;
			2) [ "$valid_cron_arg" -lt 0 ] || [ "$valid_cron_arg" -gt 23 ] && return 1 ;;
			3) [ "$valid_cron_arg" -lt 1 ] || [ "$valid_cron_arg" -gt 31 ] && return 1 ;;
			4) [ "$valid_cron_arg" -lt 1 ] || [ "$valid_cron_arg" -gt 12 ] && return 1 ;;
			*) return 1 ;;
		esac
	elif [ "$len" -gt 2 ]; then
		# Because the arg might be "1-6", "0,15,25" or even "1-7,7-21/3"
		# We'll need extra check for these long arg (>= 3 char) if the arg is:
		# - of the MONTH field but is not in JAN-DEC list
		# - of the DAY_OF_WEEK field but is not in SUN-SAT list
		# - of the MIN, HOUR or DAY_OF_MONTH fields
		case "$x" in
			4) (! echo "$valid_cron_arg" | grep -Eiqw "^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$") && complex_check=true ;;
			5) (! echo "$valid_cron_arg" | grep -Eiqw "^(SUN|MON|TUE|WED|THU|FRI|SAT)$") && complex_check=true ;;
			*) complex_check=true ;;
		esac
	fi

	if [ "$complex_check" = true ]; then
		# End check if long arg (>= 3 char) is a number
		[ "$(echo "$valid_cron_arg" | tr -d "[:digit:]" | wc -w)" -eq 0 ] && return 1

		delimiter=""
		# To split complex arg in the order from , > / > -
		if (echo "$valid_cron_arg" | grep -q "\," > /dev/null 2>&1 ); then
			delimiter=","
		elif (echo "$valid_cron_arg" | grep -q "\/" > /dev/null 2>&1 ); then
			delimiter="/"
		elif (echo "$valid_cron_arg" | grep -q "\-" > /dev/null 2>&1 ); then
			delimiter="-"
		else
			# End check if arg does not contain , / or -
			return 1
		fi

		substring=""
		prev_substring=0
		while [ "$valid_cron_arg" != "$substring" ] ;do
			# Extract the substring from start of arg up to delimiter
			# Example: substring="JAN" from "JAN,MAR,JUN,SEP,DEC"
			substring=${valid_cron_arg%%"$delimiter"*}
			# Delete this first "substring" AND its delimiter, from arg
			# Example: arg="MAR,JUN,SEP,DEC" from "JAN,MAR,JUN,SEP,DEC"
			valid_cron_arg="${valid_cron_arg#"$substring""$delimiter"}"

			is_arg_valid=false
			# Diving in from full arg (e.g. "0-59/5") into
			# individual value (e.g. "0", "59" "/2") for validation
			_is_valid_cron_arg "$x" "$substring" && is_arg_valid=true

			if [ "$delimiter" = "/" ] || [ "$delimiter" = "-" ]; then
				[ "${#valid_cron_arg}" -lt 1 ] && return 1 # End check if no arg is behind / or -

				# Test if arg behind / or - is JAN-DEC / SUN-SAT
				# arg will be converted to its respective number
				converted_arg="$valid_cron_arg"
				[ "$x" -eq 4 ] && converted_arg=$(_month_txt2dec "$valid_cron_arg")
				[ "$x" -eq 5 ] && converted_arg=$(_day_txt2dec "$valid_cron_arg")
				# End check if the arg behind / or - is not a number or not in the JAN-DEC, SUN-SAT lists
				[ "$(echo "$converted_arg" | tr -d "[:digit:]" | wc -w)" -gt 0 ] && return 1

				if [ "$delimiter" = "/" ]; then
					# Arg behind / must be a number larger than 0 or
					# if arg is of the MONTH or DAY_OF_WEEK fields, must be in JAN-DEC, SUN-SAT lists
					is_arg_valid=true
					# End check if arg behind / is less than 1
					[ "$converted_arg" -lt 1 ] && return 1
				elif [ "$delimiter" = "-" ]; then
					converted_substring="$substring"
					[ "$x" -eq 4 ] && converted_substring=$(_month_txt2dec "$substring")
					[ "$x" -eq 5 ] && converted_substring=$(_day_txt2dec "$substring")
					# End check if arg in front of - is greater than the arg behind -
					[ "$prev_substring" -gt "$converted_substring" ] && return 1
					prev_substring="$converted_substring"
				fi
			fi

			if [ "$is_arg_valid" = true ]; then
				echo "[>] field #$x value [ $substring ] passed"
			else
				echo "[!] field #$x value [ $substring ] failed"
				return 1
			fi
		done
	fi
	return 0
)
}

custom_cron() {
	shift
	echo "[+] validating custom cron expression"
	custom_cron_error=false
	# Has only 1 arg and it starts with @
	if [ "$(echo "$1" | wc -w)" -eq 1 ] && (echo "$1" | grep -q "^@"); then
		# End check if arg is not these accepted @strings (case-sensitive)
		(! echo "$1" | grep -Eqw "^(@reboot|@hourly|@midnight|@daily|@weekly|@monthly|@annually|@yearly)$") && custom_cron_error=true
	# Has 5 args
	elif [ "$(echo "$1" | wc -w)" -eq 5 ]; then
		x=1
		while [ $x -lt 6 ] ; do
			custom_cron_arg=$(echo "$1" | cut -d ' ' -f "$x")
			echo "[>] checking field #$x: [ $custom_cron_arg ]"
			is_arg_valid=false
			_is_valid_cron_arg "$x" "$custom_cron_arg" && is_arg_valid=true
			if [ "$is_arg_valid" = true ]; then
				echo "[+] field #$x passed"
			else
				echo "[!] field #$x failed"
				break
			fi
			x=$((x+1))
		done
		[ "$x" -lt 6 ] && custom_cron_error=true
	else
		custom_cron_error=true
	fi
	# this atleast will catch globbed
	if [ -z "$1" ] || [ ! -z "$2" ] || [ "$custom_cron_error" = true ]; then
		# shoutout to native test and holmes
		echo "[!] futile cronjob" 
		echo "[!] syntax: --custom-cron \"0 2 * * *\" " 
		echo "[!] syntax: --custom-cron \"@hourly\" " 
		exit 1
	fi
	# run crond
	run_crond
	# add entry
	echo "$1 sh $MODDIR/bindhosts.sh --force-update > $PERSISTENT_DIR/bindhosts_cron.log 2>&1 &" | busybox crontab -c $PERSISTENT_DIR/crontabs -
	echo "[>] $(head -n1 $PERSISTENT_DIR/crontabs/root) " 
	echo "[!] make sure entry is correct!"
	echo "[+] crontab entry added!"
}

enable_cron() {
	# run crond
	run_crond
	# add entry
	echo "0 10 * * * sh $MODDIR/bindhosts.sh --force-update > $PERSISTENT_DIR/bindhosts_cron.log 2>&1 &" | busybox crontab -c $PERSISTENT_DIR/crontabs -
	echo "[>] $(head -n1 $PERSISTENT_DIR/crontabs/root) " 
	echo "[+] crontab entry added!"
}

disable_cron() {
	# kill busybox crond that we enabled
	for i in $(busybox pidof busybox); do 
		# super leet gamma knife
		grep -q "bindhosts" "/proc/$i/cmdline" > /dev/null 2>&1 && {
		echo "[x] killing pid $i"
		busybox kill -9 "$i"
		}
	done
	# clean entry
	if grep -q "bindhosts.sh" $PERSISTENT_DIR/crontabs/root > /dev/null 2>&1; then
		rm -rf $PERSISTENT_DIR/crontabs
		echo "[x] crontab entry removed!"
	else
		echo "[x] no crontab entry found!"
	fi
}

toggle_updatejson() {
	if grep -q "^updateJson" $MODDIR/module.prop ; then
		sed -i 's/updateJson/xpdateJson/g' $MODDIR/module.prop 
		echo "[x] module updates disabled!" 
	else
		sed -i 's/xpdateJson/updateJson/g' $MODDIR/module.prop 
		echo "[+] module updates enabled!" 
	fi
}

# probe for downloaders
# wget = low pref, no ssl.
# curl, has ssl on android, we use it if found
# here we chant the https meme.
# https doesn't hide the fact that i'm using https so that's why i don't use encryption 
# because everyone is trying to crack encryption so i just don't use encryption because 
# no one is looking at unencrypted data because everyone wants encrypted data to crack
if command -v curl > /dev/null 2>&1; then
	if curl --help all | grep -q "parallel" >/dev/null 2>&1; then
		download() { curl --connect-timeout 10 -Z -Ls "$1"; }
        else
		download() { curl --connect-timeout 10 -Ls "$1"; }
        fi
else
	download() { busybox wget -T 10 --no-check-certificate -qO - "$1"; }
fi

adblock() {
	illusion
	# source processing start!
	echo "[+] processing sources"
	sources=$(sed '/#/d' $PERSISTENT_DIR/sources.txt | grep http)
	if [ -z "$sources" ]; then
		echo "[x] no sources found 😭"
		echo "[x] sources.txt needs correction 💢"
		return
	fi

	# download routine start!
	successful_downloads=0
	total_downloads=0
	for url in $sources ; do
		total_downloads=$((total_downloads + 1))
		echo "[>] fetching $url"
		if download "$url" >> "$rwdir/temphosts"; then
			successful_downloads=$((successful_downloads + 1))
			echo "" >> "$rwdir/temphosts"
		else
			echo "[x] failed downloading $url"
		fi
	done

	# if all downloads failed we are probably offline, abort the update.
	if [ "$successful_downloads" -eq 0 ] && [ "$total_downloads" -gt 0 ]; then
		echo "[!] all downloads failed, aborting update."
		echo "[!] keeping existing hosts file."
		rm -f "$rwdir/temphosts"
		return
	fi

	# if temphosts is empty (can happen if sources were valid but returned no content)
	[ ! -s "$rwdir/temphosts" ] && {
		echo "[!] downloaded hosts content is empty"
		echo "[!] using old hosts file!"
		# strip first two lines since thats just localhost
		tail -n +3 $target_hostsfile > "$rwdir/temphosts"
		}
	# localhost
	printf "127.0.0.1 localhost\n::1 localhost\n" > $target_hostsfile
	# always restore user's custom rules
	sed '/#/d; s/^disabled|//g' $PERSISTENT_DIR/custom*.txt >> $target_hostsfile
	# blacklist.txt
	for i in $(sed '/#/d' $PERSISTENT_DIR/blacklist.txt ); do echo "0.0.0.0 $i" >> "$rwdir/temphosts"; done
	# whitelist.txt
	echo "[+] processing whitelist"
	# make sure tempwhitelist isnt empty
	# or it will grep out nothingness from everything
	# which actually greps out everything.
	echo "256.256.256.256 bindhosts" > "$rwdir/tempwhitelist"
	for url in $(sed '/#/d' $PERSISTENT_DIR/sources_whitelist.txt | grep http) ; do
		echo "[>] fetching $url"
		download "$url" >> "$rwdir/remote_whitelist" || echo "[x] failed downloading $url"
	done
	# if there is a remote whitelist, we clean it up
	if [ -f "$rwdir/remote_whitelist" ]; then
		sed -i '/#/d; /!/d; s/  */ /g; /^$/d; s/\r$//' "$rwdir/remote_whitelist"
		for i in $(sort -u "$rwdir/remote_whitelist" ); do echo "$i" ; done >> "$rwdir/tempwhitelist"
	fi
	for i in $(sed '/#/d' $PERSISTENT_DIR/whitelist.txt); do echo "$i" ; done >> "$rwdir/tempwhitelist"
	# sed strip out everything with # and !, double space to single space, delete empty lines, dos2unix (CRLF), replace all 127.0.0.1 to 0.0.0.0
	# then sort uniq, then grep out whitelist.txt from it
	sed -i '/^#/d; /!/d; s/  */ /g; /^$/d; s/\r$//; s/127.0.0.1/0.0.0.0/g' "$rwdir/temphosts"
	# no need to -x on grep, allow wildmatches! bindhosts/issue #112
	sort -u "$rwdir/temphosts" | grep -Fvf "$rwdir/tempwhitelist" >> $target_hostsfile
	# mark it, will be read by service.sh to deduce
	echo "# bindhosts v$versionCode" >> $target_hostsfile
}

reset() {
	echo "[+] reset toggled!" 
	# localhost
	printf "127.0.0.1 localhost\n::1 localhost\n" > $target_hostsfile
	# always restore user's custom rules
	sed '/#/d; s/^disabled|//g' $PERSISTENT_DIR/custom*.txt >> $target_hostsfile
        string="description=status: reset 🤐 | $(date)"
        sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
        echo "[+] hosts file reset!"
        # reset state
        rm $PERSISTENT_DIR/bindhosts_state > /dev/null 2>&1
}

run() {
	adblock
	# store these as variables
	# this way we dont do the grepping twice
	custom=$( grep -vEc "0.0.0.0| localhost|#" $target_hostsfile)
	blocked=$(grep -c "0.0.0.0" $target_hostsfile )
	# now use them
	echo "[+] blocked: $blocked | custom: $custom "
	string="description=status: active ✅ | blocked: $blocked 🚫 | custom: $custom 🤖 $helper_mode"
	sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
	# ready for reset again
	(cat $PERSISTENT_DIR/*.txt; date +%F) | busybox crc32 > $PERSISTENT_DIR/bindhosts_state
	# cleanup
	rm -f "$rwdir/remote_whitelist" "$rwdir/temphosts" "$rwdir/tempwhitelist" "$PERSISTENT_DIR/bindhosts_backup" > /dev/null 2>&1
}

# adaway is installed and hosts are modified by adaway, dont overthrow
pm path org.adaway > /dev/null 2>&1 && grep -q "generated by AdAway" /system/etc/hosts && {
	# adaway coex
	string="description=status: active ✅ | 🛑 AdAway 🕊️"
	sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
	echo "[*] 🚨 hosts modified by Adaway 🛑"
	echo "[*] assuming coexistence operation"
	echo "[*] please reset hosts in Adaway before continuing"
	case "$1" in
		--query|--toggle-updatejson|--setup-link) true ;;
		*) return ;;
	esac
}

quick_reset_restore () {
	if [ -f $PERSISTENT_DIR/bindhosts_backup ]; then
		# force an update if bindhosts_backup == target_hostsfile
		# this can happen when hosts file got updated to blank
		# and user will just be reset/restoring hosts with a blank file
		if [ "$(busybox head -n -1 $PERSISTENT_DIR/bindhosts_backup | busybox crc32 )" = "$(cat $target_hostsfile | busybox crc32 )" ]; then
			run
			rm -rf $rwdir/bindhosts_lockfile $PERSISTENT_DIR/bindhosts_backup > /dev/null 2>&1
			exit 0
		fi
		echo "[+] restoring backed up hosts file!"
		cat $PERSISTENT_DIR/bindhosts_backup > $target_hostsfile
		rm $PERSISTENT_DIR/bindhosts_backup
		# store these as variables
		# this way we dont do the grepping twice
		custom=$( grep -vEc "0.0.0.0| localhost|#" $target_hostsfile)
		blocked=$(grep -c "0.0.0.0" $target_hostsfile )
		# now use them
		echo "[+] blocked: $blocked | custom: $custom "
		string="description=status: active ✅ | blocked: $blocked 🚫 | custom: $custom 🤖 $helper_mode"
	else
		echo "[+] backing up hosts file!"
		cat $target_hostsfile > $PERSISTENT_DIR/bindhosts_backup
		echo "[+] quick reset toggled!" 
		# localhost
		printf "127.0.0.1 localhost\n::1 localhost\n" > $target_hostsfile
		# always restore user's custom rules
		sed '/#/d; s/^disabled|//g' $PERSISTENT_DIR/custom*.txt >> $target_hostsfile
		string="description=status: reset 🤐 | $(date)"
		echo "[+] hosts file reset!"
	fi
	sed -i "s/^description=.*/$string/g" $MODDIR/module.prop
}

action () {
	# single instance lock
	# as the script sometimes takes some time processing
	# we implement a simple lockfile logic around here to
	# prevent multiple instances.
	# if the file is there and pid is still up then thats shady
	if [ -f "$rwdir/bindhosts_lockfile" ]; then
		bindhosts_old_pid=$(cat $rwdir/bindhosts_lockfile)
		# now check and fucking kill old instance
		if [ -d "/proc/$bindhosts_old_pid" ] && grep -q "bindhosts" "/proc/$bindhosts_old_pid/cmdline" >/dev/null 2>&1; then
			echo "[*] bindhosts with pid: $bindhosts_old_pid is still running!"
			busybox kill -9 $bindhosts_old_pid
			echo "[*] killing $bindhosts_old_pid"
			rm "$rwdir/bindhosts_lockfile" >/dev/null 2>&1
			exit 1
		fi
	fi
	# now make sure its not there and write our own pid to it
	rm "$rwdir/bindhosts_lockfile" >/dev/null 2>&1 ; echo $$ > "$rwdir/bindhosts_lockfile"

	# toggle start!
	if [ -f $PERSISTENT_DIR/bindhosts_state ]; then
		# handle rule changes, add date change detect, I guess a change of 1 day to update is sane.
		newhash=$( (cat $PERSISTENT_DIR/*.txt; date +%F) | busybox crc32 )
		oldhash=$(cat $PERSISTENT_DIR/bindhosts_state)
		if [ "$newhash" = "$oldhash" ]; then
			if grep -q "generated by AdAway" /system/etc/hosts; then
				# avoid quick reset when switching from AdAway
				run
			else
				# well if theres no rule change
				# we can have user toggle onto reset/restore
				quick_reset_restore
			fi
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

	# cleanup lockfile
	[ -f "$rwdir/bindhosts_lockfile" ] && rm "$rwdir/bindhosts_lockfile" > /dev/null 2>&1
}

tcpdump () {
	if command -v tcpdump > /dev/null 2>&1; then
		# reset hosts
		[ ! -f $PERSISTENT_DIR/bindhosts_backup ] && quick_reset_restore || reset
		echo "[+] restore hosts as needed"
		echo "[+] make sure private dns is disabled!"
		echo "[+] spawning tcpdump"
		echo "[!] press ctrl+c to exit"
		sh -c "tcpdump -ltni any dst port 53"
	else
		echo "[!] tcpdump not found"
		echo "[x] bailing out"
		exit 1
	fi
}

stop_tcpdump() {
	for i in $(busybox pidof tcpdump); do
		kill $i
	done
	[ -f $PERSISTENT_DIR/bindhosts_backup ] && quick_reset_restore
}

hosts_lastmod () {
	echo "[+] Last update at: $(date -r $target_hostsfile)"
}

hosts_query () {
	shift
	if [ -z "$1" ]; then 
		echo "[!] empty query"
		echo "[!] example usage: bindhosts --query doubleclick.net"
		return
	fi
	printf "Hosts \tDomain\n"
	grep "$1" "$target_hostsfile" || echo "[!] no match found"
}

instant_whitelist() {
    # Backend for WebUI: whitelist domain instantly without re-run action
    shift
    [ -n "$1" ] || return
    cp $target_hostsfile $rwdir/temphosts
    sed "/0.0.0.0 $1/d" $rwdir/temphosts > $target_hostsfile
    grep -qx "$1" "$PERSISTENT_DIR/whitelist.txt" || echo "$1" >> "$PERSISTENT_DIR/whitelist.txt"
    rm $rwdir/temphosts
}

setup_link() {
    # Backend for WebUI: locate target hosts file for querying and file fetching
	rm -rf $MODDIR/webroot/link
    mkdir $MODDIR/webroot/link
    ln -sf "$target_hostsfile" "$MODDIR/webroot/link/hosts.txt"
    ln -s "$MODDIR" "$MODDIR/webroot/link/MODDIR"
    ln -s "$PERSISTENT_DIR" "$MODDIR/webroot/link/PERSISTENT_DIR"
}

manager_install_zip() {
	# sanity check	
	if [ -z "$1" ] || [ ! -f "$1" ] || [ ! -f "$PERSISTENT_DIR/root_manager.sh" ]; then 
		echo "[!] no manager logged, nothing specified or file not found"
		return
	fi
	# webui flag
	[ -n "$KSU_WEBUI" ] && touch "$PERSISTENT_DIR/bindhosts_webui"
	# read which manager
	. "$PERSISTENT_DIR/root_manager.sh"
	case $manager in
		APatch) 
			echo "[+] installing via apd" 
			apd module install "$1" 
			;;
		KernelSU) 
			echo "[+] installing via ksud" 
			ksud module install "$1" 
			;;
		Magisk) 
			echo "[+] installing via magisk" 
			magisk --install-module "$1" 
			;;
		*) # catch invalid
			echo "[!] root manager unknown??"
			exit 1
			;;
	esac
	# cleanup
	rm -f "$PERSISTENT_DIR/bindhosts_webui"
}

update_locales() {
    link1="https://raw.githubusercontent.com/bindhosts/bindhosts/bot/locales.zip"
	link2="https://raw.gitmirror.com/bindhosts/bindhosts/raw/bot/locales.zip"
    error=0
	echo "[+] downloading: $link1"
    download "$link1" > "$rwdir/locales.zip" || download "$link2" > "$rwdir/locales.zip"
    [ -s "$rwdir/locales.zip" ] || error=1
    unzip -o "$rwdir/locales.zip" -d "$MODDIR/webroot/locales" || error=1
    rm -f "$rwdir/locales.zip"
    [ "$error" -eq 0 ] || exit 1
}

install_latest_artifact() {
	# likely won't happen but lets be defensive
	if [ ! -f "$PERSISTENT_DIR/root_manager.sh" ]; then
		echo "[!] root manager not detected"
		exit 1
	fi

	# via nightly.link
	latest_zip_url=$(download "https://nightly.link/bindhosts/bindhosts/workflows/release/master?preview" | sed 's/>/\n/g; s/</\n/g' | busybox grep -E "^https.*\.zip$" | head -n1)
	latest_zip_local="$rwdir/bindhosts_latest.zip"

	# download
	if echo "$latest_zip_url" | grep -q "^https"; then
		echo "[+] downloading: $latest_zip_url "
		download "$latest_zip_url" > "$latest_zip_local"
		# check if empty
		if [ ! -s "$latest_zip_local" ]; then
			echo "[!] artifact download failed or file is empty"
			rm "$latest_zip_local"
			exit 1
		fi
	else
		echo "[!] failure grabbing latest artifact" 
		exit 1
	fi

	# install
	if [ -f "$latest_zip_local" ] ; then
		echo "[+] zip: $latest_zip_local" 
		manager_install_zip "$latest_zip_local"
		update_locales || true
	else
		echo "[x] artifact download fail"
		exit 1
	fi
	[ -f "$latest_zip_local" ] && rm "$latest_zip_local"
}

show_help () {
	echo "[%] $( grep '^description=' $MODDIR/module.prop | sed 's/description=//' )"
	echo "usage:"
	printf " --action \t\tsimulate action.sh\n"
	printf " --tcpdump \t\tsniff dns requests via tcpdump\n"
	printf " --query <URL> \t\tcheck hosts file for pattern\n"
	printf " --force-update \tforce an update\n" 
	printf " --force-reset \t\tforce a reset\n"
	printf " --custom-cron \t\tcustom update schedule\n"
	printf "\t\t\tif you do NOT know this, use --enable-cron\n"
	printf " --enable-cron \t\tenables scheduled updates (10AM daily)\n"
	printf " --disable-cron \tdisables scheduled updates\n"
	printf " --help \t\tdisplays this message\n"
}

# add arguments
case "$1" in 
	--action) action; exit ;;
	--tcpdump) tcpdump; exit ;;
	--stop-tcpdump) stop_tcpdump; exit ;;
	--query) hosts_query "$@"; exit ;;
	--force-update) run; exit ;;
	--force-reset) reset; exit ;;
	--custom-cron) custom_cron "$@"; exit ;;
	--enable-cron) enable_cron; exit ;;
	--disable-cron) disable_cron; exit ;;
	--toggle-updatejson) toggle_updatejson; exit ;;
	--hosts-lastmod) hosts_lastmod; exit ;;
	--whitelist) instant_whitelist "$@"; exit ;;
	--install-canary) install_latest_artifact; exit;;
	--update-locales) update_locales; exit;;
	--setup-link) setup_link; exit;;
	--help|*) show_help; exit ;;
esac

# EOF
