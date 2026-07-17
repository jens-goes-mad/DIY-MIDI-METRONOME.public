---
title: MIDI Control Change (CC) Reference
comments: false
toc: true
---
The full Control Change (CC) assignment table — all 128 controller numbers, plus the Registered Parameter
Number (RPN) mechanism built on top of them — adapted from the MIDI Manufacturers Association's reference
tables ("Table 3: Control Changes and Mode Changes" / "Table 3a: Registered Parameter Numbers"). See
[MIDI, briefly](/midi) for the message-type overview this page complements.

Controller numbers 120–127 are reserved as **Channel Mode Messages**: instead of controlling a sound
parameter, they change the receiving channel's operating mode (see [MIDI, briefly](/midi) for how this
device uses a small slice of that CC range for its own LED configuration).

## Control Change and Channel Mode Messages

All sent as `0xBn` (Control Change, channel `n`), `0cccccccc` `0vvvvvvv` — controller number, then value.

| CC (Dec) | CC (Hex) | CC (Binary) | Function | Value | Used As |
|---|---|---|---|---|---|
| 0 | `0x00` | `00000000` | Bank Select | 0–127 | MSB |
| 1 | `0x01` | `00000001` | Modulation Wheel or Lever | 0–127 | MSB |
| 2 | `0x02` | `00000010` | Breath Controller | 0–127 | MSB |
| 3 | `0x03` | `00000011` | Undefined | 0–127 | MSB |
| 4 | `0x04` | `00000100` | Foot Controller | 0–127 | MSB |
| 5 | `0x05` | `00000101` | Portamento Time | 0–127 | MSB |
| 6 | `0x06` | `00000110` | Data Entry MSB | 0–127 | MSB |
| 7 | `0x07` | `00000111` | Channel Volume (formerly Main Volume) | 0–127 | MSB |
| 8 | `0x08` | `00001000` | Balance | 0–127 | MSB |
| 9 | `0x09` | `00001001` | Undefined | 0–127 | MSB |
| 10 | `0x0A` | `00001010` | Pan | 0–127 | MSB |
| 11 | `0x0B` | `00001011` | Expression Controller | 0–127 | MSB |
| 12 | `0x0C` | `00001100` | Effect Control 1 | 0–127 | MSB |
| 13 | `0x0D` | `00001101` | Effect Control 2 | 0–127 | MSB |
| 14 | `0x0E` | `00001110` | Undefined | 0–127 | MSB |
| 15 | `0x0F` | `00001111` | Undefined | 0–127 | MSB |
| 16 | `0x10` | `00010000` | General Purpose Controller 1 | 0–127 | MSB |
| 17 | `0x11` | `00010001` | General Purpose Controller 2 | 0–127 | MSB |
| 18 | `0x12` | `00010010` | General Purpose Controller 3 | 0–127 | MSB |
| 19 | `0x13` | `00010011` | General Purpose Controller 4 | 0–127 | MSB |
| 20 | `0x14` | `00010100` | Undefined | 0–127 | MSB |
| 21 | `0x15` | `00010101` | Undefined | 0–127 | MSB |
| 22 | `0x16` | `00010110` | Undefined | 0–127 | MSB |
| 23 | `0x17` | `00010111` | Undefined | 0–127 | MSB |
| 24 | `0x18` | `00011000` | Undefined | 0–127 | MSB |
| 25 | `0x19` | `00011001` | Undefined | 0–127 | MSB |
| 26 | `0x1A` | `00011010` | Undefined | 0–127 | MSB |
| 27 | `0x1B` | `00011011` | Undefined | 0–127 | MSB |
| 28 | `0x1C` | `00011100` | Undefined | 0–127 | MSB |
| 29 | `0x1D` | `00011101` | Undefined | 0–127 | MSB |
| 30 | `0x1E` | `00011110` | Undefined | 0–127 | MSB |
| 31 | `0x1F` | `00011111` | Undefined | 0–127 | MSB |
| 32 | `0x20` | `00100000` | LSB for Control 0 (Bank Select) | 0–127 | LSB |
| 33 | `0x21` | `00100001` | LSB for Control 1 (Modulation Wheel or Lever) | 0–127 | LSB |
| 34 | `0x22` | `00100010` | LSB for Control 2 (Breath Controller) | 0–127 | LSB |
| 35 | `0x23` | `00100011` | LSB for Control 3 (Undefined) | 0–127 | LSB |
| 36 | `0x24` | `00100100` | LSB for Control 4 (Foot Controller) | 0–127 | LSB |
| 37 | `0x25` | `00100101` | LSB for Control 5 (Portamento Time) | 0–127 | LSB |
| 38 | `0x26` | `00100110` | LSB for Control 6 (Data Entry) | 0–127 | LSB |
| 39 | `0x27` | `00100111` | LSB for Control 7 (Channel Volume, formerly Main Volume) | 0–127 | LSB |
| 40 | `0x28` | `00101000` | LSB for Control 8 (Balance) | 0–127 | LSB |
| 41 | `0x29` | `00101001` | LSB for Control 9 (Undefined) | 0–127 | LSB |
| 42 | `0x2A` | `00101010` | LSB for Control 10 (Pan) | 0–127 | LSB |
| 43 | `0x2B` | `00101011` | LSB for Control 11 (Expression Controller) | 0–127 | LSB |
| 44 | `0x2C` | `00101100` | LSB for Control 12 (Effect Control 1) | 0–127 | LSB |
| 45 | `0x2D` | `00101101` | LSB for Control 13 (Effect Control 2) | 0–127 | LSB |
| 46 | `0x2E` | `00101110` | LSB for Control 14 (Undefined) | 0–127 | LSB |
| 47 | `0x2F` | `00101111` | LSB for Control 15 (Undefined) | 0–127 | LSB |
| 48 | `0x30` | `00110000` | LSB for Control 16 (General Purpose Controller 1) | 0–127 | LSB |
| 49 | `0x31` | `00110001` | LSB for Control 17 (General Purpose Controller 2) | 0–127 | LSB |
| 50 | `0x32` | `00110010` | LSB for Control 18 (General Purpose Controller 3) | 0–127 | LSB |
| 51 | `0x33` | `00110011` | LSB for Control 19 (General Purpose Controller 4) | 0–127 | LSB |
| 52 | `0x34` | `00110100` | LSB for Control 20 (Undefined) | 0–127 | LSB |
| 53 | `0x35` | `00110101` | LSB for Control 21 (Undefined) | 0–127 | LSB |
| 54 | `0x36` | `00110110` | LSB for Control 22 (Undefined) | 0–127 | LSB |
| 55 | `0x37` | `00110111` | LSB for Control 23 (Undefined) | 0–127 | LSB |
| 56 | `0x38` | `00111000` | LSB for Control 24 (Undefined) | 0–127 | LSB |
| 57 | `0x39` | `00111001` | LSB for Control 25 (Undefined) | 0–127 | LSB |
| 58 | `0x3A` | `00111010` | LSB for Control 26 (Undefined) | 0–127 | LSB |
| 59 | `0x3B` | `00111011` | LSB for Control 27 (Undefined) | 0–127 | LSB |
| 60 | `0x3C` | `00111100` | LSB for Control 28 (Undefined) | 0–127 | LSB |
| 61 | `0x3D` | `00111101` | LSB for Control 29 (Undefined) | 0–127 | LSB |
| 62 | `0x3E` | `00111110` | LSB for Control 30 (Undefined) | 0–127 | LSB |
| 63 | `0x3F` | `00111111` | LSB for Control 31 (Undefined) | 0–127 | LSB |
| 64 | `0x40` | `01000000` | Damper Pedal On/Off (Sustain) | ≤63 off, ≥64 on | switch |
| 65 | `0x41` | `01000001` | Portamento On/Off | ≤63 off, ≥64 on | switch |
| 66 | `0x42` | `01000010` | Sostenuto On/Off | ≤63 off, ≥64 on | switch |
| 67 | `0x43` | `01000011` | Soft Pedal On/Off | ≤63 off, ≥64 on | switch |
| 68 | `0x44` | `01000100` | Legato Footswitch | ≤63 Normal, ≥64 Legato | switch |
| 69 | `0x45` | `01000101` | Hold 2 | ≤63 off, ≥64 on | switch |
| 70 | `0x46` | `01000110` | Sound Controller 1 (default: Sound Variation) | 0–127 | LSB |
| 71 | `0x47` | `01000111` | Sound Controller 2 (default: Timbre/Harmonic Intensity) | 0–127 | LSB |
| 72 | `0x48` | `01001000` | Sound Controller 3 (default: Release Time) | 0–127 | LSB |
| 73 | `0x49` | `01001001` | Sound Controller 4 (default: Attack Time) | 0–127 | LSB |
| 74 | `0x4A` | `01001010` | Sound Controller 5 (default: Brightness) | 0–127 | LSB |
| 75 | `0x4B` | `01001011` | Sound Controller 6 (default: Decay Time — MMA RP-021) | 0–127 | LSB |
| 76 | `0x4C` | `01001100` | Sound Controller 7 (default: Vibrato Rate — MMA RP-021) | 0–127 | LSB |
| 77 | `0x4D` | `01001101` | Sound Controller 8 (default: Vibrato Depth — MMA RP-021) | 0–127 | LSB |
| 78 | `0x4E` | `01001110` | Sound Controller 9 (default: Vibrato Delay — MMA RP-021) | 0–127 | LSB |
| 79 | `0x4F` | `01001111` | Sound Controller 10 (default undefined — MMA RP-021) | 0–127 | LSB |
| 80 | `0x50` | `01010000` | General Purpose Controller 5 | 0–127 | LSB |
| 81 | `0x51` | `01010001` | General Purpose Controller 6 | 0–127 | LSB |
| 82 | `0x52` | `01010010` | General Purpose Controller 7 | 0–127 | LSB |
| 83 | `0x53` | `01010011` | General Purpose Controller 8 | 0–127 | LSB |
| 84 | `0x54` | `01010100` | Portamento Control | 0–127 | LSB |
| 85 | `0x55` | `01010101` | Undefined | — | — |
| 86 | `0x56` | `01010110` | Undefined | — | — |
| 87 | `0x57` | `01010111` | Undefined | — | — |
| 88 | `0x58` | `01011000` | High Resolution Velocity Prefix | 0–127 | LSB |
| 89 | `0x59` | `01011001` | Undefined | — | — |
| 90 | `0x5A` | `01011010` | Undefined | — | — |
| 91 | `0x5B` | `01011011` | Effects 1 Depth (default: Reverb Send Level — MMA RP-023; formerly External Effects Depth) | 0–127 | — |
| 92 | `0x5C` | `01011100` | Effects 2 Depth (formerly Tremolo Depth) | 0–127 | — |
| 93 | `0x5D` | `01011101` | Effects 3 Depth (default: Chorus Send Level — MMA RP-023; formerly Chorus Depth) | 0–127 | — |
| 94 | `0x5E` | `01011110` | Effects 4 Depth (formerly Celeste [Detune] Depth) | 0–127 | — |
| 95 | `0x5F` | `01011111` | Effects 5 Depth (formerly Phaser Depth) | 0–127 | — |
| 96 | `0x60` | `01100000` | Data Increment (Data Entry +1 — MMA RP-018) | N/A | — |
| 97 | `0x61` | `01100001` | Data Decrement (Data Entry -1 — MMA RP-018) | N/A | — |
| 98 | `0x62` | `01100010` | Non-Registered Parameter Number (NRPN) — LSB | 0–127 | LSB |
| 99 | `0x63` | `01100011` | Non-Registered Parameter Number (NRPN) — MSB | 0–127 | MSB |
| 100 | `0x64` | `01100100` | Registered Parameter Number (RPN) — LSB | 0–127 | LSB |
| 101 | `0x65` | `01100101` | Registered Parameter Number (RPN) — MSB | 0–127 | MSB |
| 102 | `0x66` | `01100110` | Undefined | — | — |
| 103 | `0x67` | `01100111` | Undefined | — | — |
| 104 | `0x68` | `01101000` | Undefined | — | — |
| 105 | `0x69` | `01101001` | Undefined | — | — |
| 106 | `0x6A` | `01101010` | Undefined | — | — |
| 107 | `0x6B` | `01101011` | Undefined | — | — |
| 108 | `0x6C` | `01101100` | Undefined | — | — |
| 109 | `0x6D` | `01101101` | Undefined | — | — |
| 110 | `0x6E` | `01101110` | Undefined | — | — |
| 111 | `0x6F` | `01101111` | Undefined | — | — |
| 112 | `0x70` | `01110000` | Undefined | — | — |
| 113 | `0x71` | `01110001` | Undefined | — | — |
| 114 | `0x72` | `01110010` | Undefined | — | — |
| 115 | `0x73` | `01110011` | Undefined | — | — |
| 116 | `0x74` | `01110100` | Undefined | — | — |
| 117 | `0x75` | `01110101` | Undefined | — | — |
| 118 | `0x76` | `01110110` | Undefined | — | — |
| 119 | `0x77` | `01110111` | Undefined | — | — |
| 120 | `0x78` | `01111000` | **[Channel Mode]** All Sound Off | 0 | — |
| 121 | `0x79` | `01111001` | **[Channel Mode]** Reset All Controllers (MMA RP-015) | 0 | — |
| 122 | `0x7A` | `01111010` | **[Channel Mode]** Local Control On/Off | 0 off, 127 on | — |
| 123 | `0x7B` | `01111011` | **[Channel Mode]** All Notes Off | 0 | — |
| 124 | `0x7C` | `01111100` | **[Channel Mode]** Omni Mode Off (+ all notes off) | 0 | — |
| 125 | `0x7D` | `01111101` | **[Channel Mode]** Omni Mode On (+ all notes off) | 0 | — |
| 126 | `0x7E` | `01111110` | **[Channel Mode]** Mono Mode On (+ poly off, + all notes off) | M = number of channels, or 0 | — |
| 127 | `0x7F` | `01111111` | **[Channel Mode]** Poly Mode On (+ mono off, + all notes off) | 0 | — |

