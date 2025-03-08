import { bind } from "astal";
import { Gtk } from "astal/gtk3";
import Hyprland from "gi://AstalHyprland";
import BarItem from "../BarItem";
import { totalWorkspaces, showNumbers, settingsChanged } from "../../ControlCenter/pages/Themes";

export default () => {
  const hypr = Hyprland.get_default();

  const focusWorkspace = (workspaceId: number) =>
    hypr.dispatch("workspace", workspaceId.toString());

  return bind(settingsChanged).as(() => {
    const TOTAL_WORKSPACES = totalWorkspaces.get();
    const SHOW_NUMBERS = showNumbers.get();

    return (
      <BarItem>
        <box spacing={8} className="bar__workspaces">
          {Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) => {
            const workspace = bind(hypr, "workspaces").as((ws) =>
              ws.find((w) => w.id === id)
            );
            const isFocused = bind(hypr, "focusedWorkspace").as(
              (fw) => fw.id === id
            );
            const hasWindows = bind(workspace).as((ws) => {
              const result = (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
              return result;
            });

            return bind(hasWindows).as((active) => {
              const buttonClass = bind(isFocused).as((focused) =>
                focused
                  ? SHOW_NUMBERS
                    ? "bar__workspaces-indicator-number active"
                    : "bar__workspaces-indicator dot active"
                  : SHOW_NUMBERS
                    ? "bar__workspaces-indicator-number"
                    : "bar__workspaces-indicator dot"
              );

              const buttonContent = SHOW_NUMBERS ? (
                <label label={id.toString()} />
              ) : null;

              const button = (
                <button
                  halign={Gtk.Align.CENTER}
                  valign={Gtk.Align.CENTER}
                  className={buttonClass}
                  onClicked={() => focusWorkspace(id)}
                >
                  {buttonContent}
                </button>
              );

              return active ? (
                <box
                  className="bar__workspaces-active"
                  halign={Gtk.Align.CENTER}
                  valign={Gtk.Align.CENTER}
                >
                  {button}
                </box>
              ) : (
                button
              );
            });
          })}
        </box>
      </BarItem>
    );
  });
};