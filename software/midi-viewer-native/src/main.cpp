#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "choc/gui/choc_DesktopWindow.h"
#include "choc/gui/choc_MessageLoop.h"
#include "choc/gui/choc_WebView.h"
#include "choc/text/choc_JSON.h"

#include "bridge/MidiInputBridge.h"

#ifdef VIEWER_EMBED_RESOURCES
#include "generated/EmbeddedAssets.h"
#endif

namespace {

std::string mimeTypeFor(const std::string& path) {
    if (path.size() >= 5 && path.compare(path.size() - 5, 5, ".html") == 0) return "text/html";
    if (path.size() >= 3 && path.compare(path.size() - 3, 3, ".js") == 0) return "application/javascript";
    if (path.size() >= 4 && path.compare(path.size() - 4, 4, ".css") == 0) return "text/css";
    return "application/octet-stream";
}

#ifdef VIEWER_EMBED_RESOURCES

// Release build: served straight out of the binary, no files on disk needed.
std::optional<choc::ui::WebView::Options::Resource> loadFrontendResource(const std::string& relative,
                                                                          const std::string&) {
    for (const auto& file : viewer_embedded::getEmbeddedFiles()) {
        if (relative == file.path) {
            choc::ui::WebView::Options::Resource resource;
            resource.data.assign(file.data, file.data + file.size);
            resource.mimeType = mimeTypeFor(relative);
            return resource;
        }
    }
    return std::nullopt;
}

#else

// Debug build: read live off disk so editing ../midi-viewer doesn't require a rebuild.
std::optional<choc::ui::WebView::Options::Resource> loadFrontendResource(const std::string& relative,
                                                                          const std::string& frontendDir) {
    std::ifstream file(frontendDir + relative, std::ios::binary);
    if (!file) return std::nullopt;

    std::ostringstream ss;
    ss << file.rdbuf();
    const auto content = ss.str();

    choc::ui::WebView::Options::Resource resource;
    resource.data.assign(content.begin(), content.end());
    resource.mimeType = mimeTypeFor(relative);
    return resource;
}

#endif

// Escapes a string for safe embedding inside a JS string literal built via
// evaluateJavascript() -- used only for our own status/level/message text.
std::string jsStringLiteral(const std::string& s) {
    return choc::json::toString(choc::value::Value(s));
}

std::string bytesToHex(const std::vector<uint8_t>& bytes) {
    std::ostringstream out;
    out << std::hex << std::setfill('0');
    for (size_t i = 0; i < bytes.size(); ++i) {
        if (i > 0) out << ' ';
        out << std::setw(2) << static_cast<int>(bytes[i]);
    }
    return out.str();
}

}  // namespace

int main() {
    const std::string frontendDir = VIEWER_FRONTEND_DIR;

    choc::ui::setWindowsDPIAwareness();
    choc::messageloop::initialise();

    choc::ui::DesktopWindow window({100, 100, 900, 650});
    window.setWindowTitle("MIDI Viewer");
    window.setResizable(true);
    window.setMinimumSize(600, 400);
    window.windowClosed = [] { choc::messageloop::stop(); };

    std::unique_ptr<choc::ui::WebView> webView;
    MidiInputBridge bridge(
        [&webView](const std::string& level, const std::string& message) {
            if (!webView) return;
            const std::string call = "window.__onNativeStatus && window.__onNativeStatus(" +
                                      jsStringLiteral(level) + ", " + jsStringLiteral(message) + ");";
            webView->evaluateJavascript(call);
        },
        [&webView](const std::vector<uint8_t>& bytes, double timeStamp) {
            // Fires on RtMidi's own input thread, not the message thread --
            // evaluateJavascript() must only be called from the message
            // thread, so defer via postMessage() rather than calling it
            // directly here. Copy everything the deferred lambda needs by
            // value; only webView is captured by reference, since that
            // variable itself lives for the whole program (safe to touch
            // later from the message thread).
            std::string hex = bytesToHex(bytes);
            choc::messageloop::postMessage([&webView, hex, timeStamp] {
                if (!webView) return;
                const std::string call = "window.__onMidiInput && window.__onMidiInput(" +
                                          jsStringLiteral(hex) + ", " + std::to_string(timeStamp) + ");";
                webView->evaluateJavascript(call);
            });
        });

    choc::ui::WebView::Options options;
    options.enableDebugMode = true;

    options.fetchResource = [&frontendDir](const std::string& path)
        -> std::optional<choc::ui::WebView::Options::Resource> {
        std::string relative = (path.empty() || path == "/") ? "/index.html" : path;
        return loadFrontendResource(relative, frontendDir);
    };

    options.webviewIsReady = [&bridge](choc::ui::WebView& view) {
        view.bind("listMidiInputs", [&bridge](const choc::value::ValueView& args) {
            return bridge.listMidiInputs(args);
        });
        view.bind("openInput", [&bridge](const choc::value::ValueView& args) {
            return bridge.openInput(args);
        });
        view.bind("closeInput", [&bridge](const choc::value::ValueView& args) {
            return bridge.closeInput(args);
        });
    };

    webView = std::make_unique<choc::ui::WebView>(options);
    if (!webView->loadedOK()) {
        std::cerr << "Failed to create WebView (no suitable OS web engine found)\n";
        return 1;
    }

    window.setContent(webView->getViewHandle());
    window.setVisible(true);
    window.toFront();

    choc::messageloop::run();
    return 0;
}
