import { App, Gtk, Gdk, Widget, Astal } from "astal/gtk3";
import { bind, timeout, Variable, GLib } from "astal";
import Notifd from "gi://AstalNotifd?version=0.1";
import Notification from "./Notification";
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";
import { Subscribable } from "astal/binding";

/**
 * Wrap the Notification widget so that it tracks whether it’s been destroyed.
 * This is our helper so that later we don’t try to re-manipulate a dead widget.
 */
function createNotificationWidget(notification) {
  // Create the widget using your existing Notification code.
  const widget = Notification({
    notification,
    onHoverLost: () => {},
    setup: (self) => {},
  });

  // Add a custom flag.
  widget._destroyed = false;

  // Wrap the original destroy function so that we mark _destroyed.
  const originalDestroy = widget.destroy.bind(widget);
  widget.destroy = () => {
    if (!widget._destroyed) {
      widget._destroyed = true;
      originalDestroy();
    }
  };

  return widget;
}

class NotificationsMap implements Subscribable {
  // Maps to track notifications.
  private activeWidgets: Map<number, Gtk.Widget> = new Map();
  // We keep allNotifications public so that our UI subscription can access it.
  public allNotifications: Map<
    number,
    { widget: Gtk.Widget; resolved: boolean; notification: Notifd.Notification }
  > = new Map();
  private var: Variable<Array<Gtk.Widget>> = Variable([]);

  // Notify our binding variable with the updated list.
  private notify() {
    // We reverse so the most recent ones come out first.
    const widgets = [...this.allNotifications.values()].map(entry => entry.widget).reverse();
    console.log(`Notify called. Total: ${this.allNotifications.size}, Widgets: ${widgets.length}`);
    this.var.set(widgets);
  }

  constructor() {
    const notifd = Notifd.get_default();
    notifd.set_ignore_timeout(true);

    // When a new notification arrives…
    notifd.connect("notified", (_, id) => {
      console.log(`New notification: ID ${id}, Summary: ${notifd.get_notification(id)?.summary}`);
      const notification = notifd.get_notification(id);
      if (!notification) return;
      // Create our wrapped widget.
      const widget = createNotificationWidget(notification);
      this.set(id, widget, notification);
    });

    // When a notification is resolved…
    notifd.connect("resolved", (_, id) => {
      const entry = this.allNotifications.get(id);
      if (entry) {
        console.log(`Resolved: ID ${id}`);
        entry.resolved = true;
        // Remove from the active map.
        this.activeWidgets.delete(id);
        // Close the widget (if not already destroyed).
        if (!entry.widget._destroyed) {
          entry.widget.close(() => {});
        }
        this.notify();
      }
    });
  }

  private set(key: number, value: Gtk.Widget, notification: Notifd.Notification) {
    // If a widget already exists for this key, destroy it.
    const oldWidget = this.activeWidgets.get(key);
    if (oldWidget && typeof oldWidget.destroy === "function") {
      oldWidget.destroy();
    }
    this.activeWidgets.set(key, value);
    this.allNotifications.set(key, { widget: value, resolved: false, notification });
    console.log(`Set ID ${key}. Active: ${this.activeWidgets.size}, All: ${this.allNotifications.size}`);
    this.notify();
  }

  clearAll(widgetContainer?: Widget.Box) {
    console.log("Clearing all notifications");

    // First, remove each widget from its parent if possible.
    if (widgetContainer) {
      this.allNotifications.forEach((entry) => {
        if (!entry.widget._destroyed && entry.widget.get_parent() === widgetContainer) {
          widgetContainer.remove(entry.widget);
        }
      });
    }

    // Destroy all widgets using our safe flag check.
    this.activeWidgets.forEach((widget) => {
      if (!widget._destroyed && widget.get_parent()) {
        widget.destroy();
      }
    });
    this.allNotifications.forEach((entry) => {
      if (!entry.widget._destroyed && entry.widget.get_parent()) {
        entry.widget.destroy();
      }
    });

    // Clear our maps and update the UI binding.
    this.activeWidgets.clear();
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
        <box halign={Gtk.Align.FILL} spacing={6}>
          <label label={bind(notifs).as(n => `Notifications (${n.length})`)} className="h1" />
          <button
            className="primary-button"
            onClicked={(self) => {
              // Determine the container holding the notification widgets.
              const widgetContainer = self.get_parent()?.get_parent()?.get_parent() as Widget.Box;
              notifs.clearAll(widgetContainer);
            }}
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
              // Map to track widgets already added to this container.
              const widgetMap = new Map<number, Gtk.Widget>();
              notifs.subscribe((notifsList) => {
                // Process notifications that should be added or updated.
                notifsList.forEach((widget, index) => {
                  const entries = [...notifs.allNotifications.values()];
                  const entry = entries[notifsList.length - 1 - index];
                  if (!entry) return;
                  const id = entry.notification.id;
                  if (!widgetMap.has(id) && !widget._destroyed) {
                    console.log(`Adding widget ID ${id}: Resolved=${entry.resolved}`);
                    widgetMap.set(id, widget);
                    self.add(widget);
                    widget.show();
                  }
                  // Update class for resolved notifications, if the widget is still valid.
                  if (entry.resolved && !widget._destroyed && widget.get_parent()) {
                    widget.className = `${widget.className || ""} resolved`.trim();
                  }
                });
                // Remove widgets that are no longer present.
                widgetMap.forEach((widget, id) => {
                  if (!notifs.allNotifications.has(id)) {
                    console.log(`Removing widget ID ${id}`);
                    if (!widget._destroyed && widget.get_parent()) {
                      try {
                        self.remove(widget);
                      } catch (e) {
                        console.error(`Error while removing widget ID ${id}:`, e);
                      }
                    }
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
