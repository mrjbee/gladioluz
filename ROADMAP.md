# Gladioluz Design Notes

This document captures raw ideas, architecture drafts, naming experiments, and decision records related to the ongoing evolution of the Gladioluz platform.
It serves as a flexible space for brainstorming and iterating before final specs are formalized.

## General TODOs
- Rework service heartbeats: drop physical device mimic

## Events

### Phase 1 — Base Envelope

Introduce a new subdomain:

```
platform/streams/events/<scope>
```

Where `<scope>` can be:

* `thing` — physical events (buttons, NFC, gamepads)
* `virtual` — logical events (webhooks, timers, cooldown)
* `context` — abstraction layer (Node-RED transformations, scenario logic)

**Payload (envelope):**

```jsonc
{
  "originId": "string",   // emitter, same as units (<namespace>.<name>)
  "localName": "string",  // local channel (button id, tag id, trigger name)
  "class": "event.*",     // event family (event.Button, event.Nfc, event.Virtual …)
  "action": "string",     // specific action (press, release, click, double-click, tap …)
  "firedAt": "ISO-UTC"    // timestamp when the event happened
  // "details": { ... }    // reserved (Phase 2)
  // "signature": "..."    // reserved (Phase 2)
}
```

**Examples**

Button:

```json
{
  "originId": "esp.kitchen1",
  "localName": "btn1",
  "class": "event.Button",
  "action": "double-click",
  "firedAt": "2025-08-25T22:40:00.123Z"
}
```

NFC:

```json
{
  "originId": "service.nfc",
  "localName": "tag-04A2B1C3D4E5",
  "class": "event.Nfc",
  "action": "tap",
  "firedAt": "2025-08-25T22:55:00.321Z"
}
```

---

### Phase 2 — Extensions (TODO)

* **`details`** — optional container for class-specific extras.
  Examples:

  * `details.reader: "esp.hall1.reader1"` (which reader scanned the tag)
  * `details.rssi: -62` (signal strength)
  * `details.windowMs: 350` (double-click detection window for buttons)

* **`signature`** — optional unique identifier for deduplication/idempotency.
  Suggested format: `originId-localName-timestamp-rand16`.
  To be used only if real-world duplicates appear (e.g. retries).
