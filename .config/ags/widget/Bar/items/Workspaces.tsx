// import { bind } from "astal";
// import { App, Gtk, Gdk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import { totalWorkspaces, showNumbers } from "../../ControlCenter/pages/Themes";

// export default () => {
//   const hypr = Hyprland.get_default();

//   const focusWorkspace = (workspaceId: number) =>
//     hypr.dispatch("workspace", workspaceId.toString());

//   // Log raw values from the underlying reactive variables
//   console.log(`Workspaces: ${totalWorkspaces.get()}`);
//   console.log(`Show numbers: ${showNumbers.get()}`);

//   // Create computed bindings using lambdas for UI reactivity.
//   // Do not use .get() on these computed bindings outside an .as(...) callback.
//   const total_workspaces = bind(() => totalworkspaces.get());
//   const show_numbers = bind(() => shownumbers.get());

//   // Use TOTAL_WORKSPACES.as(...) to unwrap it for the UI rendering.
//   return TOTAL_WORKSPACES.as(total => (
//     <BarItem>
//       <box spacing={8} className="bar__workspaces">
//         {Array.from({ length: total }, (_, i) => i + 1).map(id => {
//           const workspace = bind(hypr, "workspaces").as(ws =>
//             ws.find(w => w.id === id)
//           );
//           const isFocused = bind(hypr, "focusedWorkspace").as(fw => fw.id === id);
//           const hasWindows = bind(workspace).as(ws =>
//             (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0
//           );

//           return hasWindows.as(active => {
//             // Combine isFocused and SHOW_NUMBERS reactively.
//             return bind(isFocused, SHOW_NUMBERS).as(([focused, showNumbersVal]) => {
//               const buttonClass = focused
//                 ? showNumbersVal
//                   ? "bar__workspaces-indicator-number active"
//                   : "bar__workspaces-indicator dot active"
//                 : showNumbersVal
//                   ? "bar__workspaces-indicator-number"
//                   : "bar__workspaces-indicator dot";

//               const buttonContent = showNumbersVal ? (
//                 <label label={id.toString()} />
//               ) : null;

//               const button = (
//                 <button
//                   halign={Gtk.Align.CENTER}
//                   valign={Gtk.Align.CENTER}
//                   className={buttonClass}
//                   onClicked={() => focusWorkspace(id)}
//                 >
//                   {buttonContent}
//                 </button>
//               );

//               return active ? (
//                 <box
//                   className="bar__workspaces-active"
//                   halign={Gtk.Align.CENTER}
//                   valign={Gtk.Align.CENTER}
//                 >
//                   {button}
//                 </box>
//               ) : (
//                 button
//               );
//             });
//           });
//         })}
//       </box>
//     </BarItem>
//   ));
// };



// export default () => {
//   const hypr = Hyprland.get_default();

//   const focusWorkspace = (workspaceId: number) =>
//     hypr.dispatch("workspace", workspaceId.toString());

//   // Log raw values from the underlying reactive variables (only once at init)
//   console.log(`Workspaces: ${totalWorkspaces.get()}`);
//   console.log(`Show numbers: ${showNumbers.get()}`);

//   // Create bindings for the reactive variables from your themes file
//   const TOTAL_WORKSPACES = bind(() => totalWorkspaces.get());
//   const SHOW_NUMBERS = bind(() => showNumbers.get());

//   // Create a reactive binding for all of Hyprland's workspaces
//   const HYPR_WORKSPACES = bind(hypr, "workspaces");
//   console.log(`Hyprland workspaces: ${hypr.workspaces.length}`);
//   //Create a binding for the focused workspace
//   const HYPR_FOCUSED_WORKSPACE = bind(hypr, "focusedWorkspace")


//   return TOTAL_WORKSPACES.as(total => {
//     return SHOW_NUMBERS.as(showNumbersVal => (
//       <BarItem>
//         <box spacing={8} className="bar__workspaces">
//           {/* Loop through each potential workspace (1 to total) */}
//           {Array.from({ length: total }, (_, i) => i + 1).map(id => {
//             //Get the current workspaces, and find our workspace
//             const workspace = HYPR_WORKSPACES.as(workspaces => workspaces.find(w => w.id === id))
//             //Get the currently focused workspace
//             const isFocused = HYPR_FOCUSED_WORKSPACE.as(fw => fw.id === id)

//             // Calculate if the workspace has any clients or windows
//             const hasWindows = bind(() => {
//               const ws = workspace.get();
//               return (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
//             });

