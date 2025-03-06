// NotificationsStore.js
import { Variable } from "astal";
import Notifd from "gi://AstalNotifd?version=0.1";

// Create a bindable variable to hold current notifications.
const notificationsStore = Variable([]);

// Get the default Notifd instance.
const notifd = Notifd.get_default();
notifd.set_ignore_timeout(true);

// When a new notification arrives…
notifd.connect("notified", (_, id) => {
  const notification = notifd.get_notification(id);
  if (!notification) return;
  // Append the new notification to the store.
  notificationsStore.set([...notificationsStore.get(), notification]);
});

// When a notification is resolved…
notifd.connect("resolved", (_, id) => {
  // Remove the notification with the matching id.
  notificationsStore.set(
    notificationsStore.get().filter((n) => n.id !== id)
  );
});

// Export an object with a getter and subscribe() for binding.
export default {
  get notifications() {
    return notificationsStore.get();
  },
  subscribe: notificationsStore.subscribe.bind(notificationsStore),
};
