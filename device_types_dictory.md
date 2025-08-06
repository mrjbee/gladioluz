# Gladioluz Device Types Inventory

This document summarizes the known device types used within the Gladioluz platform based on observed MQTT device definitions. It includes their properties, supported commands, and real-world examples.

---

## 📊 Summary Table

| Device Type                 | Type          | Properties                      | Commands                                    |
|----------------------------|---------------|----------------------------------|---------------------------------------------|
| myhome.firmware.Console | `console` | app, wifi, online | — |
| myhome.firmware.TV | `tv` | app, online | — |
| myhome.firmware.Mic | `microphone` | under_usage | — |
| myhome.firmware.Screen | `screen` | locked | — |
| myhome.firmware.X11 | `x11` | apps | — |
| myhome.firmware.IP | `ip` | — | — |
| myhome.firmware.Light | `light` | brightness, effect, preset | common.setBrightness, common.setEffect, common.setPreset |
| myhome.firmware.Buzzer | `buzzer` | beep | common.playTone |
| myhome.firmware.sensor.Magnet | `magnet` | value | — |
| myhome.firmware.sensor.Illumination | `illumination` | value | — |

---

## myhome.firmware.Light

- **Type:** `light`
- **Properties:**
  - `brightness`: integer (0–100) — current brightness level
  - `effect`: boolean — true = effect enabled, false = normal mode
  - `preset`: integer — preset index (used in Hyperion, WLED)
- **Supported Commands:**
  - `common.setBrightness — set brightness level`
  - `common.setEffect — enable/disable visual effect`
  - `common.setPreset — switch preset by index`
- **Example Device:**
```json
{
  "physical_device": "hyperion_Monitor",
  "driver": "hyperion-driver",
  "ip": "192.168.0.115",
  "powerChangedAt": "2025-07-23T20:07:40.992801",
  "alias": "Monitor",
  "supported_commands": [
    "common.setBrightness",
    "common.setPreset"
  ],
  "title": "Hyper Monitor",
  "type": "myhome.firmware.Light",
  "version": 1,
  "properties": {
    "brightness": {
      "value": 40
    },
    "preset": {
      "value": 1
    }
  },
  "enabled": false
}
```
- **Example Command:**
```json
{
  "alias": "common.setPreset",
  "value": 0,
  "user": "system"
}
```

---

## myhome.firmware.Buzzer

- **Type:** `buzzer`
- **Properties:**
  - `beep`: string — format 'tone,delay' (Hz, ms)
- **Supported Commands:**
  - `common.playTone — play tone with { tone, delay }`
- **Example Device:**
```json
{
  "physical_device": "ESP_bg_balcony",
  "driver": "nodemcu-java-driver",
  "powerChangedAt": "2025-08-02T20:50:54.228811",
  "alias": "main",
  "supported_commands": [
    "common.playTone"
  ],
  "title": "buzzer::ESP_bg_balcony:main",
  "type": "myhome.firmware.Buzzer",
  "version": 1,
  "properties": {
    "beep": {
      "value": "200,500"
    }
  },
  "enabled": true
}
```
- **Example Command:**
```json
{
  "alias": "common.playTone",
  "value": {
    "tone": 200,
    "delay": 500
  },
  "user": "system"
}
```

---

## myhome.firmware.sensor.Magnet

- **Type:** `magnet`
- **Properties:**
  - `value`: boolean — true = open, false = closed ⚠️ likely inverted logic
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "ESP_bg_entance_door",
  "driver": "nodemcu-java-driver",
  "powerChangedAt": "2025-07-17T19:42:50.279921",
  "alias": "entrance",
  "supported_commands": [],
  "title": "magnet::ESP_bg_entance_door:entrance",
  "type": "myhome.firmware.sensor.Magnet",
  "version": 1,
  "properties": {
    "value": {
      "value": true
    }
  },
  "enabled": true
}
```

---

## myhome.firmware.sensor.Illumination

- **Type:** `illumination`
- **Properties:**
  - `value`: integer — light level (scale is implementation-specific)
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "ESP_bg_balcony",
  "driver": "nodemcu-java-driver",
  "powerChangedAt": "2025-08-02T20:50:54.221909",
  "alias": "main",
  "supported_commands": [],
  "title": "illumination::ESP_bg_balcony:main",
  "type": "myhome.firmware.sensor.Illumination",
  "version": 1,
  "properties": {
    "value": {
      "value": 1
    }
  },
  "enabled": true
}
```

