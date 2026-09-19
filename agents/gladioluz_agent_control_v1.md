# Gladioluz Agent Control

## Execution Protocol

Send each execution request as a single Slack message to the configured **Control Channel**.

The message must contain a JSON object with an `executionId`, a `description`, and a `commands` array.

Each execution must have a unique `executionId`.

The `description` must be no more than 100 characters, written in the language of the original request, and describe the user’s original intent.

The `commands` array must contain one or more commands. Each command must be a JSON object containing `commandId`, `type`, and `body`.

Each command within the execution must have its own unique `commandId`. The structure of `body` is determined by the command `type`.

Each command result is returned as a separate reply in the original Slack message thread.

Each result reply must contain a JSON object with `commandId`, `status`, and `body`. For a failed command, `body` must use the common error format. Otherwise, the structure of `body` is determined by the command `type`.

## Command Types

### `gladioluz-unit-command`

The `body` must contain the target `unitId` and a `command` object conforming to the Unit Commands format defined at:

https://raw.githubusercontent.com/mrjbee/gladioluz/refs/heads/master/specs/gladioluz_mqtt_protocol.md

Always set `body.command.user` to the constant string `"user"`.

Available unit classes, properties, and supported commands are defined at:

https://raw.githubusercontent.com/mrjbee/gladioluz/refs/heads/master/specs/gladioluz_unit_classes.md

On successful execution, the result `body` contains the updated unit state conforming to the Unit State Events format defined at:

https://raw.githubusercontent.com/mrjbee/gladioluz/refs/heads/master/specs/gladioluz_mqtt_protocol.md

## Device Inventory

### Beacon Devices

IP Beacon units use the `online` property to indicate whether a device is currently available on the network.

Beacon devices do not support commands.

Phone beacons may be used as presence indicators to determine who is currently at home.

| unitId | properties | location | aliases |
|---|---|---|---|
| `ip.kiev_flat.probe` | `online` | Kyiv | network at the Kyiv apartment |
| `ip.minik_pc.probe` | `online` | Home network | computer |
| `ip.motoPhone.probe` | `online` | Home network | Radmila’s phone, Rada’s phone |
| `ip.my_laptop.probe` | `online` | Home network | Boss’s laptop, Master’s laptop |
| `ip.pixel6A.probe` | `online` | Home network | Boss’s phone, Master’s phone |
| `ip.pocoX6.probe` | `online` | Home network | wife’s phone, Kristina’s phone |
| `ip.projector.probe` | `online` | Home network | projector |
| `ip.redmi10C.probe` | `online` | Home network | Yaroslava’s phone |

### Light Devices

For ESP-based light units, only brightness control is used. Ignore the `effect` property and the `common.setEffect` command even when advertised by the unit.

`Intensity` describes the relative lighting strength: `high`, `medium`, or `light`.

| Unit ID | Commands | Properties | Location | Intensity | Aliases |
|---|---|---|---|---|---|
| `esp.ESP_bg_balcony.light-main` | `common.setBrightness` | `brightness` | Balcony | `medium` | balcony light |
| `esp.ESP_bg_entance_door.light-main` | `common.setBrightness` | `brightness` | Hall / Entrance | `medium` | hall light, entrance light |
| `esp.ESP_bg_kids.light-main` | `common.setBrightness` | `brightness` | Kids Room | `light` | kids’ night light, children’s night light |
| `esp.ESP_bg_my_lamp.light-main` | `common.setBrightness` | `brightness` | Master Bedroom | `high` | Boss’s desk light, Master’s desk light |
| `esp.ESP_bg_my_room.light-1` | `common.setBrightness` | `brightness` | Master Bedroom | `high` | bedside night light, Master Bedroom night light |
| `wled.192_168_0_21.main` | `common.setBrightness`, `common.setPreset` | `brightness`, `preset` | Living Room | `high` | TV WLED, TV backlight |
| `wled.192_168_0_22.main` | `common.setBrightness`, `common.setPreset` | `brightness`, `preset` | Master Bedroom | `high` | Boss’s desk WLED, Master’s desk WLED |
| `wled.192_168_0_23.main` | `common.setBrightness`, `common.setPreset` | `brightness`, `preset` | Living Room | `medium` | computer backlight, PC backlight |
| `zigbee.gl_light_GLEDOPTO_1` | `common.setBrightness` | `brightness` | Master Bedroom | `medium` | party light, pink party light |
| `zigbee.gl_light_GLEDOPTO_2` | `common.setBrightness` | `brightness` | Living Room / Balcony | `light` | window light, balcony window light |
| `zigbee.gl_socket_MyFirstPlug` | `common.setPower` | `power` | Kids Room | `medium` | kids’ room light, children’s room light |

#### WLED Presets

| Unit ID | Presets |
|---|---|
| `wled.192_168_0_21.main` | `1` — Default; `2` — Xbox; `3` — OnMeeting; `4` — Party |
| `wled.192_168_0_22.main` | `1` — Solid; `2` — Party: Red; `3` — Party: pink-aggressive; `4` — Party: pink-slow; `5` — Party: blue-aggressive; `6` — Party: blue-slow; `7` — Training; `8` — Quiet; `9` — Party: Orange; `10` — Entertainment; `11` — Work |
| `wled.192_168_0_23.main` | `1` — Solid; `2` — Work; `3` — Party |