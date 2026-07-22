---
title: Cascading BLE sync
comments: false
toc: true
---
Multiple standalone metronome units can stay in tempo with each other over
Bluetooth Low Energy — no wired connection, no host, no app in the middle.
One unit acts as the tempo source, the rest follow, and the whole thing
runs on **broadcast**, not a normal BLE connection.

## Broadcast vs. connection

Most people's mental model of Bluetooth is a *connection*: pair once, then
a private, two-way link between exactly two devices. BLE also supports a
completely different mode — **advertising**, the same mechanism a device
normally uses just to announce "I exist, here's my name" before anything
connects to it. Advertising packets can carry a small payload of custom
data, broadcast openly on a fixed schedule, readable by *any* nearby
device that's listening — no pairing, no connection slot, no one-to-one
limit.

That's a good match for a group of metronomes: every unit just needs the
current tempo and beat phase, repeatedly, and it doesn't matter how many
units are listening. A real BLE connection would mean the SENDER
juggling a separate connection per follower (and BLE connection slots are
limited); broadcast scales to as many RECEIVERs as are in range for free,
at the cost of being one-way and unacknowledged — if a packet is missed,
the next one just arrives ~20-30ms later.

## SENDER / RECEIVER

Every unit runs the identical firmware; there's no separate "sender
build." Role is decided locally and automatically:

- A unit is **SENDER** while it's USB-connected to a MIDI source, or has
  received real MIDI in the last few seconds.
- Otherwise it's a **RECEIVER**.

A unit flips roles live — plug a DAW into whichever box is closest and it
becomes the tempo source for the rest, no configuration step. An onboard
RGB LED reflects the current role at a glance (one color for SENDER,
another for RECEIVER), separate from the main pendulum strip.

Units only sync within a shared **group ID** (a small numeric value,
adjustable via MIDI Control Change like the rest of this device's
settings) — so multiple independent groups of metronomes can share the
same room without cross-talk.

## What actually gets broadcast

On each downbeat, the SENDER advertises: group ID, current tempo, and
which way the pendulum is currently swinging. That's it — no continuous
position stream, no clock signal. Every RECEIVER already runs the exact
same triangle-wave pendulum math the SENDER uses internally (see
[MIDI clock → pendulum](/software/midi-clock-to-pendulum)); it just needs
tempo and a direction anchor once per beat to keep free-running that math
in step, locally, until the next broadcast arrives.

That's also what makes the sync robust to an occasionally-missed
advertisement: a RECEIVER that misses one beat's broadcast just keeps
extrapolating from the last one it got, and quietly re-anchors on the
next successful one — rather than needing every single packet to arrive
for the LED to stay in the right place.
