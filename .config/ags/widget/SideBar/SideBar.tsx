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

const feelsTemperature = bind(feelsTemp).as((value) => value || "N/A");
const uv = bind(uvIndex).as((value) => value || "N/A");
const Wind = bind(wind).as((value) => value || "N/A");
const Precipitation = bind(precipitation).as((value) => value || "N/A");
const Pressure = bind(pressure).as((value) => value || "N/A");
const Humidity = bind(humidity).as((value) => value || "N/A");

const Entry = new Widget.Entry({
  placeholder_text: "Ask Gemini",
  canFocus: true,
  className: "location_input",
  onActivate: (self) => {
    const newLocation = self.get_text();
    saveLocation(newLocation);
  },
  onFocusInEvent: (self) => {
    if (self.get_text() === self.placeholder_text) {
      self.set_text("");
    }
  },
});

let entryFocused = false;

const username =
  GLib.get_user_name().charAt(0).toUpperCase() + GLib.get_user_name().slice(1);

const greeting = `Hello, ${username}`;

export default () => {
  return (
    <PopupWindow
      scrimType="transparent"
      layer={Astal.Layer.OVERLAY}
      visible={false}
      margin={12}
      vexpand={true}
      keymode={Astal.Keymode.EXCLUSIVE}
      name="SideBar"
      namespace="SideBar"
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
      application={App}
      onKeyPressEvent={(self, event) => {
        const [keyEvent, keyCode] = event.get_keycode();

        if (keyEvent && keyCode == 9) {
          // Tab key pressed
          App.toggle_window(self.name);
        } else if (keyEvent && keyCode === 65 && !entryFocused) {
          // 'A' key pressed and not focused
          Entry.grab_focus(); // Focus the Entry
          entryFocused = true;
        } else if (keyEvent && keyCode != 65 && entryFocused) {
          // any key pressed other than 'A' and it is focused
          entryFocused = false;
        }
      }}
    >
      <box vertical className="sidebar-window" spacing={spacing}>
        <box
          horizontal
          className="gemini-header-container"
          halign={Gtk.Align.FILL} // Ensure the container fills the available space
        >
          <label
            label="Gemini"
            className="gemini"
            halign={Gtk.Align.START}
            hexpand={true} // Allow the label to expand and push the button to the right
          />
        </box>
        <box horizontal halign={Gtk.Align.FILL}>
          <label
            label={greeting}
            className="greeting"
            halign={Gtk.Align.START}
          />
        </box>
        <box
          vertical
          spacing={spacing}
          halign={Gtk.Align.FILL}
          valign={Gtk.Align.END} // Align to the bottom
        >
          <box horizontal spacing={spacing}>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Tell me what" />
              <label class="label-subtext" label="you can do" />
            </box>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Give me" />
              <label class="label-subtext" label="study tips" />
            </box>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Save me" />
              <label class="label-subtext" label="time" />
            </box>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Inspire" />
              <label class="label-subtext" label="me" />
            </box>
          </box>
          {Entry}
        </box>
      </box>
    </PopupWindow>
  );
};
