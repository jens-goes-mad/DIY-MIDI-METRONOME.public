// Manual copy from the private DIY-MIDI-METRONOME repo's
// EDITOR/frontend/components/midi-monitor.js -- port fixes there by hand.

// Dependency-free MIDI event monitor: a scrolling, filterable, decoded log
// of MIDI messages. No framework/CSS-library classes in its own generated
// markup (see midi-monitor.css for all styling) so it can be dropped into
// any project -- built with reuse in the sibling "Pedalboard" project in
// mind, same philosophy as rotary-knob.js.
//
// This component only knows about byte arrays -- it has no opinion on how
// events actually arrive (native bridge, Web MIDI API, WebSocket, ...).
// The host app owns that wiring and calls pushEvent() per message.
//
// Usage:
//   <div id="midiMonitor"></div>
//   const monitor = new MidiMonitor(document.getElementById("midiMonitor"), { title: "MIDI Input Monitor" });
//   monitor.pushEvent([0x90, 0x3c, 0x64]);  // Note On, array of 0..255 bytes

// Grouped into columns (each inner array is one column, top-to-bottom) --
// the layout the filter checkboxes render in, not just a flat list.
const MIDI_MONITOR_FILTER_COLUMNS = [
  [
    { key: "noteOff", label: "Note Off" },
    { key: "noteOn", label: "Note On" },
  ],
  [
    { key: "pitchBend", label: "Pitch Bend" },
    { key: "aftertouch", label: "Aftertouch" },
  ],
  [{ key: "cc", label: "CC" }],
  [{ key: "programChange", label: "Prog Change" }],
  [
    { key: "systemTick", label: "System (Tick)", defaultOn: false },
    { key: "system", label: "System (general)" },
  ],
  [{ key: "sysex", label: "SysEx" }],
];

function categorizeMidiBytes(bytes) {
  if (bytes.length === 0) return "system";
  const status = bytes[0];

  if (status === 0xf0) return "sysex";
  // MIDI Clock (0xF8) and MTC Quarter Frame (0xF1) are both high-frequency
  // "tick" streams -- grouped into one filter, off by default, so either
  // one alone (or both together) doesn't flood the log.
  if (status === 0xf8 || status === 0xf1) return "systemTick";
  if (status >= 0xf0) return "system"; // remaining realtime + system common

  switch (status & 0xf0) {
    case 0x80:
      return "noteOff";
    case 0x90:
      return "noteOn";
    case 0xa0:
    case 0xd0:
      return "aftertouch"; // poly (0xA0) and channel (0xD0)
    case 0xb0:
      return "cc";
    case 0xc0:
      return "programChange";
    case 0xe0:
      return "pitchBend";
    default:
      return "system";
  }
}

function describeMidiBytes(bytes) {
  if (bytes.length === 0) return "(empty)";
  const status = bytes[0];

  if (status === 0xf0) return `SysEx (${bytes.length} bytes)`;
  if (status === 0xf1) return "MTC Quarter Frame";
  if (status >= 0xf8) {
    const realtimeNames = { 0xf8: "Clock", 0xfa: "Start", 0xfb: "Continue", 0xfc: "Stop", 0xfe: "ActiveSensing", 0xff: "Reset" };
    return realtimeNames[status] ?? `Realtime 0x${status.toString(16)}`;
  }
  if (status >= 0xf0) return `System 0x${status.toString(16)}`;

  const channelTypeNames = {
    0x80: "NoteOff", 0x90: "NoteOn", 0xa0: "PolyAftertouch", 0xb0: "CC",
    0xc0: "ProgramChange", 0xd0: "ChannelAftertouch", 0xe0: "PitchBend",
  };
  const type = status & 0xf0;
  const channel = (status & 0x0f) + 1;
  const typeName = channelTypeNames[type] ?? `0x${status.toString(16)}`;
  const data = bytes.slice(1).join(" ");
  return `${typeName} ch${channel} ${data}`;
}

class MidiMonitor {
  constructor(el, options = {}) {
    this.el = el;
    this.maxEvents = options.maxEvents ?? 500;
    this.title = options.title ?? null;
    this.paused = false;
    this._buildDom();
    this._observeWrap();
  }

