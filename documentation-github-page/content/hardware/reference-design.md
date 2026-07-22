---
title: Hardware reference design (v0)
comments: false
toc: true
---
Draft circuit blocks for a standalone board: ESP32-S3, real 5-pin DIN MIDI
IN/OUT/THRU, physical buttons, a WAV-driven click on headphones, and 5V DC
power in. This is meant as a starting point to drop into KiCad/Flux/etc. —
not a fab-ready schematic. Anything marked **[verify]** should be checked
against a datasheet or a proven reference circuit before you commit to copper.

> Status: this draft is now being transcribed into an actual KiCad schematic/PCB —
> still in progress, not yet built or verified against real hardware.

## 0. Base assumption

Build this as a **carrier/shield board around the ESP32-S3-DevKitC-1 module**
rather than a bare WROOM module. Reasons:

- The firmware already targets DevKitC-1 explicitly (`platform/esp32s3/metro_platform_esp32s3.c`
  header comment), and current pin choices (GPIO2 LED, GPIO4 WS2812) assume it.
- DevKitC-1 already solves the annoying parts of an ESP32-S3 board: USB-UART
  bridge chip for flashing, native USB-OTG breakout for USB-MIDI class-compliant
  mode, 3.3V regulation, antenna matching, boot/reset circuit.
- Downside: bigger/bulkier final product than a bare-module design. If you
  want a compact finished enclosure later, this can be redone around a bare
  ESP32-S3-WROOM-1 module — bigger scope (own regulator sized for Wi-Fi
  current bursts, USB-UART bridge chip, RF-aware antenna keepout), flag if
  you want that instead.

Everything below assumes the DevKitC-1's own 5V pin, 3.3V rail, and USB-OTG
pins (GPIO19/20, fixed) are reused as-is; the carrier board just adds the
MIDI, button, audio, and power-in circuitry around it.

---

## 1. Power — 5V DC in

- Connector: 2.1mm barrel jack (center-positive) or USB-C power-only — your call.
- Series Schottky diode (e.g. SS14) for reverse-polarity protection if using
  a barrel jack (skip if USB-C, since polarity is fixed by the connector).
- Resettable fuse (polyfuse, ~500 mA–1 A, e.g. MF-R500) in series before
  anything else.
- 100 µF bulk electrolytic across the 5V rail after protection.
- Feed DevKitC-1's `5V` pin directly — its onboard regulator makes 3.3V for
  the module itself.
- Tap the protected-but-unregulated 5V rail (before the DevKit's own
  regulator) to power: the MIDI IN current loop, and the audio DAC/amp stage.

---

## 2. MIDI IN — opto-isolated (per MIDI 1.0 electrical spec)

Component list (confident): 220 Ω resistor(s), an opto-isolator rated for
MIDI's ~5 mA current loop (6N138, PC900V, or H11L1 are the usual choices —
6N138 is slow but the "classic" spec part; PC900V/H11L1 are faster and fine
at metronome-clock tick rates), a 1N4148 flyback diode across the opto's
input LED (protects against reverse-plugged cables), and a pull-up resistor
from the opto's output transistor to 3.3V feeding the ESP32-S3 UART RX pin.

**[verify]** Exact pin-by-pin wiring (which DIN pin goes to opto anode vs.
cathode, resistor placement, and whether shield pin 2 is left floating or
grounded) against a reference schematic — e.g. the MIDI Association's
official electrical spec diagram, or a widely-used open design like
SparkFun's or Adafruit's MIDI featherwing. This is a current loop, so wiring
the LED backwards just means "no signal," not damage — low risk, but still
worth confirming before etching rather than reconstructing from memory.

Output feeds UART1 RX (see GPIO map below) — a second UART, separate from
UART0 which stays on the DevKit's native USB-serial bridge for
flashing/monitor.

---

## 3. MIDI OUT

Modern/simpler option (this is what current MIDI-Association guidance for
3.3V-logic MCUs recommends, and what most ESP32 MIDI projects use today):

- DIN pin 4 → 220 Ω → 3.3V rail (current-loop source)
- DIN pin 5 → directly to UART1 TX

No buffer chip needed — 3.3V logic sinks/sources enough current through the
220 Ω resistor for reliable MIDI-spec current levels, and this is what most
modern ESP32/Teensy MIDI designs ship with.

More-compatible/legacy option, if you hit reliability issues with older gear:
add a single Schmitt-trigger inverter gate (e.g. one gate of a 74HC14) between
UART1 TX and the DIN pin 5 side, with the 220 Ω returning to 5V instead of
3.3V — this matches the original-spec current levels more closely. Start
with the simple version; only add the buffer if needed.

---

## 4. MIDI THRU — hardware passthrough, not software

Re-drive a copy of the raw MIDI IN signal (tapped before/at the opto output,
not routed through the ESP32) through its own independent output stage,
identical topology to section 3 but with its own 220 Ω/DIN jack, so THRU
keeps working even if the firmware is busy, crashed, or asleep. This is the
standard reason THRU exists — don't implement it in software by relaying
UART RX back out UART1 TX.

---

## 5. Buttons

