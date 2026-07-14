#pragma once

#include <cstdint>
#include <functional>
#include <string>
#include <vector>

#include "choc/containers/choc_Value.h"
#include "midi/MidiInputService.h"

// Bridge surface exposed to the web UI. Each public method here is bound
// 1:1 to a whitelisted JS-callable function in main.cpp (via WebView::bind) --
// there is no generic eval/exec channel into native code from the UI, and
// no method here can write to a device: listMidiInputs/openInput/closeInput
// are the entire surface.
class MidiInputBridge {
public:
    using StatusCallback = std::function<void(const std::string& level, const std::string& message)>;

    // Fires whenever an open MIDI input receives a message. Called from
    // whatever thread MidiInputService::MidiInputCallback fires on (i.e. NOT
    // the message/UI thread) -- main.cpp is responsible for marshaling
    // onto the message thread before touching the WebView.
    using MidiInputEventCallback = std::function<void(const std::vector<uint8_t>& bytes, double timeStampSeconds)>;

    explicit MidiInputBridge(StatusCallback statusCallback = {}, MidiInputEventCallback midiInputCallback = {});

    choc::value::Value listMidiInputs(const choc::value::ValueView& args);
    choc::value::Value openInput(const choc::value::ValueView& args);
    choc::value::Value closeInput(const choc::value::ValueView& args);

private:
    MidiInputService m_midiService;
    StatusCallback m_statusCallback;
    MidiInputEventCallback m_midiInputCallback;

    void emitStatus(const std::string& level, const std::string& message);

    static std::string firstStringArg(const choc::value::ValueView& args);
    static choc::value::Value makeOk();
    static choc::value::Value makeError(const std::string& error);
};
