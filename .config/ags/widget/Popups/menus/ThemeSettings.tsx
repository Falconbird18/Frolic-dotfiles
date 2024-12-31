import { bind } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
import { spacing } from "../../../lib/variables";
import PopupWindow from "../../../common/PopupWindow";
import { feelsTemp, humidity, location, precipitation, pressure, realTemp, uvIndex, wind } from "../../../service/Weather";
import icons from "../../../lib/icons";
import PopupMenu from "../PopupMenu";

const temperature = bind(realTemp);
const feelsTemperature = bind(feelsTemp);
const uv = bind(uvIndex);
const Wind = bind(wind);
const Precipitation = bind(precipitation);
const Pressure = bind(pressure);
const Humidity = bind(humidity);

const displayLocation = location.replace(",", ", ")
const icon = icons.ui.edit

const Entry = new Widget.Entry({
    text: "Test",
    canFocus: true,
    className: "location_input",
    // onActivate: () => {
    //     items.get()[0]?.app.launch();
    //     App.toggle_window("app-launcher");
    // },
    // setup: (self) => {
    //     self.hook(self, "notify::text", () => {
    //         query.set(self.get_text());
    //     });
    // },
});

export default () => {
    return (
        <PopupMenu
            vexpand={true}
            name="theme-settings"
            namespace="theme-settings"
            label="theme-settings"
        >
            <box
                vertical
                className="theme-settings"
                spacing={spacing}
            >
                <box
                    horizontal
                    className="location-header-container"
                >
                    <label
                        label={displayLocation}
                        className="location"
                        halign={Gtk.Align.START}
                    />
                    <box
                        horizontal
                        halign={Gtk.Align.CENTER}
                    >
                        <button
                            className="icon-button"
                            valign={Gtk.Align.CENTER}
                        >
                            <icon
                                icon={icon}
                            />
                        </button>
                    </box>
                </box>
                {Entry}
                <label
                    label={temperature}
                    className="temperature"
                    halign={Gtk.Align.START}

                />
                <box horizontal className="weather-info" spacing={spacing}>
                    <box vertical className="weather-info-title">
                        <label label="Humidity" />
                        <label label={Humidity} />
                    </box>
                    <box vertical className="weather-info-title">
                        <label label="Wind" />
                        <label label={Wind} />
                    </box>
                    <box vertical className="weather-info-title">
                        <label label="Precipitation" />
                        <label label={Precipitation} />
                    </box>
                    <box vertical className="weather-info-title">
                        <label label="Pressure" />
                        <label label={Pressure} />
                    </box>
                    <box vertical className="weather-info-title">
                        <label label="UV Index" />
                        <label label={uv} />
                    </box>
                    <box vertical className="weather-info-title">
                        <label label="Feels like" />
                        <label label={feelsTemperature} />
                    </box>
                </box>
            </box>
        </PopupMenu>
    );
};