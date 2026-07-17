---
title: Overview
links:
  - title: A blog about building a DIY MIDI metronome
    description: hardware and firmware notes for a cascading, BLE-synced MIDI metronome
menu:
    main:
        weight: 1
        params:
            icon: home

comments: false
toc: false
---
# DIY MIDI Metronome

Welcome to the build log for a small, standalone MIDI metronome — an ESP32/ESP32-S3 based
device that receives MIDI Timing Clock and drives a WS2811/WS2812 LED strip to mimic the
swinging arm of a mechanical pendulum metronome, in sync with the detected tempo.

## What it does

- Receives MIDI Timing Clock (24 ticks per beat) over a real 5-pin DIN MIDI connection or
  USB-MIDI class-compliant, and sweeps a lit position back and forth across an LED strip —
  tick sweeps left→right, tock sweeps right→left — the same visual cue as a real mechanical
  pendulum metronome, not just a blinking light.
- Runs on two firmware variants: a generic ESP32 build using a shared UART-COBS message
  transport, and an ESP32-S3 build speaking native USB-MIDI to a DAW or host directly.
- Supports **cascading sync over Bluetooth Low Energy** — one device advertises as a
  SENDER, others detect and join as RECEIVERs under a shared group ID, keeping onboard
  status LEDs in sync across multiple standalone units without any wired connection.
- Ships with a desktop MIDI Monitor tool for inspecting live MIDI traffic while developing
  and debugging the firmware.

## Why

Most affordable metronomes are either a phone app or a simple click box — neither is built
to sit inside a real MIDI rig, sync tempo across a room of devices without cabling, or give
you visibility into what's actually being clocked or understand program changes. Even worse 
when dealing with several (build in) metronomes they are always out of sync causing literally 
mud by unsynchronized effects like delays on keys and git due to same tempo, but different starting times.

This project is the hardware/firmware side of scratching that itch,<br>
for fun,<br>
thus: [jens-goes-mad](/me).

## Where to look next

- [Hardware](/hardware) — reference circuit design for a standalone board built around an
  ESP32-S3-DevKitC-1: MIDI I/O, power, and audio click output.
- [Software](/software) — firmware architecture: the cascading BLE sync transport, role
  detection, and the MIDI Monitor tooling.

---

More to come as the build progresses.
