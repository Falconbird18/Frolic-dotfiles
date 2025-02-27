import { Gtk } from "astal/gtk3";
import { Binding, Variable, bind, exec, execAsync, timeout } from "astal";
import { spacing } from "../../../lib/variables";

export default ({
  revealMenu,
  closeMenu,
}: {
  revealMenu: Binding<boolean>;
  closeMenu: () => void;
}) => {
  const reboot = Variable("normal");

  const rebootCommands: Record<string, string> = {
    reboot: "systemctl reboot",
    shutdown: "shutdown now",
    sleep: "systemctl suspend",
    logout: "hyprctl dispatch exit",
  };

  const setReboot = (option: string) => {
    reboot.value = option;
    exec(rebootCommands[option]).catch(error => {
      console.error("Error executing reboot command:", error);
    });
  };

  return (
    <box
      vertical
      className={"card"}
      spacing={spacing}
      visible={revealMenu}
      halign={Gtk.Align.FILL}
    >
      <button className="secondary-button" onClicked={() => setReboot("reboot")}>
        <label label="Reboot" />
      </button>
      <button className="secondary-button" onClicked={() => setReboot("shutdown")}>
        <label label="Shutdown" />
      </button>
      <button className="secondary-button" onClicked={() => setReboot("sleep")}>
        <label label="Sleep" />
      </button>
      <button className="secondary-button" onClicked={() => setReboot("logout")}>
        <label label="Log out" />
      </button>
      <button className="secondary-button" onClicked={closeMenu}>
        <label label="Cancel" />
      </button>
    </box>
  );
};