## Registered Parameter Numbers (RPNs)

RPNs extend Control Change with addressable parameters: send CC101 (RPN MSB) and CC100 (RPN LSB) to select
one below, then CC6 (Data Entry MSB) — and CC38 (Data Entry LSB) if the parameter needs it — to set its
value. CC96/97 (Data Increment/Decrement) nudge the selected parameter relatively instead.

| RPN MSB (Hex) | RPN LSB (Hex) | Parameter | Data Entry Value |
|---|---|---|---|
| `0x00` | `0x00` | Pitch Bend Sensitivity | MSB = ± semitones, LSB = ± cents |
| `0x00` | `0x01` | Channel Fine Tuning (formerly Fine Tuning — MMA RP-022) | Resolution 100/8192 cents. `0x00 0x00` = −100 cents, `0x40 0x00` = A440, `0x7F 0x7F` = +100 cents |
| `0x00` | `0x02` | Channel Coarse Tuning (formerly Coarse Tuning — MMA RP-022) | Only MSB used, resolution 100 cents. `0x00` = −6400 cents, `0x40` = A440, `0x7F` = +6300 cents |
| `0x00` | `0x03` | Tuning Program Change | Tuning Program Number |
| `0x00` | `0x04` | Tuning Bank Select | Tuning Bank Number |
| `0x00` | `0x05` | Modulation Depth Range (MMA General MIDI Level 2) | GM2: defined in the GM2 spec; other systems: manufacturer-defined |
| `0x00` | `0x06` | MPE Configuration Message | See the MPE Specification |
| `0x3D` | `0x00` | 3D Sound Controller — Azimuth Angle | See RP-049 |
| `0x3D` | `0x01` | 3D Sound Controller — Elevation Angle | See RP-049 |
| `0x3D` | `0x02` | 3D Sound Controller — Gain | See RP-049 |
| `0x3D` | `0x03` | 3D Sound Controller — Distance Ratio | See RP-049 |
| `0x3D` | `0x04` | 3D Sound Controller — Maximum Distance | See RP-049 |
| `0x3D` | `0x05` | 3D Sound Controller — Gain at Maximum Distance | See RP-049 |
| `0x3D` | `0x06` | 3D Sound Controller — Reference Distance Ratio | See RP-049 |
| `0x3D` | `0x07` | 3D Sound Controller — Pan Spread Angle | See RP-049 |
| `0x3D` | `0x08` | 3D Sound Controller — Roll Angle | See RP-049 |
| `0x7F` | `0x7F` | Null Function Number (RPN/NRPN reset) | Disables the data entry/increment/decrement controllers until a new RPN or NRPN is selected |

Source: MIDI Manufacturers Association — see [Summary of MIDI 1.0 Messages](https://midi.org/summary-of-midi-1-0-messages)
for the related message-type reference, and [midi.org](https://midi.org/) for the full, current specification.
