import { App, Gtk, Widget, astalify, ConstructProps } from "astal/gtk3";
import { bind, execAsync, GObject, Variable } from "astal";
import icons from "/home/austin/.config/ags/lib/icons";

export default () => {
  const revealScreenRecord = Variable(false);

  return (
      <box className="arch-container">
        <button
          className="control-center__powermenu-button"
          onClick={() => execAsync("wofi")}
        >
          <icon icon={icons.arch} Size={20} />
        </button>
        <box/>
      </box>
  );
};
