---
title: MIDI Monitor
comments: false
toc: false
---
A dedicated, filterable log of live MIDI traffic — Note On/Off, CC, Pitch Bend, Aftertouch,
Program Change, SysEx, and clock/system messages, each decoded and color-coded, with per-type
filters, pause, and clear. Built to make it easy to see exactly what's arriving while developing
and debugging the metronome's firmware, without digging through raw hex by hand.

The same component (`midi-monitor.js`/`.css`, dependency-free, no framework required) also lives
in the project's desktop MIDI Editor, wired up to real hardware over `rtmidi`. Here it's wired up
instead to the browser's own [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API),
so you can try it standalone with your own gear — no install, no build step.

**[Open the MIDI Viewer demo →](/software/midi-viewer/)**

> Requires a browser with Web MIDI API support — Chrome and Edge work; Safari and Firefox
> currently don't support it.
