# Tempora Desktop
This is my in-progress hyprland settup. This includes an ags bar, a spotify theme using spicetify, and a starship config. This setup is still in development, and while in a usable state, is not perfect. Expect bugs!
- The name comes from the latin word "tempora", meaning "seasons" or "times."
## Features
- Custom icon theme based on [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)
- Unique control panel
- AI assistant using either locally run models or google gemini
- 4 beautiful themes with light and dark mode
- (Mostly) Complete spotify theme
- Wallpaper switching
- Various useful tools such as screenshots, screensnips, and a color picker.

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
- `webkit` - Specifically `webkit2gtk-4.1` for arch
## Installation

To install, run the install script, or the following commands.
```
bash <(curl -s "https://raw.githubusercontent.com/Falconbird18/Frolic-dotfiles/main/install.sh")
```

**Important:** The following commands will overwrite any existing configs for hyprland, ags, wofi, starship, fish, and spicetify. Back up any configs you do not want to lose before installing.
```
git clone https://github.com/Falconbird18/Frolic-dotfiles.git
cp -r ~/Frolic-dotfiles/.config/* ~/.config/
cp ~/Frolic-dotfiles/.local/bin/hyprland-flee-bravely ~/.local/bin/
cp -r ~/Frolic-dotfiles/.spicetify/ ~/
cp -r ~/Frolic-dotfiles/.icons ~/
```

## Credits
Thanks to [PoSayDone](https://github.com/PoSayDone) for the base ags widget. 
