import { Gtk } from "astal/gtk3";
import { Binding, Variable } from "astal";
import { spacing } from "../../../lib/variables";
import { toggleWindow } from "../../../lib/utils";

export const selectedAction = Variable<string | null>(null);

export default ({
  revealMenu,
  closeMenu,
}: {
  revealMenu: Binding<boolean>;
  closeMenu: () => void;
}) => {

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
