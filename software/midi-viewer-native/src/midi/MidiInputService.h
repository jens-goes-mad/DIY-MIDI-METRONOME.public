#pragma once

#include <cstdint>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <vector>

// RtMidi.h declares this inside namespace rt::midi and only exposes it
// unqualified via a `using namespace rt::midi;` at the end of that header --
// so the forward declaration has to target the real namespace, not global
// scope, or it creates a second, incompatible type.
namespace rt {
namespace midi {
class RtMidiIn;
}  // namespace midi
}  // namespace rt
using rt::midi::RtMidiIn;

struct MidiInputInfo {
    std::string id;
    std::string name;
};

// Real backend via RtMidi (vendored at third_party/rtmidi). Input-only --
// there is no RtMidiOut member and no send/write method anywhere in this
// class, by construction: this app can monitor MIDI traffic but cannot
// control a device.
class MidiInputService {
public:
    MidiInputService();
    ~MidiInputService();

    // Fires on whatever thread RtMidi's platform backend delivers input on
    // (NOT the caller's thread, and NOT any UI/message thread) -- the
    // callback must not touch UI state directly. See MidiInputBridge, which
    // marshals this onto the message thread before evaluating JS.
    using MidiInputCallback = std::function<void(const std::vector<uint8_t>& bytes, double timeStampSeconds)>;

    std::vector<MidiInputInfo> listInputs() const;

    bool openInput(const std::string& id, std::string* errorOut);
    void closeInput();
    bool isInputOpen() const;

    // Must be called before openInput() to take effect on that connection.
    void setInputCallback(MidiInputCallback callback);

private:
    std::unique_ptr<RtMidiIn> m_input;
    std::optional<std::string> m_openInputId;
    MidiInputCallback m_inputCallback;

    static void rtMidiInputTrampoline(double timeStamp, std::vector<unsigned char>* message, void* userData);
};
