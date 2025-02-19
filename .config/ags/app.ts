import { App, Gdk, Gtk } from "astal/gtk3";
import { exec } from "astal";
import Theme from "./widget/Popups/menus/ThemeSettings";
const { GLib } = imports.gi;
// const style = require(`../ags/style/frolic${Theme}/main.scss`);
import { currentTheme, currentMode } from "./widget/Popups/menus/ThemeSettings";
import Bar from "./widget/Bar";
import ControlCenter from "./widget/ControlCenter";
import AppLauncher from "./widget/AppLauncher";
import NotificationsPopup from "./widget/Notifications/NotificationsPopup";
import Weather from "./widget/Weather/Weather";
import SideBar from "./widget/SideBar/SideBar";
import ThemeSettings from "./widget/Popups/menus/ThemeSettings";
import Notifications from "./widget/Notifications";
import OSD from "./widget/OSD";
import { toggleWindow } from "./lib/utils";
import Scrim from "./widget/Scrims/Scrim";
import SinkMenu from "./widget/Popups/menus/Sink";
import MixerMenu from "./widget/Popups/menus/Mixer";
import Verification from "./widget/Powermenu/Verification";
import Powermenu from "./widget/Powermenu";
import ScreenRecordService from "./service/ScreenRecord";
import Dashboard from "./widget/Dashboard";

const applyTheme = () => {
  const homeDir = GLib.get_home_dir();
  const theme = currentTheme.get();
  const mode = currentMode.get();
  const themePathCss = `${homeDir}/.config/ags/style/${theme}${mode}/main.css`;
  const themePathScss = `${homeDir}/.config/ags/style/${theme}${mode}/main.scss`;
  const spicetifyPathScss = `${homeDir}/.config/ags/style/${theme}${mode}/spicetify.scss`;
  const spicetifyPathCss = `${homeDir}/.config/spicetify/Themes/Frolic/user.css`;
  exec(`sass ${themePathScss} ${themePathCss}`);
  exec(`sass ${spicetifyPathScss} ${spicetifyPathCss}`);
  console.log("Scss compiled");
  App.reset_css();
  App.apply_css(themePathCss);
  exec("spicetify update");
  console.log("Compiled css applied");
};

function main() {
  const bars = new Map<Gdk.Monitor, Gtk.Widget>();
  const notificationsPopups = new Map<Gdk.Monitor, Gtk.Widget>();
  const osds = new Map<Gdk.Monitor, Gtk.Widget>();

  Notifications();
  Weather();
  SideBar();
  ThemeSettings();
  ControlCenter();
  Scrim({ scrimType: "opaque", className: "scrim" });
  Scrim({ scrimType: "transparent", className: "transparent-scrim" });
  SinkMenu();
  MixerMenu();
  Verification();
  Powermenu();
  Dashboard();
  AppLauncher();

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

  applyTheme();

  currentTheme.subscribe(applyTheme);
  currentMode.subscribe(applyTheme);
}

App.start({
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
