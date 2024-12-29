import { Variable, exec } from "astal";

const Location = "Richland,WA";
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
    console.log('Wind:', out);
    return out;
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
    console.log('Pressure in inches of mercury:', inHgValue);
    
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
export const location = Location