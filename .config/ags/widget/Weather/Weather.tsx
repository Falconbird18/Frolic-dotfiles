import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";
import {
  feelsTemp,
  humidity,
  location,
  precipitation,
  pressure,
  realTemp,
  updateWeatherCommands,
  uvIndex,
  wind,
  loadLocation,
  setLocation,
  weatherDescription,
} from "../../service/Weather";
import icons from "../../lib/icons";

const settingsFile = `${GLib.get_home_dir()}/.config/ags/service/weather-location.json`;

const saveLocation = (location: string) => {
  try {
    // Remove spaces between city and state (e.g., "Richland, Wa" -> "Richland,Wa")
    const formattedLocation = location.replace(/, /g, ",");

    const file = Gio.File.new_for_path(settingsFile);
    const contents = JSON.stringify({ location: formattedLocation });
    file.replace_contents(
      contents,
      null,
      false,
      Gio.FileCreateFlags.NONE,
      null,
    );

    // Call the functions to update the weather data
    setLocation(loadLocation());
    updateWeatherCommands();
  } catch (e) {
    console.error("Failed to save location:", e);
  }
};

// Add a space between city and state when displaying the location (e.g., "Richland,Wa" -> "Richland, Wa")
const displayLocation = bind(location).as((value) => {
  if (!value) return "N/A";
  return value.replace(/,/g, ", "); // Add a space after the comma
});

const temperature = bind(realTemp).as((value) => value || "N/A");
const feelsTemperature = bind(feelsTemp).as((value) => value || "N/A");
const uv = bind(uvIndex).as((value) => value || "N/A");
const Wind = bind(wind).as((value) => value || "N/A");
const Precipitation = bind(precipitation).as((value) => value || "N/A");
const Pressure = bind(pressure).as((value) => value || "N/A");
const Humidity = bind(humidity).as((value) => value || "N/A");

const icon = icons.ui.edit;

// Create a Variable to control the visibility of the Entry widget
const isEntryVisible = new Variable(false);

const Entry = new Widget.Entry({
  placeholder_text: bind(location).as((value) =>
    value ? value.replace(/,/g, ", ") : "N/A",
  ), // Bind placeholder to the current location
  canFocus: true,
  className: "location_input",
  visible: bind(isEntryVisible).as((value) => value), // Bind visibility to the Variable
  onActivate: (self) => {
    const newLocation = self.get_text();
    saveLocation(newLocation);
    isEntryVisible.set(false); // Hide the Entry after saving the location
  },
  onFocusInEvent: (self) => {
    // Clear the placeholder text when the Entry gains focus
    if (self.get_text() === self.placeholder_text) {
      self.set_text("");
    }
  },
});

const desc = bind(weatherDescription); // Bind the description variable

// Function to map weather description to an icon
const getWeatherIcon = (description: string | undefined) => {
  if (!description) {
    return icons.weather.unknown; // Fallback for undefined/null
  }

  switch (description.toLowerCase()) {
    case "clear":
    case "sunny":
      return icons.weather.clear;
    case "cloudy":
      return icons.weather.cloudy;
    case "rain":
    case "rainy":
      return icons.weather.rain;
    case "snow":
    case "snowy":
      return icons.weather.snow;
    case "thunderstorm":
      return icons.weather.thunderstorm;
    case "mist":
      return icons.weather.fog;
    case "haze":
      return icons.weather.fog;
    case "partly cloudy":
      return icons.weather.partlyCloudy;
    default:
      return icons.weather.unknown; // Fallback for unknown descriptions
  }
};

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
          halign={Gtk.Align.FILL} // Ensure the container fills the available space
        >
          <label
            label={displayLocation}
            className="location"
            halign={Gtk.Align.START}
            hexpand={true} // Allow the label to expand and push the button to the right
          />
          <button
            valign={Gtk.Align.CENTER}
            onClicked={() => isEntryVisible.set(!isEntryVisible.value)} // Toggle visibility on button click
          >
            <icon icon={icon} />
          </button>
        </box>
        {Entry}
        <box horizontal halign={Gtk.Align.FILL}>
          <icon icon={desc.as((value) => getWeatherIcon(value))} size={100} />
          <label
            label={temperature}
            className="temperature"
            halign={Gtk.Align.START}
          />
        </box>
        <box horizontal spacing={spacing}>
          <box vertical>
            <label className="weather-info-title" label="Humidity" />
            <label className="weather-info" label={Humidity} />
          </box>
          <box vertical>
            <label className="weather-info-title" label="Wind" />
            <label className="weather-info" label={Wind} />
          </box>
          <box vertical>
            <label className="weather-info-title" label="Precipitation" />
            <label className="weather-info" label={Precipitation} />
          </box>
          <box vertical>
            <label className="weather-info-title" label="Pressure" />
            <label className="weather-info" label={Pressure} />
          </box>
          <box vertical>
            <label className="weather-info-title" label="UV Index" />
            <label className="weather-info" label={uv} />
          </box>
          <box vertical>
            <label className="weather-info-title" label="Feels like" />
            <label className="weather-info" label={feelsTemperature} />
          </box>
        </box>
      </box>
    </PopupWindow>
  );
};
