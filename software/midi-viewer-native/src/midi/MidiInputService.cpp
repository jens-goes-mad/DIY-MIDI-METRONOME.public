#include "MidiInputService.h"

#include <algorithm>

#include "RtMidi.h"

MidiInputService::MidiInputService() = default;

// Defined here (not defaulted in the header) so that ~unique_ptr<RtMidiIn>
// runs where RtMidiIn's full definition is visible.
MidiInputService::~MidiInputService() = default;

// A fresh RtMidiIn is probed on every call rather than cached, so the list
// reflects devices plugged/unplugged since the last call (e.g. on each
// Refresh click). Ids are the port index as a string -- see openInput() for
// the corresponding lookup.
std::vector<MidiInputInfo> MidiInputService::listInputs() const {
    std::vector<MidiInputInfo> inputs;
    try {
        RtMidiIn probe;
        const unsigned int portCount = probe.getPortCount();
        for (unsigned int i = 0; i < portCount; ++i) {
            inputs.push_back({std::to_string(i), probe.getPortName(i)});
        }
    } catch (const RtMidiError&) {
        // No compiled MIDI API support or no devices reachable -- report
        // an empty list rather than throwing through the bridge layer.
    }
    return inputs;
}

void MidiInputService::rtMidiInputTrampoline(double timeStamp, std::vector<unsigned char>* message, void* userData) {
    auto* self = static_cast<MidiInputService*>(userData);
    if (self->m_inputCallback && message) {
        self->m_inputCallback(std::vector<uint8_t>(message->begin(), message->end()), timeStamp);
    }
}

void MidiInputService::setInputCallback(MidiInputCallback callback) {
    m_inputCallback = std::move(callback);
}

bool MidiInputService::openInput(const std::string& id, std::string* errorOut) {
    const auto inputs = listInputs();
    const bool exists = std::any_of(inputs.begin(), inputs.end(),
        [&](const MidiInputInfo& i) { return i.id == id; });

    if (!exists) {
        if (errorOut) *errorOut = "Unknown input id: " + id;
        return false;
    }

    closeInput();

    try {
        auto input = std::make_unique<RtMidiIn>();
        input->openPort(static_cast<unsigned int>(std::stoul(id)), "MIDI Viewer In");
        // SysEx passes through; Timing Clock's high data rate (per RtMidi's
        // own doc comment on the "time" flag) is instead handled UI-side by
        // MidiMonitor's "System (Tick)" filter, which defaults to off.
        // Active Sensing is a high-frequency keepalive with no informational
        // value here, so it's still filtered at the source.
        input->ignoreTypes(false, false, true);
        input->setCallback(&MidiInputService::rtMidiInputTrampoline, this);
        m_input = std::move(input);
    } catch (const std::exception& e) {
        if (errorOut) *errorOut = e.what();
        return false;
    }

    m_openInputId = id;
    return true;
}

void MidiInputService::closeInput() {
    if (m_input) {
        m_input->cancelCallback();
        m_input->closePort();
        m_input.reset();
    }
    m_openInputId.reset();
}

bool MidiInputService::isInputOpen() const {
    return m_openInputId.has_value();
}
