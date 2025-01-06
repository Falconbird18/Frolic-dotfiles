import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";

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
    return { theme: "Frolic", mode: "Light" };
};

const saveSettings = (theme: string, mode: string) => {
    try {
        const file = Gio.File.new_for_path(settingsFile);
        const contents = JSON.stringify({ theme, mode });
        file.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
    } catch (e) {
        console.error("Failed to save settings:", e);
    }
};

const settings = loadSettings();

export const currentTheme = Variable(settings.theme);
export const currentMode = Variable(settings.mode);

const setTheme = (theme: string, mode: string) => {
    currentTheme.set(theme);
    currentMode.set(mode);
    saveSettings(theme, mode);
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
            </box>
        </PopupMenu>
    );
};