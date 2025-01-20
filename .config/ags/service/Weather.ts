import { Variable } from "astal";
const { GLib, Gio } = imports.gi;

const settingsFile = `${GLib.get_home_dir()}/.config/ags/service/weather-location.json`;
console.log("Settings file:", settingsFile);

export const loadLocation = () => {
    try {
        const file = Gio.File.new_for_path(settingsFile);
        const [ok, contents] = file.load_contents(null);
        if (ok) {
            const settings = JSON.parse(new TextDecoder().decode(contents));
            console.log("Loaded settings:", settings);
            if (settings?.location && typeof settings.location === "string") {
                return settings.location;
            }
        }
    } catch (e) {
        console.error("Failed to load location:", e);
    }
    return null;
};

export let Location = loadLocation();
export const location = Variable(Location);

export const setLocation = (newLocation: string) => {
    Location = newLocation;
    location.set(newLocation); // Update the Variable instance
};

export const updateWeatherCommands = () => {
    temperature[1] = `wttr.in/${Location}?format=%c%t`;
    feelslikeTemp[1] = `wttr.in/${Location}?format=%f`;
    humid[1] = `wttr.in/${Location}?format=%h`;
    Pressure[1] = `wttr.in/${Location}?format=%P`;
    uvindex[1] = `wttr.in/${Location}?format=%u`;
    Precipitation[1] = `wttr.in/${Location}?format=%p`;
    Wind[1] = `wttr.in/${Location}?format=%w`;
    bar[1] = `wttr.in/${Location}?format=${barFormat}`;
};

const temperature = [
  "curl",
  `wttr.in/${Location}?format=%c%t`,
];
const feelslikeTemp = [
  "curl",
  `wttr.in/${Location}?format=%f`,
];
const humid = [
  "curl",
  `wttr.in/${Location}?format=%h`,
];
const Pressure = [
  "curl",
  `wttr.in/${Location}?format=%P`,
];

const uvindex = [
  "curl",
  `wttr.in/${Location}?format=%u`,
];
const Precipitation = [
  "curl",
  `wttr.in/${Location}?format=%p`,
];
const Wind = [
  "curl",
  `wttr.in/${Location}?format=%w`,
];
const barFormat = `%c+%f+%w`;
const bar = [
  "curl",
  `wttr.in/${Location}?format=${barFormat}`,
];

/**
 * Polls the weather API every 30 seconds and updates the weather variable.
 * The weather variable is an object containing the current weather data.
 */
export const barWeather = Variable<any | null>(null).poll(
  30_000,
  bar,
  (out, prev) => {
    console.log('Weather output:', out);

    // Extract wind speed and direction from the output
    const windMatch = out.match(/([↖↗↙↘←→↑↓]+)(\d+)mph/);
    if (windMatch) {
      const directionSymbol = windMatch[1]; // Wind direction symbol
      const windSpeedMph = parseFloat(windMatch[2]); // Wind speed in mph

      // Convert wind speed to knots
      const windSpeedKnots = windSpeedMph * 0.868976;

      // Replace the mph value with knots in the output string
      const updatedOutput = out.replace(/([↖↗↙↘←→↑↓]+)(\d+)mph/, `${directionSymbol}${windSpeedKnots.toFixed(2)} Kt`);

      console.log('Updated weather output with wind in knots:', updatedOutput);
      return updatedOutput;
    }

    // If no wind data is found, return the original output
    return out;
  },
);
export const realTemp = Variable<any | null>(null).poll(
  30_000,
  temperature,
  (out, prev) => {
    console.log('Temperature:', out);
    return out;
  },
);
export const feelsTemp = Variable<any | null>(null).poll(
  30_000,
  feelslikeTemp,
  (out, prev) => {
    console.log('Feels like temperature:', out);
    return out;
  },
);
export const humidity = Variable<any | null>(null).poll(
  30_000,
  humid,
  (out, prev) => {
    console.log('Humidity:', out);
    return out;
  },
);
export const wind = Variable<any | null>(null).poll(
  30_000,
  Wind,
  (out, prev) => {
    // Extract the direction symbol and wind speed
    const directionSymbol = out.match(/[^\d]+/)[0]; // Get the direction symbol (e.g., "↗")
    const windSpeedValue = parseFloat(out.match(/\d+/)[0]); // Get the numeric wind speed (e.g., "13")

    // Convert mph to knots
    const knotsValue = windSpeedValue * 0.868976;

    // Log the converted value
    console.log('Wind speed in knots:', knotsValue);

    // Return the combined output with direction symbol
    return directionSymbol + knotsValue.toFixed(2) + " kt"; // Convert to string with 2 decimal places
  },
);
export const pressure = Variable<any | null>(null).poll(
  30_000,
  Pressure,
  (out, prev) => {
    // Extract numeric value from the output (e.g., "1012hPa" -> 1012)
    const hPaValue = parseFloat(out);
    
    // Convert hPa to inHg
    const inHgValue = hPaValue * 0.02953;
    
    // Log the converted value
    console.log('Pressure in inches of mercury:', inHgValue.toFixed(2));
    
    // Return the converted value as a string
    return inHgValue.toFixed(2) + " inHg"; // Convert to string with 2 decimal places
  },
);
export const uvIndex = Variable<any | null>(null).poll(
  30_000,
  uvindex,
  (out, prev) => {
    console.log('UV Index:', out);
    return out;
  },
);
export const precipitation = Variable<any | null>(null).poll(
  30_000,
  Precipitation,
  (out, prev) => {
    console.log('Precipitation:', out);
    return out;
  },
);