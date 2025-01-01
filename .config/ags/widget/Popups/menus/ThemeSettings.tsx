import { bind } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
import { spacing } from "../../../lib/variables";
import PopupWindow from "../../../common/PopupWindow";
import { feelsTemp, humidity, location, precipitation, pressure, realTemp, uvIndex, wind } from "../../../service/Weather";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";
import { Theme } from "../../../lib/theme";

const scss = `/home/austin/.config/ags/style/Frolic/main${Theme}.scss`;


const reloadCss = () => {
    Astal.exec(`sass ${scss}`);
}
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
                        App.apply_css(`/home/austin/.config/ags/style/Frolic/mainLight.scss`);
                        // reloadCss();
                    }}
                >
                    <label label="Light" />
                </button>
                <button
                    className="theme-settings__button"
                >
                    <label label="Dark" />
                </button>
            </box>
        </PopupMenu>
    );
};