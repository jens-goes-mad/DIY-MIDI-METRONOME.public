# DIY-MIDI-METRONOME.public

Public-facing content for the [DIY-MIDI-METRONOME](https://github.com/jens-goes-mad/diy-midi-metronome)
project — a cascading, BLE-synced MIDI metronome. This repo holds two independent things,
both deployed together to the one GitHub Pages site via `.github/workflows/hugo.yml`:

- [`documentation-github-page/`](documentation-github-page) — the Hugo (Stack theme) build-log
  site: project overview, hardware reference design, firmware/tooling notes, build timeline.
- [`software/midi-viewer/`](software/midi-viewer) — a standalone, dependency-free MIDI Monitor
  you can run straight in a browser via the Web MIDI API, no build step required. Served at
  `/software/midi-viewer/` on the deployed site.
  
See: [https://jens-goes-mad.github.io/DIY-MIDI-METRONOME.public/overview/]
