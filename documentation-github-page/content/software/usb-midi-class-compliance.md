---
title: USB MIDI class-compliance
comments: false
toc: true
---
"Class-compliant" USB MIDI means the operating system recognizes the
device as a standard MIDI port the moment it's plugged in — no driver
install, no vendor app, no "this is actually MIDI wrapped in something
else" translation layer. It shows up in your DAW's MIDI device list next
to any other MIDI interface. See [why the ESP32-S3](/hardware)
for what makes that possible on this board specifically (native USB-OTG,
which a plain Arduino doesn't have).

The excerpts below are trimmed down from the actual firmware to show the
shape of the approach — comments and error handling cut, some detail
folded away. They're illustrative, not buildable: no Makefiles or full
source here.

## Telling the OS "I'm a MIDI device"

Class-compliance comes from the USB descriptors the device presents during
enumeration — a device descriptor (vendor/product ID, USB version) plus a
configuration descriptor declaring a standard USB MIDI streaming
interface. The USB-IF's MIDI class spec defines that interface shape, so
any compliant host already knows how to talk to it:

```c
// illustrative, trimmed from usb_descriptors.c

#define USB_VID   0x1234u   // vendor ID
#define USB_PID   0xABCDu   // product ID

tusb_desc_device_t const desc_device = {
    .bcdUSB          = 0x0200u,
    .idVendor        = USB_VID,
    .idProduct       = USB_PID,
    // ...
};

uint8_t const desc_configuration[] = {
    TUD_CONFIG_DESCRIPTOR(/* ... */),
    // the actual "I am a MIDI device" declaration:
    TUD_MIDI_DESCRIPTOR(/* ... */),
};
```

## Decoding what comes in

Once enumerated, USB MIDI moves data as fixed 4-byte packets: a cable
number + Code Index Number (CIN) byte, then up to 3 raw MIDI bytes. CIN is
effectively "what kind of MIDI message is this," so decoding is a small
dispatch on that one nibble:

```c
// illustrative, trimmed from usb_midi_device.c

// [0] cable:4 | CIN:4   [1] status   [2] data0   [3] data1

static void decode_packet(const uint8_t *pkt, MidiListener *listener)
{
    uint8_t cin    = pkt[0] & 0x0F;
    uint8_t status = pkt[1];
    uint8_t ch     = status & 0x0F;

    switch (cin) {
        case 0x09: listener->on_note_on(ch, pkt[2], pkt[3]); break;
        case 0x0B: listener->on_cc(ch, pkt[2], pkt[3]);      break;
        case 0x0F: listener->on_realtime(status);            break;
        // ... other message types
    }
}
```

Received packets get pulled off a FreeRTOS notification (fired from the
USB stack's own receive callback) rather than polled on a timer, so the
firmware isn't burning CPU checking for MIDI data that isn't there — and
isn't adding polling-interval jitter to time-sensitive messages like
Timing Clock (see [MIDI clock → pendulum](/software/midi-clock-to-pendulum)
for why that timing precision matters here).

## Sending, the same way

Outgoing messages are just the reverse: pack the same 4-byte shape and
hand it to the USB stack. This project only sends short messages (Note
On/Off, CC) back out for things like Editor tooling — no SysEx transmit
path exists in the current firmware.
