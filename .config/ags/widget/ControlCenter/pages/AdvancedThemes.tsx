import Page from "../Page";
import { App, Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, execAsync, timeout, Variable, exec } from "astal";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import { controlCenterPage } from "../index";

const settingsFile = `${GLib.get_home_dir()}/.config/ags/theme-settings.json`;
const menuName = "advancedthemes";

const loadSettings = () => {
  try {
    const file = Gio.File.new_for_path(settingsFile);
    const [ok, contents] = file.load_contents(null);
    if (ok) {
      const settings = JSON.parse(new TextDecoder().decode(contents));
      console.log(settings);
      return settings;
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return {
    theme: "Frolic",
    mode: "Light",
    slideshow: false,
    wallpaper: "747.jpg",
    wallpaperDirectory: "/home/austin/Pictures/wallpapers",
    workspaces: 10,
    numbers: false,
    hideEmptyWorkspaces: false,
  };
};

const saveSettings = (
  theme: string,
  mode: string,
  slideshow: boolean,
  wallpaper: string,
  wallpaperDirectory: string,
  workspaces: number,
  numbers: boolean,
  hideEmptyWorkspaces: boolean,
) => {
  try {
    const file = Gio.File.new_for_path(settingsFile);
    const contents = JSON.stringify({
      theme,
      mode,
      slideshow,
      wallpaper,
      wallpaperDirectory,
      workspaces,
      numbers,
      hideEmptyWorkspaces,
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
console.log(currentTheme);
export const currentMode = Variable(settings.mode);
console.log(currentMode);
export const slideshow = Variable(settings.slideshow);
export const wallpaperImage = Variable(settings.wallpaper);
export const wallpaperFolder = Variable(settings.wallpaperDirectory);
export const totalWorkspaces = Variable(settings.workspaces);
export const hideEmptyWorkspaces = Variable(settings.hideEmptyWorkspaces);
export const settingsChanged = Variable(0); // Signal to trigger workspace updates
console.log(totalWorkspaces);
export const showNumbers = Variable(settings.numbers);
console.log(showNumbers);

const setTheme = (theme: string, mode: string) => {
  currentTheme.set(theme);
  currentMode.set(mode);
  saveSettings(
    theme,
    mode,
    slideshow.get(),
    wallpaperImage.get(),
    wallpaperFolder.get(),
    totalWorkspaces.get(),
    showNumbers.get(),
    hideEmptyWorkspaces.get(),
  );
};

const setSlideshow = (isSlideshow: boolean) => {
  slideshow.set(isSlideshow);
  saveSettings(
    currentTheme.get(),
    currentMode.get(),
    isSlideshow,
    wallpaperImage.get(),
    wallpaperFolder.get(),
    totalWorkspaces.get(),
    showNumbers.get(),
    hideEmptyWorkspaces.get(),
  );
};

const setWallpaper = (wallpaper: string) => {
  wallpaperImage.set(wallpaper);
  saveSettings(
    currentTheme.get(),
    currentMode.get(),
    slideshow.get(),
    wallpaper,
    wallpaperFolder.get(),
    totalWorkspaces.get(),
    showNumbers.get(),
    hideEmptyWorkspaces.get(),
  );
  console.log(`New Wallpaper: ${wallpaper}`);

  const wallpaperImagePath = `${wallpaperFolder.get()}/${wallpaper}`;
  const destinationPath = `/usr/share/sddm/themes/frolic/Backgrounds/wallpaper.jpg`;

  try {
    exec(`mkdir -p /usr/share/sddm/themes/frolic/Backgrounds`);
    exec(`cp "${wallpaperImagePath}" "${destinationPath}"`);
    exec(
      `swww img "${destinationPath}" --transition-step 100 --transition-fps 120 --transition-type grow --transition-angle 30 --transition-duration 1`,
    );
  } catch (e) {
    console.error("Failed to set wallpaper:", e);
  }
};

const setWallpaperDirectory = (wallpaperDirectory: string) => {
  wallpaperFolder.set(wallpaperDirectory);
  saveSettings(
    currentTheme.get(),
    currentMode.get(),
    slideshow.get(),
    wallpaperImage.get(),
    wallpaperDirectory,
    totalWorkspaces.get(),
    showNumbers.get(),
    hideEmptyWorkspaces.get(),
  );
};

const chooseWallpaperDirectory = () => {
  const chooser = Gtk.FileChooserDialog.new(
    "Choose Wallpaper Directory",
    null,
    Gtk.FileChooserAction.SELECT_FOLDER,
    "Select",
    "Cancel",
  );
  chooser.set_modal(false);
  chooser.set_transient_for(null);
  chooser.set_skip_taskbar_hint(true);
  chooser.set_skip_pager_hint(true);
  chooser.connect("response", (chooser, response) => {
    if (response === Gtk.ResponseType.ACCEPT) {
      const file = chooser.get_filename();
      setWallpaperDirectory(file);
    }
    chooser.destroy();
  });
  chooser.show_all();
};

const setWorkspaces = (workspaces: number) => {
  const newValue = Math.max(1, Math.min(20, workspaces));
  totalWorkspaces.set(newValue);
  saveSettings(
    currentTheme.get(),
    currentMode.get(),
    slideshow.get(),
    wallpaperImage.get(),
    wallpaperFolder.get(),
    newValue,
    showNumbers.get(),
    hideEmptyWorkspaces.get(),
  );
  settingsChanged.set(settingsChanged.get() + 1); // Notify subscribers
};

const setShowNumbers = (numbers: boolean) => {
  showNumbers.set(numbers);
  saveSettings(
    currentTheme.get(),
    currentMode.get(),
    slideshow.get(),
    wallpaperImage.get(),
    wallpaperFolder.get(),
    totalWorkspaces.get(),
    numbers,
    hideEmptyWorkspaces.get(),
  );
  settingsChanged.set(settingsChanged.get() + 1); // Notify subscribers
};

const setHideEmptyWorkspaces = (hide: boolean) => {
  hideEmptyWorkspaces.set(hide);
  saveSettings(
    currentTheme.get(),
    currentMode.get(),
    slideshow.get(),
    wallpaperImage.get(),
    wallpaperFolder.get(),
    totalWorkspaces.get(),
    showNumbers.get(),
    hide,
  );
  settingsChanged.set(settingsChanged.get() + 1); // Trigger workspace update
};

const getWallpaperImages = () => {
  const images = [];
  if (wallpaperFolder.get()) {
    const directory = Gio.File.new_for_path(wallpaperFolder.get());
    const enumerator = directory.enumerate_children(
      "standard::*",
      Gio.FileQueryInfoFlags.NONE,
      null,
    );
    while (true) {
      const info = enumerator.next_file(null);
      if (!info) break;
      if (info.get_file_type() === Gio.FileType.REGULAR) {
        const mimeType = info.get_content_type();
        if (mimeType.startsWith("image/")) {
          images.push(info.get_name());
        }
      }
    }
  }
  return images;
};

const chunkArray = (arr, size) => {
  return arr.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);
};

export default () => {
  const images = getWallpaperImages();
  const rows = chunkArray(images, 2);

  return (
    <Page label={"AdvancedThemes"}>
      <box
        vertical
        spacing={8}
        className={"control-center__page_scrollable-content"}
      >
        {/* Workspace Control */}
        <label label="Workspaces" className="h2" halign={Gtk.Align.CENTER} />
        <box
          horizontal
          spacing={spacing}
          halign={Gtk.Align.CENTER}
          className="workspace-container"
        >
          <button
            onClick={() => setWorkspaces(totalWorkspaces.get() - 1)}
            className="workspace-button"
          >
            <label label="-" className="paragraph" />
          </button>
          <label
            label={bind(totalWorkspaces).as((ws) => ws.toString())}
            className="h3"
          />
          <button
            onClick={() => setWorkspaces(totalWorkspaces.get() + 1)}
            className="workspace-button"
          >
            <label label="+" className="paragraph" />
          </button>
        </box>

        {/*Show workspace numbers */}
        <label
          label="Show Workspace Numbers"
          className="h2"
          halign={Gtk.Align.CENTER}
        />
        <box horizontal halign={Gtk.Align.CENTER}>
          <switch
            active={bind(showNumbers).as((numbers) => numbers)}
            onNotifyActive={(self) => {
              const newValue = self.active;
              if (newValue !== showNumbers.get()) {
                console.log(
                  "Toggling showNumbers from",
                  showNumbers.get(),
                  "to",
                  newValue,
                );
                setShowNumbers(newValue);
              }
            }}
          />
        </box>

        {/* Hide Empty Workspaces Switch */}
        <label
          label="Hide Empty Workspaces"
          className="h2"
          halign={Gtk.Align.CENTER}
        />
        <box horizontal halign={Gtk.Align.CENTER}>
          <switch
            active={bind(hideEmptyWorkspaces).as((hide) => hide)}
            onNotifyActive={(self) => {
              const newValue = self.active; // Get the switch's new state
              if (newValue !== hideEmptyWorkspaces.get()) {
                // Only update if different
                console.log(
                  "Toggling hidden empty workspaces from",
                  hideEmptyWorkspaces.get(),
                  "to",
                  newValue,
                );
                setHideEmptyWorkspaces(newValue);
              }
            }}
          />
        </box>

      </box>
    </Page>
  );
};
