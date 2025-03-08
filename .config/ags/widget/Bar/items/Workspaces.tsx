// import { bind } from "astal";
// import { Gtk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import { totalWorkspaces, showNumbers, settingsChanged } from "../../ControlCenter/pages/Themes";

// export default () => {
//   const hypr = Hyprland.get_default();

//   const focusWorkspace = (workspaceId: number) =>
//     hypr.dispatch("workspace", workspaceId.toString());

//   return bind(settingsChanged).as(() => {
//     const TOTAL_WORKSPACES = totalWorkspaces.get();
//     const SHOW_NUMBERS = showNumbers.get();

//     return (
//       <BarItem>
//         <box spacing={8} className="bar__workspaces">
//           {Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) => {
//             // Create bindings for the workspace data.
//             const workspace = bind(hypr, "workspaces").as((ws) =>
//               ws.find((w) => w.id === id)
//             );
//             const isFocused = bind(hypr, "focusedWorkspace").as(
//               (fw) => fw.id === id
//             );
//             // const hasWindows = bind(workspace).as((ws) => {
//             //   return (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
//             // });
//             const hasWindows = bind(workspace).as((ws) => {
//               const result = (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
//               return result;
//             });

//             // We'll store a reference to the button so we can update it imperatively.
//             let buttonRef = null;
//             const setButtonRef = (btn) => {
//               buttonRef = btn;
//             };

//             // Always render a container and button for each workspace.
//             // Instead of conditionally mounting/unmounting the button,
//             // we update its visual state to simulate presence/absence.
//             return (
//               <box
//                 key={`workspace-box-${id}`}
//                 halign={Gtk.Align.CENTER}
//                 valign={Gtk.Align.CENTER}
//               >
//                 <button
//                   key={`workspace-btn-${id}`}
//                   ref={setButtonRef}
//                   halign={Gtk.Align.CENTER}
//                   valign={Gtk.Align.CENTER}
//                   onClicked={() => focusWorkspace(id)}
//                   className={bind(isFocused).as((focused) =>
//                     focused
//                       ? SHOW_NUMBERS
//                         ? "bar__workspaces-indicator-number active"
//                         : "bar__workspaces-indicator dot active"
//                       : SHOW_NUMBERS
//                         ? "bar__workspaces-indicator-number"
//                         : "bar__workspaces-indicator dot"
//                   )}
//                 >
//                   {SHOW_NUMBERS ? <label label={id.toString()} /> : null}
//                 </button>
//                 {
//                   bind(hasWindows).as((active) => {
//                     if (buttonRef && buttonRef.get_parent()) {
//                       buttonRef.visible = true; // keep mounted
//                       buttonRef.opacity = active ? 1.0 : 0.0;
//                     }
//                     return null;
//                   })
//                 }
//               </box>
//             );
//           })}
//         </box>
//       </BarItem>
//     );
//   });
// };

// import { bind } from "astal";
// import { Gtk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import { totalWorkspaces, showNumbers, hideEmptyWorkspaces, settingsChanged } from "../../ControlCenter/pages/Themes";

// export default () => {
//   const hypr = Hyprland.get_default();

//   const focusWorkspace = (workspaceId: number) =>
//     hypr.dispatch("workspace", workspaceId.toString());

//   return bind(settingsChanged).as(() => {
//     const TOTAL_WORKSPACES = totalWorkspaces.get();
//     const SHOW_NUMBERS = showNumbers.get();

//     return (
//       <BarItem>
//         <box spacing={8} className="bar__workspaces">
//           {Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) => {
//             const workspace = bind(hypr, "workspaces").as((ws) =>
//               ws.find((w) => w.id === id)
//             );
//             const isFocused = bind(hypr, "focusedWorkspace").as(
//               (fw) => fw.id === id
//             );
//             const hasWindows = bind(workspace).as((ws) => {
//               return ((ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0);
//             });

//             let buttonRef = null;
//             const setButtonRef = (btn) => {
//               buttonRef = btn;
//             };

//             return (
//               <box
//                 key={`workspace-box-${id}`}
//                 halign={Gtk.Align.CENTER}
//                 valign={Gtk.Align.CENTER}
//               >
//                 <button
//                   key={`workspace-btn-${id}`}
//                   ref={setButtonRef}
//                   halign={Gtk.Align.CENTER}
//                   valign={Gtk.Align.CENTER}
//                   onClicked={() => focusWorkspace(id)}
//                   className={bind(isFocused).as((focused) =>
//                     focused
//                       ? SHOW_NUMBERS
//                         ? "bar__workspaces-indicator-number active"
//                         : "bar__workspaces-indicator dot active"
//                       : SHOW_NUMBERS
//                         ? "bar__workspaces-indicator-number"
//                         : "bar__workspaces-indicator dot"
//                   )}
//                 >
//                   {SHOW_NUMBERS && <label label={id.toString()} />}
//                 </button>
//                 {
//                   // Instead of returning null, we return an empty fragment.
//                   bind(hasWindows).as((active) => {
//                     if (buttonRef && buttonRef.get_parent()) {
//                       buttonRef.visible = true; // keep mounted
//                       buttonRef.opacity = active ? 1.0 : 0.0;
//                     }
//                     return (<></>);
//                   })
//                 }
//               </box>
//             );
//           })}
//         </box>
//       </BarItem>
//     );
//   });
// };

