import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";

// Variable to store and display Ollama response
const ollamaResponse = Variable("");

async function queryOllama(prompt) {
  try {
    const response = await exec([
      "curl",
      "-X",
      "POST",
      "http://localhost:11434/api/generate",
      "-d",
      JSON.stringify({
        model: "llama3.2",
        prompt: prompt,
        stream: false,
      }),
    ]);

    const result = JSON.parse(response);
    ollamaResponse.set(result.response || "No response received");
  } catch (error) {
    ollamaResponse.set(`Error: ${error.message}`);
  }
}

// Reset conversation function
function resetConversation() {
  ollamaResponse.set("");
  Entry.set_text("");
}

const Entry = new Widget.Entry({
  placeholder_text: "Ask Ollama",
  canFocus: true,
  className: "location_input",
  // Remove onActivate to handle submission with button or Enter
  primary_icon_name: "system-search-symbolic", // Optional: adds a search icon
  on_changed: (self) => {
    // This allows typing multiple words without losing input
    self.get_text();
  },
  on_activate: (self) => {
    const prompt = self.get_text();
    if (prompt) {
      queryOllama(prompt);
      // Don't clear entry immediately, let user decide when to reset
    }
  },
});

const NewConversationButton = new Widget.Button({
  label: "New Conversation",
  className: "primary-button",
  onClicked: () => resetConversation(),
});

let entryFocused = false;

const username =
  GLib.get_user_name().charAt(0).toUpperCase() + GLib.get_user_name().slice(1);

const greeting = `Hello, ${username}`;

export default () => {
  return (
    <PopupWindow
      scrimType="transparent"
      layer={Astal.Layer.OVERLAY}
      visible={false}
      margin={12}
      vexpand={true}
      keymode={Astal.Keymode.EXCLUSIVE}
      name="SideBar"
      namespace="SideBar"
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
      application={App}
      onKeyPressEvent={(self, event) => {
        const [keyEvent, keyCode] = event.get_keycode();

        if (keyEvent && keyCode == 9) {
          // Tab key pressed
          App.toggle_window(self.name);
        } else if (keyEvent && keyCode === 65 && !entryFocused) {
          // 'A' key pressed and not focused
          Entry.grab_focus();
          entryFocused = true;
        } else if (keyEvent && keyCode != 65 && entryFocused) {
          // any key pressed other than 'A' and it is focused
          entryFocused = false;
        }
      }}
    >
      <box vertical className="sidebar-window" spacing={spacing}>
        <box
          horizontal
          className="ollama-header-container"
          halign={Gtk.Align.FILL}
        >
          <label
            label="Ollama"
            className="ollama"
            halign={Gtk.Align.START}
            hexpand={true}
          />
        </box>
        <box horizontal halign={Gtk.Align.FILL}>
          <label
            label={greeting}
            className="greeting"
            halign={Gtk.Align.START}
          />
        </box>
        <box vertical spacing={spacing} halign={Gtk.Align.FILL} hexpand={true}>
          <label
            label={bind(ollamaResponse)}
            className="p"
            wrap={true}
            halign={Gtk.Align.FILL}
          />
        </box>
        <box
          vertical
          spacing={spacing}
          halign={Gtk.Align.FILL}
          valign={Gtk.Align.END}
        >
          <box horizontal spacing={spacing}>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Tell me what" />
              <label class="label-subtext" label="you can do" />
            </box>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Give me" />
              <label class="label-subtext" label="study tips" />
            </box>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Save me" />
              <label class="label-subtext" label="time" />
            </box>
            <box vertical className="sidebar-prompt-example">
              <label class="label-paragraph" label="Inspire" />
              <label class="label-subtext" label="me" />
            </box>
          </box>
          <box horizontal spacing={spacing}>
            {Entry}
            {NewConversationButton}
          </box>
        </box>
      </box>
    </PopupWindow>
  );
};
