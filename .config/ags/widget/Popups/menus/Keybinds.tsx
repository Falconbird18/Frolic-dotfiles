import { App, Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, exec, Variable } from "astal";
import PopupMenu from "../PopupMenu";
import { spacing } from "../../../lib/variables";

const { GLib, Gio } = imports.gi;

// Define key icon mappings (update your icon names/paths accordingly)
const keyIcons = {
  "Super": "dialog-error",    // Replace with your Windows-like icon name/path
  "Shift": "dialog-error",    // Replace with your Shift icon
  "Ctrl": "dialog-error",     // Replace with your Ctrl icon
  "Alt": "dialog-error",      // Replace with your Alt icon
  "XF86MonBrightnessUp": "audio-volume-high",
  "XF86MonBrightnessDown": "audio-volume-low",
  // Add more keys as needed
};

// Map keycodes to actual keys (expand if needed)
const keycodeMap = {
  "code:61": "/"
};

// --------------------------------------------------------------------
// Improved config parser:
//   • Ignores empty lines and hidden ones (lines containing "# [hidden]").
//   • Uses lines starting with "#!" for section headings.
//   • Sets description when a line starts with "#[description]"
//   • Splits the bind line by commas and then processes the key combination
// --------------------------------------------------------------------
function parseConfig(filePath) {
  const file = Gio.File.new_for_path(filePath);
  const [, contents] = file.load_contents(null);
  const text = new TextDecoder("utf-8").decode(contents);
  const lines = text.split("\n");

  let currentSection = "Miscellaneous";
  const shortcuts = [];
  let currentDescription = "";

  for (let line of lines) {
    line = line.trim();
    if (!line || line.includes("# [hidden]")) continue;

    if (line.startsWith("#!")) {
      currentSection = line.replace("#!", "").trim();
      continue;
    }

    if (line.startsWith("#[description]")) {
      currentDescription = line.replace("#[description]", "").trim();
      continue;
    }

    // Parse lines that start with any form of bind
    if (
      line.startsWith("bind") ||
      line.startsWith("bindl") ||
      line.startsWith("bindle") ||
      line.startsWith("bindr") ||
      line.startsWith("binde")
    ) {
      // Split by commas and clean up whitespace
      let parts = line.split(",").map(p => p.trim());
      if (parts.length < 2) continue; // Malformed bind line?

      // The second part is the key combination. It may contain a +-separated list.
      let keyCombo = parts[1];
      let keys = keyCombo
        ? keyCombo.split("+").map(key => keycodeMap[key.trim()] || key.trim())
        : [];

      shortcuts.push({
        section: currentSection,
        description: currentDescription || "No description",
        keys,
      });
      currentDescription = "";
    }
  }
  return shortcuts;
}

// --------------------------------------------------------------------
// Component for rendering a single key, either as an icon (if mapped)
// or as text
// --------------------------------------------------------------------
const KeyIcon = ({ keyName }) =>
  keyIcons[keyName] ? (
    <box className="key-icon">
      <icon icon={keyIcons[keyName]} className="icon" />
    </box>
  ) : (
    <box className="key-icon">
      <label label={keyName} className="key-text" />
    </box>
  );

// --------------------------------------------------------------------
// Helper component to arrange items in a grid with 4 columns
// This works by splitting our list of children into rows of 4
// and putting each row in a horizontal box inside a vertical box
// --------------------------------------------------------------------
const FourColumnGrid = ({ children, columns = 4, spacing: gridSpacing }) => {
  const rows = [];
  let currentRow = [];

  children.forEach((child, i) => {
    currentRow.push(child);
    if ((i + 1) % columns === 0) {
      rows.push(currentRow);
      currentRow = [];
    }
  });
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return (
    <box vertical spacing={gridSpacing}>
      {rows.map((row, rowIndex) => (
        <box horizontal spacing={gridSpacing} key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <box key={cellIndex} expand>{cell}</box>
          ))}
        </box>
      ))}
    </box>
  );
};

// --------------------------------------------------------------------
// Main component – the keybinds popup
// It groups the shortcuts by section and then lays out each section’s
// shortcuts in a four-column grid using our FourColumnGrid helper.
// --------------------------------------------------------------------
export default () => {
  // Read and parse the configuration file
  const shortcuts = parseConfig(
    GLib.get_home_dir() + "/.config/hypr/hyprland/keybinds.conf"
  );

  // Group shortcuts by section heading
  const sections = {};
  shortcuts.forEach((shortcut) => {
    if (!sections[shortcut.section]) {
      sections[shortcut.section] = [];
    }
    sections[shortcut.section].push(shortcut);
  });

  return (
    <PopupMenu label="Keybinds">
      <box vertical spacing={spacing}>
        {Object.keys(sections).map((sectionName) => (
          <box key={sectionName} vertical spacing={spacing}>
            <label label={sectionName} className="section-header" />
            <FourColumnGrid spacing={spacing} columns={4}>
              {sections[sectionName].map((shortcut, idx) => {
                // Build an array of key widgets interleaved with plus signs
                const keyNodes = shortcut.keys.reduce((nodes, key, i) => {
                  if (i > 0)
                    nodes.push(
                      <label label="+" className="plus-sign" key={`plus-${i}`} />
                    );
                  nodes.push(<KeyIcon keyName={key} key={`key-${i}`} />);
                  return nodes;
                }, []);

                return (
                  <box key={`${sectionName}-${idx}`} vertical spacing={spacing / 2}>
                    <box horizontal spacing={2}>
                      {keyNodes}
                    </box>
                    <label
                      label={shortcut.description}
                      className="description"
                      wrap
                    />
                  </box>
                );
              })}
            </FourColumnGrid>
          </box>
        ))}
      </box>
    </PopupMenu>
  );
};
