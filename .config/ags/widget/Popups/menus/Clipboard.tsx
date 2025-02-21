import { App, Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, execAsync, timeout, Variable } from "astal";
import PopupMenu from "../PopupMenu";

// Create variables for clipboard history and search term
const clipboardHistory = new Variable<string[]>([]);
const searchTerm = new Variable<string>("");
const REFRESH_INTERVAL = 1000;

export default () => {
  const updateHistory = () => {
    execAsync(["cliphist", "list"])
      .then((output) => {
        const items = output
          .split("\n")
          .filter(Boolean)
          .map((line) => line.trim());
        clipboardHistory.set(items);
      })
      .catch((err) => console.error("Error fetching cliphist:", err));
  };

  // Initial update and periodic refresh
  updateHistory();
  timeout(REFRESH_INTERVAL, () => {
    updateHistory();
    return true;
  });

  const ClipboardItem = (item: string, index: number) => {
    return new Widget.Box({
      hexpand: true,
      className: "popup-menu__item clipboard__item",
      spacing: 8,
      children: [
        new Widget.Label({
          className: "clipboard__index",
          label: `${index + 1}`,
        }),
        new Widget.Label({
          xalign: 0,
          truncate: true,
          maxWidthChars: 40,
          label: item.split("\t")[1] || item,
        }),
        new Widget.Button({
          className: "clipboard__copy-btn",
          halign: Gtk.Align.END,
          label: "Copy",
          onClicked: () => {
            execAsync([
              "bash",
              "-c",
              `echo "${item}" | cliphist decode | wl-copy && notify-send "Clipboard" "Item copied successfully"`,
            ]).catch((err) => console.error("Error copying:", err));
          },
        }),
      ],
    });
  };

  const Placeholder = () => (
    <box
      name="placeholder"
      className="clipboard-placeholder"
      spacing={16}
      vexpand
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
    >
      <label label="Clipboard history is empty" />
    </box>
  );

  const SearchBar = () => (
    <box className="clipboard-search" spacing={8} css="padding: 8px;">
      <entry
        hexpand
        placeholderText="Search clipboard..."
        text={bind(searchTerm)}
        onChanged={({ text }) => searchTerm.set(text || "")}
      />
    </box>
  );

  return (
    <PopupMenu label="Clipboard">
      <box vertical>
        <SearchBar />
        {bind(clipboardHistory).as((history) => {
          const filteredHistory = history.filter((item) =>
            (item.split("\t")[1] || item)
              .toLowerCase()
              .includes(searchTerm.get().toLowerCase()),
          );
          return (
            <stack
              transitionType={Gtk.StackTransitionType.CROSSFADE}
              transitionDuration={500}
              shown={filteredHistory.length > 0 ? "history" : "placeholder"}
            >
              <box vertical name="history">
                {filteredHistory.map(ClipboardItem)}
              </box>
              <Placeholder />
            </stack>
          );
        })}
      </box>
    </PopupMenu>
  );
};
