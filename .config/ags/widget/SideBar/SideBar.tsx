import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";
import icons from "../../lib/icons";

// Array to store chat messages
const chatHistory = Variable([]);
// Variable to track if greeting should be shown
const showGreeting = Variable(true);

// Message type definition
type ChatMessage = {
  sender: "user" | "ollama";
  text: string;
  timestamp: string;
};

// Available Ollama models
const models = [
  "llama3.2",
  "gemma2:2b",
  "phi3",
  // Add more models as needed
];

const modelIcons = {
  "llama3.2": icons.models.llama || "dialog-information-symbolic", // Fallback icon if not in icons
  "gemma2:2b": icons.models.gemma || "dialog-question-symbolic",
  phi3: icons.models.phi3 || "dialog-warning-symbolic",
};

// Variable to track the selected model
const selectedModel = Variable(models[0]);

// Create buttons for each model
const ModelButtons = () => (
  <box horizontal spacing={spacing} className="model-buttons">
    {models.map((model) => (
      <button
        className={`model-button ${bind(selectedModel).as((m) => (m === model ? "active" : ""))}`}
        onClicked={() => selectedModel.set(model)}
        tooltip_text={model} // Add tooltip to show model name on hover
      >
        <Widget.Icon
          icon={modelIcons[model]} // Use the mapped icon
          size={24} // Adjust size as needed
        />
      </button>
    ))}
  </box>
);

async function queryOllama(prompt) {
  try {
    const response = await exec([
      "curl",
      "-X",
      "POST",
      "http://localhost:11434/api/generate",
      "-d",
      JSON.stringify({
        model: selectedModel.get(), // Use selected model
        prompt: prompt,
        stream: false,
      }),
    ]);

    const result = JSON.parse(response);
    const timestamp = new Date().toLocaleTimeString();

    chatHistory.set([
      ...chatHistory.get(),
      { sender: "user", text: prompt, timestamp },
      {
        sender: "ollama",
        text: result.response || "No response received",
        timestamp,
      },
    ]);
    // Hide greeting after first prompt
    if (showGreeting.get()) {
      showGreeting.set(false);
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString();
    chatHistory.set([
      ...chatHistory.get(),
      { sender: "user", text: prompt, timestamp },
      { sender: "ollama", text: `Error: ${error.message}`, timestamp },
    ]);
    if (showGreeting.get()) {
      showGreeting.set(false);
    }
  }
}

// Reset conversation function
function resetConversation() {
  chatHistory.set([]);
  Entry.set_text("");
  showGreeting.set(true); // Show greeting again on reset
}

// Function to submit the prompt
function submitPrompt() {
  const prompt = Entry.get_text();
  if (prompt) {
    queryOllama(prompt);
    Entry.set_text(""); // Clear entry after sending
  }
}

const Entry = new Widget.Entry({
  placeholder_text: "Ask Ollama",
  canFocus: true,
  className: "location_input",
  primary_icon_name: "system-search-symbolic",
  on_activate: () => submitPrompt(), // Enter key submits
  on_key_press_event: (self, event) => {
    return false; // Let entry handle all key events
  },
  on_changed: (self) => {
    const text = self.get_text();
    if (text.length > 0) {
      self.className = "location_input expanded";
    } else {
      self.className = "location_input";
    }
  },
});

const SubmitButton = new Widget.Button({
  className: "primary-circular-button",
  onClicked: () => submitPrompt(),
  children: [
    new Widget.Icon({
      icon: icons.ui.arrow.right,
    }),
  ],
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

// Function to determine the sender name based on the model
function getSenderName(sender: "user" | "ollama") {
  if (sender === "user") return username;
  const currentModel = selectedModel.get();
  if (currentModel.includes("llama")) return "Llama";
  if (currentModel.includes("gemma")) return "Gemma";
  return "Ollama"; // Default for other models like phi3
}

// Chat message display component
const ChatMessages = () => (
  <box vertical spacing={spacing} halign={Gtk.Align.FILL} hexpand={true}>
    {bind(chatHistory).as((messages) =>
      messages.map((msg) => (
        <box vertical className={`message ${msg.sender}-message`} spacing={2}>
          <label
            label={`${getSenderName(msg.sender)} (${msg.timestamp}):`}
            className="message-sender"
            halign={msg.sender === "user" ? Gtk.Align.END : Gtk.Align.START}
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
        <box vertical halign={Gtk.Align.FILL} spacing={spacing}>
          {NewConversationButton}
          <ModelButtons />
        </box>
        {bind(showGreeting).as((visible) =>
          visible ? (
            <box horizontal halign={Gtk.Align.FILL}>
              <label
                label={greeting}
                className="greeting"
                halign={Gtk.Align.START}
              />
            </box>
          ) : null,
        )}
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
            <scrollable
              vscroll={Gtk.PolicyType.AUTOMATIC}
              hscroll={Gtk.PolicyType.NEVER}
              className="entry-container"
            >
              {Entry}
            </scrollable>
            {SubmitButton}
          </box>
        </box>
      </box>
    </PopupWindow>
  );
};
