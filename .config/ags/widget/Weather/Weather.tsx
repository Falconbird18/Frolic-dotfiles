import { bind } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";
import { feelsTemp, humidity, location, precipitation, pressure, realTemp, uvIndex, wind } from "../../service/Weather";
import icons from "../../lib/icons";

const temperature = bind(realTemp).as(value => value || "N/A");
const feelsTemperature = bind(feelsTemp).as(value => value || "N/A");
const uv = bind(uvIndex).as(value => value || "N/A");
const Wind = bind(wind).as(value => value || "N/A");
const Precipitation = bind(precipitation).as(value => value || "N/A");
const Pressure = bind(pressure).as(value => value || "N/A");
const Humidity = bind(humidity).as(value => value || "N/A");

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
        <PopupWindow
            scrimType="transparent"
            layer={Astal.Layer.OVERLAY}
            visible={false}
            margin={12}
            vexpand={true}
            keymode={Astal.Keymode.EXCLUSIVE}
            name="weather"
            namespace="weather"
            className="weather"
            exclusivity={Astal.Exclusivity.NORMAL}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            application={App}
            onKeyPressEvent={(self, event) => {
                const [keyEvent, keyCode] = event.get_keycode();
                if (keyEvent && keyCode == 9) {
                    App.toggle_window(self.name);
                }
            }}
        >
            <box vertical className="weather-window" spacing={spacing}>
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
        </PopupWindow>
    );
};