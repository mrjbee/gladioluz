# Gladioluz Platform MQTT Protocol (v0.2 BETA)

This protocol defines the standardized message structure and topic hierarchy for MQTT-based communication between components of the Gladioluz platform: services, adapters, agents, and physical devices. Its goal is to **unify automation logic**, **decouple low-level integrations**, and support **flexible orchestration** across a distributed environment.

---

## Protocol Domains

The Gladioluz MQTT protocol is organized into distinct domains, each responsible for a specific category of messages exchanged across the platform.

All domains share a common topic prefix — the **Platform Root Topic**, which is configurable. By default, this root topic is set to `platform`.

---

### Units

`platform/units`

This domain represents logical **units** (ex‑devices) available to the automation layer — lights, sensors, media players, switches, and other components.

#### Unit State Events

Each unit publishes its current state to the topic:

```
platform/units/<unit-id>
```

Each unit is identified by a unique `unit-id`, following the **flat** convention:

```
<originId>.<localName>
```

**Where:**

- `originId` — `<namespace>.<name>` that identifies the physical or virtual origin (e.g. `esp.ESP_bg_balcony`, `wled.192_168_0_21`).
- `localName` — local component name within the origin. For multi‑class origins it typically includes class in the name (e.g. `light-main`). **No dots** are allowed in `localName`.

**Parsing rule:** split by the **last** `.` → left part is `originId`, right part is `localName`.

**Examples:**

- `esp.ESP_bg_balcony.light-main`
- `wled.192_168_0_21.main`

> ⚠️ `unit-id` must be unique and stable. It is referenced in configuration, commands, and automation logic.

Each message in `platform/units/<unit-id>` is a full snapshot of the unit's current state. It includes:

1. **General information** — metadata about the unit and its origin
2. **Properties** — structured observable/controllable values
3. **Supported commands** — list of operations this unit accepts

**Payload Schema:**

```jsonc
{
  "localName": "string",                 // e.g. "light-main" or "main"
  "originId": "string",                 // e.g. "esp.ESP_bg_balcony"
  "driver": "string",                   // e.g. "nodemcu-unit-driver"
  "nature": "nature.Thing | nature.Virtual | nature.Logic | nature.Context",
  "title": "string",                    // human-friendly title
  "class": "class.Light | class.*",     // replaces legacy `type`
  "version": 1,
  "ip": "string",                       // optional, when applicable
  "powerChangedAt": "ISO timestamp",    // optional; depends on `nature`
  "supported_commands": ["string", "..."], // list of commands accepted by the unit
  "properties": {
    "<property-name>": {
      "value": "any",
      "updatedAt": "ISO timestamp",
      "updatedBy": "system | user",
      "changedAt": "ISO timestamp",
      "changed_from_value": "any"
    }
  },
  "propertiesSchema": {}, //optional schema definition for properties
  "enabled": true
}
```

**Optional: Properties Schema**

Units may optionally include a `propertiesSchema` object that declares the domain of allowed values for specific properties (useful for validation and UI hints).

```jsonc
"propertiesSchema": {
  "<property-name>": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "string",
    "enum": ["..."] // domain for this property
  }
}
```
Notes:

propertiesSchema is purely declarative; it does not change runtime behavior.

Values published under properties.*.value MUST comply with the declared schema when present.


**Examples:**

```json
{
  "localName": "light-main",
  "originId": "esp.ESP_bg_balcony",
  "driver": "nodemcu-unit-driver",
  "nature": "nature.Thing",
  "powerChangedAt": "2025-08-17T13:23:25.156492",
  "supported_commands": ["common.setBrightness", "common.setEffect"],
  "title": "Balcony: Main Light",
  "class": "class.Light",
  "version": 1,
  "properties": {
    "brightness": {
      "updatedBy": "system",
      "changedAt": "2025-08-18T19:03:36.71672",
      "value": 100,
      "changed_from_value": 0,
      "updatedAt": "2025-08-18T23:04:07.71252"
    },
    "effect": {
      "updatedBy": "user",
      "changedAt": "2025-08-16T22:55:21.886164",
      "value": false,
      "changed_from_value": null,
      "updatedAt": "2025-08-18T23:03:07.624805"
    }
  },
  "enabled": true
}
```

