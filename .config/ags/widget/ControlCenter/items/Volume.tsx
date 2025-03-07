import AstalWp from "gi://AstalWp?version=0.1";
import { App, Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import icons from "../../../lib/icons";

export default () => {
	const speaker = AstalWp.get_default()?.audio.defaultSpeaker!;

	return (
		<box
			className={bind(speaker, "mute").as((mute) =>
				mute ? "muted" : "",
			)}
		>
			<box 
				orientation={Gtk.Orientation.HORIZONTAL} 
				spacing={10}
				className={"control-center-slider-container"}>
				<icon
					className={"icon"}
					icon={bind(speaker, "volumeIcon")}
					hexpand={false}
					halign={Gtk.Align.START}
				/>
				<slider
					draw_value={false}
					hexpand={true}
					className="control-center-slider"
					onDragged={({ value }) => {
						speaker.volume = value;
						speaker.mute = false;
					}}
					value={bind(speaker, "volume")}
				/>
			</box>
		</box>
	);
};