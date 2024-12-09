# Frolic 
This is my in-progress hyprland settup. They include an ags bar, a spotify theme using spicetify, and a starship config using kitty.
## Features
- Clean UI (Still work in development)
- Control panel similar to gnome
- Sleek animations
- Various usefull tools such as screenshots, screensips, and a color picker.
- Hyprland Flee-Bravely (Yet to be released)

This is the state as of December 9th, 2024
  ![Current setup](https://github.com/user-attachments/assets/a0af4e89-e018-42b2-90ee-df8c8e606b5d)

  
## Dependencies
Before you install, check that you have the following dependencies installed (and probably more that I forgot about):
- `hyprland` - Wayland compositor
- `ags` - Widgets (top bar, etc.)
- `wofi` - App launcher
- `starship` - Terminal config
- `fish` - Shell
- `spicetify` - Spotify customization
- `monaspace` - Github Monaspace fonts
- 'hyprlock' - Hyprland Lock screen
- 'sddm' - Simple Desktop Display Manager (Login screen)
## Installation

To install, run the following commands.

**Important:** The following commands will overwrite any existing configs for hyprland, ags, wofi, starship, fish, and spicetify. Back up any configs you do not want to lose before installing.
```
git clone https://github.com/Falconbird18/Dotfiles.git
cp -r ~/Dotfiles/.config/* ~/.config/
cp ~/Dotfiles/.local/bin/hyprland-flee-bravely ~/.local/bin/
cp -r ~/Dotfiles/.spicetify/ ~/
cp -r ~/Dotfiles/.icons ~/
```
**Important:** This settup is still experimental, and the commands above have not been tested.

## Credits
Thanks to [PoSayDone](https://github.com/PoSayDone) for the base ags widget. 
