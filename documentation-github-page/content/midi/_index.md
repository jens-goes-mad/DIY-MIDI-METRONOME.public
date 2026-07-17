---
title: MIDI
links:
  - title: A quick primer on the MIDI protocol
    description: what MIDI is, which messages this device actually listens for, and the full message list
menu:
    main:
        weight: 15
        params:
            icon: music

comments: false
toc: true
---
# MIDI, briefly

MIDI (Musical Instrument Digital Interface) is a decades-old (1983) serial protocol for describing musical
*events* — not audio itself, just instructions like "start this note," "stop that note," or "advance the clock
by one tick." It runs at a fixed 31,250 baud over 5-pin DIN cables, or is tunneled over USB as USB-MIDI
class-compliant data; either way, the byte-level message format is identical.

Every MIDI message starts with a **status byte** (top bit set, `0x80`–`0xFF`) identifying the message type and —
for channel messages — which of the 16 channels it targets, followed by zero or more **data bytes** (top bit
clear, `0x00`–`0x7F`).

## What this device listens for

The DIY-MIDI-METRONOME firmware is a MIDI *consumer*, not a sequencer — it doesn't generate note data, it just
reacts to timing and a small set of control messages:

- **Timing Clock (`0xF8`)** — the whole point of the device. Sent 24 times per quarter note by the clock source
  (DAW, sequencer, another MIDI device), each tick advances the pendulum sweep by a fixed step. This is a
  System Realtime message, so it isn't wrapped in a channel and arrives continuously whenever the transport is
  running.
- **Start / Continue / Stop (`0xFA` / `0xFB` / `0xFC`)** — the other System Realtime messages the firmware
  tracks, so the pendulum knows whether the clock stream is actually live or the transport is just paused.
- **Control Change (`0xBn`)** — the device's own configuration surface: LED spot/tail color, brightness, and
  length, plus a small NRPN-based scheme for remapping which CC numbers control what. See
  [Software](/software) for the details.

Everything else — Note On/Off, Pitch Bend, SysEx, and so on — the firmware simply ignores; it isn't a
synthesizer or a note-triggered device.

## All MIDI message types, for reference

Grouped the same way the [MIDI Viewer](/software/midi-monitor) categorizes them, and sourced from the MIDI
Association's own reference — see [Summary of MIDI 1.0 Messages](https://midi.org/summary-of-midi-1-0-messages)
for the authoritative version (`n` = channel number `0x0`–`0xF` throughout).

### Channel Voice Messages

| Message | Status (Hex) | Status (Binary) | Data Bytes | Notes |
|---|---|---|---|---|
| Note Off | `0x8n` | `1000nnnn` | `0kkkkkkk` `0vvvvvvv` | key number, velocity |
| Note On | `0x9n` | `1001nnnn` | `0kkkkkkk` `0vvvvvvv` | key number, velocity |
| Polyphonic Key Pressure (Aftertouch) | `0xAn` | `1010nnnn` | `0kkkkkkk` `0vvvvvvv` | key number, pressure |
| Control Change | `0xBn` | `1011nnnn` | `0ccccccc` `0vvvvvvv` | controller number, value — 120–127 reserved for Channel Mode |
| Program Change | `0xCn` | `1100nnnn` | `0ppppppp` | new program number |
| Channel Pressure (Aftertouch) | `0xDn` | `1101nnnn` | `0vvvvvvv` | single pressure value for the whole channel |
| Pitch Bend Change | `0xEn` | `1110nnnn` | `0lllllll` `0mmmmmmm` | 14-bit value, center = `0x2000` |

### Channel Mode Messages (Control Change, controller types 120–127)

Sent as ordinary Control Change (`0xBn`) messages, using these reserved controller numbers. For the full
Control Change assignment table (all 128 controller numbers) and the RPN mechanism built on top of it, see
[MIDI Control Change (CC) Reference](/midi/midi-cc).

| Message | Controller (Hex) | Controller (Dec) | Value | Notes |
|---|---|---|---|---|
| All Sound Off | `0x78` | 120 | 0 | all oscillators off, envelopes to zero immediately |
| Reset All Controllers | `0x79` | 121 | — | all controllers reset to their default values |
| Local Control | `0x7A` | 122 | 0 / 127 | Off / On |
| All Notes Off | `0x7B` | 123 | 0 | all oscillators off |
| Omni Mode Off | `0x7C` | 124 | 0 | |
| Omni Mode On | `0x7D` | 125 | 0 | |
| Mono Mode On (Poly Off) | `0x7E` | 126 | M | M = number of channels, or 0 |
| Poly Mode On (Mono Off) | `0x7F` | 127 | 0 | |

The general-purpose Controller Numbers table (0–119, e.g. Modulation, Volume, Pan, Sustain) is defined by the
MIDI Association but isn't reproduced here — see the link above for the full, current assignment list.

### System Common Messages

| Message | Status (Hex) | Status (Binary) | Data Bytes | Notes |
|---|---|---|---|---|
| System Exclusive | `0xF0` | `11110000` | manufacturer ID + arbitrary data | terminated by End of Exclusive |
| MIDI Time Code Quarter Frame | `0xF1` | `11110001` | `0nnndddd` | nnn = message type, dddd = value |
| Song Position Pointer | `0xF2` | `11110010` | `0lllllll` `0mmmmmmm` | 14-bit beat count since song start |
| Song Select | `0xF3` | `11110011` | `0sssssss` | selects a sequence/song |
| *(undefined)* | `0xF4` | `11110100` | — | reserved |
| *(undefined)* | `0xF5` | `11110101` | — | reserved |
| Tune Request | `0xF6` | `11110110` | — | analog synths should tune their oscillators |
| End of Exclusive (EOX) | `0xF7` | `11110111` | — | terminates a SysEx dump |

### System Real-Time Messages

| Message | Status (Hex) | Status (Binary) | Notes |
|---|---|---|---|
| Timing Clock | `0xF8` | `11111000` | 24 per quarter note — what this device is built around |
| *(undefined)* | `0xF9` | `11111001` | reserved |
| Start | `0xFA` | `11111010` | followed by Timing Clocks |
| Continue | `0xFB` | `11111011` | resumes from the point the sequence was stopped |
| Stop | `0xFC` | `11111100` | |
| *(undefined)* | `0xFD` | `11111101` | reserved |
| Active Sensing | `0xFE` | `11111110` | optional keepalive — expect one every ≤300ms once seen |
| Reset (System Reset) | `0xFF` | `11111111` | resets all receivers to power-up state — use sparingly |
