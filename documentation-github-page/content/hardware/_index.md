---
title: Hardware
links:
  - title: Why the ESP32-S3
    description: what the chip brings to this project that a classic Arduino can't do without extra hardware
menu:
    main:
        weight: 10
        params:
            icon: cpu

comments: false
toc: true
---
# Hardware

The metronome's ESP32-S3 build is the primary target (the plain ESP32 build
exists too, over a shared UART/COBS transport, for boards that don't need
native USB). Here's what the S3 actually brings to this project, and why an
Arduino Uno/Nano-class board couldn't do the job without extra hardware
bolted on.

## What the chip is

The ESP32-S3 is a dual-core Xtensa LX7 microcontroller (up to 240 MHz),
with:

- **Native USB-OTG** — a real USB device controller on-chip, not a
  UART bridged through an external USB-serial chip. Used here for
  [class-compliant USB MIDI](/software/usb-midi-class-compliance).
- **Wi-Fi + [Bluetooth LE 5](/hardware/bluetooth)** on the same silicon,
  no separate radio module.
- Up to 512 KB SRAM plus external PSRAM/flash headroom (model-dependent).
- A street price in the same ballpark as an Arduino Nano.

## Why that matters here

Two of this project's core features come directly from capabilities a
classic Arduino (ATmega328P: single-core 8-bit, no native USB, no
wireless) simply doesn't have on its own:

- **USB MIDI, class-compliant.** Native USB-OTG means the chip itself can
  present as a standard USB MIDI device — the OS sees a real MIDI port,
  no driver install, no FTDI-style USB-to-serial adapter and no separate
  "this is actually MIDI" translation layer. An ATmega328P has no USB
  peripheral at all; getting class-compliant USB-MIDI out of one means
  reaching for a second chip (an ATmega32U4, or an external USB
  controller) just to speak USB. See
  [USB MIDI class-compliance](/software/usb-midi-class-compliance) for how
  this project uses it.
- **Cascading BLE sync.** Bluetooth Low Energy is built into the same
  chip used for everything else — no separate BLE module, no extra UART
  or SPI link to bridge to one. See
  [Cascading BLE sync](/software/cascading-ble-sync) for how multiple
  units use this to stay in tempo without any wired connection.

The plain (non-S3) ESP32 build exists for boards that don't need
class-compliant USB — it talks over a shared UART/COBS message transport
instead, which works fine but doesn't get you a "just plug it into a DAW"
experience the same way.

## Where an Arduino still fits

Arduino boards aren't a bad choice generally — they're cheaper, simpler to
reason about, and plenty for a huge range of projects (including earlier,
smaller pieces of this one, prototyped on an Arduino Nano before the
metronome itself moved to the ESP32-S3). They just don't have the two
specific capabilities — native class-compliant USB and onboard BLE — that
this project's headline features are actually built on.

---

## See also

- [Reference design (v0)](/hardware/reference-design) — the current circuit
  draft: power, MIDI I/O, buttons, audio click, GPIO map, and BOM.
- [Bluetooth on the ESP32-S3](/hardware/bluetooth) — Classic vs. LE,
  advertising vs. connections, and what the S3's BLE 5 radio specifically
  provides.
