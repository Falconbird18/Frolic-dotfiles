#!/usr/bin/env bash

XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
CONFIG_DIR="$XDG_CONFIG_HOME/ags"

# Set the wallpaper directory here
WALLPAPER_DIR="/home/austin/Pictures/wallpapers"

if ! pgrep -x "swww-daemon" > /dev/null; then
    swww-daemon
fi

switch() {
	imgpath=$1
	read scale screenx screeny screensizey < <(hyprctl monitors -j | jq '.[] | select(.focused) | .scale, .x, .y, .height' | xargs)
	cursorposx=$(hyprctl cursorpos -j | jq '.x' 2>/dev/null) || cursorposx=960
	cursorposx=$(bc <<< "scale=0; ($cursorposx - $screenx) * $scale / 1")
	cursorposy=$(hyprctl cursorpos -j | jq '.y' 2>/dev/null) || cursorposy=540
	cursorposy=$(bc <<< "scale=0; ($cursorposy - $screeny) * $scale / 1")
	cursorposy_inverted=$((screensizey - cursorposy))

	if [ "$imgpath" == '' ]; then
		echo 'Aborted'
		exit 0
	fi

	# ags run-js "wallpaper.set('')"
	# sleep 0.1 && ags run-js "wallpaper.set('${imgpath}')" &
	swww img "$imgpath" --transition-step 100 --transition-fps 120 \
		--transition-type grow --transition-angle 30 --transition-duration 1 \
		--transition-pos "$cursorposx, $cursorposy_inverted"

	# Generate colors after setting wallpaper
	# "$CONFIG_DIR"/scripts/color_generation/colorgen.sh "$imgpath" --apply --smart

	# reload application
	# gsettings set org.gnome.desktop.interface gtk-theme adwaita-dark
	# gsettings set org.gnome.desktop.interface gtk-theme default
}

while true; do
    # Choose random image from the set directory
    imgpath=$(find "$WALLPAPER_DIR" -type f -name "*.jpg" -o -name "*.png" | shuf -n 1)

    switch "$imgpath"

    # Wait 15 minutes
    sleep 300
done
