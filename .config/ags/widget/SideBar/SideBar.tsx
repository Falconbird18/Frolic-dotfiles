import { bind, exec, Variable } from "astal";
import { App, Gtk, Astal, Widget } from "astal/gtk3";
const { GLib, Gio } = imports.gi;
import { spacing } from "../../lib/variables";
import PopupWindow from "../../common/PopupWindow";
import icons from "../../lib/icons";

// const GEMINI_API_KEY = "AIzaSyAJS1WVALYZ-gvaMr2DVKX1kEj7nuvcOew";

// Array to store chat messages
const chatHistory = Variable([]);
// Variable to track if greeting should be shown
const showGreeting = Variable(true);

const ollamaRunningStatus = Variable(false);


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
  "gemini",
  // Add more models as needed
];

const modelIcons = {
  "llama3.2": icons.models.llama || "dialog-information-symbolic", // Fallback icon if not in icons
  "gemma2:2b": icons.models.gemma || "dialog-question-symbolic",
  phi3: icons.models.phi3 || "dialog-warning-symbolic",
  gemini: icons.models.gemini || "dialog-question-symbolic",
};

function loadGeminiApiKey(): string {
  const configDir = GLib.get_user_config_dir();
  const appName = "ags";
  const configPath = GLib.build_filenamev([
    configDir,
    appName,
    "gemini-key.json",
  ]);

  try {
    const file = Gio.File.new_for_path(configPath);
    const [success, contents] = file.load_contents(null);
    if (!success) {
      return ""; // File doesn't exist or can't be read, return empty
    }

    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(contents);
    const config = JSON.parse(jsonString);

    return config.gemini_api_key || "";
  } catch (error) {
    console.error(
      `Failed to load Gemini API key from ${configPath}: ${error.message}`,
    );
    return ""; // Return empty string on error
  }
}

function saveGeminiApiKey(apiKey: string): boolean {
  const configDir = GLib.get_user_config_dir();
  const appName = "ags"; // Replace with your actual app name
  const configPath = GLib.build_filenamev([
    configDir,
    appName,
    "gemini-key.json",
  ]);

  try {
    const config = { gemini_api_key: apiKey };
    const jsonString = JSON.stringify(config);

    const file = Gio.File.new_for_path(configPath);
    const dir = file.get_parent();
    if (!dir.query_exists(null)) {
      dir.make_directory_with_parents(null); // Create directory if it doesn't exist
    }

    file.replace_contents(
      jsonString,
      null,
      false,
      Gio.FileCreateFlags.REPLACE_DESTINATION,
      null,
    );

    // Set file permissions to owner-only (600)
    const fileInfo = new Gio.FileInfo();
    fileInfo.set_attribute_uint32("unix::mode", 0o600);
    file.set_attributes_from_info(fileInfo, Gio.FileQueryInfoFlags.NONE, null);

    return true;
  } catch (error) {
    console.error(
      `Failed to save Gemini API key to ${configPath}: ${error.message}`,
    );
    return false;
  }
}

let GEMINI_API_KEY = loadGeminiApiKey();

// Variable to track the selected model
const selectedModel = Variable(models[0]);

// Create buttons for each model
const ModelButtons = () => (
  <box horizontal halign={Gtk.Align.CENTER} expand={false}>
    <box
      horizontal
      className="model-buttons"
      halign={Gtk.Align.CENTER}
      expand={false}
    >
      {models.map((model) => (
        <button
          className={bind(selectedModel).as(
            (m) => `model-button${m === model ? " active" : ""}`,
          )}
          onClicked={() => selectedModel.set(model)}
          tooltip_text={model}
        >
          <Widget.Icon icon={modelIcons[model]} size={24} />
        </button>
      ))}
    </box>
  </box>
);

async function startOllama() {
  try {
    const ollamaRunning = await isOllamaRunning();
    if (ollamaRunning) {
      console.log("Ollama server is already running");
      const timestamp = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      chatHistory.set([
        ...chatHistory.get(),
        { sender: "ollama", text: "Ollama server is already running.", timestamp },
      ]);
      return;
    }

    const subprocess = new Gio.Subprocess({
      argv: ["ollama", "serve"],
      flags: Gio.SubprocessFlags.NONE,
    });
    subprocess.init(null);
    console.log("Started Ollama server");
    const timestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    chatHistory.set([
      ...chatHistory.get(),
      { sender: "ollama", text: "Ollama server started.", timestamp },
    ]);
  } catch (error) {
    console.error("Failed to start Ollama:", error.message);
    const timestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    chatHistory.set([
      ...chatHistory.get(),
      { sender: "ollama", text: `Failed to start Ollama: ${error.message}`, timestamp },
    ]);
  }
}

