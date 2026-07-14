// UI wiring for the standalone MIDI Viewer -- talks only to the host-agnostic
// bridge API (window.listMidiInputs/openInput/closeInput + window.__onMidiInput),
// implemented either by web-midi-bridge.js (browser, Web MIDI API) or by the
// native MIDI Viewer app (../midi-viewer-native/) via WebView::bind(). This
// file is unchanged between the two hosts.

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function populateInputSelect(inputs) {
  const select = document.getElementById("inputSelect");
  const previousId = select.value;

  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = inputs.length ? "Select a MIDI input..." : "No MIDI inputs found";
  select.appendChild(placeholder);

  inputs.forEach((input) => {
    const opt = document.createElement("option");
    opt.value = input.id;
    opt.textContent = input.name;
    select.appendChild(opt);
  });

  if (inputs.some((i) => i.id === previousId)) select.value = previousId;
}

async function refreshInputs() {
  try {
    const inputs = await window.listMidiInputs();
    populateInputSelect(inputs);
    document.getElementById("inputSelect").disabled = false;
    setStatus("Select a MIDI input to start monitoring.");
  } catch (error) {
    populateInputSelect([]);
    document.getElementById("inputSelect").disabled = true;
    setStatus(error.message ?? String(error));
  }
}

function main() {
  const monitor = new MidiMonitor(document.getElementById("midiMonitor"), { title: "MIDI Input Monitor" });

  window.__onMidiInput = (hex, timeStampSeconds) => {
    const bytes = hex.trim().length === 0 ? [] : hex.trim().split(/\s+/).map((h) => parseInt(h, 16));
    monitor.pushEvent(bytes, timeStampSeconds);
  };

  document.getElementById("inputSelect").addEventListener("change", async (e) => {
    const id = e.target.value;
    await window.closeInput();
    if (!id) {
      setStatus("No input open.");
      return;
    }
    const name = e.target.options[e.target.selectedIndex]?.textContent ?? id;
    const result = await window.openInput(id);
    setStatus(result.ok ? `Listening: ${name}` : `Failed to open: ${result.error}`);
  });

  document.getElementById("refreshBtn").addEventListener("click", refreshInputs);

  refreshInputs();
}

document.addEventListener("DOMContentLoaded", main);
