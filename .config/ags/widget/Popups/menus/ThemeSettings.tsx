import { bind, exec } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib } = imports.gi;
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";


const setTheme = (theme: string, mode: string) => {
    const homeDir = GLib.get_home_dir();
    const themePathCss = `${homeDir}/.config/ags/style/${theme}${mode}/main.css`;
    const themePathScss = `${homeDir}/.config/ags/style/${theme}${mode}/main.scss`;
    // reloadCss();
    exec(`sass ${themePathScss} ${themePathCss}`);
    console.log("Scss compiled");

    // main scss file
    // App.resetCss();
    // console.log("R$set");
    App.apply_css(themePathCss);
    console.log("Compiled css applied");
};
export default () => {
    return (
        <PopupMenu
            vexpand={true}
            name="theme-settings"
            namespace="theme-settings"
            label="theme-settings"
        >
            <box
                vertical
            >
                <box className="mode-buttons-container">
                    <button
                        className="mode-settings__button_left"
                        onClick={() => {
                            setTheme("Frolic", "Light");
                            let Theme = "Light";
                        }}
                    >
                        <label label="Light" />
                    </button>
                    <button
                        className="mode-settings__button_right"
                        onClick={() => {
                            setTheme("Frolic", "Dark");
                            let Theme = "Dark";
                        }}
                    >
                        <label label="Dark" />
                    </button>
                </box>
                <box
                    horizontal
                    className="theme-buttons-container"
                    spacing={spacing}
                >
                    <label label="Theme" className="theme" />
                    <box
                        vertical
                    >
                        <button>
                            <label label="Frolic" />
                        </button>
                        <label label="Frolic" />
                    </box>
                    <box
                        vertical
                    >
                        <button
                            onClick={() => {
                                setTheme("Glaciara", "Dark");
                                let Theme = "Dark";
                            }}
                        >
                            <icon icon={icons.powermenu.shutdown} iconSize={16} />
                        </button>
                        <label label="Glaciara" />
                    </box>
                </box>
            </box>
        </PopupMenu >
    );
};