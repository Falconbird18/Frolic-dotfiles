import { bind } from "astal";
import { App, Gtk } from "astal/gtk3";
import { barWeather, weatherDescription } from "../../../service/Weather"; // Import the description variable
import BarButton from "../BarButton";
import { toggleWindow } from "../../../lib/utils";
import icons from "../../../lib/icons";

export default () => {
    const wthr = bind(barWeather);
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
            default:
                return icons.weather.unknown; // Fallback for unknown descriptions
        }
    };

    // Debug: Log the weather description
    desc.subscribe((value) => {
        console.log("Weather Description:", value);
    });

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
                    <icon icon={desc.as((value) => getWeatherIcon(value))} Size={20} /> {/* Pass the result of getWeatherIcon */}
                    <label label={wthr.as((value) => value || "Loading...")} />
                </box>
            </BarButton>
        </revealer>
    );
};