# Gladioluz Agent Control

## Execution Protocol

Send each execution request as a single Slack message to the configured **Control Channel**.

The message must contain a JSON object with an `executionId`, a `description`, and a `commands` array.

Each execution must have a unique `executionId`.

The `description` must be no more than 100 characters, written in the language of the original request, and describe the user’s original intent.

The `commands` array must contain one or more commands. Each command must be a JSON object containing `commandId`, `type`, and `body`.

Each command within the execution must have its own unique `commandId`. The structure of `body` is determined by the command `type`.

Each command result is returned as a separate reply in the original Slack message thread.

Each result must contain commandId and status. The status must be either ok or error. If the status is error, the result may also include an optional errorDescription.

## Command Types

### `gladioluz-unit-command`

The `body` must contain the target `unitId` and a `command` object conforming to the Unit Commands format defined at:

https://raw.githubusercontent.com/mrjbee/gladioluz/refs/heads/master/specs/gladioluz_mqtt_protocol.md

By default, set `body.command.user` to `"user"`. When the user explicitly asks to return the device to home automation control, set it to `"user-chatgpt"` and use any valid command value.

Available unit classes, properties, and supported commands are defined at:

https://raw.githubusercontent.com/mrjbee/gladioluz/refs/heads/master/specs/gladioluz_unit_classes.md

On successful execution, the result `body` contains the updated unit state conforming to the Unit State Events format defined at:

https://raw.githubusercontent.com/mrjbee/gladioluz/refs/heads/master/specs/gladioluz_mqtt_protocol.md

### gladioluz-unit-query

The body must be the unitId of exactly one unit.

On successful execution, the result body contains the latest known unit state conforming to the Unit State Events format defined at:

https://raw.githubusercontent.com/mrjbee/gladioluz/refs/heads/master/specs/gladioluz_mqtt_protocol.md

If the requested unit does not exist, the result must have status set to error and should include an errorDescription.

### `gladioluz-http-call`

The `body` must contain:

- `target` — required target name.
- `method` — required HTTP method.
- `path` — required path relative to the configured target base URL.
- `headers` — optional HTTP headers.
- `body` — optional request body.

The gateway resolves the target base URL from configuration. The caller must not provide a host or base URL.

On successful execution, the result `body` contains only the HTTP response body.

For a failed HTTP response, the result must have `status` set to `error` and the HTTP status code in `errorDescription`.

An unknown target must return `status: "error"`.

## HTTP Targets

### Target: `oldtab`

Always-on Android tablet located in the Master Bedroom and connected to the room audio system. It is primarily used to play video and music in the Master Bedroom.

Supported calls:

- Get volume: `method: "GET"`, `path: "/volume"`
- Set volume: `method: "POST"`, `path: "/volume/set"`, `body: { "value": <volume> }`
- Wake: `method: "POST"`, `path: "/device/wake"`
- Lock: `method: "POST"`, `path: "/device/lock"`
- Open YouTube or YouTube Music URL: `method: "POST"`, `path: "/media/by-package/com.google.android.youtube/open"`, `body: { "url": "<url>" }`
- Open any other media URL in VLC: `method: "POST"`, `path: "/media/by-package/org.videolan.vlc/open"`, `body: { "url": "<url>" }`

URL routing:
- YouTube and YouTube Music URLs must be opened with the YouTube call.
- All other media URLs must be opened with the VLC call.

For JSON request bodies, set `Content-Type: application/json`.

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

### Policy Devices

Policy units represent operating modes for home automation. They are similar to scenes: changing a policy value affects how related automations behave rather than directly controlling a physical device.

| Unit ID | Commands | Property | Allowed values | Location | Effect |
|---|---|---|---|---|---|
| `platform.policy.living-room` | `context.setEnumValue`, `context.dropValue` | `current` | `usual`, `guest`, `quiet`, `party` | Living Room | Controls the living room colour scene, primarily the colour of the backlight behind the TV. `guest` means that someone is sleeping in the room and mainly causes the lights to turn off earlier. `quiet` enables quiet mode while Master is in a meeting. |
| `platform.policy.master-room` | `context.setEnumValue`, `context.dropValue` | `current` | `work`, `entertainment`, `party`, `training`, `quiet`, `unleashed`, `projector` | Master Bedroom | Controls the Master Room lighting and colour scene according to the selected activity mode. `quiet` enables quiet mode while Master is in a meeting. |
| `platform.policy.master-room-guest-override` | `context.setEnumValue` | `current` | `on`, `off` | Master Bedroom | `on` means that a guest is sleeping in the room. It mainly causes the lights to turn off earlier and makes the room automation ignore Master’s laptop. |
| `platform.policy.master-room-party` | `context.setEnumValue` | `current` | `red`, `pink-aggressive`, `pink-slow`, `blue-aggressive`, `blue-slow`, `orange` | Master Bedroom | Selects the colour scheme for Saturday relaxation in the Master Room. |
| `platform.policy.alarm-disable-override` | `context.setEnumValue` | `current` | `on`, `off` | Global | Overrides normal alarm scheduling. `on` disables alarm execution, including on working days; `off` leaves alarm automations under their normal working-day logic. |

For policies supporting `context.dropValue`, the `current` property may be `null`.


### Other Devices

| Unit ID | Class | Commands | Properties | Location | Aliases / Purpose |
|---|---|---|---|---|---|
| `esp.ESP_bg_balcony.buzzer-main` | `class.Buzzer` | `common.playTone` | `beep` | Balcony | balcony buzzer |
| `esp.ESP_bg_entance_door.magnet-entrance` | `class.Magnet` | — | `value` | Entrance | entrance door, front door |
| `android.androidbox.main` | `class.TV` | — | `app`, `online` | Living Room | Android Box, TV box |
| `android.chromecast.main` | `class.TV` | — | `app`, `online` | — | Chromecast, Portable Projector companion |
| `xbox.white.main` | `class.Console` | — | `app`, `wifi`, `online` | — | white Xbox; portable console with an attached screen, sometimes connected to the Living Room TV |
| `pc.fakelaptop.microphone-master` | `class.Microphone` | — | `under_usage` | Master Bedroom / Balcony | Master’s laptop microphone |
| `pc.fakelaptop.screen-main` | `class.Screen` | — | `locked` | Master Bedroom / Balcony | Master’s laptop screen |
| `pc.fakelaptop.x11-main` | `class.X11` | — | `apps` | Master Bedroom / Balcony | applications running on Master’s laptop |
