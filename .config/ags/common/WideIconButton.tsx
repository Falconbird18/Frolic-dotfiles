import { App, Gtk, Gdk, Widget, Astal } from "astal/gtk3";
import { bind, execAsync, timeout, Variable } from "astal";
import icons from "../lib/icons";
import Binding, { Subscribable } from "astal/binding";
import { controlCenterPage } from "../widget/ControlCenter";
import Network from "gi://AstalNetwork?version=0.1";
import Button from "./Button";

type ControlCenterButtonProps = {
	icon: Widget.IconProps["icon"];
	label?: Widget.LabelProps["label"];
	onPrimaryClick?: () => void;
	menuName?: string;
	connection?: [Subscribable<unknown>, () => boolean];
	className?: Widget.ButtonProps["className"];
} & Widget.ButtonProps;

export default ({
	icon,
	label,
	menuName,
	onPrimaryClick,
	connection,
	className,
	...props
}: ControlCenterButtonProps) => {
	return (
		<box horizontal>
			<button
				className={`${className} control-center__button ${!label && "no-label"}`}
				setup={(self) => {
					if (connection) {
						let [service, condition] = connection;

						self.toggleClassName("active", condition());

						self.hook(service, () => {
							self.toggleClassName("active", condition());
						});
					}
				}}
				onClickRelease={(_, event: Astal.ClickEvent) => {
					if (event.button == 1 && onPrimaryClick) {
						onPrimaryClick();
					}
				}}
				{...props}
			>
				<box
					hexpand
					spacing={12}
					halign={!label ? Gtk.Align.CENTER : Gtk.Align.FILL}
				>
					<icon icon={icon} />
					{label && (
						<label
							label={label}
							halign={Gtk.Align.START}
							hexpand
							truncate
						/>
					)}
				</box>
			</button>
			<button
				className="control-center__button-icon"
				setup={(self) => {
					if (connection) {
						let [service, condition] = connection;

						self.toggleClassName("active");

						self.hook(service, () => {
							self.toggleClassName("active", condition());
						});
					}
				}}
				onClickRelease={(_, event: Astal.ClickEvent) => {
					if (event.button == 1 && menuName) {
						if (menuName == "network") {
							const network = Network.get_default();
							const { wifi } = Network.get_default();
							if (wifi == null) return;
						}
						controlCenterPage.set(menuName);
					}
				}}
				{...props}
			>
				{menuName && (
					<box hexpand={false} halign={Gtk.Align.END}>
						<icon
							halign={Gtk.Align.END}
							icon={icons.ui.arrow.right}
						/>
					</box>
				)}
			</button>
		</box>
	);
};
