---
title: MIDI clock → pendulum LED
comments: false
toc: true
---
The whole point of the device: turn an incoming MIDI Timing Clock stream
into a physical, swinging LED position — tick sweeps left→right, tock
sweeps right→left, the same visual cue as a real mechanical pendulum
metronome, not just a blinking light. See
[MIDI, briefly](/midi#what-this-device-listens-for) for why Timing Clock
specifically is what drives this.

As with the [USB MIDI class-compliance](/software/usb-midi-class-compliance)
page, the excerpts below are trimmed for illustration — not the actual
buildable source, no Makefiles, won't compile as shown.

## Tick → phase

MIDI Timing Clock sends 24 ticks per quarter note. Each tick advances a
counter; the counter's position within the beat maps onto a triangle wave
— rising for the first half of the beat, falling for the second half —
so a steady stream of ticks produces smooth back-and-forth motion instead
of a stepped one:

```c
// illustrative -- trimmed from metronome.c, won't compile as shown

// phase = tick_in_beat / ticks_per_beat   [0.0 .. 1.0)
// beat_pendulum_pos = phase          if phase < 0.5   (left -> right)
//                      1.0 - phase    otherwise         (right -> left)

void metronome_on_clock(Metronome *m)
{
    float beat_phase = (float)m->clock_count / (float)TICKS_PER_BEAT;
    m->beat_pendulum_pos = (m->beat % 2 == 0) ? beat_phase : (1.0f - beat_phase);

    if (++m->clock_count >= TICKS_PER_BEAT) {
        m->clock_count = 0;
        m->beat++;
    }
}
```

A separate, adaptive BPM estimate is tracked from the actual time between
ticks (not just the tick count) — smoothed enough to filter jitter at a
steady tempo, but quick enough to catch up within a handful of ticks after
a real tempo change.

## Phase → LED position

That `0.0..1.0` position becomes a single moving "spot" LED, trailed by a
short fading tail. The tricky part isn't drawing the spot — it's the tail:
which side does it trail on? The direction has to be derived from real
motion only, not re-derived every redraw, or a redraw triggered by
something unrelated (say, a color change) at an unchanged position
flips the tail to the wrong side for a frame:

```c
// illustrative -- trimmed from metro_led_strip.c, won't compile as shown

static void draw_spot(float pos)
{
    float head = pos * (active_leds - 1);

    // Direction only re-derived when the head position actually moved.
    int moving_right = (head != prev_head) ? (head > prev_head) : prev_moving_right;
    prev_head = head;

    // Tail: discrete steps starting one LED behind the head, walking
    // strictly further away from it -- can never land back on the head
    // itself, regardless of direction.
    for (int step = 1; step <= tail_length; step++) {
        int i = moving_right ? (head_index - step) : (head_index + step);
        if (i >= 0 && i < active_leds) set_pixel(i, fade(tail_color, step));
    }

    set_pixel(head_index, spot_color);   // drawn last, always wins over the tail
}
```

The rendering itself happens on its own low-priority task, polling a
"target position changed" flag rather than being called directly from
MIDI receive — the same reasoning as the USB MIDI receive path: nothing
that touches hardware (LED strip refresh over RMT, in this case) is
allowed to block time-sensitive MIDI handling.

## The one line that connects them

`metro_platform_esp32s3.c`'s MIDI realtime-message dispatcher ties both
halves together with nothing more than:

```c
// illustrative -- one line from on_realtime()'s Timing Clock case

metronome_on_clock(m);
metro_led_strip_set_target(metronome_beat_pendulum_pos(m));
```

Everything upstream of that line is MIDI parsing; everything downstream is
LED rendering. Neither side needs to know the other exists beyond this one
call.
