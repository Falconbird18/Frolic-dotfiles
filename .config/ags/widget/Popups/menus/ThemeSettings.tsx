import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";
import WideIconButton from "../../../common/WideIconButton";

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
                <box className="mode-buttons-container">
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
                <label label="Theme" className="theme" />
                <box horizontal className="theme-buttons-container" spacing={spacing}>
                    <box vertical>
                        <button 
                            onClick={() => setTheme("Glaciara", currentMode.get())}
                            className="theme-buttons"
                        >
                            <label label="Verdant" />
                        </button>
                        <label label="Verdant" />
                    </box>
                    <box vertical>
                        <button 
                            onClick={() => setTheme("Glaciara", currentMode.get())}
                            className="theme-buttons"
                        >
                            <label label="Zephyr" />
                        </button>
                        <label label="Zephyr" />
                    </box>
                    <box vertical>
                        <button 
                            onClick={() => setTheme("Frolic", currentMode.get())}
                            className="theme-buttons"
                        >
                            <label label="Frolic" />
                        </button>
                        <label label="Frolic" />
                    </box>
                    <box vertical>
                        <button 
                            onClick={() => setTheme("Glaciara", currentMode.get())}
                            className="theme-buttons"
                        >
                            <label label="Glaciara" />
                        </button>
                        <label label="Glaciara" />
                    </box>
                </box>
            </box>
        </PopupMenu>
    );
};