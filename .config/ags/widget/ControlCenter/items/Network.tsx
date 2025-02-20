import { bind, Variable } from "astal";
import { spacing } from "../../../lib/variables";
import icons from "../../../lib/icons";
import ControlCenterButton from "../../../common/WideIconButton";
import { controlCenterPage } from "../index";
import Network from "gi://AstalNetwork?version=0.1";

export default () => {
	const network = Network.get_default();
	const { wifi, wired } = Network.get_default();

	var icon;

	if (wifi == null) {
		return (
			<ControlCenterButton
				name="network"
				icon={bind(wired, "iconName")}
				label={"Ethernet"}
				connection={[Variable(true), () => true]}
			/>
		);
	}

	const primary = bind(network, "primary");
	const wifiIcon = bind(wifi, "iconName");
	const wiredIcon = bind(wired, "iconName");

	// TODO: This is a hack to make sure the icon is updated when the primary network changes
	icon = Variable.derive([primary, wifiIcon], (primary, iconWifi) => {
		if (primary == Network.Primary.WIFI) {
			return iconWifi;
		} else {
			return icons.network.wired;
		}
	});

	const label = Variable.derive(
		[bind(network, "primary"), bind(wifi, "ssid")],
		(primary, ssid) => {
			if (primary == Network.Primary.WIFI) {
				return ssid || "Wi-Fi";
			} else {
				return "Wifi";
			}
		},
	);

	const menuName = "network";

	const connection = [bind(wifi, "enabled"), () => wifi.enabled];

	return (
		<box
			spacing={spacing}
		>
		<button
			onClickRelease={() => {
				if (wifi.enabled) {
					wifi.enabled = false;
				} else {
					wifi.enabled = true;
					wifi.scan();
				}
			}}
			className="primary-button-circular"
		>
			<icon icon={bind(icon)} className="h1" />
		</button>
		<box
			className="control-center-label-container"
		>
			<label label={bind(label)} className="h2"/>
		</box>
		<button
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
		>
			<icon icon={icons.ui.arrow.right} className="h1" />
		</button>
		</box>


// 		<ControlCenterButton
// 			name="network"
// 			icon={bind(icon)}
// 			label={bind(label)}
// 			connection={connection}
// 			onPrimaryClick={() => {
// 				if (wifi.enabled) {
// 					wifi.enabled = false;
// 				} else {
// 					wifi.enabled = true;
// 					wifi.scan();
// 				}
// 			}}
// 			menuName="network"
// 		/>
	);
};
