# Frolic 
This is my in-progress hyprland settup. They include an ags bar, a spotify theme using spicetify, and a starship config using kitty. This setup is still in development, and while in a usable state, is not perfect.
## Features
- Clean UI (Still work in development)
- Custom icons based on [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)
- Control panel similar to gnome
- Sleek animations
- Various usefull tools such as screenshots, screensnips, and a color picker.
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
- `hyprlock` - Hyprland Lock screen
- `sddm` - Simple Desktop Display Manager (Login screen)
- `brightnessctl` - A CLI for controling screen brightness
- `cliphist` - Wayland clipboard manager
## Installation

To install, run the following commands.

**Important:** The following commands will overwrite any existing configs for hyprland, ags, wofi, starship, fish, and spicetify. Back up any configs you do not want to lose before installing.
```
git clone https://github.com/Falconbird18/Frolic-dotfiles.git
cp -r ~/Frolic-dotfiles/.config/* ~/.config/
cp ~/Frolic-dotfiles/.local/bin/hyprland-flee-bravely ~/.local/bin/
cp -r ~/Frolic-dotfiles/.spicetify/ ~/
cp -r ~/Frolic-dotfiles/.icons ~/
```
**Important:** The following commands have not been tested.

## Credits
Thanks to [PoSayDone](https://github.com/PoSayDone) for the base ags widget. 
