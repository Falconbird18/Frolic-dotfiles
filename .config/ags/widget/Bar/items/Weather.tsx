import { bind } from "astal";
import { App, Gtk, Gdk } from "astal/gtk3";
import { spacing } from "../../../lib/variables";
import { weather } from "../../../service/Weather";
import { BarButtonStyle } from "../BarButton";
import BarItem, { BarItemStyle } from "../BarItem";

export default () => {
  const wthr = bind(weather);
  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={300}
      revealChild={wthr.as(Boolean)}
    >
      <BarItem>
        <box spacing={spacing}>
          <label label={wthr} />
        </box>
      </BarItem>
    </revealer>
  );
};