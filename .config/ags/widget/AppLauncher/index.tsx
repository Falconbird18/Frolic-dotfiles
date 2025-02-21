import { App, Astal, Widget } from "astal/gtk3";
import { bind, Variable, exec } from "astal";
import AstalApps from "gi://AstalApps?version=0.1";
import AppItem, { MathResultItem } from "./AppItem";
import PopupWindow from "../../common/PopupWindow";

const apps = new AstalApps.Apps();

const query = Variable<string>("");

const isMathExpression = (input: string): boolean => {
  return /^[\d\s()+\-*/.^]+$/.test(input.trim());
};

const calculateWithQalc = (expression: string): string => {
  try {
    // Log the command being executed
    console.log(`Executing command: qalc -t "${expression}"`);

    // Check if Astal.exec exists and works
    if (typeof exec !== "function") {
      console.error("exec is not a function!");
      return "Astal.exec unavailable";
    }

    // Execute qalc
    const result = exec(`qalc -t "${expression}"`);
    console.log(`qalc output: "${result}"`);

    // Check if result is valid
    if (result === undefined || result === null) {
      return "No result from qalc";
    }

    return result.trim();
  } catch (error) {
    // Log the error for debugging
    console.error(`Error in calculateWithQalc: ${error}`);
    return `Error: ${error.message || "Unknown"}`;
  }
};

export default () => {
  const items = query((query) => {
    const trimmedQuery = query.trim();
    let resultItems: any[] = [];

    if (trimmedQuery && isMathExpression(trimmedQuery)) {
      const result = calculateWithQalc(trimmedQuery);
      resultItems.push(MathResultItem(trimmedQuery, result));
    }

    const appItems = apps
      .fuzzy_query(query)
      .map((app: AstalApps.Application) => AppItem(app));
    return [...resultItems, ...appItems];
  });

  const Entry = new Widget.Entry({
    text: bind(query),
    canFocus: true,
    className: "app-launcher__input",
    onActivate: () => {
      const currentItems = items.get();
      if (currentItems.length > 0) {
        const firstItem = currentItems[0];
        if (firstItem.app) {
          firstItem.app.launch();
        }
        App.toggle_window("app-launcher");
      }
    },
    setup: (self) => {
      self.hook(self, "notify::text", () => {
        query.set(self.get_text());
      });
    },
  });

  return (
    <PopupWindow
      scrimType="transparent"
      visible={false}
      margin={12}
      vexpand={true}
      name="app-launcher"
      namespace="app-launcher"
      className="AppLauncher"
      keymode={Astal.Keymode.EXCLUSIVE}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.CENTER | Astal.WindowAnchor.CENTER}
      application={App}
      onKeyPressEvent={(self, event) => {
        const [keyEvent, keyCode] = event.get_keycode();
        if (keyEvent && keyCode == 9) {
          App.toggle_window(self.name);
        }
      }}
      setup={(self) => {
        self.hook(self, "notify::visible", () => {
          if (!self.get_visible()) {
            query.set("");
          } else {
            Entry.grab_focus();
          }
        });
      }}
    >
      <box className="app-launcher" vertical>
        {Entry}
        <scrollable vexpand>
          <box className="app-launcher__list" vertical>
            {items}
          </box>
        </scrollable>
      </box>
    </PopupWindow>
  );
};
