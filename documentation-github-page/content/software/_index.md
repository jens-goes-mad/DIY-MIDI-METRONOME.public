---
title: Software
links:
  - title: Firmware and tooling notes
    description: USB-MIDI, the tick-to-LED pendulum pipeline, cascading BLE sync, and MIDI monitoring for the metronome firmware
menu:
    main:
        weight: 20
        params:
            icon: tool

comments: false
toc: false
---
# Software

Firmware and desktop tooling notes for the metronome project.

- [**USB MIDI class-compliance**](/software/usb-midi-class-compliance) — how the
  ESP32-S3 presents as a native USB MIDI device, and how incoming packets get decoded.
- [**MIDI clock → pendulum LED**](/software/midi-clock-to-pendulum) — the pipeline from
  incoming Timing Clock ticks to the moving spot-and-tail LED display.
- [**Cascading BLE sync**](/software/cascading-ble-sync) — hardware-verified: the
  advertising-based transport that lets a group of standalone devices stay in tempo
  without any wired connection, and how SENDER/RECEIVER role detection works.
- [**MIDI Monitor**](/software/midi-monitor) — a dedicated, filterable tool for inspecting
  live MIDI traffic while developing and debugging the firmware, with a live browser demo.

---

MORE TO COME
