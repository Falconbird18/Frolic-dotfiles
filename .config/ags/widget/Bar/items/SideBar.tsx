import { App, Gtk, Widget } from "astal/gtk3";
import BarButton from "../BarButton";
import { toggleWindow } from "../../../lib/utils";
import icons from "../../../lib/icons";

export default () => (
  <box className="arch-container">
    <button
      className="control-center__powermenu-button"
      onClick={() => {
        toggleWindow("SideBar");
      }}
    >
      <icon icon={icons.arch} Size={20} />
    </button>
    <box />
  </box>
);