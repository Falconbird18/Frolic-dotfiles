import { App, Gtk, Widget, astalify, ConstructProps } from "astal/gtk3";
import { bind, execAsync, GObject, Variable } from "astal";
import { spacing, uptime } from "../../../lib/variables";
import NetworkButton from "../items/Network";
import Volume from "../items/Volume";
import DND from "../items/DND";
import Microphone from "../items/Microphone";
import icons from "../../../lib/icons";
import Brightness from "../items/Brightness";
import FanProfileButton from "../items/FanProfile";
import ScreenRecord from "../items/ScreenRecord";
import ScreenRecordMenu from "../items/ScreenRecordMenu";
import ScreenRecordService from "../../../service/ScreenRecord";
import BluetoothButton from "../items/Bluetooth";
import ScreenSnip from "../items/ScreenSnip";
import ScreenShot from "../items/ScreenShot";
import { toggleWindow } from "../../../lib/utils";

class FlowBox extends astalify(Gtk.FlowBox) {
  static {
    GObject.registerClass(this);
  }

  constructor(
    props: ConstructProps<Gtk.FlowBox, Gtk.FlowBox.ConstructorProps>,
  ) {
    super(props as any);
  }
}

export default () => {
  const revealScreenRecord = Variable(false);

  const fb = new FlowBox({
    homogeneous: true,
    selectionMode: Gtk.SelectionMode.NONE,
    maxChildrenPerLine: 2,
    minChildrenPerLine: 2,
    rowSpacing: spacing,
    columnSpacing: spacing,
  });

//   const FanProfile = FanProfileButton();
//   const Network = NetworkButton();
//   const Bluetooth = BluetoothButton();
  <button
  className="control-center__settings-button"
  onClick={() => toggleWindow("popup-theme-settings")}
>
  <icon icon={icons.ui.settings} iconSize={16} />
</button>
  // fb.add(
  //   new Widget.Box({
  //     spacing,
  //     className: "control-center__settings-container",
  //     children: [
  //       fb.add(Network),
  //       fb.add(Bluetooth),
  //       fb.add(FanProfile),
  //     ]
  //   })
  // )
  const settingsContainer = new Widget.Box({
    spacing,
    className: "control-center__settings-container",
    children: [], // Start with an empty children array
  });

  const Network = NetworkButton();
  if (Network) {
    settingsContainer.children.push(Network); // Push the Network widget directly
  }

  const Bluetooth = BluetoothButton();
  if (Bluetooth) {
    settingsContainer.children.push(Bluetooth); // Push the Bluetooth widget directly
  }

  const FanProfile = FanProfileButton();
  if (FanProfile) {
    settingsContainer.children.push(FanProfile); // Push the FanProfile widget directly
  }

  fb.add(settingsContainer); // Add the settingsContainer (containing the buttons) to the FlowBox

  fb.add(Microphone());
  fb.add(DND());
  fb.add(
    new Widget.Box({
      spacing,
      homogeneous: true,
      children: [
        ScreenRecord({
          onClicked: () => {
            if (ScreenRecordService.recording) {
              ScreenRecordService.stop();
            } else {
              revealScreenRecord.set(!revealScreenRecord.get());
            }
          },
        }),
      ],
    }),
  );
  fb.add(
    new Widget.Box({
      spacing,
      homogeneous: true,
      children: [
        ScreenShot(),
        ScreenSnip(),
      ],
    }),
  );

  return (
    <box
      name="main"
      className="control-center__page main"
      vertical
      spacing={spacing}
    >
      {fb}
      <ScreenRecordMenu
        revealMenu={bind(revealScreenRecord)}
        closeMenu={() => revealScreenRecord.set(!revealScreenRecord.get())}
      />
      <box
        horizontal
        spacing={spacing}
      >
        <Volume />
        {Brightness()}
      </box>
      <box spacing={16} className="control-center__footer">
        <button
          className="control-center__powermenu-button"
          onClick={() => toggleWindow("powermenu")}
        >
          <icon icon={icons.powermenu.shutdown} iconSize={16} />
        </button>
        <box hexpand />
        <label className="control-center__time-to-empty" label={bind(uptime)} />
        <button
          className="control-center__settings-button"
          onClick={() => toggleWindow("popup-theme-settings")}
        >
          <icon icon={icons.ui.settings} iconSize={16} />
        </button>
      </box>
    </box>
  );
};
