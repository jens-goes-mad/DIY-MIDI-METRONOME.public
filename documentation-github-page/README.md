# documentation-github-page

Public build-log site for the [DIY-MIDI-METRONOME](https://github.com/jens-goes-mad/diy-midi-metronome.public)
project — a cascading, BLE-synced MIDI metronome. Built with [Hugo](https://gohugo.io/) and the
[Stack theme](https://github.com/CaiJimmy/hugo-theme-stack), deployed to GitHub Pages together
with [`../software/midi-viewer`](../software/midi-viewer) via `../.github/workflows/hugo.yml`
on every push to `main`.

## Local development

Hugo (extended) and Go are required to build this site; both are pinned into the bundled
Docker image, so no local install is needed:

```bash
docker compose up
```

Then open http://localhost:1313. Content lives under `content/`; the theme config is under
`config/_default/`.

## Structure

- `content/overview` — project intro
- `content/hardware` — circuit/reference design notes
- `content/software` — firmware and tooling notes (cascading BLE sync, MIDI Monitor)
- `content/timeline` — build log
- `content/me` — author bio + legal notice (Impressum/Datenschutzerklärung)
