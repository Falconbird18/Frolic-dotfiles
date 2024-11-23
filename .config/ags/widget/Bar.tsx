import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import Battery from "gi://AstalBattery";

const battery = Battery.get_default();

// Function to get the current battery status icon
const getBatteryStatusIcon = () => {
    const percentage = battery.percentage * 100; // Convert to a percentage
    const isCharging = battery.charging;

    if (isCharging) {
        return "battery-full-charging"; // Charging icon from GTK
    } else if (percentage > 50) {
        return "battery-full"; // Battery more than 50%
    } else if (percentage > 20) {
        return "battery-caution"; // Battery between 20% and 50%
    } else {
        return "battery-empty"; // Critical battery level
    }
};

// Create a reactive variable for the battery icon
const batteryIcon = Variable(getBatteryStatusIcon());

// Poll for battery status every 5 seconds
setInterval(() => {
    batteryIcon.set(getBatteryStatusIcon()); // Update the variable with the latest icon
}, 5000);

// Reactive variable to hold the current time, updated every second
const time = Variable(() => new Date().toLocaleTimeString()).poll(1000); // Update every second

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
                    <label label={time()} /> {/* Use the reactive variable directly */}
                </button>
                <button
                    onClick={() => {
                        print(batteryIcon.get()); // Directly print the reactive variable
                    }}
                    halign={Gtk.Align.END}>
                    <icon
                        icon={batteryIcon()} // Bind the icon directly to the reactive variable
                    />
                </button>
                <box />
            </centerbox>
        </window>
    );
}
