import { bind } from "astal";
import { App, Gtk, Gdk } from "astal/gtk3";
import Hyprland from "gi://AstalHyprland";
import BarItem from "../BarItem";

// Configuration
const TOTAL_WORKSPACES = 10;
const SHOW_NUMBERS = false; // Toggle this to true for numbers, false for dots

export default () => {
	const hypr = Hyprland.get_default();

	const focusWorkspace = (workspaceId: number) =>
		hypr.dispatch("workspace", workspaceId.toString());

	return (
		<BarItem>
			<box spacing={8} className="bar__workspaces">
				{Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) => {
					const workspace = bind(hypr, "workspaces").as((ws) =>
						ws.find((w) => w.id === id)
					);
					const isFocused = bind(hypr, "focusedWorkspace").as(
						(fw) => fw.id === id
					);
					const hasWindows = bind(workspace).as((ws) => {
						const result = (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
						// Uncomment for debugging:
						// console.log(`Workspace ${id}: hasWindows = ${result}, clients = ${ws?.clients?.length}, windows = ${ws?.windows?.length}`);
						return result;
					});

					return bind(hasWindows).as((active) => {
						// Button class based on focus state and mode
						const buttonClass = bind(isFocused).as((focused) =>
							focused
								? SHOW_NUMBERS
									? "bar__workspaces-indicator-number active"
									: "bar__workspaces-indicator dot active"
								: SHOW_NUMBERS
								? "bar__workspaces-indicator-number"
								: "bar__workspaces-indicator dot"
						);

						// Button content: numbers or nothing (dot styled via CSS)
						const buttonContent = SHOW_NUMBERS ? (
							<label label={id.toString()} />
						) : null;

						const button = (
							<button
								valign={Gtk.Align.CENTER}
								className={buttonClass}
								onClicked={() => focusWorkspace(id)}
							>
								{buttonContent}
							</button>
						);

						return active ? (
							<box className="bar__workspaces-active">{button}</box>
						) : (
							button
						);
					});
				})}
			</box>
		</BarItem>
	);
};