import Page from "../Page";
import { App, Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, execAsync, timeout, Variable, exec } from "astal";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../../lib/variables";

const settingsFile = `${GLib.get_home_dir()}/.config/ags/theme-settings.json`;

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
    workspaceIcons: {}, // Object to store icons for any workspace
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
  workspaceIcons: { [key: number]: string },
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
      workspaceIcons,
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
export const slideshow = Variable(settings.slideshow);
export const wallpaperImage = Variable(settings.wallpaper);
export const wallpaperFolder = Variable(settings.wallpaperDirectory);
export const totalWorkspaces = Variable(settings.workspaces);
export const hideEmptyWorkspaces = Variable(settings.hideEmptyWorkspaces);
export const settingsChanged = Variable(0);
export const showNumbers = Variable(settings.numbers);
export const workspaceIcons = Variable(settings.workspaceIcons || {});

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
    workspaceIcons.get(),
  );
  settingsChanged.set(settingsChanged.get() + 1);
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
    workspaceIcons.get(),
  );
  settingsChanged.set(settingsChanged.get() + 1);
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
    workspaceIcons.get(),
  );
  settingsChanged.set(settingsChanged.get() + 1);
};

const setWorkspaceIcon = (workspaceId: number, icon: string) => {
  const currentIcons = workspaceIcons.get();
  if (icon.trim() === "") {
    delete currentIcons[workspaceId]; // Remove icon if empty
  } else {
    currentIcons[workspaceId] = icon;
  }
  workspaceIcons.set({ ...currentIcons });
  saveSettings(
    currentTheme.get(),
    currentMode.get(),
    slideshow.get(),
    wallpaperImage.get(),
    wallpaperFolder.get(),
    totalWorkspaces.get(),
    showNumbers.get(),
    hideEmptyWorkspaces.get(),
    workspaceIcons.get(),
  );
  settingsChanged.set(settingsChanged.get() + 1);
};

export default () => {
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

        {/* Show workspace numbers */}
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
              const newValue = self.active;
              if (newValue !== hideEmptyWorkspaces.get()) {
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

        {/* Workspace Icons */}
        <label
          label="Workspace Icons"
          className="h2"
          halign={Gtk.Align.CENTER}
        />
        <box vertical spacing={4} halign={Gtk.Align.CENTER}>
          {bind(totalWorkspaces).as((ws) =>
            Array.from({ length: ws }, (_, i) => i + 1).map((id) => (
              <box horizontal spacing={8} key={`workspace-icon-${id}`}>
                <label label={`Workspace ${id}:`} className="paragraph" />
                <entry
                  text={bind(workspaceIcons).as((icons) => icons[id] || "")}
                  placeholderText="Enter emoji (e.g., 🌟)"
                  onActivate={(self) => {
                    const newIcon = self.text.trim();
                    setWorkspaceIcon(id, newIcon);
                  }}
                />
              </box>
            )),
          )}
        </box>
      </box>
    </Page>
  );
};