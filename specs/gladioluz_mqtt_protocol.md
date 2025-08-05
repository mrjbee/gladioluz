# Gladioluz Platform MQTT Protocol (v0.1 BETA)

This protocol defines the standardized message structure and topic hierarchy for MQTT-based communication between components of the Gladioluz platform: services, adapters, agents, and physical devices. Its goal is to **unify automation logic**, **decouple low-level integrations**, and support **flexible orchestration** across a distributed environment.

---

## Protocol Domains

The Gladioluz MQTT protocol is organized into distinct domains, each responsible for a specific category of messages exchanged across the platform.

All domains share a common topic prefix — the **Platform Root Topic**, which is configurable. By default, this root topic is set to `platform`.

---

### Devices

`platform/devices`

This domain represents logical devices available to the automation layer — lights, sensors, media players, switches, and other components.

#### Device State Events

Each device publishes its current state to the topic:

```
platform/devices/<device-id>
```

Each device is identified by a unique `device-id`, following the convention:

```
<short-type>::<physical-device-id>:<alias>
```

**Where:**

- `short-type` — a simplified form of the `type` field (lowercase, dots removed).
- `physical-device-id` — the physical source ID (matches `physical_device`).
- `alias` — local component name inside the physical device (matches `alias`).

**Examples:**

- `light::ESP_bg_balcony:main`
- `sensor::ESP_my_room:1`
- `ip::chrome_tv:main`

> ⚠️ `device-id` must be unique and stable. It is referenced in configuration, commands, and automation logic.

Each message in `platform/devices/<device-id>` is a full snapshot of the device's current state. It includes:

1. **General information** — metadata about the device and its origin
2. **Properties** — structured observable/controllable values
3. **Supported commands** — list of operations this device accepts

**Payload Schema:**

```jsonc
{
  "physical_device": "string",
  "alias": "string",
  "driver": "string",
  "title": "string",
  "type": "string",
  "version": 1,
  "powerChangedAt": "string",
  "supported_commands": ["string", "..."],
  "properties": {
    "<property-name>": {
      "value": "any",
      "updatedAt": "ISO timestamp",
      "updatedBy": "system | user",
      "changedAt": "ISO timestamp",
      "changed_from_value": "any"
    }
  },
  "disabled": true,
  "ip": "string",
  "enabled": true
}
```

**Examples:**

```json
{
  "physical_device": "ESP_bg_entance_door",
  "driver": "nodemcu-java-driver",
  "powerChangedAt": "2025-07-17T19:42:50.287958",
  "alias": "main",
  "supported_commands": [
    "common.setBrightness",
    "common.setEffect"
  ],
  "title": "Hall: Light",
  "type": "myhome.firmware.Light",
  "version": 1,
  "properties": {
    "brightness": {
      "updatedBy": "system",
      "changedAt": "2025-08-05T19:09:19.58574",
      "value": 20,
      "changed_from_value": 100,
      "updatedAt": "2025-08-05T19:22:19.60472"
    },
    "effect": {
      "updatedBy": "system",
      "changedAt": "2025-08-05T11:01:17.735519",
      "value": false,
      "changed_from_value": true,
      "updatedAt": "2025-08-05T19:20:58.742227"
    }
  },
  "enabled": true
}
```

```json
{
  "physical_device": "chrome_tv",
  "driver": "ip-checker",
  "powerChangedAt": "2025-06-26T00:31:26.59772",
  "alias": "main",
  "supported_commands": [],
  "type": "myhome.firmware.IP",
  "version": 1,
  "properties": {},
  "enabled": false
}
```

#### Device Commands

To execute an action on a device, a command must be published to the following topic:

```
platform/devices/<device-id>/commands
```

The payload must follow this schema:

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
  "alias": "common.playTone",
  "value": {
    "tone": 200,
    "delay": 500
  },
  "user": "system"
}
```

> ⚠️ If the command is not supported or malformed, the device service will silently ignore it. No state update or error event will be published.

Successful execution typically results in a `platform/devices/<device-id>` update with the new property state.

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

**Topic:** `platform/configs/devices`



This topic is optionally used to attach **human-friendly metadata** to known devices. The messages are published as a single JSON object keyed by `device-id` and are typically consumed by UI or orchestration tools to enhance visibility.

Unlike device state, this configuration is **not reported by the device itself**, but **published externally** (e.g. by UI service or configuration synchronizer).

> ⚠️ Not all services support these configs. Only devices managed by services that explicitly support config enrichment will reflect the additional data.

**Typical Use Cases:**

- Assigning custom display names (`title`)
- Indicating user-disabled devices (`disabled: true`)
- (Planned) Grouping or UI hints

**Payload Schema:**

```jsonc
{
  "<device-id>": {
    "title": "string",       // Optional display name override
    "disabled": true          // Optional manual override to hide/disable the device
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