```json
{
  "localName": "main",
  "originId": "wled.192_168_0_21",
  "driver": "wled-unit-driver",
  "nature": "nature.Thing",
  "ip": "192.168.0.21",
  "powerChangedAt": "2025-08-17T13:23:27.813519",
  "supported_commands": ["common.setBrightness", "common.setPreset"],
  "title": "Living Room: TV WLED",
  "class": "class.Light",
  "version": 1,
  "properties": {
    "brightness": {
      "updatedBy": "system",
      "changedAt": "2025-08-18T23:01:57.090433",
      "value": 5,
      "changed_from_value": 100,
      "updatedAt": "2025-08-18T23:03:46.078967"
    },
    "preset": {
      "updatedBy": "system",
      "changedAt": "2025-08-18T17:54:39.743614",
      "value": 1,
      "changed_from_value": 2,
      "updatedAt": "2025-08-18T23:04:39.630843"
    }
  },
  "enabled": true
}
```
```json
{
  "localName": "master-room",
  "originId": "platform.policy",
  "driver": "policy-unit-service",
  "nature": "nature.Context",
  "class": "class.Policy",
  "title": "Master Room Policy",
  "version": 1,
  "supported_commands": ["context.setEnumValue", "context.dropValue"],
  "properties": {
    "current": {
      "value": "work",
      "updatedBy": "system",
      "updatedAt": "2025-08-24T15:04:11.332Z",
      "changedAt": "2025-08-24T15:04:11.332Z",
      "changed_from_value": null
    }
  },
  "propertiesSchema": {
    "current": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "string",
      "enum": ["work", "entertainment", "party", "training", "quiet", "unleashed"]
    }
  },
  "enabled": true
}
```


#### Unit Commands

To execute an action on a unit, publish a command to the following topic:

```
platform/units/<unit-id>/commands
```

The payload must follow this schema :

```jsonc
{
  "alias": "string",        // required; must match supported_commands
  "value": "any",           // required; can be primitive or structured
  "user": "string"          // optional; typically "user" or "system"
}
```

**Examples:**

```json
{
  "alias": "common.setBrightness",
  "value": 100,
  "user": "system"
}
```

```json
{
  "alias": "common.setPreset",
  "value": 0,
  "user": "system"
}
```

> ⚠️ If the command is not supported or malformed, the unit service will silently ignore it. No state update or error event will be published.

Successful execution typically results in a `platform/units/<unit-id>` update with the new property state.

---
### Streams

**Topic prefix:** `platform/streams`

This domain is used for **fire-and-forget event streams**. Messages published under `streams` are **not retained**, **not structured as state**, and **not guaranteed** to be delivered or repeated.

Unlike `devices`, which publish current snapshots, **stream messages are transient**. If missed — they are lost.

**General Rules**:

- **No strict topic hierarchy.** Any subtopic is allowed: `notifications`, `physical-devices/heartbeats`, `logs/system`, `tts`, etc.
- **Each subtopic has its own structure.** There is no unified schema across `streams`, but within one subtopic, structure should be consistent.

---

#### Notifications

**Topic:** `platform/streams/notifications`\
**Consumer:** `service-telegram` (and optionally others)

Human-oriented messages: user alerts, announcements, reminders. These are intended for display in UI, Telegram bots, or notification services.

**Payload Schema:**

```jsonc
{
  "message": "string",   // Required. Human-readable text
  "private": false         // Optional. true = admin-only; false = family/group message
}
```

**Example:**

```json
{
  "message": "Front door was closed",
  "private": false
}
```

---

#### Physical Device Heartbeats

