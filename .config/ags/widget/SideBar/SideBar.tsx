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

function markdownToPango(text: string): string {
  let result = text;

  // Escape Pango special characters first
  result = result
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text** or __text__
  result = result
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/__(.+?)__/g, "<b>$1</b>");

  // Italic: *text* or _text_
  result = result
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/_(.+?)_/g, "<i>$1</i>");

  // Headings: # Heading, ## Heading, ### Heading
  result = result
    .replace(/^### (.+)$/gm, '<span size="large"><b>$1</b></span>')
    .replace(/^## (.+)$/gm, '<span size="x-large"><b>$1</b></span>')
    .replace(/^# (.+)$/gm, '<span size="xx-large"><b>$1</b></span>');

  // Unordered lists: - item or * item
  result = result.replace(/^[-*]\s+(.+)$/gm, "• $1");

  // Preserve line breaks
  result = result.replace(/\n/g, "\n");

  // Debug the converted output
  console.log(`Original text: "${text}"`);
  console.log(`Converted Pango markup: "${result}"`);

  return result;
}

async function queryOllama(prompt) {
  console.log("Starting queryOllama with prompt:", prompt);
  try {
    const timestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    console.log("Adding user message to chatHistory");
    chatHistory.set([
      ...chatHistory.get(),
      { sender: "user", text: prompt, timestamp },
    ]);

    console.log("Launching curl subprocess");
    const subprocess = new Gio.Subprocess({
      argv: [
        "curl",
        "--silent",
        "--no-buffer",
        "-N",
        "-X",
        "POST",
        "http://localhost:11434/api/generate",
        "-d",
        JSON.stringify({
          model: selectedModel.get(),
          prompt: prompt,
          stream: true,
        }),
      ],
      flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE,
    });

    subprocess.init(null);
    console.log("Subprocess initialized");

    const stdout = new Gio.DataInputStream({
      base_stream: subprocess.get_stdout_pipe(),
    });

    let ollamaResponse = "";
    const ollamaTimestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Asynchronous stream reading
    const readStream = () => {
      return new Promise((resolve) => {
        const readNextLine = () => {
          stdout.read_line_async(
            GLib.PRIORITY_DEFAULT,
            null,
            (source, result) => {
              const [line, length] = stdout.read_line_finish_utf8(result);
              if (line === null) {
                console.log("Stream ended");
                // Remove the duplicate addition here
                resolve();
                return;
              }

              console.log("Raw line from stream:", line);
              if (!line.trim() || !line.startsWith("{")) {
                console.log("Skipping non-JSON line:", line);
                readNextLine(); // Continue reading
                return;
              }

              try {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                  ollamaResponse += parsed.response;
                  console.log("Partial response:", ollamaResponse);
                  // Update only the latest Ollama message during streaming
                  const currentHistory = chatHistory.get();
                  const lastMessage = currentHistory[currentHistory.length - 1];
                  if (
                    lastMessage?.sender === "ollama" &&
                    lastMessage?.timestamp === ollamaTimestamp
                  ) {
                    // Update existing message
                    chatHistory.set([
                      ...currentHistory.slice(0, -1),
                      {
                        sender: "ollama",
                        text: ollamaResponse,
                        timestamp: ollamaTimestamp,
                      },
                    ]);
                  } else {
                    // Add new message
                    chatHistory.set([
                      ...currentHistory,
                      {
                        sender: "ollama",
                        text: ollamaResponse,
                        timestamp: ollamaTimestamp,
                      },
                    ]);
                  }
                }
              } catch (e) {
                console.error(
                  "Error parsing stream line:",
                  e.message,
                  "Line:",
                  line,
                );
              }

              readNextLine(); // Continue reading the next line
            },
          );
        };

        console.log("Starting to read stream");
        readNextLine();
      });
    };

    const waitForSubprocess = () =>
      new Promise((resolve, reject) => {
        subprocess.wait_async(null, (proc, result) => {
          try {
            subprocess.wait_finish(result);
            console.log("Subprocess completed");
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });

    console.log("Starting stream reading and waiting for subprocess");
    const readPromise = readStream();
    await waitForSubprocess();
    await readPromise;

    if (showGreeting.get()) {
      showGreeting.set(false);
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    chatHistory.set([
      ...chatHistory.get(),
      { sender: "user", text: prompt, timestamp },
      { sender: "ollama", text: `Error: ${error.message}`, timestamp },
    ]);
    if (showGreeting.get()) {
      showGreeting.set(false);
    }
    console.error("Streaming error:", error);
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
  className: "message-input",
  hexpand: true, // Makes it take available horizontal space
  on_activate: () => submitPrompt(), // Enter key submits
  on_key_press_event: (self, event) => {
    return false; // Let entry handle all key events
  },
  on_changed: (self) => {
    const text = self.get_text();
    if (text.length > 0) {
      self.className = "message-input expanded";
    } else {
      self.className = "message-input";
    }
  },
  // New properties for wrapping and scrolling
  wrap_mode: Gtk.WrapMode.WORD_CHAR, // Wrap at word boundaries or characters
  max_height: 100, // Maximum height in pixels (adjust as needed)
  vscrollbar_policy: Gtk.PolicyType.AUTOMATIC, // Show scrollbar when needed
  max_length: 0, // Remove any character limit (0 means unlimited)
});

// Also update the containing box to ensure proper layout
const InputBox = () => (
  <box horizontal spacing={spacing} halign={Gtk.Align.FILL}>
    {Entry}
    {SubmitButton}
  </box>
);

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
        <box
          vertical
          className={`message ${msg.sender}-message`}
          spacing={2}
          halign={msg.sender === "user" ? Gtk.Align.END : Gtk.Align.START}
          hexpand={false}
        >
          <label
            label={`${getSenderName(msg.sender)}`}
            className="message-sender"
            halign={msg.sender === "user" ? Gtk.Align.END : Gtk.Align.START}
          />
          <label
            label={markdownToPango(msg.text)} // Convert Markdown to Pango markup
            use_markup={true} // Enable Pango markup rendering
            className="message-text"
            wrap={true}
            halign={msg.sender === "user" ? Gtk.Align.END : Gtk.Align.START}
            hexpand={false}
            max_width_chars={40}
          />
          <label
            label={`${msg.timestamp}`}
            className="message-time"
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
          !Entry.has_focus // Changed from has_focus() to has_focus
        ) {
          Entry.grab_focus();
          entryFocused = true;
          return true;
        } else if (Entry.has_focus) {
          // Changed from has_focus() to has_focus
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
          <InputBox />
        </box>
      </box>
    </PopupWindow>
  );
};
