import { bind, exec } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib } = imports.gi;
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";


const setTheme = (theme: string) => {
    const homeDir = GLib.get_home_dir();
    const themePathCss = `${homeDir}/.config/ags/style/frolic${theme}/main.css`;
    const themePathScss = `${homeDir}/.config/ags/style/frolic${theme}/main.scss`;
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
            <box className="theme-buttons-container">
                <button
                    className="theme-settings__button"
                    onClick={() => {
                        setTheme("Light");
                        export const Theme = "Light";
                    }}
                >
                    <label label="Light" />
                </button>
                <button
                    className="theme-settings__button"
                    onClick={() => {
                        setTheme("Dark");
                        export const Theme = "Dark";
                    }}
                >
                    <label label="Dark" />
                </button>
            </box>
        </PopupMenu>
    );
};