import { bind } from "astal";
import { Gtk } from "astal/gtk3";
import Hyprland from "gi://AstalHyprland";
import BarItem from "../BarItem";
import {
  totalWorkspaces,
  showNumbers,
  hideEmptyWorkspaces,
  settingsChanged,
} from "../../ControlCenter/pages/Themes";

export default function Workspaces() {
  const hypr = Hyprland.get_default();

  // Focus the given workspace.
  const focusWorkspace = (workspaceId: number) =>
    hypr.dispatch("workspace", workspaceId.toString());

  // We'll store our button elements in a Map.
  // (This map will be re-created whenever the totalWorkspaces setting changes.)
  let buttons = new Map<number, any>();

  // Helper: create one workspace button.
  const createWorkspaceButton = (id: number) => (
    <button
      key={`workspace-btn-${id}`}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClicked={() => focusWorkspace(id)}
    >
      {showNumbers.get() && <label label={id.toString()} />}
    </button>
  );

  // Rebuild the buttons map from scratch.
  const rebuildButtons = () => {
    const newButtons = new Map<number, any>();
    const TOTAL_WORKSPACES = totalWorkspaces.get();
    for (let id = 1; id <= TOTAL_WORKSPACES; id++) {
      newButtons.set(id, createWorkspaceButton(id));
    }
    buttons = newButtons;
  };

  // Update a button's appearance & label child based on current settings.
  const updateButton = (
    button: any,
    id: number,
    isFocused: boolean,
    hasWindows: boolean,
    SHOW_NUMBERS: boolean,
    HIDE_EMPTY: boolean,
  ) => {
    let className = SHOW_NUMBERS
      ? "bar__workspaces-indicator-number"
      : "bar__workspaces-indicator dot";
    if (isFocused) className += " active";
    button.className = className;
    button.opacity = HIDE_EMPTY && !hasWindows ? 0 : 1;

    // Update the visible label based on SHOW_NUMBERS.
    if (SHOW_NUMBERS && !button.child) {
      button.child = <label label={id.toString()} />;
    } else if (!SHOW_NUMBERS && button.child) {
      button.child = null;
    }
  };

  // Helper to completely clear the container's children.
  const clearBox = (box: any) => {
    if (box.remove_all_children) {
      // If your framework provides this functionality:
      box.remove_all_children();
    } else if (box.get_children) {
      // Otherwise manually remove children one by one.
      const children = box.get_children();
      for (let child of children) {
        box.remove(child);
      }
    } else {
      // Fallback if neither is available.
      while (box.firstChild) {
        box.remove(box.firstChild);
      }
    }
  };

  // This function is run when the container is set up.
  // It is responsible for both initially rendering and later updating the UI.
  const setupUpdates = (box: any) => {
    // Refresh the entire list of workspace buttons.
    const refreshAllButtons = () => {
      rebuildButtons();
      // Clear out every child from the container.
      clearBox(box);
      // Add (re-add) each workspace button.
      buttons.forEach((button, id) => {
        box.add(
          <box
            key={`workspace-box-${id}`}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
          >
            {button}
          </box>,
        );
      });

      if (box.queue_relayout) box.queue_relayout();
    };

    // Update appearance of each button (active style, show label, opacity, etc.).
    const updateAllButtons = () => {
      const SHOW_NUMBERS = showNumbers.get();
      const HIDE_EMPTY = hideEmptyWorkspaces.get();
      const ws = hypr.workspaces;
      const fw = hypr.focusedWorkspace;

      buttons.forEach((button, id) => {
        const currentWorkspace = ws.find((w) => w.id === id);
        const hasWindows =
          (currentWorkspace?.clients?.length ||
            currentWorkspace?.windows?.length ||
            0) > 0;
        const isFocused = fw?.id === id;
        updateButton(
          button,
          id,
          isFocused,
          hasWindows,
          SHOW_NUMBERS,
          HIDE_EMPTY,
        );
      });
    };

    // Initially refresh the list and update button appearances.
    refreshAllButtons();
    updateAllButtons();

    // Listen to settings changes. Your settingsChanged variable
    // should fire whenever ANY setting (totalWorkspaces, showNumbers, etc.) changes.
    settingsChanged.subscribe(() => {
      refreshAllButtons();
      updateAllButtons();
    });

    // Listen for workspace and focus changes.
    hypr.connect("notify::workspaces", updateAllButtons);
    hypr.connect("notify::focused-workspace", updateAllButtons);
  };

  // The final JSX below is created once.
  // The setup function is in charge of removing/adding children as needed.
  return (
    <BarItem>
      <box spacing={8} className="bar__workspaces" setup={setupUpdates}>
        {Array.from(buttons.entries()).map(([id, button]) => (
          <box
            key={`workspace-box-${id}`}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
          >
            {button}
          </box>
        ))}
      </box>
    </BarItem>
  );
}
