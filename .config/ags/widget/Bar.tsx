import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import Battery from "gi://AstalBattery";

const battery = Battery.get_default();
const time = Variable("").poll(1000, "date");

const getBatteryStatusIcon = () => {
    const percentage = battery.percentage * 100; // Convert to a percentage
    const isCharging = battery.charging;

    // Directly return a string based on the battery status
    if (isCharging) {
        return "battery-full-charging"; // Charging icon from GTK
    } else if (percentage > 50) {
        return "battery-empty"; // Battery more than 50%
    } else if (percentage > 20) {
        return "battery-caution"; // Battery between 20% and 50%
    } else {
        return "battery-empty"; // Critical battery level
    }
};

// You can now call this function directly
Gtk.IconTheme.get_default().rescan_if_needed(); // Ensure icons are loaded

export default function Bar(gdkmonitor: Gdk.Monitor) {
    return (
        <window
            className="Bar"
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={
                Astal.WindowAnchor.TOP |
                Astal.WindowAnchor.LEFT |
                Astal.WindowAnchor.RIGHT
            }
            application={App}>
            <centerbox>
                <button
                    onClick={() => print("hello")}
                    halign={Gtk.Align.START}>
                    <label label={time()} />
                </button>
                <button
                    onClick={() => {
                        // Now this will print the icon name directly
                        print(getBatteryStatusIcon());
                    }}
                    halign={Gtk.Align.END}>
                    <icon
                        icon={getBatteryStatusIcon()} // Use the resolved value
                    />
                </button>
                <box />
            </centerbox>
        </window >
    );
}