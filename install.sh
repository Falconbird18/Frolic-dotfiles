#!/bin/bash

echo "This script will guide you through the installation of Frolic Dotfiles."


# Define the AGS config directory and backup directory
AGS_CONFIG_DIR="$HOME/.config/ags"
AGS_BACKUP_DIR="$HOME/.config/ags-bkup"

# Ask the user if they want to back up the AGS config directory
read -p "Do you want to back up your AGS config directory? (y/n): " backup_choice

# Process the user's choice
if [[ "$backup_choice" =~ ^[Yy]$ ]]; then
    # Backup the AGS config directory
    if [ -d "$AGS_CONFIG_DIR" ]; then
        echo "Backing up AGS config directory to $AGS_BACKUP_DIR..."
        mv "$AGS_CONFIG_DIR" "$AGS_BACKUP_DIR"
        echo "Backup completed."
    else
        echo "AGS config directory not found. Nothing to back up."
    fi
elif [[ "$backup_choice" =~ ^[Nn]$ ]]; then
    # Delete the AGS config directory
    if [ -d "$AGS_CONFIG_DIR" ]; then
        echo "Deleting AGS config directory..."
        rm -rf "$AGS_CONFIG_DIR"
        echo "AGS config directory deleted."
    else
        echo "AGS config directory not found. Nothing to delete."
    fi
else
    # Handle invalid input
    echo "Invalid choice. Please enter 'y' or 'n'."
    exit 1
fi