---
title: Cascading BLE sync
comments: false
toc: true
---
Multiple standalone metronome units can stay in tempo with each other over
Bluetooth Low Energy — no wired connection, no host, no app in the middle.
One unit acts as the tempo source, the rest follow, and the whole thing
runs on **broadcast**, not a normal BLE connection. See
[Bluetooth on the ESP32-S3](/hardware/bluetooth) for the radio/protocol
background this section builds on.

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

## Configuring non-connectable advertising

As with [USB MIDI class-compliance](/software/usb-midi-class-compliance),
the excerpts below are trimmed down from the actual firmware to show the
shape of the approach — not the actual buildable source, no Makefiles,
won't compile as shown. This uses NimBLE, the BLE stack ESP-IDF ships.

The SENDER's whole payload is one small packed struct, sent as
manufacturer-specific advertising data — no GATT service, no
characteristics, because nothing ever connects to read them. Beyond the
manufacturer/magic pair and group ID, it's just tempo, swing direction,
and a per-beat sequence number used for dedup (more on that below):

```c
// illustrative, trimmed from metro_cascade_ble.c

typedef struct __attribute__((packed)) {
    uint16_t company_id;
    uint8_t  magic;
    uint8_t  group_id;
    uint16_t bpm_x10;
    uint8_t  beat_increasing;
    uint8_t  beat_seq;
} cascade_adv_payload_t;

static void start_advertising(void)
{
    cascade_adv_payload_t payload = { /* ... */ };

    struct ble_hs_adv_fields fields = {0};
    fields.mfg_data     = (uint8_t *)&payload;
    fields.mfg_data_len = sizeof(payload);
    ble_gap_adv_set_fields(&fields);

    // non-connectable, non-discoverable
    struct ble_gap_adv_params adv_params = {0};
    adv_params.conn_mode = BLE_GAP_CONN_MODE_NON;
    adv_params.disc_mode = BLE_GAP_DISC_MODE_NON;
    adv_params.itvl_min  = CASCADE_ADV_ITVL_MIN;
    adv_params.itvl_max  = CASCADE_ADV_ITVL_MAX;

    ble_gap_adv_start(s_own_addr_type, NULL, BLE_HS_FOREVER,
                       &adv_params, cascade_gap_event, NULL);
}
```

The RECEIVER side is a passive scan callback: parse the manufacturer data
back out, filter to this project's own broadcasts, and drop repeats of a
beat it's already seen (a legacy advertising PDU repeats on 3 channels and
on every advertising interval, not just once per beat):

```c
// illustrative, trimmed from metro_cascade_ble.c

static int cascade_gap_event(struct ble_gap_event *event, void *arg)
{
    if (event->type != BLE_GAP_EVENT_DISC) return 0;

    struct ble_hs_adv_fields fields;
    ble_hs_adv_parse_fields(&fields, event->disc.data,
                             event->disc.length_data);

    cascade_adv_payload_t p;
    memcpy(&p, fields.mfg_data, sizeof(p));

    if (p.company_id != CASCADE_MFG_COMPANY_ID) return 0;
    if (p.group_id   != s_group_id)             return 0;

    if (s_have_last_beat && p.beat_seq == s_last_beat_seq) {
        return 0;  // dup
    }
    s_last_beat_seq = p.beat_seq;
    s_sync_bpm      = (float)p.bpm_x10 / 10.0f;
    s_sync_local_us = esp_timer_get_time();
    // ...
    return 0;
}
```
