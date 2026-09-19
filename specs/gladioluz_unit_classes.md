# Gladioluz Unit Classes Inventory

This document summarizes the known **unit classes** used within the Gladioluz platform. Each class belongs to a `nature` and defines a set of properties and supported commands.

---

## 📊 Classes Table

| Class              | Nature         | Properties                      | Commands                                    |
|--------------------|----------------|----------------------------------|---------------------------------------------|
| `class.Light`      | `nature.Thing` | brightness, effect, preset       | common.setBrightness, common.setEffect, common.setPreset |
| `class.Socket` | `nature.Thing` | power | common.setPower |
| `class.Buzzer`     | `nature.Thing` | beep                             | common.playTone                             |
| `class.Magnet`     | `nature.Thing` | value                            | —                                           |
| `class.Illumination` | `nature.Thing` | value                           | —                                           |
| `class.Console`    | `nature.Thing` | app, wifi, online                | —                                           |
| `class.TV`         | `nature.Thing` | app, online                      | —                                           |
| `class.Mic` | `nature.Thing` | under_usage                      | —                                           |
| `class.Screen`     | `nature.Thing` | locked                           | —                                           |
| `class.X11`        | `nature.Thing` | apps                             | —                                           |
| `class.Beacon`     | `nature.Virtual` | online                              | —                                           |
| `class.Policy`   | `nature.Context` | current                        | context.setEnumValue, context.dropValue |

---

## 📜 Unified Commands

| Command                | Description                                | Example Payload |
|------------------------|--------------------------------------------|----------------|
| `common.setBrightness` | Set brightness level (0–100)               | `{ "alias": "common.setBrightness", "value": 75, "user": "system" }` |
| `common.setEffect`     | Enable/disable visual effect (boolean)     | `{ "alias": "common.setEffect", "value": true, "user": "user" }` |
| `common.setPower` | Turn power on/off (boolean) | `{ "alias": "common.setPower", "value": true, "user": "user" }` |
| `common.setPreset`     | Switch preset by index (integer)           | `{ "alias": "common.setPreset", "value": 2, "user": "system" }` |
| `common.playTone`      | Play tone with `{ tone, delay }` payload   | `{ "alias": "common.playTone", "value": { "tone": 200, "delay": 500 }, "user": "system" }` |
| `context.setEnumValue` | Set an enumerated property value (string defined by schema enum) | `{ "alias": "context.setEnumValue", "value": "work", "user": "system" }` |
| `context.dropValue`    | Drop the current value of an enum property, resulting in a `null` or default value | `{ "alias": "context.dropValue", "user": "system" }` |
---

## 🧾 Properties Data Types

| Property       | Data Type          | Notes |
|----------------|--------------------|-------|
| `brightness`   | integer (0–100)    | Current brightness level |
| `power` | boolean | `true` = on, `false` = off |
| `effect`       | boolean            | Visual effect enabled/disabled |
| `preset`       | integer            | Preset index (implementation specific) |
| `beep`         | string             | Format `"tone,delay"` (Hz, ms) |
| `value` (Magnet) | boolean          | `true` = open, `false` = closed |
| `value` (Illumination) | integer   | Light level (scale depends on firmware) |
| `app`          | string \/ null     | Active application ID or null |
| `wifi`         | boolean            | Wi‑Fi connection status |
| `online`       | boolean            | Availability |
| `under_usage`  | boolean            | Microphone active status |
| `locked`       | boolean            | Screen lock state |
| `apps`         | array of string    | List of visible X11 application class names |
| `current` | string | Active enumerated value, must be one of the items defined in `propertiesSchema.<prop>.enum`. |

---

