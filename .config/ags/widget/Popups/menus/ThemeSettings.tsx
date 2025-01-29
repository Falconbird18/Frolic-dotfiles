import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";
// import { FileChooserDialog } from "astal/gtk3/FileChooserDialog";

const settingsFile = `${GLib.get_home_dir()}/.config/ags/theme-settings.json`;

const loadSettings = () => {
  try {
    const file = Gio.File.new_for_path(settingsFile);
    const [ok, contents] = file.load_contents(null);
    if (ok) {
      const settings = JSON.parse(new TextDecoder().decode(contents));
      return settings;
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  // return { theme: "Frolic", mode: "Light" };
  return {
    theme: "Frolic",
    mode: "Light",
    wallpaperDir: "/home/austin/Pictures/wallpapers",
    slideshow: false,
    themeSpecificWallpaper: false,
  };
};

const saveSettings = (theme: string, mode: string) => {
  try {
    const file = Gio.File.new_for_path(settingsFile);
    const contents = JSON.stringify({
      theme,
      mode,
      wallpaperDir: currentWallpaperDir.get(),
      slideshow: currentSlideshow.get(),
      themeSpecificWallpaper: currentThemeSpecificWallpaper.get(),
    });
    file.replace_contents(
      contents,
      null,
      false,
      Gio.FileCreateFlags.NONE,
      null,
    );
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
};

const settings = loadSettings();

export const currentTheme = Variable(settings.theme);
export const currentMode = Variable(settings.mode);
export const currentWallpaperDir = Variable(settings.wallpaperDir);
export const currentSlideshow = Variable(settings.slideshow);
export const currentThemeSpecificWallpaper = Variable(
  settings.themeSpecificWallpaper,
);
export const currentTransitionStep = Variable(20); // Default transition step
export const currentTransitionFps = Variable(30); // Default transition FPS
export const currentTransitionType = Variable("center"); // Default transition type

const setTheme = (theme: string, mode: string) => {
  currentTheme.set(theme);
  currentMode.set(mode);
  saveSettings(theme, mode, wallpaperDir, slideshow, themSpecificWallpaper);
};

const chooseWallpaperDirectory = async () => {
  const dialog = new FileChooserDialog({
    title: "Select Wallpaper Directory",
    action: Gio.Action.SELECT_FOLDER,
  });
  const response = await dialog.run();
  if (response === Gtk.ResponseType.OK) {
    settings.wallpaperDir = dialog.get_filename();
    saveSettings(settings);
    currentWallpaperDir.set(settings.wallpaperDir);
    // Potentially trigger swww update here if needed.  Example:
    // exec(`swww --set-directory "${settings.wallpaperDir}"`); // Adapt command as needed
  }
  dialog.destroy();
};

const updateSwww = () => {
  let command = "swww img";

  // Handle wallpaper directory: If slideshow is off, pick a single image. Otherwise, let swww handle the directory.
  if (!currentSlideshow.get() && currentWallpaperDir.get()) {
    // Choose a single image (This part needs improvement for robustness, error handling, and selecting a random image from a directory if necessary)
    const files = GLib.list_directory(currentWallpaperDir.get(), 0);
    if (files.length > 0) {
      command += ` "${currentWallpaperDir.get()}/${files[0]}"`;
    } else {
      console.warn("No files found in selected wallpaper directory!");
      return;
    }
  } else if (currentSlideshow.get() && currentWallpaperDir.get()) {
    command += ` "${currentWallpaperDir.get()}"`;
  } else {
    console.warn(
      "No wallpaper directory selected or slideshow is off without a single image selected!",
    );
    return;
  }

  // Add transition options
  command += ` --transition-step ${currentTransitionStep.get()} --transition-fps ${currentTransitionFps.get()} --transition-type ${currentTransitionType.get()}`;

  try {
    exec(command);
  } catch (error) {
    console.error("Error updating swww:", error);
  }
};

export default () => {
  return (
    <PopupMenu
      vexpand={true}
      name="theme-settings"
      namespace="theme-settings"
      label="theme-settings"
    >
      <box vertical>
        <box className="buttons-container">
          <button
            className="mode-settings__button_left"
            onClick={() => setTheme(currentTheme.get(), "Light")}
          >
            <label label="Light" />
          </button>
          <button
            className="mode-settings__button_right"
            onClick={() => setTheme(currentTheme.get(), "Dark")}
          >
            <label label="Dark" />
          </button>
        </box>
        <label label="Theme" className="theme" halign={Gtk.Align.START} />
        <box horizontal className="buttons-container" spacing={spacing}>
          <box vertical>
            <button
              onClick={() => setTheme("Verdant", currentMode.get())}
              className="theme-buttons"
            >
              <icon icon={icons.ui.edit} />
            </button>
            <label label="Verdant" className="label" />
          </box>
          <box vertical>
            <button
              onClick={() => setTheme("Zephyr", currentMode.get())}
              className="theme-buttons"
            >
              <icon icon={icons.ui.edit} />
            </button>
            <label label="Zephyr" className="label" />
          </box>
          <box vertical>
            <button
              onClick={() => setTheme("Frolic", currentMode.get())}
              className="theme-buttons"
            >
              <icon icon={icons.ui.edit} />
            </button>
            <label label="Frolic" className="label" />
          </box>
          <box vertical>
            <button
              onClick={() => setTheme("Glaciara", currentMode.get())}
              className="theme-buttons"
            >
              <icon icon={icons.ui.edit} />
            </button>
            <label label="Glaciara" className="label" />
          </box>
        </box>
        <label label="Wallpaper" className="theme" halign={Gtk.Align.START} />
        <box>
          <button onClick={chooseWallpaperDirectory}>
            Choose Wallpaper Directory
          </button>
          <label
            label={`Selected Directory: ${currentWallpaperDir.get() || "None"}`}
          />
          <hbox spacing={spacing}>
            <switch
              ref={(widget) => {
                if (widget) {
                  bind(widget, "notify::active", () => {
                    settings.slideshow = !settings.slideshow;
                    saveSettings(settings);
                    currentSlideshow.set(settings.slideshow);
                    updateSwww();
                  });
                }
              }}
              active={currentSlideshow.get()}
            />
            <label label="Slideshow" />
          </hbox>

          <hbox spacing={spacing}>
            <switch
              ref={(widget) => {
                if (widget) {
                  bind(widget, "notify::active", () => {
                    settings.themeSpecificWallpaper =
                      !settings.themeSpecificWallpaper;
                    saveSettings(settings);
                    currentThemeSpecificWallpaper.set(
                      settings.themeSpecificWallpaper,
                    );
                    updateSwww();
                  });
                }
              }}
              active={currentThemeSpecificWallpaper.get()}
            />
            <label label="Theme Specific Wallpaper" />
          </hbox>
          <label label="Transition Settings" />
          <adjustment
            min={1}
            max={255}
            step={1}
            value={currentTransitionStep.get()}
            onChange={(step) => currentTransitionStep.set(step)}
          />
          <adjustment
            min={1}
            max={255}
            step={1}
            value={currentTransitionFps.get()}
            onChange={(fps) => currentTransitionFps.set(fps)}
          />
          <combo
            value={currentTransitionType.get()}
            onChange={(type) => currentTransitionType.set(type)}
          >
            <item value="center">Center</item>
            {/* Add other transition types as supported by swww */}
          </combo>
        </box>
      </box>
    </PopupMenu>
  );
};
