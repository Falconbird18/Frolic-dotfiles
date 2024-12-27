import { App, Gtk, Astal } from "astal/gtk3";
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";

export default () => {
    return (
        <PopupWindow
            scrimType="transparent"
            layer={Astal.Layer.OVERLAY}
            visible={false}
            margin={12}
            vexpand={true}
            keymode={Astal.Keymode.EXCLUSIVE}
            name="weather"
            namespace="weather"
            className="weather"
            exclusivity={Astal.Exclusivity.NORMAL}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}
            onKeyPressEvent={(self, event) => {
                const [keyEvent, keyCode] = event.get_keycode();
                if (keyEvent && keyCode == 9) {
                    App.toggle_window(self.name);
                }
            }}
        >
            <box vertical className="weather-window" spacing={spacing}>
                <label label="Hello" />
            </box>
        </PopupWindow>
    );
};