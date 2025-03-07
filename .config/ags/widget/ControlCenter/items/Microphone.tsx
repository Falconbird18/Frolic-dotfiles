import { bind } from "astal";
import { Gtk } from "astal/gtk3";
import ControlCenterButton from "../../../common/WideButton";
import AstalWp from "gi://AstalWp?version=0.1";
import icons from "../../../lib/icons";

export default () => {
	const mic = AstalWp.get_default()?.audio.defaultMicrophone!;

	return (
		<button
			className="primary-button"
			connection={[bind(mic, "mute"), () => !mic.mute]}
			onClick={() => (mic.mute = !mic.mute)}
		>
			<box horizontal >

				<icon
					icon={bind(mic, "mute").as(
						(muted) => icons.audio.mic[muted ? "muted" : "high"],
					)}
					className="icon"
				/>
				<box vertical>
					<label label="Microphone" className="paragraph" halign={Gtk.Align.START} />
					<label
						label={bind(mic, "mute").as((muted) =>
							muted ? "On" : "Off",
						)}
						className="subtext"
						halign={Gtk.Align.START}
					/>
				</box>
			</box>
		</button>

		// <ControlCenterButton
		// 	label={bind(mic, "mute").as((muted) =>
		// 		muted ? "Muted" : "Unmuted",
		// 	)}
		// 	icon={bind(mic, "mute").as(
		// 		(muted) => icons.audio.mic[muted ? "muted" : "high"],
		// 	)}
		// />
	);
};
