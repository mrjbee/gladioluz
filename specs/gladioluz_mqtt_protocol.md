# Gladioluz Platform MQTT Protocol (v0.1 BETA)

This protocol defines the standardized message structure and topic hierarchy for MQTT-based communication between components of the Gladioluz platform: services, adapters, agents, and physical devices. Its goal is to **unify automation logic**, **decouple low-level integrations**, and support **flexible orchestration** across a distributed environment.

---

## Protocol Domains

The Gladioluz MQTT protocol is organized into distinct domains, each responsible for a specific category of messages exchanged across the platform.

All domains share a common topic prefix — the **Platform Root Topic**, which is configurable. By default, this root topic is set to `platform`.

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

Schema:

```jsonc
{
  // Unique ID of the physical source (ESP, agent, etc.)
  "physical_device": "string",

  // Component alias inside the physical device (e.g. channel, slot)
  "alias": "string",

  // Driver/service identifier responsible for managing this device
  "driver": "string",

  // Optional display name shown in UI
  "title": "string",

  // Device type — predefined set of supported platform device types
  "type": "string",

  // Optional schema version of this structure
  "version": 1,

  // Timestamp (ISO 8601) when power-related state was last changed
  "powerChangedAt": "string",

  // Optional list of commands supported by this device (may depend on type; may be empty)
  "supported_commands": ["string", "..."],

  // Optional structured state properties
  "properties": {
    "<property-name>": {
      "value": "any",
      "updatedAt": "ISO timestamp",
      "updatedBy": "system | user",
      "changedAt": "ISO timestamp",
      "changed_from_value": "any"
    }
  },

  // Optional, indicates device is hidden or ignored by user (TODO: rename 'disabled' to 'hidden' or 'ignored' in future)
  "disabled": true,

  // Optional last known IP address (reported by device or network monitor)
  "ip": "string",

  // Usually indicates whether the physical device is currently active and available
  "enabled": true
}
```

Examples:

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

Examples:

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

**Command Fields**

- `alias`: command name, must match one of the entries in `supported_commands`
- `value`: command payload (could be a primitive or object depending on command type)
- `user`: optional source tag, typically "user" or "system"

> ⚠️ If the command is not supported or malformed, the device service will silently ignore it. No state update or error event will be published.

Successful execution typically results in a `platform/devices/<device-id>` update with the new property state.
