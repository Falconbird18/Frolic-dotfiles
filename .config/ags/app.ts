import { App, Gdk, Gtk } from "astal/gtk3";
import style from "./style/main.scss";
import Bar from "./widget/Bar";
import ControlCenter from "./widget/ControlCenter";
import NotificationsPopup from "./widget/Notifications/NotificationsPopup";
import Weather from "./widget/Weather/Weather";
import ThemeSettings from "./widget/ThemeSettings/ThemeSettings";
import Arch from "./widget/Arch";
import Notifications from "./widget/Notifications";
import OSD from "./widget/OSD";
import {
	monitorColorsChange,
	monitorDashboard,
	toggleWindow,
} from "./lib/utils";
import Scrim from "./widget/Scrims/Scrim";
import SinkMenu from "./widget/Popups/menus/Sink";
import MixerMenu from "./widget/Popups/menus/Mixer";
import Verification from "./widget/Powermenu/Verification";
import Powermenu from "./widget/Powermenu";
import ScreenRecordService from "./service/ScreenRecord";
import Dashboard from "./widget/Dashboard";

function main() {
	const bars = new Map<Gdk.Monitor, Gtk.Widget>();
	const notificationsPopups = new Map<Gdk.Monitor, Gtk.Widget>();
	const osds = new Map<Gdk.Monitor, Gtk.Widget>();

	Notifications();
	Weather();
	ThemeSettings();
	ControlCenter();
	Arch();
	Scrim({ scrimType: "opaque", className: "scrim" });
	Scrim({ scrimType: "transparent", className: "transparent-scrim" });
	SinkMenu();
	MixerMenu();
	Verification();
	Powermenu();
	Dashboard();

	for (const gdkmonitor of App.get_monitors()) {
		bars.set(gdkmonitor, Bar(gdkmonitor));
		notificationsPopups.set(gdkmonitor, NotificationsPopup(gdkmonitor));
		osds.set(gdkmonitor, OSD(gdkmonitor));
	}

	App.connect("monitor-added", (_, gdkmonitor) => {
		bars.set(gdkmonitor, Bar(gdkmonitor));
		notificationsPopups.set(gdkmonitor, NotificationsPopup(gdkmonitor));
		osds.set(gdkmonitor, OSD(gdkmonitor));
	});

	App.connect("monitor-removed", (_, gdkmonitor) => {
		bars.get(gdkmonitor)?.destroy();
		notificationsPopups.get(gdkmonitor)?.destroy();
		osds.get(gdkmonitor)?.destroy();
		bars.delete(gdkmonitor);
		notificationsPopups.delete(gdkmonitor);
		osds.delete(gdkmonitor);
	});

	monitorColorsChange();
	monitorDashboard();
}

App.start({
	css: style,
	main: main,
	requestHandler(request: string, res: (response: any) => void) {
		const args = request.split(" ");
		if (args[0] == "toggle") {
			toggleWindow(args[1]);
			res("ok");
		} else if (args[0] == "record") {
			if (args[1] == "start") {
				ScreenRecordService.start();
				res("Record started");
			} else if (args[1] == "stop") {
				ScreenRecordService.stop();
				res("Record stopped");
			}
			return res("unknown command");
		} else {
			res("unknown command");
		}
	},
});
