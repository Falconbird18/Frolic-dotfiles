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
    return {
        theme: "Frolic",
        mode: "Light",
        slideshow: false,
        wallpaper: "",
        wallpaperDirectory: ""
    };
};

const saveSettings = (theme: string, mode: string, slideshow: boolean, wallpaper: string, wallpaperDirectory: string) => {
    try {
        const file = Gio.File.new_for_path(settingsFile);
        const contents = JSON.stringify({ theme, mode, slideshow, wallpaper, wallpaperDirectory });
        file.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
    } catch (e) {
        console.error("Failed to save settings:", e);
    }
};

const settings = loadSettings();

export const currentTheme = Variable(settings.theme);
export const currentMode = Variable(settings.mode);
export const slideshow = Variable(settings.slideshow);
export const wallpaper = Variable(settings.wallpaper);
export const wallpaperDirectory = Variable(settings.wallpaperDirectory);

const setTheme = (theme: string, mode: string) => {
    currentTheme.set(theme);
    currentMode.set(mode);
    saveSettings(theme, mode, slideshow.get(), wallpaper.get(), wallpaperDirectory.get());
};

const setSlideshow = (slideshow: boolean) => {
    slideshow.set(slideshow);
    saveSettings(currentTheme.get(), currentMode.get(), slideshow, wallpaper.get(), wallpaperDirectory.get());
};

const setWallpaper = (wallpaper: string) => {
    wallpaper.set(wallpaper);
    saveSettings(currentTheme.get(), currentMode.get(), slideshow.get(), wallpaper, wallpaperDirectory.get());
};

const setWallpaperDirectory = (wallpaperDirectory: string) => {
    wallpaperDirectory.set(wallpaperDirectory);
    saveSettings(currentTheme.get(), currentMode.get(), slideshow.get(), wallpaper.get(), wallpaperDirectory);
};

const chooseWallpaperDirectory = () => {
    const chooser = Gtk.FileChooserNative.new(
        "Choose Wallpaper Directory",
        null,
        Gtk.FileChooserAction.SELECT_FOLDER,
        "Select",
        "Cancel"
    );
    chooser.connect("response", (chooser, response) => {
        if (response === Gtk.ResponseType.ACCEPT) {
            const file = chooser.get_filename();
            setWallpaperDirectory(file);
        }
        chooser.destroy();
    });
    chooser.show();
};

const getWallpaperImages = () => {
    const images = [];
    if (wallpaperDirectory.get()) {
        const directory = Gio.File.new_for_path(wallpaperDirectory.get());
        const enumerator = directory.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);
        while (true) {
            const info = enumerator.next_file(null);
            if (!info) {
                break;
            }
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
                <box vertical className="switches-container">
                    <switch
                        active={slideshow.get()}
                        onActivate={() => setSlideshow(!slideshow.get())}
                    >
                    </switch>
                    <label label="Slideshow" className="label" />
                    <switch
                        active={wallpaper.get() !== ""}
                        onActivate={() => setWallpaper(wallpaper.get() === "" ? "default" : "")}
                    >
                    </switch>
                    <label label="Set Wallpaper" className="label" />
                </box>
                <button
                    onClick={chooseWallpaperDirectory}
                >
                    <label label="Choose Wallpaper Directory" />
                </button>
                <box vertical className="wallpaper-images-container">
                    {getWallpaperImages().map((image) => (
                        <box key={image} horizontal>
                            <label label={image} />
                            <button
                                onClick={() => setWallpaper(image)}
                            >
                                <label label="Set as Wallpaper" />
                            </button>
                        </box>
                    ))}
                </box>
            </box>
        </PopupMenu>
    );
};