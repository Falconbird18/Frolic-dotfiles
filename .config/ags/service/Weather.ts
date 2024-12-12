import { Variable, exec } from "astal";

const weatherCommand = [
  "curl",
  "https://wttr.in/Richland,WA?format=3",
];

/**
 * Polls the weather API every 30 seconds and updates the weather variable.
 * The weather variable is an object containing the current weather data.
 */
export const weather = Variable<any | null>(null).poll(
  30_000,
  weatherCommand,
  (out, prev) => {
	console.log('Weather output:', out);
	return out;
  },
);