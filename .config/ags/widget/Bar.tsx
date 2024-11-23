import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable } from "astal";
import Battery from "gi://AstalBattery";

const battery = Battery.get_default();

// Function to get the current battery status icon
const getBatteryStatusIcon = () => {
    const percentage = battery.percentage * 100; // Convert to a percentage
    const isCharging = battery.charging;

    if (isCharging) {
        if (percentage === 100) {
            return "battery-full-charging"; // Charging icon from GTK
        } else if (percentage > 75) {
            return "battery-full-charging"; 
        } else if (percentage > 50) {
            return "battery-caution-charging";
        } else {
            return "battery-low-charging"; // Battery between 0% and 50%
        }
    } else {
        if (percentage === 100) {
            return "battery-full"; // Battery full and not charging
        } else if (percentage > 75) {
            return "battery-full"; // Battery between 50% and 99%
        } else if (percentage > 50) {
            return "battery-caution";
        } else {
            return "battery-low"; // Battery between 0% and 49%
        }
    }
};

// Create a reactive variable for the battery icon
const batteryIcon = Variable(getBatteryStatusIcon());

// Poll for battery status every 5 seconds
setInterval(() => {
    batteryIcon.set(getBatteryStatusIcon()); // Update the variable with the latest icon
}, 5000);

// Reactive variable to hold the current time, updated every second
const time = Variable("").poll(1000, "date")

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
                    className="battery"
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
