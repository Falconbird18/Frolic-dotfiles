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
    workspaceIcons: {},
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
    delete currentIcons[workspaceId];
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

const removeWorkspaceIcon = (workspaceId: number) => {
  const currentIcons = workspaceIcons.get();
  delete currentIcons[workspaceId];
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

const showAddIconForm = Variable(false);

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

        {/* Workspace Icons Section */}
        <label
          label="Workspace Icons"
          className="h2"
          halign={Gtk.Align.CENTER}
        />
        <box vertical spacing={8} halign={Gtk.Align.CENTER}>
          {/* Add Icon Button */}
          <button
            onClick={() => showAddIconForm.set(true)}
            className="add-icon-button"
          >
            <label label="+" className="paragraph" />
          </button>

          {/* Add Icon Form */}
          <box
            vertical
            spacing={4}
            className="add-icon-form"
            visible={bind(showAddIconForm).as((v) => v)}
          >
            <entry
              placeholderText="Workspace Number (1-20)"
              className="workspace-number-entry"
            />
            <entry
              placeholderText="Icon (e.g., 🌟)"
              className="icon-entry"
            />
            <box horizontal spacing={8} halign={Gtk.Align.CENTER}>
              <button
                onClick={(self) => {
                  const form = self.get_parent().get_parent();
                  const numberEntry = form.get_children()[0]; // First child
                  const iconEntry = form.get_children()[1];   // Second child
                  const workspaceId = parseInt(numberEntry.text.trim());
                  const icon = iconEntry.text.trim();

                  if (
                    !isNaN(workspaceId) &&
                    workspaceId >= 1 &&
                    workspaceId <= totalWorkspaces.get() &&
                    icon
                  ) {
                    setWorkspaceIcon(workspaceId, icon);
                    numberEntry.text = "";
                    iconEntry.text = "";
                    showAddIconForm.set(false);
                  } else {
                    console.error("Invalid workspace number or icon");
                  }
                }}
                className="submit-button"
              >
                <label label="Save" className="paragraph" />
              </button>
              <button
                onClick={(self) => {
                  const form = self.get_parent().get_parent();
                  const numberEntry = form.get_children()[0];
                  const iconEntry = form.get_children()[1];
                  numberEntry.text = "";
                  iconEntry.text = "";
                  showAddIconForm.set(false);
                }}
                className="cancel-button"
              >
                <label label="Cancel" className="paragraph" />
              </button>
            </box>
          </box>
          {/* Icon Cards */}
          {bind(workspaceIcons).as((icons) =>
            Object.entries(icons).map(([id, icon]) => {
              let deleteButton = null; // Variable to store the deleteButton reference
              const deleteButtonTest = (
                  <button
                    className="delete-button delete-button-hidden" // Initially hidden
                    onClick={() => removeWorkspaceIcon(parseInt(id))}
                    setup={(self) => {
                      // Store the reference to the deleteButton
                      deleteButton = self;
                    }}
                  >
                    <label label="x" className="paragraph" />
                  </button>
              );

              return (
                <eventbox
                  key={`icon-card-${id}`}
                  horizontal
                  spacing={8}
                  className="icon-card"
                  halign={Gtk.Align.CENTER}
                  onEnterNotifyEvent={(self) => {
                    if (deleteButton) {
                      console.log("Hover enter:", id);
                      // Remove the hidden class to show the button
                      deleteButton.className = "delete-button-visible"
                      console.log("Current className:", deleteButton.className)
                    }
                  }}
                  onLeaveNotifyEvent={(self) => {
                    if (deleteButton) {
                      console.log("Hover leave:", id);
                      // Add the hidden class to hide the button
                      deleteButton.className = "delete-button-hidden";
                      console.log("Current className:", deleteButton.className)
                    }
                  }}
                >
                  <box>
                  <label
                    label={`Workspace ${id}: ${icon}`}
                    className="paragraph"
                  />
                  {deleteButtonTest}
                  </box>
                </eventbox>
              );
            }),
          )}
        </box>
      </box>
    </Page>
  );
};