import PopupWindow from "../../common/PopupWindow";
import { App } from "astal/gtk3";
import PowermenuService, { PowerMenuAction } from "../../service/Powermenu";
import { ButtonProps } from "astal/gtk3/widget";
import icons from "../../lib/icons";
import { toggleWindow } from "../../lib/utils";
import { Gtk } from "astal/gtk3";

type PowermenuButtonProps = {
  action: PowerMenuAction;
  iconName: string;
} & ButtonProps;

const PowermenuButton = ({ action, iconName }: PowermenuButtonProps) => (
  <box orientation={Gtk.Orientation.VERTICAL}>
    <button
      className={`powermenu__button`}
      onClicked={() => PowermenuService.action(action)}
    >
      <icon icon={iconName} className={`powermenu__button_icon`} />
    </button>
    <label className="powermenu__label">{action}</label>
  </box>
);

export default () => {
  return (
    <PopupWindow
      application={App}
      scrimType="opaque"
      name="powermenu"
      namespace="powermenu"
      onKeyPressEvent={(self, event) => {
        const [keyEvent, keyCode] = event.get_keycode();
        if (keyEvent && keyCode == 9) {
          toggleWindow(self.name);
        }
      }}
    >
      <box vertical className={"powermenu"}>
        <box horizantal spacing={24}>
          <PowermenuButton
            action="shutdown"
            iconName={icons.powermenu.shutdown}
          />
          <PowermenuButton action="reboot" iconName={icons.powermenu.reboot} />
        </box>
        <box horizantal spacing={24}>
          <PowermenuButton action="sleep" iconName={icons.powermenu.sleep} />
          <PowermenuButton action="logout" iconName={icons.powermenu.logout} />
        </box>
      </box>
    </PopupWindow>
  );
};
