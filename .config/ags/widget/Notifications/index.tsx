import { App, Gtk, Gdk, Widget, Astal } from "astal/gtk3";
import { bind, execAsync, timeout, Variable, GLib } from "astal";
import Notifd from "gi://AstalNotifd?version=0.1";
import Notification from "./Notification";
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";
import { Subscribable } from "astal/binding";

class NotificationsMap implements Subscribable {
    private activeWidgets: Map<number, Gtk.Widget> = new Map(); // Active notification widgets
    private allNotifications: Map<number, { widget: Gtk.Widget; resolved: boolean }> = new Map(); // All notifications with state
    private var: Variable<Array<Gtk.Widget>> = Variable([]);

    private notify() {
        // Show all notifications, resolved or not
        // this.var.set([...this.allNotifications.values()].map(entry => entry.widget).reverse());
        this.var.set([...this.allNotifications.values()].map(entry => entry.widget).reverse());
    }

    constructor() {
        const notifd = Notifd.get_default();
        notifd.set_ignore_timeout(true);

        notifd.connect("notified", (_, id) => {
            const widget = Notification({
                notification: notifd.get_notification(id)!,
                onHoverLost: () => {},
                setup: (self) => {},
            });
            this.set(id, widget);
        });

        notifd.connect("resolved", (_, id) => {
            const entry = this.allNotifications.get(id);
            if (entry) {
                entry.resolved = true; // Mark as resolved but keep in history
                this.activeWidgets.delete(id); // Remove from active widgets
                entry.widget.close(() => this.delete(id)); // Close animation, no removal from allNotifications
                this.notify();
            }
        });
    }

    private set(key: number, value: Gtk.Widget) {
        const oldWidget = this.activeWidgets.get(key);
        if (oldWidget && typeof oldWidget.destroy === "function") {
            oldWidget.destroy();
        }
        this.activeWidgets.set(key, value);
        this.allNotifications.set(key, { widget: value, resolved: false });
        this.notify();
    }

    private delete(key: number) {
        const widget = this.activeWidgets.get(key);
        if (widget && typeof widget.destroy === "function") {
            this.activeWidgets.delete(key);
        }
        if (this.allNotifications.get(key)?.resolved) {
            this.allNotifications.delete(key); // Remove from history too
        }
    }

    // Method to clear all notifications from history
    clearAll() {
        this.activeWidgets.forEach((widget, id) => {
            if (typeof widget.destroy === "function") widget.destroy();
            this.activeWidgets.delete(id);
        });
        this.allNotifications.clear();
        this.notify();
    }

    get() {
        return this.var.get();
    }

    subscribe(callback: (list: Array<Gtk.Widget>) => void) {
        return this.var.subscribe(callback);
    }
}

export default () => {
    const notifs = new NotificationsMap();
    const notifications = Notifd.get_default();

    return (
        <PopupWindow
            scrimType="transparent"
            layer={Astal.Layer.OVERLAY}
            visible={false}
            margin={12}
            vexpand={true}
            keymode={Astal.Keymode.EXCLUSIVE}
            name="notifications"
            namespace="notifications"
            className="notifications"
            exclusivity={Astal.Exclusivity.NORMAL}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}
            onKeyPressEvent={(self, event) => {
                const [keyEvent, keyCode] = event.get_keycode();
                if (keyEvent && keyCode == 9) {
                    App.toggle_window(self.name);
                }
            }}
            setup={(self) => {
                self.hook(notifications, "notify::notifications", () => {
                    // Do nothing here
                });
            }}
        >
            <box vertical className="notifications-window" spacing={spacing}>
                <button
                    halign={Gtk.Align.END}
                    hexpand={false}
                    className="notifications-button"
                    onClicked={() => {
                        self.visible = true; // Show window when button is clicked
                    }}
                >
                    <label
                        className="notifications-button__label"
                        label={"Notifications"}
                    />
                </button>
                <scrollable vexpand>
                    <box
                        className="notifications-window__list"
                        visible={true}
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={6}
                        vexpand={true}
                        hexpand={true}
                        setup={(self) => {
                            self.hook(notifs, "notify", () => {
                                self.children = notifs.get();
                            });
                        }}
                    />
                </scrollable>
            </box>
        </PopupWindow>
    );
};