//             return hasWindows.as(active => {
//                return isFocused.as(focused =>{
//                     const buttonClass = focused
//                         ? showNumbersVal
//                         ? "bar__workspaces-indicator-number active"
//                         : "bar__workspaces-indicator dot active"
//                         : showNumbersVal
//                         ? "bar__workspaces-indicator-number"
//                         : "bar__workspaces-indicator dot";

//                     const buttonContent = showNumbersVal ? (
//                         <label label={id.toString()} />
//                     ) : null;

//                     const button = (
//                         <button
//                         halign={Gtk.Align.CENTER}
//                         valign={Gtk.Align.CENTER}
//                         className={buttonClass}
//                         onClicked={() => focusWorkspace(id)}
//                         >
//                         {buttonContent}
//                         </button>
//                     );
//                      return active ? (
//                         <box
//                         className="bar__workspaces-active"
//                         halign={Gtk.Align.CENTER}
//                         valign={Gtk.Align.CENTER}
//                         >
//                         {button}
//                         </box>
//                     ) : (
//                         button
//                     );
//                })
//             });
//           })}
//         </box>
//       </BarItem>
//     ));
//   });
// };
// import { bind } from "astal";
// import { Gtk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import { totalWorkspaces, showNumbers } from "../../ControlCenter/pages/Themes";
// import { Gtk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import { totalWorkspaces, showNumbers } from "../../ControlCenter/pages/Themes";

// // Configuration
// const TOTAL_WORKSPACES = (totalWorkspaces.get());
// const SHOW_NUMBERS = (showNumbers.get());

// export default () => {
// 	const hypr = Hyprland.get_default();

// 	const focusWorkspace = (workspaceId: number) =>
// 		hypr.dispatch("workspace", workspaceId.toString());

// 	return (
// 		<BarItem>
// 			<box spacing={8} className="bar__workspaces">
// 				{Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) => {
// 					const workspace = bind(hypr, "workspaces").as((ws) =>
// 						ws.find((w) => w.id === id)
// 					);
// 					const isFocused = bind(hypr, "focusedWorkspace").as(
// 						(fw) => fw.id === id
// 					);
// 					const hasWindows = bind(workspace).as((ws) => {
// 						const result = (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
// 						return result;
// 					});

// 					return bind(hasWindows).as((active) => {
// 						const buttonClass = bind(isFocused).as((focused) =>
// 							focused
// 								? SHOW_NUMBERS
// 									? "bar__workspaces-indicator-number active"
// 									: "bar__workspaces-indicator dot active"
// 								: SHOW_NUMBERS
// 									? "bar__workspaces-indicator-number"
// 									: "bar__workspaces-indicator dot"
// 						);

// 						const buttonContent = SHOW_NUMBERS ? (
// 							<label label={id.toString()} />
// 						) : null;

// 						const button = (
// 							<button
// 								halign={Gtk.Align.CENTER}
// 								valign={Gtk.Align.CENTER}
// 								className={buttonClass}
// 								onClicked={() => focusWorkspace(id)}
// 							>
// 								{buttonContent}
// 							</button>
// 						);

// 						return active ? (
// 							<box
// 								className="bar__workspaces-active"
// 								halign={Gtk.Align.CENTER} // Center the box horizontally
// 								valign={Gtk.Align.CENTER}
// 							>
// 								{button}
// 							</box>
// 						) : (
// 							button
// 						);
// 					});
// 				})}
// 			</box>
// 		</BarItem>
// 	);
// };


// // Configuration
// const TOTAL_WORKSPACES = (totalWorkspaces.get());
// const SHOW_NUMBERS = (showNumbers.get());

// export default () => {
// 	const hypr = Hyprland.get_default();

// 	const focusWorkspace = (workspaceId: number) =>
// 		hypr.dispatch("workspace", workspaceId.toString());

// 	return (
// 		<BarItem>
// 			<box spacing={8} className="bar__workspaces">
// 				{Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) => {
// 					const workspace = bind(hypr, "workspaces").as((ws) =>
// 						ws.find((w) => w.id === id)
// 					);
// 					const isFocused = bind(hypr, "focusedWorkspace").as(
// 						(fw) => fw.id === id
// 					);
// 					const hasWindows = bind(workspace).as((ws) => {
// 						const result = (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
// 						return result;
// 					});