// import { bind } from "astal";
// import { Gtk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import {
//   totalWorkspaces,
//   showNumbers,
//   hideEmptyWorkspaces,
//   settingsChanged
// } from "../../ControlCenter/pages/Themes";

// export default () => {
//   const hypr = Hyprland.get_default();

//   const focusWorkspace = (workspaceId: number) =>
//     hypr.dispatch("workspace", workspaceId.toString());

//   return bind(settingsChanged).as(() => {
//     const TOTAL_WORKSPACES = totalWorkspaces.get();
//     const SHOW_NUMBERS = showNumbers.get();
//     const HIDE_EMPTY = hideEmptyWorkspaces.get();

//     return (
//       <BarItem>
//         <box spacing={8} className="bar__workspaces">
//           {Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) =>
//             bind(hypr, "workspaces").as((ws) => {
//               // Find the workspace matching this id
//               const currentWorkspace = ws.find((w) => w.id === id);
//               // Determine if the workspace has any windows/clients
//               const hasWindows =
//                 (currentWorkspace?.clients?.length ?? currentWorkspace?.windows?.length ?? 0) > 0;

//               let buttonRef = null;
//               const setButtonRef = (btn) => {
//                 buttonRef = btn;
//               };

//               // If we’re hiding empty workspaces and this one is empty, render nothing.
//               if (HIDE_EMPTY && !hasWindows) return buttonRef.opacity = 0;

//               // Create a binding to check if this workspace is focused.
//               const isFocused = bind(hypr, "focusedWorkspace").as((fw) => fw.id === id);

//               return (
//                 <box
//                   key={`workspace-box-${id}`}
//                   halign={Gtk.Align.CENTER}
//                   valign={Gtk.Align.CENTER}
//                 >
//                   <button
//                     key={`workspace-btn-${id}`}
//                     ref={setButtonRef}
//                     halign={Gtk.Align.CENTER}
//                     valign={Gtk.Align.CENTER}
//                     onClicked={() => focusWorkspace(id)}
//                     className={bind(isFocused).as((focused) =>
//                       focused
//                         ? SHOW_NUMBERS
//                           ? "bar__workspaces-indicator-number active"
//                           : "bar__workspaces-indicator dot active"
//                         : SHOW_NUMBERS
//                           ? "bar__workspaces-indicator-number"
//                           : "bar__workspaces-indicator dot"
//                     )}
//                   >
//                     {SHOW_NUMBERS && <label label={id.toString()} />}
//                   </button>
//                   {(() => {
//                     // Instead of binding to a constant value,
//                     // we simply update the button’s opacity right here.
//                     // This IIFE re-runs whenever the full binding re-renders.
//                     if (buttonRef && buttonRef.get_parent()) {
//                       buttonRef.visible = true; // Keep the button mounted.
//                       buttonRef.opacity = hasWindows ? 1.0 : 0.0;
//                     }
//                     return <></>;
//                   })()}
//                 </box>
//               );
//             })
//           )}
//         </box>
//       </BarItem>
//     );
//   });
// };

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

  const focusWorkspace = (workspaceId: number) =>
    hypr.dispatch("workspace", workspaceId.toString());

  // Initialize buttons for all workspaces
  const TOTAL_WORKSPACES = totalWorkspaces.get();
  const buttons = new Map<number, any>();

  for (let id = 1; id <= TOTAL_WORKSPACES; id++) {
    const button = (
      <button
        key={`workspace-btn-${id}`}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        onClicked={() => focusWorkspace(id)}
      >
        {showNumbers.get() && <label label={id.toString()} />}
      </button>
    );
    buttons.set(id, button);
  }

  // Function to update button appearance
  const updateButton = (
    button: any,
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

    if (SHOW_NUMBERS && !button.child) {
      button.child = <label label={button.key.split("-")[2]} />; // Extract ID from key
    } else if (!SHOW_NUMBERS && button.child) {
      button.child = null;
    }
  };

  // Setup reactive updates
  const setupUpdates = (box: any) => {
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
        updateButton(button, isFocused, hasWindows, SHOW_NUMBERS, HIDE_EMPTY);
      });
    };

    // Initial update
    updateAllButtons();

    // Subscribe to changes
    settingsChanged.subscribe(updateAllButtons);
    hypr.connect("notify::workspaces", updateAllButtons);
    hypr.connect("notify::focused-workspace", updateAllButtons);
  };

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
