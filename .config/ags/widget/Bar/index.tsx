import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import Workspaces from "./items/Workspaces";
import { spacing } from "../../lib/variables";
import ActiveApp from "./items/ActiveApp";
import Clock from "./items/Clock";
import Battery from "./items/Battery";
import Tray from "./items/Tray";
import SystemIndicators from "./items/SystemIndicators";
import Notifications from "./items/Notifications";
import Arch from "./items/Arch";
import Weather from "./items/Weather";
import RecordingIndicator from "./items/RecordingIndicator";
import SideBar from "./items/SideBar";

const Start = () => {
  return (
    <box halign={Gtk.Align.START} spacing={spacing}>
      <SideBar />
      <Workspaces />
      <ActiveApp />
    </box>
  );
};

const Center = () => {
  return (
    <box halign={Gtk.Align.CENTER} spacing={spacing}>
      <Clock />
    </box>
  );
};

const End = () => {
  return (
    <box halign={Gtk.Align.END} spacing={spacing}>
      <RecordingIndicator />
      <Weather />
      <Notifications />
      <SystemIndicators />
      <Battery />
      <Tray />
      <Arch />
    </box>
  );
};

export default function Bar(gdkmonitor: Gdk.Monitor) {
  return (
    <window
      vexpand={true}
      className="Bar"
      namespace="bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT
      }
      application={App}
    >
      <centerbox className="bar" valign={Gtk.Align.CENTER}>
        <Start />
        <Center />
        <End />
      </centerbox>
    </window>
  );
}
