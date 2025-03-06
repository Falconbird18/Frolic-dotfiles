import WebKit2 from "gi://WebKit2?version=4.1";
import { App, Gtk, Astal } from "astal/gtk3";
const { GLib } = imports.gi;
import PopupWindow from "../../common/PopupWindow";

const WebViewWidget = () => {
  console.log("WebViewWidget: Start");

  // Create and configure the WebKit2 WebView.
  const webView = new WebKit2.WebView();
  console.log("WebViewWidget: WebView created");
  const settings = webView.get_settings();
  settings.set_enable_javascript(true);
  settings.set_user_agent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
  );
  console.log("WebViewWidget: WebView settings configured");

  // Create a Gtk.ScrolledWindow to host the WebView.
  const scrolledWindow = new Gtk.ScrolledWindow({
    hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
    vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
  });
  // Set an explicit size on the container.
  scrolledWindow.set_size_request(400, 400);
  console.log("WebViewWidget: ScrolledWindow created");
  scrolledWindow.add(webView);

  // Show the container and its children.
  scrolledWindow.show_all();
  console.log("WebViewWidget: ScrolledWindow shown");

  // Delay loading google.com until after the widget is realized.
  GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
    try {
      console.log("WebViewWidget: Loading google.com");
      webView.load_uri("https://www.bing.com");
    } catch (error) {
      console.error("Error during load_uri:", error);
    }
    return GLib.SOURCE_REMOVE;
  });

  // Connect event handlers for load progress and errors.
  webView.connect("load-changed", (self, loadEvent) => {
    console.log(`WebView load event: ${loadEvent}`);
    if (loadEvent === WebKit2.LoadEvent.FINISHED) {
      console.log("Load finished, current URI:", webView.get_uri());
      webView.queue_draw();
      scrolledWindow.queue_draw();
    }
  });

  webView.connect("load-failed", (self, loadEvent, failingUri, error) => {
    console.error(`Failed to load ${failingUri}: ${error.message}`);
  });

  console.log("WebViewWidget: Event handlers connected");

  // Instead of wrapping our GTK widget in a (possibly undefined) JSX custom tag,
  // we directly return the native GTK widget.
  return scrolledWindow;
};

export default () => {
  console.log("Main Component: Start");
  return (
    <PopupWindow
      scrimType="transparent"
      layer={Astal.Layer.OVERLAY}
      visible={true}
      margin={12}
      vexpand={true}
      hexpand={true}
      keymode={Astal.Keymode.EXCLUSIVE}
      name="Webkit"
      namespace="Webkit"
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
      application={App}
    >
      <WebViewWidget />
    </PopupWindow>
  );
};
