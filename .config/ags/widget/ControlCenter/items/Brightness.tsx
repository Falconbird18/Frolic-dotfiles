import AstalWp from "gi://AstalWp?version=0.1";
import { Widget, Gtk } from "astal/gtk3";
import { bind } from "astal";
import icons from "../../../lib/icons";
import BrightnessService from "../../../service/Brightness";

export default () => {
	if (BrightnessService)
		return (
			<box
				orientation={Gtk.Orientation.HORIZONTAL}
				spacing={10}
				classname={"control-center-slider-container"}
			>
				<icon
					className={"icon"}
					icon={icons.brightness.screen}
					hexpand={false}
					halign={Gtk.Align.START}
				/>
				<slider
					draw_value={false}
					hexpand={true}
					className="control-center-slider"
					onDragged={({ value }) =>
						(BrightnessService!.screen = value)
					}
					value={bind(BrightnessService).as((b) => b.screen)}
				/>
			</box>
		);
};