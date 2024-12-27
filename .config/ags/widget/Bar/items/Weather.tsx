// /home/austin/.config/ags/widget/Bar/items/Weather.tsx
import { bind } from "astal";
import { App, Gtk } from "astal/gtk3";
import { barWeather } from "../../../service/Weather";
import BarButton from "../BarButton";
import { toggleWindow } from "../../../lib/utils";

export default () => {
    const wthr = bind(barWeather);

    return (
        <revealer
            transitionType={Gtk.RevealerTransitionType.CROSSFADE}
            transitionDuration={300}
            revealChild={wthr.as(Boolean)}
        >
            <BarButton 
            
			    onClicked={() => {
					toggleWindow("weather");
				}}
                >
                <box>
                    <label label={wthr.as((value) => value || "Loading...")} />
                </box>
            </BarButton>
        </revealer>
    );
};