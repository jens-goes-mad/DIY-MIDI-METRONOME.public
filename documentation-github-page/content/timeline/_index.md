---
title: Timeline
links:
  - title: Build log
    description: milestones in the metronome build, roughly in order
menu:
    main:
        weight: 30
        params:
            icon: calendar-stats

comments: false
toc: false
timeline:
  - label: "2026-07-11"
    title: "MIDI Monitor becomes its own tool"
    weight: 10
    body: "
Pulled the MIDI Monitor out into its own dedicated, filterable tab —
see [MIDI Monitor](/software/midi-monitor)."
  - label: "2026-07-12"
    title: "Cascading: role detection"
    weight: 20
    body: "
SENDER/RECEIVER role detection landed: a unit is SENDER while
USB-connected or recently fed MIDI, RECEIVER otherwise, with a group ID
to keep independent clusters of units from cross-talking. See
[Cascading BLE sync](/software/cascading-ble-sync)."
  - label: "2026-07-13"
    title: "Cascading: BLE transport, hardware-verified"
    weight: 30
    body: "
The actual BLE broadcast went in and got verified on two real
ESP32-S3-DevKitC-1 units — one USB-connected as SENDER, the other
RECEIVER over BLE only, staying in tight sync beat to beat."
  - label: "2026-07-17"
    title: "Hardware reference design"
    weight: 40
    body: "
Drafted the [reference circuit design](/hardware/reference-design) for a
standalone board, and started transcribing it into an actual KiCad
schematic/PCB."
  - label: "2026-07-18"
    title: "MIDI Monitor: configurable history"
    weight: 50
    body: "
Made the MIDI Monitor's event history size configurable, and fixed a bug
where it silently lost history during sustained MIDI Clock playback."
  - label: "2026-07-19"
    title: "MIDI Monitor: Action Listeners"
    weight: 60
    body: "
Added an Action Listeners tab to the MIDI Monitor — click a captured
event to save it as a reusable template."
---
# Timeline

A running log of build milestones, roughly in order.

{{< timeline >}}

---

MORE TO COME