async function checkOllamaStatus() {
  const isRunning = await isOllamaRunning();
  ollamaRunningStatus.set(isRunning);
}

checkOllamaStatus();

const StartOllamaButton = bind(ollamaRunningStatus).as((isRunning) =>
  isRunning ? null : ( //Return null to hide it entirely
    <Widget.Box className="card" halign={Gtk.Align.FILL}>
      <Widget.Label label="Ollama is not started." className="subtext" />
      <Widget.Box halign={Gtk.Align.END} hexpand={false}>
        <Widget.Button
          label="Start Ollama"
          className="primary-button"
          onClicked={async () => {
            await startOllama();
          }}
        />
      </Widget.Box>
    </Widget.Box>
  )
);


// Function to split message into parts (regular text and code blocks)
function splitMessageParts(
  text: string,
): { type: "text" | "code" | "math" | "display_math"; content: string }[] {
  const parts: {
    type: "text" | "code" | "math" | "display_math";
    content: string;
  }[] = [];
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
  const inlineMathRegex = /\$([^$\n]+?)\$/g;
  let remainingText = text;
  let lastIndex = 0;

  // Helper function to process regex matches
  function processMatches(
    regex: RegExp,
    type: "code" | "math" | "display_math",
  ) {
    let match;
    regex.lastIndex = 0; // Reset regex index
    while ((match = regex.exec(remainingText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: remainingText.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type,
        content: match[1].trim(),
      });
      lastIndex = regex.lastIndex;
    }
  }

  // Process display math first ($$...$$)
  processMatches(displayMathRegex, "display_math");

  // Update remaining text after display math
  if (parts.length > 0) {
    remainingText = remainingText.slice(lastIndex);
    lastIndex = 0;
    parts.length = 0; // Reset parts and rebuild with remaining text
    processMatches(displayMathRegex, "display_math");
  }

  // Process code blocks (```...```)
  let tempText = remainingText.slice(lastIndex);
  processMatches(codeBlockRegex, "code");

  // Update remaining text after code blocks
  if (parts.length > 0) {
    remainingText = remainingText.slice(lastIndex);
    lastIndex = 0;
    parts.length = 0; // Reset parts and rebuild
    processMatches(displayMathRegex, "display_math");
    tempText = remainingText.slice(lastIndex);
    processMatches(codeBlockRegex, "code");
  }

  // Process inline math ($...$)
  remainingText = tempText;
  lastIndex = 0;
  processMatches(inlineMathRegex, "math");

  // Add remaining text
  if (lastIndex < remainingText.length) {
    parts.push({
      type: "text",
      content: remainingText.slice(lastIndex),
    });
  }

  // If no special parts were found, add the whole text as regular text
  if (parts.length === 0) {
    parts.push({
      type: "text",
      content: text,
    });
  }

  return parts;
}

// Updated markdownToPango for regular text only
function markdownToPango(text: string): string {
  let result = text;

  // Escape Pango special characters
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

  return result;
}

// New function to format math expressions
function formatMath(content: string, isDisplay: boolean = false): string {
  let result = content;

  // Replace common LaTeX commands with Pango approximations
  // Superscripts: x^2
  result = result.replace(/(\w+)\^(\d+)/g, "$1<sup>$2</sup>");

  // Subscripts: x_1
  result = result.replace(/(\w+)_(\d+)/g, "$1<sub>$2</sub>");

  // Fractions: \frac{a}{b}
  result = result.replace(
    /\\frac\{([^}]+)\}\{([^}]+)\}/g,
    "<span>$1</span>/<span>$2</span>",
  );

  // Wrap in monospace for math-like appearance
  result = `<tt>${result}</tt>`;

  // For display math, increase size and center it
  if (isDisplay) {
    result = `<span size="large">${result}</span>`;
  }

  return result;
}

