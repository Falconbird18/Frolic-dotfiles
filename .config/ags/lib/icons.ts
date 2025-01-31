interface substitutions {
  icons: {
    [key: string]: string | undefined;
  };
  titles: {
    [key: string]: string | undefined;
  };
}

export const substitutions: substitutions = {
  icons: {
    "transmission-gtk": "transmission",
    "blueberry.py": "bluetooth",
    Caprine: "facebook-messenger",
    "de.shorsh.discord-screenaudio": "discord",
    "org.pwmt.zathura": "x-office-document",
    "code-url-handler": "visual-studio-code",
    "dev.zed.Zed": "zed",
    "": "preferences-desktop-display",
  },
  titles: {
    "io.github.Rirusha.Cassette": "Cassette",
    "com.github.Aylur.ags": "AGS",
    "transmission-gtk": "Transmission",
    "com.obsproject.Studio": "OBS",
    "com.usebottles.bottles": "Bottles",
    "com.github.wwmm.easyeffects": "Easy Effects",
    "org.gnome.TextEditor": "Text Editor",
    "org.gnome.design.IconLibrary": "Icon Library",
    "blueberry.py": "Blueberry",
    "org.wezfurlong.wezterm": "Wezterm",
    "com.raggesilver.BlackBox": "BlackBox",
    firefox: "Firefox",
    "org.gnome.Nautilus": "Files",
    "libreoffice-writer": "Writer",
    "chromium-browser": "Chromium",
    "dev.zed.Zed": "Zed",
    "org.telegram.desktop": "Telegram",
    "de.shorsh.discord-screenaudio": "Discord",
    "org.pwmt.zathura": "Zathura",
    kitty: "Kitty",
    "code-url-handler": "VSCode",
    "": "Desktop",
  },
};

export default {
  colorscheme: {
    dark: "night-light",
    light: "night-light",
  },
  record: "media-record-symbolic",
  screensnip: "edit-cut-symbolic",
  screenshot: "view-fullscreen-symbolic",
  arch: "$XDG_CONFIG_HOME/ags/arch.svg",
  ai: "$XDG_CONFIG_HOME/ags/ai.svg",
  powerprofile: {
    0: "power-profile-balanced",
    1: "power-profile-power-saver",
    2: "power-profile-performance",
  },
  bluetooth: {
    enabled: "bluetooth-active-symbolic",
    disabled: "bluetooth-disabled-symbolic",
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information",
    video: "video-x-generic",
    audio: "audio-x-generic",
  },
  network: {
    wired: "network-wired",
  },
  ui: {
    add: "list-add",
    checked: "checkbox-checked",
    close: "window-close",
    colorpicker: "color-select",
    edit: "document-edit",
    info: "info",
    link: "external-link",
    lock: "system-lock-screen",
    menu: "open-menu",
    refresh: "view-refresh",
    search: "system-search",
    settings: "emblem-system-symbolic",
    themes: "preferences-desktop-theme",
    tick: "object-select",
    time: "hourglass",
    toolbars: "toolbars",
    warning: "dialog-warning",
    avatar: "avatar-default",
    arrow: {
      right: "pan-end",
      left: "pan-start",
      down: "pan-down",
      up: "pan-up",
    },
  },
  audio: {
    mic: {
      muted: "microphone-sensitivity-muted-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic",
    },
    volume: {
      muted: "audio-volume-muted",
      low: "audio-volume-low",
      medium: "audio-volume-medium",
      high: "audio-volume-high",
      overamplified: "audio-volume-overamplified",
    },
    type: {
      headset: "audio-headphones",
      speaker: "audio-speakers",
      card: "audio-card",
    },
    mixer: "media-playlist-shuffle",
  },
  notifications: {
    noisy: "preferences-system-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
  },
  media: {
    fallback: "audio-x-generic",
    shuffle: {
      enabled: "media-playlist-shuffle",
      disabled: "media-playlist-shuffle",
    },
    loop: {
      none: "media-playlist-repeat",
      track: "media-playlist-repeat",
      playlist: "media-playlist-repeat",
    },
    playing: "media-playback-pause",
    paused: "media-playback-start",
    stopped: "media-playback-start",
    prev: "media-skip-backward",
    next: "media-skip-forward",
  },
  powermenu: {
    sleep: "weather-clear-night",
    reboot: "system-reboot",
    logout: "system-log-out",
    shutdown: "system-shutdown",
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness",
  },
  weather: {
    clear: "weather-clear",
    clearNight: "weather-clear-night",
    partlyCloudy: "weather-few-clouds",
    cloudy: "weather-overcast",
    fog: "weather-fog",
    rain: "weather-showers",
    thunderstorm: "weather-severe-alert",
    snow: "weather-snow",
    freezingRain: "weather-freezing-rain",
    unknown: "window-none-availible",
  },
};
