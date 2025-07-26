# Gladioluz Plugin API Specification

**Version:** 0.1\
**Status:** Draft

This document defines the minimal required API interface for Gladioluz-compatible plugins. Plugins are standalone services that expose an HTTP API to support command execution and event streaming via long polling.

---

## Startup Parameters

Plugins **must** accept the following runtime argument:

- `--port=<number>`:\
  The HTTP port on which the plugin will expose its API.

If the parameter is missing, the plugin must terminate or throw a descriptive error.

---

## REST API

### `POST /command`

Execute a named command supported by the plugin.

#### Request Body

```json
{
  "command": "<command-name>",
  "args": { ... } // optional, plugin-defined
}
```

- `command` (string): The command to execute.
- `args` (object): Optional dictionary of arguments specific to the command.

#### Response

```json
{
  "result": "ok",
  "data": { ... } // optional, plugin-defined result
}
```

#### On Error

Errors must follow the [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) Problem Details for HTTP APIs specification.

```json
{
  "type": "https://gladioluz.io/problems/unknown-command",
  "title": "Unknown Command",
  "status": 400,
  "detail": "The command 'foobar' is not recognized.",
  "instance": "/command"
}
```

---

### `GET /events`

Retrieve past or future events emitted by the plugin. This endpoint supports long-polling.

#### Query Parameters

| Parameter | Type    | Required | Description                                                           |
| --------- | ------- | -------- | --------------------------------------------------------------------- |
| `since`   | number  | no       | Timestamp (in ms). Only events after this timestamp will be returned. |
| `wait`    | boolean | no       | If `true`, waits (long-polls) for the next matching event(s).         |

#### Response

```json
[
  {
    "id": 1722019244001,
    "topic": "system",
    "payload": { ... }
  },
  ...
]
```

- If `wait=true` and no event is available, the request should block (default timeout: 30 seconds) and return an empty array if no event arrives in time.

---

## Event Format

Each event returned by `/events` must conform to the following structure:

```json
{
  "id": <number>,         // unique ID, typically timestamp-based
  "topic": "<string>",    // category or scope of the event
  "payload": { ... }      // plugin-defined event data
}
```

---

## Notes

- Multiple plugins may run concurrently; uniqueness of `port` is enforced externally (e.g. by the agent).
- The plugin must retain a recent history of events in memory (implementation-defined), available to `/events?since=...`.