async function queryGemini(prompt: string) {
  console.log("Starting queryGemini with prompt:", prompt);
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

    const subprocess = new Gio.Subprocess({
      argv: [
        "curl",
        "--silent",
        "--no-buffer",
        "-N",
        "-X",
        "POST",
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${GEMINI_API_KEY}`,
        "-H",
        "Content-Type: application/json",
        "-d",
        JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      ],
      flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE,
    });

    subprocess.init(null);
    console.log("Gemini subprocess initialized");

    const stdout = new Gio.DataInputStream({
      base_stream: subprocess.get_stdout_pipe(),
    });

    let fullResponse = "";
    const geminiTimestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const readStream = () => {
      return new Promise((resolve) => {
        const readNextLine = () => {
          stdout.read_line_async(
            GLib.PRIORITY_DEFAULT,
            null,
            (source, result) => {
              const [line, length] = stdout.read_line_finish_utf8(result);
              if (line === null) {
                console.log("Gemini stream ended");
                try {
                  // Parse the full response, accounting for the outer array
                  const parsedArray = JSON.parse(fullResponse);
                  const firstResponse = parsedArray[0]; // Get the first object in the array
                  const geminiResponse =
                    firstResponse?.candidates[0]?.content?.parts[0]?.text ||
                    "No response received";
                  console.log("Full Gemini response:", geminiResponse);
                  chatHistory.set([
                    ...chatHistory.get(),
                    {
                      sender: "ollama",
                      text: geminiResponse,
                      timestamp: geminiTimestamp,
                    },
                  ]);
                } catch (e) {
                  console.error(
                    "Error parsing full Gemini response:",
                    e.message,
                    "Response:",
                    fullResponse,
                  );
                  chatHistory.set([
                    ...chatHistory.get(),
                    {
                      sender: "ollama",
                      text: `Error parsing response: ${e.message}`,
                      timestamp: geminiTimestamp,
                    },
                  ]);
                }
                resolve();
                return;
              }

              console.log("Raw line from Gemini stream:", line);
              fullResponse += line; // Accumulate the response
              readNextLine(); // Continue reading
            },
          );
        };

        console.log("Starting to read Gemini stream");
        readNextLine();
      });
    };

    const waitForSubprocess = () =>
      new Promise((resolve, reject) => {
        subprocess.wait_async(null, (proc, result) => {
          try {
            subprocess.wait_finish(result);
            console.log("Gemini subprocess completed");
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });

    console.log("Starting Gemini stream reading and waiting for subprocess");
    const readPromise = readStream();
    await waitForSubprocess();
    await readPromise;

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
    console.error("Gemini streaming error:", error);
  }
}

// Add this helper function to check if Ollama is running
async function isOllamaRunning(): Promise<boolean> {
  try {
    const subprocess = new Gio.Subprocess({
      argv: ["curl", "--silent", "http://localhost:11434"],
      flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE,
    });
    subprocess.init(null);

    const stdout = new Gio.DataInputStream({
      base_stream: subprocess.get_stdout_pipe(),
    });

    return new Promise((resolve) => {
      let response = "";
      const readResponse = () => {
        stdout.read_line_async(GLib.PRIORITY_DEFAULT, null, (source, result) => {
          const [line, length] = stdout.read_line_finish_utf8(result);
          if (line === null) {
            // Check if the response contains "Ollama" to confirm it’s the right server
            resolve(response.includes("Ollama"));
            return;
          }
          response += line;
          readResponse();
        });
      };
      subprocess.wait_check_async(null, (proc, result) => {
        try {
          subprocess.wait_check_finish(result);
          readResponse();
        } catch (e) {
          resolve(false);
        }
      });
    });
  } catch (error) {
    return false;
  }
}

async function queryOllama(prompt: string) {
  const currentModel = selectedModel.get();

  // Handle API key submission with \key command
  if (prompt.startsWith("\\key ")) {
    const apiKey = prompt.substring(5).trim();
    if (currentModel === "gemini") {
      const timestamp = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      if (saveGeminiApiKey(apiKey)) {
        GEMINI_API_KEY = apiKey; // Update the in-memory key
        chatHistory.set([
          ...chatHistory.get(),
          { sender: "user", text: prompt, timestamp },
          {
            sender: "ollama",
            text: "Gemini API key saved successfully!",
            timestamp,
          },
        ]);
      } else {
        chatHistory.set([
          ...chatHistory.get(),
          { sender: "user", text: prompt, timestamp },
          {
            sender: "ollama",
            text: "Failed to save Gemini API key.",
            timestamp,
          },
        ]);
      }
    } else {
      const timestamp = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      chatHistory.set([
        ...chatHistory.get(),
        { sender: "user", text: prompt, timestamp },
        {
          sender: "ollama",
          text: "Switch to Gemini model to set the API key.",
          timestamp,
        },
      ]);
    }
    return;
  }

  if (currentModel === "gemini") {
    if (!GEMINI_API_KEY) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      chatHistory.set([
        ...chatHistory.get(),
        { sender: "user", text: prompt, timestamp },
        {
          sender: "ollama",
          text: "No Gemini API key found. Please submit your key using: \\key YOUR_API_KEY",
          timestamp,
        },
      ]);
      return;
    }
    await queryGemini(prompt);
  } else {
    const ollamaRunning = await isOllamaRunning();
    const timestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (!ollamaRunning) {
      console.log("Ollama is not running");
      chatHistory.set([
        ...chatHistory.get(),
        { sender: "user", text: prompt, timestamp },
        {
          sender: "ollama",
          text: "Ollama server is not running. Please click 'Start Ollama' or run 'ollama serve' manually.",
          timestamp,
        },
      ]);
      return;
    }

    console.log("Starting queryOllama with prompt:", prompt);
    try {
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
            model: currentModel,
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
                  if (!ollamaResponse) {
                    chatHistory.set([
                      ...chatHistory.get(),
                      {
                        sender: "ollama",
                        text: "No response received from Ollama.",
                        timestamp: ollamaTimestamp,
                      },
                    ]);
                  }
                  resolve();
                  return;
                }

                console.log("Raw line from stream:", line);
                if (!line.trim() || !line.startsWith("{")) {
                  console.log("Skipping non-JSON line:", line);
                  readNextLine();
                  return;
                }

                try {
                  const parsed = JSON.parse(line);
                  if (parsed.response) {
                    ollamaResponse += parsed.response;
                    console.log("Partial response:", ollamaResponse);
                    const currentHistory = chatHistory.get();
                    const lastMessage = currentHistory[currentHistory.length - 1];
                    if (
                      lastMessage?.sender === "ollama" &&
                      lastMessage?.timestamp === ollamaTimestamp
                    ) {
                      chatHistory.set([
                        ...currentHistory.slice(0, -1),
                        {
                          sender: "ollama",
                          text: ollamaResponse,
                          timestamp: ollamaTimestamp,
                        },
                      ]);
                    } else {
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
                  console.error("Error parsing stream line:", e.message, "Line:", line);
                }

                readNextLine();
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
      console.error("Streaming error:", error);
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
    if (showGreeting.get()) {
      showGreeting.set(false); // Hide greeting immediately on submission
    }
    queryOllama(prompt);
    Entry.set_text(""); // Clear entry after sending
  }
}

function getModelDisplayName(model: string): string {
  if (model.includes("llama")) return "Llama";
  if (model.includes("gemma")) return "Gemma";
  if (model === "gemini") return "Gemini";
  if (model === "phi3") return "Phi3";
  return "Ollama";
}

const Entry = new Widget.Entry({
  placeholder_text: bind(selectedModel).as(
    (model) => `Ask ${getModelDisplayName(model)}`,
  ),
  canFocus: true,
  className: "message-input",
  hexpand: true,
  on_activate: () => submitPrompt(),
  on_key_press_event: (self, event) => {
    return false;
  },
  on_changed: (self) => {
    const text = self.get_text();
    if (text.length > 0) {
      self.className = "message-input expanded";
    } else {
      self.className = "message-input";
    }
  },
  wrap_mode: Gtk.WrapMode.WORD_CHAR,
  max_height: 100,
  vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
  max_length: 0,
});

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
  if (currentModel === "gemini") return "Gemini"; // Add Gemini name
  return "Ollama"; // Default for other models like phi3
}

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
          <box vertical spacing={2}>
            {splitMessageParts(msg.text).map((part, index) => {
              if (part.type === "text") {
                return (
                  <label
                    key={`text-${index}`}
                    label={markdownToPango(part.content)}
                    use_markup={true}
                    className="message-text"
                    wrap={true}
                    halign={
                      msg.sender === "user" ? Gtk.Align.END : Gtk.Align.START
                    }
                    hexpand={false}
                    max_width_chars={40}
                  />
                );
              } else if (part.type === "code") {
                return (
                  <box
                    key={`code-${index}`}
                    className="code-block"
                    spacing={4}
                    css={`
                background-color: #2e3440;
                border: 1px solid #4b5563;
                padding: 8px;
                border-radius: 4px;
                `}
                  >
                    <label
                      label={part.content}
                      className="code-text"
                      css={`
                  font-family: monospace;
                  color: #d8dee9;
                  `}
                      wrap={true}
                      hexpand={false}
                      max_width_chars={40}
                    />
                  </box>
                );
              } else if (part.type === "math") {
                return (
                  <label
                    key={`math-${index}`}
                    label={formatMath(part.content, false)}
                    use_markup={true}
                    className="math-text"
                    wrap={true}
                    halign={
                      msg.sender === "user" ? Gtk.Align.END : Gtk.Align.START
                    }
                    hexpand={false}
                    max_width_chars={40}
                  />
                );
              } else if (part.type === "display_math") {
                return (
                  <box
                    key={`display-math-${index}`}
                    className="display-math"
                    css={`
                padding: 8px;
                text-align: center;
                `}
                  >
                    <label
                      label={formatMath(part.content, true)}
                      use_markup={true}
                      className="math-text"
                      wrap={true}
                      halign={Gtk.Align.CENTER}
                      hexpand={false}
                      max_width_chars={40}
                    />
                  </box>
                );
              }
            })}
          </box>
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
          !Entry.has_focus
        ) {
          Entry.grab_focus();
          entryFocused = true;
          return true;
        } else if (Entry.has_focus) {
          return false;
        }
        return false;
      }}
      >
      <box
      vertical
      className="sidebar-window"
      spacing={spacing}
      css="min-width: 300px;"
      >
      <box vertical halign={Gtk.Align.FILL} spacing={spacing}>
      {NewConversationButton}
      {bind(showGreeting).as((visible) =>
        visible ? <ModelButtons /> : <box visible={false} />,
      )}
      </box>
      {bind(showGreeting).as((visible) =>
        visible ? (
          <box
          vertical
          halign={Gtk.Align.FILL}
          valign={Gtk.Align.CENTER}
          vexpand={true}
          >
          <box horizontal halign={Gtk.Align.CENTER}>
          <label
          label={greeting}
          className="greeting"
          halign={Gtk.Align.CENTER}
          />
          </box>
          </box>
        ) : (
          <box visible={false} />
        ),
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
      {StartOllamaButton}
      {bind(showGreeting).as((visible) =>
        visible ? (
          <box horizontal spacing={spacing} className="sidebar-prompt-container">
          <button
          className="sidebar-prompt-button"
          onClicked={() => {
            Entry.set_text("Tell me what you can do");
            submitPrompt();
          }}
          >
          <box vertical className="sidebar-prompt-example">
          <label className="paragraph" label="Tell me what" />
          <label className="subtext" label="you can do" />
          </box>
          </button>
          <button
          className="sidebar-prompt-button"
          onClicked={() => {
            Entry.set_text("Give me study tips");
            submitPrompt();
          }}
          >
          <box vertical className="sidebar-prompt-example">
          <label className="paragraph" label="Give me" />
          <label className="subtext" label="study tips" />
          </box>
          </button>
          <button
          className="sidebar-prompt-button"
          onClicked={() => {
            Entry.set_text("Save me time");
            submitPrompt();
          }}
          >
          <box vertical className="sidebar-prompt-example">
          <label className="paragraph" label="Save me" />
          <label className="subtext" label="time" />
          </box>
          </button>
          <button
          className="sidebar-prompt-button"
          onClicked={() => {
            Entry.set_text("Inspire me");
            submitPrompt();
          }}
          >
          <box vertical className="sidebar-prompt-example">
          <label className="paragraph" label="Inspire" />
          <label className="subtext" label="me" />
          </box>
          </button>
          </box>
        ) : (
          <box visible={false} />
        ),
      )}
      <InputBox />
      </box>
      </box>
      </PopupWindow>
  );
};
