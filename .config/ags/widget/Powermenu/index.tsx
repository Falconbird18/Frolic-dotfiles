import PopupWindow from "../../common/PopupWindow";
import { App } from "astal/gtk3";
import { spacing } from "../../lib/variables";
import { exec } from "astal";
import { toggleWindow } from "../../lib/utils";
import { selectedAction } from "../ControlCenter/items/ShutDownMenu"; // import shared state

// Mapping action keys to system commands
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

type ConfirmationPopupProps = {
  // onConfirm will execute the selected command
  onConfirm?: () => void;
  // onCancel will simply hide the popup
  onCancel?: () => void;
};

const ConfirmationPopup = (
  { onConfirm, onCancel }: ConfirmationPopupProps = {}
) => {
  // Retrieve the currently selected action from shared state
  const actionKey = selectedAction.value;
  const labelText = actionKey ? actionLabels[actionKey] : "Confirm";

  const confirmAction = () => {
    if (actionKey) {
      exec(actionCommands[actionKey]).catch((error) => {
        console.error(`Error executing ${actionKey} command:`, error);
      });
    }
    toggleWindow("confirmationPopup");
    onConfirm && onConfirm();
  };

  const cancelAction = () => {
    toggleWindow("confirmationPopup");
    onCancel && onCancel();
  };

  return (
    <PopupWindow
      application={App}
      scrimType="opaque"
      name="confirmationPopup"
      namespace="confirmation"
      onKeyPressEvent={(self, event) => {
        const [keyEvent, keyCode] = event.get_keycode();
        if (keyEvent && keyCode === 9) {
          // Optional: handle Tab key event for focus management
        }
      }}
    >
      <box className={"confirmation-popup"} spacing={spacing}>
        <button className="primary-button" onClicked={confirmAction}>
          <label label={labelText} />
        </button>
        <button className="secondary-button" onClicked={cancelAction}>
          <label label="Cancel" />
        </button>
      </box>
    </PopupWindow>
  );
};

export default ConfirmationPopup;