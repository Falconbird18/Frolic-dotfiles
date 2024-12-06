# Frolic 
This is my in-progress hyprland settup. They include an ags bar, a spotify theme using spicetify, and a starship config using kitty.
## Dependencies
Before you install, check that you have the following dependencies installed (and probably more that I forgot about):
- `hyprland` - Wayland compositor
- `ags` - Widgets (top bar, etc.)
- `wofi` - App launcher
- `starship` - Terminal config
- `fish` - Shell
- `spicetify` - Spotify customization
## Installation

To install, run the following commands.

**Important:** The following commands will overwrite any existing configs for hyprland, ags, wofi, starship, fish, and spicetify. Back up any configs you do not want to lose before installing.
```
git clone https://github.com/Falconbird18/Dotfiles.git
cp -r ~/Dotfiles/.config/* ~/.config/
cp ~/Dotfiles/.local/bin/hyprland-flee-bravely ~/.local/bin/
cp -r ~/Dotfiles/.spicetify/ ~/
```
**Important:** This settup is still experimental, and the commands above have not been tested.

## Credits
Thanks to [PoSayDone](https://github.com/PoSayDone) for the base ags widget. 