// 					return bind(hasWindows).as((active) => {
// 						const buttonClass = bind(isFocused).as((focused) =>
// 							focused
// 								? SHOW_NUMBERS
// 									? "bar__workspaces-indicator-number active"
// 									: "bar__workspaces-indicator dot active"
// 								: SHOW_NUMBERS
// 									? "bar__workspaces-indicator-number"
// 									: "bar__workspaces-indicator dot"
// 						);

// 						const buttonContent = SHOW_NUMBERS ? (
// 							<label label={id.toString()} />
// 						) : null;

// 						const button = (
// 							<button
// 								halign={Gtk.Align.CENTER}
// 								valign={Gtk.Align.CENTER}
// 								className={buttonClass}
// 								onClicked={() => focusWorkspace(id)}
// 							>
// 								{buttonContent}
// 							</button>
// 						);

// 						return active ? (
// 							<box
// 								className="bar__workspaces-active"
// 								halign={Gtk.Align.CENTER} // Center the box horizontally
// 								valign={Gtk.Align.CENTER}
// 							>
// 								{button}
// 							</box>
// 						) : (
// 							button
// 						);
// 					});
// 				})}
// 			</box>
// 		</BarItem>
// 	);
// };


// import { bind } from "astal";
// import { Gtk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import { totalWorkspaces, showNumbers } from "../../ControlCenter/pages/Themes";

// export default () => {
//   const hypr = Hyprland.get_default();

//   const focusWorkspace = (workspaceId: number) =>
//     hypr.dispatch("workspace", workspaceId.toString());


  // Use bind to create a reactive component
  // return (
  //   <BarItem>
      {/* {bind(totalWorkspaces).as((TOTAL_WORKSPACES) =>
        bind(showNumbers).as((SHOW_NUMBERS) => (
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
        ))
      )} */}
      {/* <box>
        <label
          label={bind(totalWorkspaces).as(TOTAL_WORKSPACES => TOTAL_WORKSPACES.toString())}
        />
        <label
          label={bind(showNumbers).as(SHOW_NUMBERS => SHOW_NUMBERS.toString())}
        />
      </box>
    </BarItem>
  );
}; */}


// import { bind } from "astal";
// import { Gtk } from "astal/gtk3";
// import Hyprland from "gi://AstalHyprland";
// import BarItem from "../BarItem";
// import { totalWorkspaces, showNumbers } from "../../ControlCenter/pages/Themes";

// export default () => {
//   const hypr = Hyprland.get_default();

//   const focusWorkspace = (workspaceId: number) =>
//     hypr.dispatch("workspace", workspaceId.toString());

//   // Use bind to create a reactive component
//   return (
//     <BarItem>
//       {bind(totalWorkspaces).as((TOTAL_WORKSPACES) =>
//         bind(showNumbers).as((SHOW_NUMBERS) => (
//           <box spacing={8} className="bar__workspaces">
//             {Array.from({ length: TOTAL_WORKSPACES }, (_, i) => i + 1).map((id) => {
//               const workspace = bind(hypr, "workspaces").as((ws) =>
//                 ws.find((w) => w.id === id)
//               );
//               const isFocused = bind(hypr, "focusedWorkspace").as(
//                 (fw) => fw.id === id
//               );
//               const hasWindows = bind(workspace).as((ws) => {
//                 const result = (ws?.clients?.length ?? ws?.windows?.length ?? 0) > 0;
//                 return result;
//               });

//               return bind(hasWindows).as((active) => {
//                 const buttonClass = bind(isFocused).as((focused) =>
//                   focused
//                     ? SHOW_NUMBERS
//                       ? "bar__workspaces-indicator-number active"
//                       : "bar__workspaces-indicator dot active"
//                     : SHOW_NUMBERS
//                       ? "bar__workspaces-indicator-number"
//                       : "bar__workspaces-indicator dot"
//                 );

//                 const buttonContent = SHOW_NUMBERS ? (
//                   <label label={id.toString()} />
//                 ) : null;

//                 const button = (
//                   <button
//                     halign={Gtk.Align.CENTER}
//                     valign={Gtk.Align.CENTER}
//                     className={buttonClass}
//                     onClicked={() => focusWorkspace(id)}
//                   >
//                     {buttonContent}
//                   </button>
//                 );

//                 return active ? (
//                   <box
//                     className="bar__workspaces-active"
//                     halign={Gtk.Align.CENTER}
//                     valign={Gtk.Align.CENTER}
//                   >
//                     {button}
//                   </box>
//                 ) : (
//                   button
//                 );
//               });
//             })}
//           </box>
//         ))
//       )}
//     </BarItem>
//   );
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