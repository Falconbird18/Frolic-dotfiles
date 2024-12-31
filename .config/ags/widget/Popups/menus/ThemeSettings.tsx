import { bind } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
import { spacing } from "../../../lib/variables";
import PopupWindow from "../../../common/PopupWindow";
import { feelsTemp, humidity, location, precipitation, pressure, realTemp, uvIndex, wind } from "../../../service/Weather";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";

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