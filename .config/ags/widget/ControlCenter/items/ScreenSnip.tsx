import Gio from "gi://Gio";
import GLib from "gi://GLib"; // Import GLib for user directories
import ControlCenterButton from "../ControlCenterButton";
import icons from "../../../lib/icons";

const takeScreensnip = () => {
  // Get the Pictures directory or fallback to the home directory
  const picturesDir =
    GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES) ||
    GLib.get_home_dir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const screensnipPath = `${picturesDir}/Screensnips/screensnip-${timestamp}.png`;

  try {
    // Ensure the Screensnips directory exists
    if (!GLib.file_test(`${picturesDir}/Screensips`, GLib.FileTest.IS_DIR)) {
      GLib.mkdir_with_parents(`${picturesDir}/Screensnips`, 0o755);
    }

    // Create a subprocess to execute the `grim` command with `slurp`
    const subprocess = Gio.Subprocess.new(
      ["sh", "-c", `grim -g "$(slurp)" "${screensnipPath}" | wl-copy`],
      Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
    );

    // Wait for the process to complete
    subprocess.communicate_utf8_async(null, null, (proc, res) => {
      try {
        proc.communicate_utf8_finish(res);
        console.log("Screensnip saved to:", screensnipPath);
      } catch (err) {
        console.error("Failed to take screensnip:", err.message);
      }
    });
  } catch (err) {
    console.error("Error initializing subprocess:", err.message);
  }
};

export default () => {
  return (
    <ControlCenterButton
      icon={icons.screensnip}
      onClick={takeScreensnip} // Trigger the screensnip function on click
    />
  );
};
