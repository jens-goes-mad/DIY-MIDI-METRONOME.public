#include "MidiInputBridge.h"

MidiInputBridge::MidiInputBridge(StatusCallback statusCallback, MidiInputEventCallback midiInputCallback)
    : m_statusCallback(std::move(statusCallback)), m_midiInputCallback(std::move(midiInputCallback)) {
    m_midiService.setInputCallback([this](const std::vector<uint8_t>& bytes, double timeStamp) {
        if (m_midiInputCallback) m_midiInputCallback(bytes, timeStamp);
    });
}

void MidiInputBridge::emitStatus(const std::string& level, const std::string& message) {
    if (m_statusCallback) m_statusCallback(level, message);
}

std::string MidiInputBridge::firstStringArg(const choc::value::ValueView& args) {
    if (args.isArray() && args.size() > 0) return args[0].getWithDefault<std::string>({});
    return {};
}

choc::value::Value MidiInputBridge::makeOk() {
    auto v = choc::value::createObject("Result");
    v.setMember("ok", true);
    return v;
}

choc::value::Value MidiInputBridge::makeError(const std::string& error) {
    auto v = choc::value::createObject("Result");
    v.setMember("ok", false);
    v.setMember("error", error);
    return v;
}

choc::value::Value MidiInputBridge::listMidiInputs(const choc::value::ValueView&) {
    auto result = choc::value::createEmptyArray();
    for (const auto& input : m_midiService.listInputs()) {
        auto entry = choc::value::createObject("MidiInput");
        entry.setMember("id", input.id);
        entry.setMember("name", input.name);
        result.addArrayElement(entry);
    }
    return result;
}

choc::value::Value MidiInputBridge::openInput(const choc::value::ValueView& args) {
    const std::string id = firstStringArg(args);
    std::string error;
    if (!m_midiService.openInput(id, &error)) {
        emitStatus("error", "openInput failed: " + error);
        return makeError(error);
    }
    emitStatus("info", "Opened input: " + id);
    return makeOk();
}

choc::value::Value MidiInputBridge::closeInput(const choc::value::ValueView&) {
    m_midiService.closeInput();
    emitStatus("info", "Input closed");
    return makeOk();
}
