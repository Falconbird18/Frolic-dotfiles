import { Variable } from "astal";
import icons from "../lib/icons";
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
    description[1] = `wttr.in/${Location}?format=%C`;
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
const description = [
  "curl",
  `wttr.in/${Location}?format=%C`,
]
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
    try {
      console.log('Raw weather output:', out);

      // Step 1: Remove the weather icon (e.g., 🌫) but preserve wind direction arrows
      const outputWithoutIcon = out.replace(/[^\x00-\x7F↖↗↙↘↔←→↑↓]/g, '').trim(); // Remove non-ASCII characters except wind arrows

      // Step 2: Remove extra spaces between the remaining weather data
      const trimmedOutput = outputWithoutIcon.replace(/\s+/g, ' '); // Replace multiple spaces with a single space

      // Step 3: Remove the '+' sign from positive temperatures and ensure the degree symbol is present
      const cleanedOutput = trimmedOutput.replace(/\+(\d+)([°]?)([CF])/, '$1°$3'); // Remove '+' and ensure ° is present

      // Step 4: Extract wind speed and direction from the output
      const windMatch = cleanedOutput.match(/([↖↗↙↘↔←→↑↓]+)(\d+)mph/);
      if (windMatch) {
        const directionSymbol = windMatch[1]; // Wind direction symbol
        const windSpeedMph = parseFloat(windMatch[2]); // Wind speed in mph

        // Step 5: Convert wind speed to knots
        const windSpeedKnots = windSpeedMph * 0.868976;

        // Step 6: Replace the mph value with knots in the output string
        const updatedOutput = cleanedOutput.replace(/([↖↗↙↘↔←→↑↓]+)(\d+)mph/, `${directionSymbol}${windSpeedKnots.toFixed(2)}kt`);

        console.log('Updated weather output:', updatedOutput);
        return updatedOutput;
      }

      // If no wind data is found, return the cleaned output
      console.log('Cleaned weather output:', cleanedOutput);
      return cleanedOutput;
    } catch (e) {
      console.error('Error processing weather data:', e);
      return prev; // Return the previous value if an error occurs
    }
  },
);
export const weatherDescription = Variable<any | null>(null).poll(
  30_000,
  description,
  (out, prev) => {
    try {
      console.log('Weather description:', out);
      return out;
    } catch (e) {
      console.error('Error processing weather description:', e);
      return prev;
    }
  },
);

export const realTemp = Variable<any | null>(null).poll(
  30_000,
  temperature,
  (out, prev) => {
    try {
      console.log('Temperature:', out);

      // Remove the emoji and the '+' sign, but keep the degree symbol
      const cleanedOutput = out.replace(/[^\x00-\x7F°]/g, '').replace(/\+/g, '');

      console.log('Cleaned temperature output:', cleanedOutput);
      return cleanedOutput;
    } catch (e) {
      console.error('Error processing temperature:', e);
      return prev;
    }
  },
);

export const feelsTemp = Variable<any | null>(null).poll(
  30_000,
  feelslikeTemp,
  (out, prev) => {
    try {
      console.log('Feels like temperature:', out);

      // Remove the '+' sign
      const cleanedOutput = out.replace(/\+/g, '');

      console.log('Cleaned feels like temperature output:', cleanedOutput);
      return cleanedOutput;
    } catch (e) {
      console.error('Error processing feels like temperature:', e);
      return prev;
    }
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

export const WeatherIcon = (description: string | undefined) => {
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