  // bytes: array of numbers 0..255. timeStampSeconds is optional/unused
  // for now (reserved for a future "show elapsed time" feature). Silently
  // dropped while paused -- the host keeps calling pushEvent() as normal,
  // it's just a no-op here.
  pushEvent(bytes, _timeStampSeconds) {
    if (this.paused) return;

    const category = categorizeMidiBytes(bytes);

    // systemTick (MIDI Clock / MTC Quarter Frame) is high-frequency and
    // carries no per-message information, hence hidden by default -- while
    // hidden, it's skipped entirely rather than just CSS-hidden. Otherwise a
    // sustained clock stream during playback still counts toward maxEvents
    // below and silently evicts genuinely visible history out of the log
    // long before the visible list looks anywhere near full. Every other
    // category keeps the "uncheck now, recheck later reveals past events
    // too" behavior CSS-only filtering gives us -- this is a deliberate
    // exception for the one category that's pure noise while hidden.
    if (category === "systemTick" && this.logEl.classList.contains("mm-hide-systemTick")) return;

    const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");

    const line = document.createElement("div");
    line.className = `mm-event mm-cat-${category}`;
    const ts = new Date().toISOString().split("T")[1].replace("Z", "");
    line.textContent = `[${ts}] ${describeMidiBytes(bytes)}  (${hex})`;

    this.logEl.appendChild(line);
    while (this.logEl.children.length > this.maxEvents) {
      this.logEl.removeChild(this.logEl.firstChild);
    }
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  clear() {
    this.logEl.innerHTML = "";
  }

  _buildDom() {
    this.el.classList.add("mm");
    this.el.innerHTML = "";

    this.headerEl = document.createElement("div");
    this.headerEl.className = "mm-header";
    if (this.title) {
      const titleEl = document.createElement("h2");
      titleEl.className = "mm-title";
      titleEl.textContent = this.title;
      this.headerEl.appendChild(titleEl);
    }

    this.filtersEl = document.createElement("div");
    this.filtersEl.className = "mm-filters";

    const defaultHiddenKeys = [];

    MIDI_MONITOR_FILTER_COLUMNS.forEach((column) => {
      const colEl = document.createElement("div");
      colEl.className = "mm-filter-col";

      column.forEach(({ key, label, defaultOn }) => {
        const isOn = defaultOn !== false;
        if (!isOn) defaultHiddenKeys.push(key);

        const filterLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = isOn;
        checkbox.addEventListener("change", () => {
          this.logEl.classList.toggle(`mm-hide-${key}`, !checkbox.checked);
        });
        filterLabel.append(checkbox, ` ${label}`);
        colEl.appendChild(filterLabel);
      });

      this.filtersEl.appendChild(colEl);
    });

    this.pauseBtn = document.createElement("button");
    this.pauseBtn.type = "button";
    this.pauseBtn.className = "mm-pause-btn";
    this.pauseBtn.textContent = "Pause";
    this.pauseBtn.addEventListener("click", () => {
      this.paused = !this.paused;
      this.pauseBtn.textContent = this.paused ? "Paused" : "Pause";
      this.pauseBtn.classList.toggle("mm-pause-btn--active", this.paused);
    });

    this.clearBtn = document.createElement("button");
    this.clearBtn.type = "button";
    this.clearBtn.className = "mm-clear-btn";
    this.clearBtn.textContent = "Clear";
    this.clearBtn.addEventListener("click", () => this.clear());

    this.buttonsEl = document.createElement("div");
    this.buttonsEl.className = "mm-buttons";
    this.buttonsEl.append(this.pauseBtn, this.clearBtn);

    this.maxEventsSelect = document.createElement("select");
    [100, 500, 1000, 5000, 10000].forEach((n) => {
      const opt = document.createElement("option");
      opt.value = String(n);
      opt.textContent = `${n}`;
      this.maxEventsSelect.appendChild(opt);
    });
    this.maxEventsSelect.value = String(this.maxEvents);
    this.maxEventsSelect.addEventListener("change", () => {
      this.maxEvents = parseInt(this.maxEventsSelect.value, 10);
      // Trim immediately (rather than waiting for the next pushEvent) so
      // lowering the cap is felt right away, not just on the next message.
      while (this.logEl.children.length > this.maxEvents) {
        this.logEl.removeChild(this.logEl.firstChild);
      }
    });

    this.maxEventsRow = document.createElement("div");
    this.maxEventsRow.className = "mm-maxevents";
    const maxEventsLabel = document.createElement("span");
    maxEventsLabel.textContent = "Keep:";
    this.maxEventsRow.append(maxEventsLabel, this.maxEventsSelect);

    this.controlsEl = document.createElement("div");
    this.controlsEl.className = "mm-controls";
    this.controlsEl.append(this.buttonsEl, this.maxEventsRow);
    // Default home: same row as the filter columns. _observeWrap() moves it
    // up into the header row instead if the columns don't fit on one line.
    this.filtersEl.appendChild(this.controlsEl);

    this.logEl = document.createElement("div");
    this.logEl.className = "mm-log";
    defaultHiddenKeys.forEach((key) => this.logEl.classList.add(`mm-hide-${key}`));

    this.el.append(this.headerEl, this.filtersEl, this.logEl);
  }

  // Moves the Pause/Clear buttons + Keep-events dropdown up next to the
  // title when the filter columns no longer fit on a single row (all
  // columns share the same offsetTop when they do), keeping them
  // right-aligned either way. ResizeObserver -- rather than a viewport
  // media query -- since what matters is this component's own available
  // width, not the window's, so it stays correct if reused in a narrower
  // host layout.
  _observeWrap() {
    if (typeof ResizeObserver === "undefined") return;

    const check = () => {
      const cols = this.filtersEl.querySelectorAll(".mm-filter-col");
      if (cols.length === 0) return;
      const firstTop = cols[0].offsetTop;
      const wrapped = Array.from(cols).some((c) => c.offsetTop !== firstTop);

      if (wrapped && this.controlsEl.parentElement !== this.headerEl) {
        this.headerEl.appendChild(this.controlsEl);
      } else if (!wrapped && this.controlsEl.parentElement !== this.filtersEl) {
        this.filtersEl.appendChild(this.controlsEl);
      }
    };

    this._resizeObserver = new ResizeObserver(check);
    this._resizeObserver.observe(this.el);
    check();
  }
}

window.MidiMonitor = MidiMonitor;
