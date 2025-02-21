import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";

// Array to store chat messages
const chatHistory = Variable([]);

// Message type definition
type ChatMessage = {
  sender: "user" | "ollama";
  text: string;
  timestamp: string;
};

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
    const timestamp = new Date().toLocaleTimeString();

    // Add user message to history
    chatHistory.set([
      ...chatHistory.get(),
      { sender: "user", text: prompt, timestamp },
    ]);

    // Add Ollama response to history
    chatHistory.set([
      ...chatHistory.get(),
      {
        sender: "ollama",
        text: result.response || "No response received",
        timestamp,
      },
    ]);
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString();
    chatHistory.set([
      ...chatHistory.get(),
      { sender: "user", text: prompt, timestamp },
      { sender: "ollama", text: `Error: ${error.message}`, timestamp },
    ]);
  }
}

// Reset conversation function
function resetConversation() {
  chatHistory.set([]);
  Entry.set_text("");
}

const Entry = new Widget.Entry({
  placeholder_text: "Ask Ollama",
  canFocus: true,
  className: "location_input",
  primary_icon_name: "system-search-symbolic",
  on_activate: (self) => {
    const prompt = self.get_text();
    if (prompt) {
      queryOllama(prompt);
      self.set_text(""); // Clear entry after sending
    }
  },
  on_key_press_event: (self, event) => {
    return false; // Let entry handle all key events
  },
});

const NewConversationButton = new Widget.Button({
  label: "New Chat",
  className: "primary-button",
  onClicked: () => resetConversation(),
});

let entryFocused = false;

const username =
  GLib.get_user_name().charAt(0).toUpperCase() + GLib.get_user_name().slice(1);

const greeting = `Hello, ${username}`;

// Chat message display component
const ChatMessages = () => (
  <box vertical spacing={spacing} halign={Gtk.Align.FILL} hexpand={true}>
    {bind(chatHistory).as((messages) =>
      messages.map((msg) => (
        <box
          vertical
          className={`message ${msg.sender === "user" ? "user-message" : "ollama-message"}`}
          spacing={2}
        >
          <label
            label={`${msg.sender === "user" ? username : "Ollama"} (${msg.timestamp}):`}
            className="message-sender"
          />
          <label
            label={msg.text}
            className="message-text"
            wrap={true}
            halign={msg.sender === "user" ? Gtk.Align.END : Gtk.Align.START}
          />
        </box>
      )),
    )}
  </box>
);

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
          App.toggle_window(self.name);
          return true;
        } else if (
          keyEvent &&
          keyCode === 65 &&
          !entryFocused &&
          !Entry.has_focus()
        ) {
          Entry.grab_focus();
          entryFocused = true;
          return true;
        } else if (Entry.has_focus()) {
          return false;
        }
        return false;
      }}
    >
      <box vertical className="sidebar-window" spacing={spacing}>
        <box
          horizontal
          className="ollama-header-container"
          halign={Gtk.Align.FILL}
        >
          <label
            label="Ollama Chat"
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
        <scrollable
          vscroll={Gtk.PolicyType.AUTOMATIC}
          hscroll={Gtk.PolicyType.NEVER}
          className="chat-container"
          vexpand={true}
        >
          <ChatMessages />
        </scrollable>
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
