import { bind, Variable } from "astal";
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import ControlCenterButton from "../../../common/WideIconButton";
import { controlCenterPage } from "../index";
import Bluetooth from "gi://AstalBluetooth?version=0.1";

export default () => {
  const bluetooth = Bluetooth.get_default();

  if (!bluetooth) {
    return null;
  }

  const isPowered = bind(bluetooth, "isPowered");
  const bluetoothIcon = bind(bluetooth, "isPowered").as(
    (p) => icons.bluetooth[p ? "enabled" : "disabled"],
  );

  const label = Variable.derive(
    [bind(bluetooth, "isConnected"), bind(bluetooth, "devices")],
    (isConnected, devices) => {
      if (isConnected) {
        const connectedDevices = devices.filter((device) => device.connected);
        if (connectedDevices[0]) {
          return connectedDevices[0].name;
        } else {
          return "Bluetooth";
        }
      } else {
        return "Bluetooth";
      }
    },
  );

  // Derive the button class name based on isPowered
  const buttonClassName = bind(bluetooth, "isPowered").as((p) =>
    p ? "primary-button-circular active" : "primary-button-circular",
  );

  const menuName = "bluetooth";
  const connection = [bind(bluetooth, "isPowered"), () => bluetooth.isPowered];

  return (
    <box spacing={spacing}>
      <button
        onClickRelease={() => bluetooth.toggle()}
        // Use the derived buttonClassName here
        className={bind(buttonClassName)}
        // Remove the setup function as it's no longer needed
      >
        <icon icon={bind(bluetoothIcon)} className="h1" />
      </button>
      <box className="control-center-label-container">
        <label label={bind(label)} className="h2" />
      </box>
      <button
        onClickRelease={(_, event: Astal.ClickEvent) => {
          if (event.button == 1 && menuName) {
            controlCenterPage.set(menuName);
          }
        }}
      >
        <icon icon={icons.ui.arrow.right} className="h1" />
      </button>
    </box>
  );
};
