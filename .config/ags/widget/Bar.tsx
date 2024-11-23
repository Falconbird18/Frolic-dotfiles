import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import Battery from "gi://AstalBattery";

const battery = Battery.get_default();
const time = Variable("").poll(1000, "date");

// Create a variable that polls the battery percentage every 5 seconds
const batteryStatus = Variable("").poll(5000, () => {
    const percentage = battery.percentage * 100; // Convert to a percentage
    const isCharging = battery.charging;

    // Determine icon based on battery state
    if (isCharging) {
        return "🔌"; // Charging icon
    } else if (percentage > 50) {
        return "🔋"; // Full-ish battery icon
    } else if (percentage > 20) {
        return "🪫"; // Low battery icon
    } else {
        return "⚡"; // Critical battery icon
    }
});

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
                    onClick={() => print("Battery button clicked")}
                    halign={Gtk.Align.END}>
                    <label label={batteryStatus()} />
                </button>
                <box />
            </centerbox>
        </window>
    );
}
