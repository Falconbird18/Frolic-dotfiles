import { bind, timeout } from "astal";
import { App, Astal, Gtk } from "astal/gtk3";
import BarButton from "../BarButton";
import Notifications from "gi://AstalNotifd";
import { toggleWindow } from "../../../lib/utils";
import notificationsStore from "../../../service/Notifications";

export default () => {
    return (
        <BarButton
            className={"bar__notifications"}
            onClicked={() => {
                toggleWindow("notifications");
            }}
            setup={(self) => {
                const notificationsWindow = App.get_window("notifications");
                if (notificationsWindow) {
                    self.hook(
                        notificationsWindow,
                        "notify::visible",
                        () => {
                            self.toggleClassName("active", notificationsWindow.visible);
                        },
                    );
                }
            }}
        >
            <label
                valign={Gtk.Align.CENTER}
                className="bar__notifications_label"
                label={bind(notificationsStore, "notifications").as((n) =>
                    n.length.toString(),
                )}
            />
        </BarButton>
    );
};