**Topic:** `platform/streams/physical-devices/heartbeats`\
**Consumer:** `service-device-watcher`

Heartbeat messages emitted by physical devices — ESPs, agents, containers, and others — via dedicated platform services.\
Used to determine device availability, restart detection, and daily uptime reports.

> These events are **not retained**. If a heartbeat is missed, the platform may consider the device **offline**.

**Requirements**:

- Devices must **emit heartbeats via an appropriate Gladioluz platform service** (e.g., `service-node-mcu-driver`, `gladiolus-agent`, etc.)
- If no heartbeat is received for a configurable timeout period (e.g., 60s), the device is considered **unavailable**
- `uptime` is always reported in **milliseconds**

---

**Payload Schema:**

```jsonc
{
  "deviceId": "string",    // Required. Unique physical device ID
  "type": "string",        // Required. Device category (e.g. "esp", "agent", "service")
  "details": {              // Optional. Additional info
    "ip": "string",        // IP address (if known)
    "mac": "string",       // MAC address (if known)
    "uptime": number        // Required. Uptime in milliseconds
  }
}
```

---

**Examples:**

```json
{
  "deviceId": "fakelaptop",
  "type": "pc_board",
  "details": {
    "mac": "d0:39:57:48:31:2f",
    "uptime": 1754416103334
  }
}
```

```json
{
  "deviceId": "app_device-watcher",
  "type": "service",
  "details": {
    "ip": "172.19.0.2",
    "uptime": 1645821620
  }
}
```

```json
{
  "deviceId": "ESP_bg_my_lamp",
  "type": "node_mcu_board",
  "details": {
    "mac": "D8:BF:C0:D7:F3:F4",
    "uptime": 256039760
  }
}
```

---
### Configs

**Topic prefix:** `platform/configs`

This domain is reserved for publishing configuration metadata used by the platform and its services. These topics are **read-only** from the perspective of platform services and are intended to be populated by external publishers (such as UI editors, config sync tools, or admin dashboards).

> ⚠️ Subtopics under `platform/configs` are **reserved**. Only specific keys and formats are permitted. Unrecognized or malformed messages must be ignored by consumers.

#### Device Configs

**Topic:** `platform/configs/units`



This topic is optionally used to attach **human-friendly metadata** to known units. The messages are published as a single JSON object keyed by `unit-id` and are typically consumed by UI or orchestration tools to enhance visibility.

Unlike unit state, this configuration is **not reported by the unit itself**, but **published externally** (e.g. by UI service or configuration synchronizer).

> ⚠️ Not all services support these configs. Only units managed by services that explicitly support config enrichment will reflect the additional data.

**Typical Use Cases:**

- Assigning custom display names (`title`)
- Indicating user-disabled devices (`disabled: true`)
- (Planned) Grouping or UI hints

**Payload Schema:**

```jsonc
{
  "<unit-id>": {
    "title": "string",       // Optional display name override
    "disabled": true          // Optional manual override to hide/disable the unit
  },
  ...
}
```

**Example:**

```json
{
  "light::ESP_bg_balcony:main": {
    "title": "Balcony: Light"
  },
  "light::ESP_bg_my_room:1": {
    "title": "Master Room: Light"
  },
  "light::ESP_bg_my_room:2": {
    "title": "Master Room: Light (Disabled)",
    "disabled": true
  },
  "light::ESP_bg_kids:main": {
    "title": "Kids Room: Light"
  },
  "light::ESP_bg_my_lamp:main": {
    "title": "Master Room: Table Light"
  },
  "light::wled_TV:TV": {
    "title": "Living Room: WLED"
  },
  "light::wled_Master_Table:Master_Table": {
    "title": "Master Room: WLED"
  },
  "light::ESP_bg_entance_door:main": {
    "title": "Hall: Light"
  }
}
```

> These configs are currently considered **optional** and **non-authoritative**. Environment variables remain the primary config source for most services.