---

## myhome.firmware.Console

- **Type:** `console`
- **Properties:**
  - `app`: string|null — active application ID or null
  - `wifi`: boolean — Wi-Fi connection status
  - `online`: boolean — online availability ⚠️ may duplicate `enabled`
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "xbox_main",
  "driver": "xbox-driver",
  "ip": "192.168.0.201",
  "powerChangedAt": "2025-07-17T19:37:54.996076",
  "alias": "main",
  "supported_commands": [],
  "title": "XBox main",
  "type": "myhome.firmware.Console",
  "version": 1,
  "properties": {
    "app": {
      "value": null
    },
    "wifi": {
      "value": false
    },
    "online": {
      "value": false
    }
  },
  "enabled": true
}
```

---

## myhome.firmware.TV

- **Type:** `tv`
- **Properties:**
  - `app`: string — active Android application (package name)
  - `online`: boolean — true = online, false = offline ⚠️ independent from `enabled`
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "android_chromecast",
  "driver": "android-driver",
  "ip": "192.168.0.117",
  "powerChangedAt": "2025-08-06T00:57:44.523653",
  "alias": "chromecast",
  "supported_commands": [],
  "title": "Android chromecast",
  "type": "myhome.firmware.TV",
  "version": 1,
  "properties": {
    "app": {
      "value": "com.google.android.youtube.tv"
    },
    "online": {
      "value": true
    }
  },
  "enabled": false
}
```

---

## myhome.firmware.Mic

- **Type:** `microphone`
- **Properties:**
  - `under_usage`: boolean — true = microphone is active
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "fakelaptop",
  "driver": "pc-java-driver",
  "powerChangedAt": "2025-08-05T18:40:23.312575",
  "alias": "master",
  "supported_commands": [],
  "title": "microphone::fakelaptop:master",
  "type": "myhome.firmware.Mic",
  "version": 1,
  "properties": {
    "under_usage": {
      "value": false
    }
  },
  "enabled": true
}
```

---

## myhome.firmware.Screen

- **Type:** `screen`
- **Properties:**
  - `locked`: boolean — true = screen locked, false = unlocked
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "fakelaptop",
  "driver": "pc-java-driver",
  "powerChangedAt": "2025-08-05T18:40:23.319477",
  "alias": "main",
  "supported_commands": [],
  "title": "screen::fakelaptop:main",
  "type": "myhome.firmware.Screen",
  "version": 1,
  "properties": {
    "locked": {
      "value": false
    }
  },
  "enabled": true
}
```

---

## myhome.firmware.X11

- **Type:** `x11`
- **Properties:**
  - `apps`: array of string — list of visible X11 application class names
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "fakelaptop",
  "driver": "pc-java-driver",
  "powerChangedAt": "2025-08-05T18:40:23.270963",
  "alias": "main",
  "supported_commands": [],
  "title": "x11::fakelaptop:main",
  "type": "myhome.firmware.X11",
  "version": 1,
  "properties": {
    "apps": {
      "value": [
        "google-chrome",
        "idea",
        "jetbrains-idea-ce"
      ]
    }
  },
  "enabled": true
}
```

---

## myhome.firmware.IP

- **Type:** `ip`
- **Properties:**
  - *(none)*
- **Supported Commands:**
  - *(none)*
- **Example Device:**
```json
{
  "physical_device": "kiev_flat",
  "driver": "ip-checker",
  "powerChangedAt": "2025-08-04T12:48:52.581268",
  "alias": "main",
  "supported_commands": [],
  "type": "myhome.firmware.IP",
  "version": 1,
  "properties": {},
  "enabled": true
}
```

---