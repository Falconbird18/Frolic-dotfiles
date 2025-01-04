#!/bin/bash

echo "This script will guide you through the installation of Frolic Dotfiles."

# Define the AGS config directory and backup directory
CONFIG_PATHS=(
    "$HOME/.config/ags"
    "$HOME/.config/hypr"
    "$HOME/.config/wofi"
    "$HOME/.config/fish"
    "$HOME/.config/starship.toml"
    "$HOME/.config/spicetify"
)

# Define the backup directory
BACKUP_DIR="$HOME/.config/config-bkup"

# Create the backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to back up a directory or file
backup_config() {
    local path="$1"
    local backup_path="$BACKUP_DIR/$(basename "$path")"

    if [ -e "$path" ]; then
        echo "Backing up $path to $backup_path..."
        mv "$path" "$backup_path"
        echo "Backup completed for $path."
    else
        echo "$path not found. Nothing to back up."
    fi
}

# Check if any of the config paths exist
config_exists=false
for path in "${CONFIG_PATHS[@]}"; do
    if [ -e "$path" ]; then
        config_exists=true
        break
    fi
done

# If config paths exist, ask the user if they want to back up their configs
if [ "$config_exists" = true ]; then
    read -p "Do you want to back up your config directories and files? (y/n): " backup_choice

    # Process the user's choice
    if [[ "$backup_choice" =~ ^[Yy]$ ]]; then
        # Backup each config path
        for path in "${CONFIG_PATHS[@]}"; do
            backup_config "$path"
        done
    elif [[ "$backup_choice" =~ ^[Nn]$ ]]; then
        # Delete each config path
        for path in "${CONFIG_PATHS[@]}"; do
            if [ -e "$path" ]; then
                echo "Deleting $path..."
                rm -rf "$path"
                echo "$path deleted."
            else
                echo "$path not found. Nothing to delete."
            fi
        done
    else
        # Handle invalid input
        echo "Invalid choice. Continuing with installation..."
    fi
else
    echo "No config directories or files found. Continuing with installation..."
fi

echo "Backup process completed."

# Pacman update
echo "Updating pacman..."
sudo pacman -Syu
echo "Pacman updated."

# Install packages
echo "Installing packages..."
sudo pacman -S --needed hyprland wofi fish starship hyprpicker hyprlock wl-clipboard brightnessctl bluez-utils cliphist sddm git
yay -S --needed aylurs-gtk-shell
echo "Packages installed."

# Install github fonts
echo "Installing github fonts..."
git clone https://github.com/githubnext/monaspace.git
cd monaspace/fonts
cp -r * ~/.local/share/fonts
cd $HOME
echo "Github fonts installed."

# Clone the dotfiles repository
echo "Cloning the dotfiles repository..."
git clone https://github.com/Falconbird18/Frolic-dotfiles.git
echo "Dotfiles repository cloned."

# Copy the config files
echo "Installing config files..."
cp -r $HOME/Frolic-dotfiles/.config/* $HOME/.config
cp $HOME/Frolic-dotfiles/.local/bin/hyprland-flee-bravely $HOME/.local/bin/
cp -r $HOME/Frolic-dotfiles/.spicetify/ $HOME/
cp -r $HOME/Frolic-dotfiles/.icons $HOME/
echo "Config files installed."

# Ask the user if they want to install Spicetify
read -p "Do you want to install Spicetify? (y/n): " spicetify_choice

if [[ "$spicetify_choice" =~ ^[Yy]$ ]]; then
    echo "Proceeding with Spicetify installation..."
    yay -S spicetify-cli
    sudo chmod a+wr /opt/spotify
    sudo chmod a+wr /opt/spotify/Apps -R
    spicetify apply
    echo "Spicetify installed."
else
    echo "Skipping Spicetify installation."
fi

echo "Installation complete. Please restart your system to apply the changes, and