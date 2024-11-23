import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import { Variable } from "astal"
import Battery from "gi://AstalBattery"

const battery = Battery.get_default()
const time = Variable("").poll(1000, "date")

export default function Bar(gdkmonitor: Gdk.Monitor) {
    return <window
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.LEFT
            | Astal.WindowAnchor.RIGHT}
        application={App}>
        <centerbox>
            <button
                onClick={() => print("hello")}
                halign={Gtk.Align.START} >
                <label label={time()} />
            </button>
            <button
                onClick={() => print("hello")}
                halign={Gtk.Align.END} >
                <label label={`${(battery.percentage * 100).toFixed(0)}%`} />
            </button>
            <box />
        </centerbox>
    </window>
}
