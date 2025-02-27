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
    reboot: "systemctl reboot",
    shutdown: "shutdown now",
    sleep: "systemctl suspend",
    logout: "hyprctl dispatch exit",
  };

  // Mapping action keys to display labels
  const actionLabels: Record<string, string> = {
    reboot: "Reboot",
    shutdown: "Shutdown",
    sleep: "Sleep",
    logout: "Log out",
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
        onClicked={() => openConfirmation("reboot")}
      >
        <label label="Reboot" />
      </button>
      <button
        className="secondary-button"
        onClicked={() => openConfirmation("shutdown")}
      >
        <label label="Shutdown" />
      </button>
      <button
        className="secondary-button"
        onClicked={() => openConfirmation("sleep")}
      >
        <label label="Sleep" />
      </button>
      <button
        className="secondary-button"
        onClicked={() => openConfirmation("logout")}
      >
        <label label="Log out" />
      </button>
      <button className="secondary-button" onClicked={closeMenu}>
        <label label="Cancel" />
      </button>
    </box>
  );
};
