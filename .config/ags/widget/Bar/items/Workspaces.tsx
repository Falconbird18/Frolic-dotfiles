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
              return ((ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0);
            });

            let buttonRef = null;
            const setButtonRef = (btn) => {
              buttonRef = btn;
            };

            return (
              <box
                key={`workspace-box-${id}`}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
              >
                <button
                  key={`workspace-btn-${id}`}
                  ref={setButtonRef}
                  halign={Gtk.Align.CENTER}
                  valign={Gtk.Align.CENTER}
                  onClicked={() => focusWorkspace(id)}
                  className={bind(isFocused).as((focused) =>
                    focused
                      ? SHOW_NUMBERS
                        ? "bar__workspaces-indicator-number active"
                        : "bar__workspaces-indicator dot active"
                      : SHOW_NUMBERS
                        ? "bar__workspaces-indicator-number"
                        : "bar__workspaces-indicator dot"
                  )}
                >
                  {SHOW_NUMBERS && <label label={id.toString()} />}
                </button>
                {
                  // Instead of returning null, we return an empty fragment.
                  bind(hasWindows).as((active) => {
                    if (buttonRef && buttonRef.get_parent()) {
                      buttonRef.visible = true; // keep mounted
                      buttonRef.opacity = active ? 1.0 : 0.0;
                    }
                    return (<></>);
                  })
                }
              </box>
            );
          })}
        </box>
      </BarItem>
    );
  });
};
