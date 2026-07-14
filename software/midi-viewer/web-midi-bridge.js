// Input-only Web MIDI API bridge for the standalone MIDI Viewer demo. Unlike
// the private repo's native rtmidi bridge, this only ever reads -- there's no
// device/output control here (no CC send, no sysex send, no port writing).

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

function main() {
  const monitor = new MidiMonitor(document.getElementById("midiMonitor"), { title: "MIDI Input Monitor" });

  if (!navigator.requestMIDIAccess) {
    setStatus("Web MIDI isn't supported in this browser -- try Chrome or Edge.");
    document.getElementById("inputSelect").disabled = true;
    return;
  }

  navigator.requestMIDIAccess({ sysex: true }).then(
    (midiAccess) => {
      let currentInput = null;

      const onMidiMessage = (event) => monitor.pushEvent(Array.from(event.data), event.timeStamp / 1000);

      const refreshInputs = () => populateInputSelect(Array.from(midiAccess.inputs.values()));

      const select = document.getElementById("inputSelect");
      select.addEventListener("change", () => {
        if (currentInput) currentInput.onmidimessage = null;
        currentInput = midiAccess.inputs.get(select.value) ?? null;
        if (currentInput) {
          currentInput.onmidimessage = onMidiMessage;
          setStatus(`Listening: ${currentInput.name}`);
        } else {
          setStatus("No input open.");
        }
      });

      // Hot-plug: refresh the list on connect/disconnect; if the open input
      // itself disappeared, drop back to "no input open".
      midiAccess.onstatechange = () => {
        refreshInputs();
        if (currentInput && !Array.from(midiAccess.inputs.values()).includes(currentInput)) {
          currentInput = null;
          setStatus("Input disconnected.");
        }
      };

      refreshInputs();
      setStatus("Select a MIDI input to start monitoring.");
    },
    (error) => {
      setStatus(`Web MIDI access denied: ${error.message ?? error}`);
      document.getElementById("inputSelect").disabled = true;
    }
  );
}

document.addEventListener("DOMContentLoaded", main);
