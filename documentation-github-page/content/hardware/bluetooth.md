---
title: Bluetooth on the ESP32-S3
comments: false
toc: true
---
This project uses Bluetooth purely as a wireless broadcast link between
metronome units — see [Cascading BLE sync](/software/cascading-ble-sync)
for how that's actually built. This page stays one level below that: what
Bluetooth *is*, at the radio/protocol level, and specifically what the
ESP32-S3 provides.

## Bluetooth Classic vs. Bluetooth LE

"Bluetooth" covers two different radios that happen to share a brand name:

- **Bluetooth Classic (BR/EDR)** — continuous-connection, higher-bandwidth,
  built for streaming audio (headphones, car stereos). Always paired,
  always point-to-point.
- **Bluetooth Low Energy (LE)** — short, infrequent radio bursts, built for
  battery-powered sensors and beacons. Supports one-to-many broadcast
  without ever forming a connection, which is the part this project
  actually uses.

The ESP32-S3 only implements the LE side — **Bluetooth 5 (LE)**, with no
Classic/BR-EDR support (the original ESP32, by contrast, has both). For a
device that only needs to broadcast a tempo, LE is the right fit anyway:
lower power, and — critically — advertising doesn't require a connection
or a paired peer at all.

## Advertising vs. connections

BLE's Generic Access Profile (GAP) defines a few roles; the two that matter
here:

- **Broadcaster** — periodically transmits small advertising packets, to
  anyone listening, with no connection ever established.
- **Observer** — scans for advertising packets from broadcasters, again
  without connecting.

This is distinct from the *Central*/*Peripheral* roles used for actual BLE
connections (the pairing flow behind things like BLE heart-rate straps or
keyboards), and from **GATT** (Generic Attribute Profile — the
services/characteristics data model connected devices use to exchange
structured data). None of that machinery is needed for a one-to-many
"here's the current tempo" broadcast, which is why this project's
[SENDER/RECEIVER model](/software/cascading-ble-sync) is built entirely on
Broadcaster/Observer advertising, not connections.

## What the ESP32-S3 specifically brings

- **Bluetooth 5 (LE)**, integrated on the same silicon as the Wi-Fi radio —
  no separate BLE module or UART/SPI bridge to one.
- **Long-range Coded PHY** — one of Bluetooth 5's optional PHYs, trading
  data rate for radio sensitivity/range. Not currently used by this
  project's firmware, but available if broadcast range ever becomes a
  constraint.
- **Shared 2.4 GHz radio with Wi-Fi** — the S3 has one RF front end
  time-multiplexed between Wi-Fi and BLE by the coexistence scheduler in
  the SDK, not two independent radios. This project's builds don't use
  Wi-Fi, so BLE gets the radio to itself.

## Official specs and diagrams

- [Bluetooth SIG — Core Specifications](https://www.bluetooth.com/specifications/specs/) —
  the primary source; GAP, GATT, advertising, and the LE controller/host
  split are all defined here.
- [Bluetooth SIG — GATT Specification Supplement](https://www.bluetooth.com/specifications/gss/) —
  the connected-device data model referenced above, for comparison against
  the connectionless approach this project uses.
- [Bluetooth SIG — Classic vs. LE technology overview](https://www.bluetooth.com/learn-about-bluetooth/tech-overview/) —
  short comparison table of the two radios.
- [Espressif — ESP32-S3 product page](https://www.espressif.com/en/products/socs/esp32-s3)
- [Espressif — ESP32-S3 datasheet (PDF)](https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf) —
  radio specs, system block diagram.
- [Espressif — ESP32-S3 Technical Reference Manual (PDF)](https://www.espressif.com/sites/default/files/documentation/esp32-s3_technical_reference_manual_en.pdf) —
  the Bluetooth LE controller chapter and the Wi-Fi/BLE coexistence chapter,
  both with block diagrams.
