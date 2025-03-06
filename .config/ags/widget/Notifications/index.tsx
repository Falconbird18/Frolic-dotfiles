import { App, Gtk, Gdk, Widget, Astal } from "astal/gtk3";
import { bind, timeout, Variable, GLib } from "astal";
import Notifd from "gi://AstalNotifd?version=0.1";
import Notification from "./Notification";
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";
import { Subscribable } from "astal/binding";

class NotificationsMap implements Subscribable {
    private activeWidgets: Map<number, Gtk.Widget> = new Map();
    private allNotifications: Map<number, { widget: Gtk.Widget; resolved: boolean; notification: Notifd.Notification }> = new Map();
    private var: Variable<Array<Gtk.Widget>> = Variable([]);

    private notify() {
        const widgets = [...this.allNotifications.values()].map(entry => entry.widget).reverse();
        console.log(`Notify called. Total: ${this.allNotifications.size}, Widgets: ${widgets.length}`);
        this.var.set(widgets);
    }

    constructor() {
        const notifd = Notifd.get_default();
        notifd.set_ignore_timeout(true);

        notifd.connect("notified", (_, id) => {
            console.log(`New notification: ID ${id}, Summary: ${notifd.get_notification(id)?.summary}`);
            const notification = notifd.get_notification(id)!;
            const widget = Notification({
                notification,
                onHoverLost: () => {},
                setup: (self) => {},
            });
            this.set(id, widget, notification);
        });

        notifd.connect("resolved", (_, id) => {
            const entry = this.allNotifications.get(id);
            if (entry) {
                console.log(`Resolved: ID ${id}`);
                entry.resolved = true;
                this.activeWidgets.delete(id);
                entry.widget.close(() => {});
                this.notify();
            }
        });
    }

    private set(key: number, value: Gtk.Widget, notification: Notifd.Notification) {
        const oldWidget = this.activeWidgets.get(key);
        if (oldWidget && typeof oldWidget.destroy === "function") {
            oldWidget.destroy();
        }
        this.activeWidgets.set(key, value);
        this.allNotifications.set(key, { widget: value, resolved: false, notification });
        console.log(`Set ID ${key}. Active: ${this.activeWidgets.size}, All: ${this.allNotifications.size}`);
        this.notify();
    }

    private delete(key: number) {
        const widget = this.activeWidgets.get(key);
        if (widget && typeof widget.destroy === "function") {
            this.activeWidgets.delete(key);
        }
    }

    clearAll() {
        console.log("Clearing all notifications");
        this.activeWidgets.forEach((widget) => {
            if (typeof widget.destroy === "function") widget.destroy();
        });
        this.activeWidgets.clear();
        this.allNotifications.forEach((entry) => {
            if (typeof entry.widget.destroy === "function") entry.widget.destroy();
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
                    console.log("Toggling notifications window");
                    App.toggle_window(self.name);
                }
            }}
        >
            <box vertical className="notifications-window" spacing={spacing}>
                <box halign={Gtk.Align.END} spacing={6}>
                    <label label={bind(notifs).as(n => `Notifications (${n.length})`)} />
                    <button
                        className="notifications-button"
                        onClicked={() => notifs.clearAll()}
                    >
                        <label label="Clear All" />
                    </button>
                </box>
                <scrollable vexpand>
                    <box
                        className="notifications-window__list"
                        visible={true}
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={6}
                        vexpand={true}
                        hexpand={true}
                        setup={(self) => {
                            const widgetMap = new Map<number, Gtk.Widget>();
                            notifs.subscribe((notifsList) => {
                                // Add new widgets
                                notifsList.forEach((widget, index) => {
                                    const entry = [...notifs.allNotifications.values()][
                                        notifsList.length - 1 - index
                                    ];
                                    const id = entry.notification.id;
                                    if (!widgetMap.has(id)) {
                                        console.log(`Adding widget ID ${id}: Resolved=${entry.resolved}`);
                                        widgetMap.set(id, widget);
                                        self.add(widget);
                                        widget.show(); // Ensure visibility
                                    }
                                    if (entry.resolved && widget.get_child() && widget.get_parent()) {
                                        widget.className = `${widget.className || ""} resolved`.trim();
                                    }
                                });
                                // Remove cleared widgets
                                widgetMap.forEach((widget, id) => {
                                    if (!notifs.allNotifications.has(id)) {
                                        console.log(`Removing widget ID ${id}`);
                                        self.remove(widget);
                                        widgetMap.delete(id);
                                    }
                                });
                                console.log(`Updated list: ${widgetMap.size} notifications, Children: ${self.get_children().length}`);
                            });
                        }}
                    />
                </scrollable>
            </box>
        </PopupWindow>
    );
};