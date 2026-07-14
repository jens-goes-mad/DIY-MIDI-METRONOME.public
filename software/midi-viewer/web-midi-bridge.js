// Browser-only Web MIDI API implementation of the host-agnostic bridge API
// (window.listMidiInputs/openInput/closeInput + window.__onMidiInput(hex,
// timeStampSeconds)) that viewer-glue.js talks to. The native MIDI Viewer
// app (../midi-viewer-native/) implements this exact same API via
// choc::ui::WebView::bind() -- see its src/bridge/MidiInputBridge.cpp -- and
// injects it *before* this script runs, so this file becomes a no-op there
// (same pattern as the private editor's mock_bridge.js).
(function () {
  if (window.listMidiInputs) return;

  if (!navigator.requestMIDIAccess) {
    const unsupported = "Web MIDI isn't supported in this browser -- try Chrome or Edge.";
    window.listMidiInputs = () => Promise.reject(new Error(unsupported));
    window.openInput = () => Promise.resolve({ ok: false, error: unsupported });
    window.closeInput = () => Promise.resolve({ ok: true });
    return;
  }

  let midiAccessPromise = null;
  let currentInput = null;

  function getMidiAccess() {
    if (!midiAccessPromise) midiAccessPromise = navigator.requestMIDIAccess({ sysex: true });
    return midiAccessPromise;
  }

  function bytesToHex(data) {
    return Array.from(data).map((b) => b.toString(16).padStart(2, "0")).join(" ");
  }

  window.listMidiInputs = () =>
    getMidiAccess().then(
      (midiAccess) => Array.from(midiAccess.inputs.values()).map((i) => ({ id: i.id, name: i.name })),
      (error) => {
        throw new Error(`Web MIDI access denied: ${error.message ?? error}`);
      }
    );

  window.openInput = (id) =>
    getMidiAccess().then((midiAccess) => {
      const input = midiAccess.inputs.get(id);
      if (!input) return { ok: false, error: `Unknown input id: ${id}` };

      if (currentInput) currentInput.onmidimessage = null;
      currentInput = input;
      currentInput.onmidimessage = (event) => {
        if (window.__onMidiInput) window.__onMidiInput(bytesToHex(event.data), event.timeStamp / 1000);
      };
      return { ok: true };
    });

  window.closeInput = () => {
    if (currentInput) currentInput.onmidimessage = null;
    currentInput = null;
    return Promise.resolve({ ok: true });
  };
})();
