import { Gtk } from "astal/gtk3";
import { Binding, Variable } from "astal";
import { spacing } from "../../../lib/variables";
import { toggleWindow } from "../../../lib/utils";

// Shared state for the selected action.
// In a real app, consider lifting this state to a common parent or using a global store.
export const selectedAction = Variable<string | null>(null);

export default ({
  revealMenu,
  closeMenu,
}: {
  revealMenu: Binding<boolean>;
  closeMenu: () => void;
}) => {
  // Mapping action keys to system commands (for use later upon confirmation)
  const actionCommands: Record<string, string> = {
    normal: "reboot",
    safeMode: "systemctl reboot --firmware-setup",
    powerOff: "poweroff",
    restartUI: "systemctl restart display-manager",
  };

  // Mapping action keys to display labels
  const actionLabels: Record<string, string> = {
    normal: "Reboot",
    safeMode: "Reboot to Firmware",
    powerOff: "Shutdown",
    restartUI: "Restart UI",
  };

  // When an option is clicked, record the action and toggle (show) the confirmation window.
  const openConfirmation = (action: string) => {
    selectedAction.value = action;
    toggleWindow("confirmationPopup");
  };

  return (
    <box
      vertical
      className={"card"}
      spacing={spacing}
      visible={revealMenu}
      halign={Gtk.Align.FILL}
    >
      <button
        className="secondary-button"
        onClicked={() => openConfirmation("normal")}
      >
        <label label="Reboot" />
      </button>
      <button
        className="secondary-button"
        onClicked={() => openConfirmation("safeMode")}
      >
        <label label="Reboot to Firmware" />
      </button>
      <button
        className="secondary-button"
        onClicked={() => openConfirmation("powerOff")}
      >
        <label label="Shutdown" />
      </button>
      <button
        className="secondary-button"
        onClicked={() => openConfirmation("restartUI")}
      >
        <label label="Restart UI" />
      </button>
      <button className="secondary-button" onClicked={closeMenu}>
        <label label="Cancel" />
      </button>
    </box>
  );
};
