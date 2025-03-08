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

  // Maps to keep track of workspace buttons and their outer containers.
  let buttons = new Map<number, any>();
  let containers = new Map<number, any>();

  // Create a workspace button.
  const createWorkspaceButton = (id: number) => (
    <button
      key={`workspace-btn-${id}`}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClicked={() => focusWorkspace(id)}
    >
      {/* On initial render add a label only if showNumbers is true */}
      {showNumbers.get() ? <label label={id.toString()} /> : null}
    </button>
  );

  // Rebuild the buttons and their container boxes from scratch
  const rebuildButtons = () => {
    const newButtons = new Map<number, any>();
    const newContainers = new Map<number, any>();
    const TOTAL_WORKSPACES = totalWorkspaces.get();
    for (let id = 1; id <= TOTAL_WORKSPACES; id++) {
      const button = createWorkspaceButton(id);
      newButtons.set(id, button);
      // Create a container box wrapping our button.
      // We’ll update this container’s styles (and visibility) later.
      newContainers.set(
        id,
        <box
          key={`workspace-box-${id}`}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          className="workspace-container"
        >
          {button}
        </box>,
      );
    }
    buttons = newButtons;
    containers = newContainers;
  };

  // Update a button’s appearance and its label safely.
  const updateButton = (
    button: any,
    id: number,
    isFocused: boolean,
    hasWindows: boolean,
    SHOW_NUMBERS: boolean,
    HIDE_EMPTY: boolean,
  ) => {
    // Build the base CSS classes for the button.
    let baseClass = SHOW_NUMBERS
      ? "bar__workspaces-indicator-number"
      : "bar__workspaces-indicator dot";
    if (isFocused) baseClass += " active";
    // (We update the border on the container rather than the button.)
    button.className = baseClass;

    // Instead of setting an opacity of 0, we hide or show the button.
    if (HIDE_EMPTY && !hasWindows) {
      if (button.hide) button.hide();
      if (typeof button.visible !== "undefined") button.visible = false;
    } else {
      if (button.show) button.show();
      if (typeof button.visible !== "undefined") button.visible = true;
    }

    // Safely update the label:
    if (SHOW_NUMBERS) {
      if (button.child) {
        // Instead of adding a new label, update the existing label’s text.
        if (button.child.label !== undefined) {
          button.child.label = id.toString();
        }
      } else {
        // No label exists yet, so add one.
        button.child = <label label={id.toString()} />;
      }
    } else {
      // Remove the label. If the button provides a remove function, use it.
      if (button.child) {
        if (button.remove) {
          button.remove(button.child);
        }
        button.child = null;
      }
    }
  };

  // Helper to completely clear the container’s children.
  const clearBox = (box: any) => {
    if (box.remove_all_children) {
      box.remove_all_children();
    } else if (box.get_children) {
      const children = box.get_children();
      for (let child of children) {
        box.remove(child);
      }
    } else {
      while (box.firstChild) {
        box.remove(box.firstChild);
      }
    }
  };

  // Setup the reactive updates.
  const setupUpdates = (box: any) => {
    // Helper to rebuild the entire list of workspace containers.
    const refreshAllButtons = () => {
      rebuildButtons();
      clearBox(box);
      // Add each container (which wraps a workspace button) to the main box.
      containers.forEach((container, id) => {
        box.add(container);
      });
      if (box.queue_relayout) box.queue_relayout();
    };

    // Update every workspace’s appearance.
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

        // Update the container that wraps the button.
        const container = containers.get(id);
        if (container) {
          // Hide or show the container so empty workspaces don’t take up space.
          if (HIDE_EMPTY && !hasWindows) {
            if (container.hide) container.hide();
            if (typeof container.visible !== "undefined") {
              container.visible = false;
            }
          } else {
            if (container.show) container.show();
            if (typeof container.visible !== "undefined") {
              container.visible = true;
            }
          }
          // When all workspaces are shown, add a border if this one has windows.
          if (!HIDE_EMPTY && hasWindows) {
            container.className = "bar-workspaces-active";
          } else {
            container.className = "bar-workspaces";
          }
        }
      });
    };

    // Initial rendering and update.
    refreshAllButtons();
    updateAllButtons();

    // Subscribe to all settings changes.
    settingsChanged.subscribe(() => {
      refreshAllButtons();
      updateAllButtons();
    });
    hypr.connect("notify::workspaces", updateAllButtons);
    hypr.connect("notify::focused-workspace", updateAllButtons);
  };

  return (
    <BarItem>
      <box spacing={8} className="bar__workspaces" setup={setupUpdates}>
        {/* Containers are added dynamically in refreshAllButtons */}
      </box>
    </BarItem>
  );
}