Simple momentary switches, active-low, internal pull-ups enabled in
firmware (no external pull-up resistor needed on ESP32-S3), one small
100 nF ceramic cap to GND per button for basic RC debounce as a hardware
assist (software debounce still recommended on top).

Suggested set: Tap Tempo, Start/Stop, Mode/Menu, Up, Down — 5 buttons, or
combine Up/Down into a rotary encoder if you want continuous BPM adjustment
instead (encoder needs 2 GPIOs instead of 2 buttons' worth, roughly a wash).

---

## 6. Audio click (WAV) on headphones

ESP32-S3 has **no internal analog DAC** (unlike the original ESP32, which
has an 8-bit DAC on GPIO25/26) — audio out has to go through I2S to an
external DAC.

Recommended path:
- **PCM5102A** I2S DAC breakout — cheap, ~112 dB SNR, has its own onboard
  analog reconstruction filter, can self-generate its master clock (tie its
  SCK pin low), needs only BCLK/LRCLK/DIN from the ESP32-S3.
- Feed the DAC's line-out into a small headphone-amp IC — **TPA6132A2** (TI)
  is a common low-parts-count choice — rather than driving headphones
  straight off the DAC's line-level output, which is often too weak for
  low-impedance headphones.
- 3.5mm TRS headphone jack, plus an inline volume potentiometer (10 kΩ audio
  taper) between DAC and amp if you want physical volume control instead of
  (or in addition to) a software volume/gain on the WAV playback itself.

Lower-parts-count alternative: **MAX98357A** (I2S in, Class-D amp out,
mono) — designed to drive a small 4–8 Ω speaker at up to 3W, so if you use
it for headphones you must pad the output down (series resistor + pot, e.g.
~220 Ω plus a volume pot) — otherwise it's loud/distorted enough to be
uncomfortable or risk hearing damage at low impedances. Simpler board, but
only reach for this if you don't mind the padding-resistor hack.

WAV playback itself is a firmware concern (decode + I2S DMA), not hardware —
worth deciding early whether WAVs are stored in flash (SPIFFS/LittleFS) or
generated as a synthesized click, since that affects flash size needed but
not this circuit.

---

## 7. Proposed GPIO map

Keeps the two pins already committed by existing firmware; the rest are
draft picks that need cross-checking against the DevKitC-1's actual header
pinout (a handful of low-numbered GPIOs are reserved internally for
octal flash/PSRAM on the WROOM-1 module and aren't broken out — **[verify]**
against the DevKitC-1 pinout diagram before finalizing).

| Signal | Pin | Status |
|---|---|---|
| Status LED | GPIO2 | existing, keep |
| WS2812 strip data | GPIO4 | existing, keep |
| USB-OTG D-/D+ | GPIO19/20 | native/fixed, unchanged |
| UART0 (flash/monitor) | GPIO43/44 | native/fixed, unchanged |
| MIDI UART1 TX | GPIO17 | draft — verify broken out |
| MIDI UART1 RX | GPIO18 | draft — verify broken out |
| I2S BCLK | GPIO5 | draft — verify broken out |
| I2S LRCLK (WS) | GPIO6 | draft — verify broken out |
| I2S DOUT | GPIO7 | draft — verify broken out |
| BTN Tap Tempo | GPIO8 | draft |
| BTN Start/Stop | GPIO9 | draft |
| BTN Mode | GPIO10 | draft |
| BTN Up | GPIO11 | draft |
| BTN Down | GPIO12 | draft |

---

## 8. BOM summary (rough, per-board qty)

| Part | Qty | Notes |
|---|---|---|
| ESP32-S3-DevKitC-1 | 1 | reused as carrier |
| 5-pin DIN jack (panel mount) | 3 | IN, OUT, THRU |
| Opto-isolator (6N138 / PC900V / H11L1) | 1 | MIDI IN |
| 1N4148 diode | 1 | flyback across opto LED |
| 220 Ω resistor | ~5 | IN, OUT, THRU loops |
| 74HC14 (optional) | 0–1 | only if legacy-compatible MIDI OUT needed |
| PCM5102A I2S DAC breakout | 1 | audio |
| TPA6132A2 headphone amp (or MAX98357A) | 1 | audio |
| 3.5mm TRS jack | 1 | headphone out |
| 10 kΩ audio-taper pot | 0–1 | optional volume |
| Momentary switch | 5 | buttons |
| 100 nF ceramic cap | 5 | button debounce assist |
| Barrel jack or USB-C (power) | 1 | 5V in |
| Schottky diode (SS14) | 0–1 | only if barrel jack |
| Polyfuse (500 mA–1 A) | 1 | 5V in protection |
| 100 µF electrolytic cap | 1 | 5V rail bulk |

---

## Next steps

1. Breadboard/proto the MIDI IN + OUT loop first in isolation — cheapest
   way to catch a wiring/polarity mistake before it's in copper.
2. Confirm the GPIO map against the actual DevKitC-1 pinout diagram.
3. Decide flash-stored vs. synthesized click WAV (affects nothing here, but
   worth locking down before writing playback firmware).
4. Pick an EDA tool (KiCad vs. Flux.ai vs. other) and transcribe these
   blocks into an actual schematic.
