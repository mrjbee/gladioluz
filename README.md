# Purpose and Motivation of the Gladioluz Platform

Gladioluz was built with two main ideas in mind: first, to simplify access to devices and applications, and second, to create an architecture that is truly flexible and resilient.

## 1. Unified protocol for accessing devices and applications

Today, every device speaks its own language — some use HTTP, some WebSocket, others custom MQTT schemas or even obscure binary protocols. Automation in such conditions becomes fragile and hard to maintain.

Gladioluz introduces a unified and clearly defined way to interact with everything. Devices are represented as standardized objects with state, supported commands, and a consistent event model, built on pub/sub and streaming principles using the MQTT protocol.

This makes it possible to:

- Decouple automation from low-level device specifics
- Reuse logic and automation patterns
- Easily integrate external tools (Node-RED, Home Assistant, CLI, etc.)

## 2. Decentralized architecture

The second idea is architectural. Gladioluz is designed as a set of independent microservices (adapters), each focused on a specific task and communicating via well-defined interfaces.

This approach offers:

- Stability — if one component fails, the rest keep working
- Flexibility — components can be updated, replaced, or scaled independently
- Freedom — services can be written in any language
- Transparency — behavior is easy to debug and reason about

## 3. Deployment

Gladioluz is distributed as a set of lightweight Docker containers and is typically managed using Docker Compose or K3s. Each service is self-contained and designed to run independently, making the platform highly modular and easy to maintain.

Services have minimal memory footprint and are optimized for deployment on resource-constrained devices such as Raspberry Pi or similar ARM-based boards.

All components communicate over a shared network using a central MQTT broker. Most services are stateless and can be restarted, updated, or replaced without affecting the rest of the system.


## 4. Services and components

### `service-node-mcu-driver`
Provides integration with ESP-based devices (e.g., NodeMCU, ESP8266, ESP32) running the `gladiolus-iot-framework` firmware, which is lightweight non-blocking firmware that simplifies pin control and state publishing. Supports heartbeat and structured device mapping.  
**Dependency:** `gladiolus-iot-framework`  
**Internal Protocol:** MQTT

## `service-wled-driver`
Provides basic control over WLED-based LED strips: brightness adjustment and preset switching.  
**Dependency:** WLED firmware  
**Internal Protocol:** HTTP

### `service-hyperion-driver`
Controls a local Hyperion instance (ambient lighting system) by exposing it as a unified light device with brightness and preset support.  
**Dependency:** Hyperion (HTTP API enabled)  
**Internal Protocol:** HTTP

### `service-pc-driver`
Provides access to local PC state and controls via integration with a desktop Linux agent: lists GNOME applications, monitors screen state, and controls the media player.  
**Dependency:** `gladiolus-agent` running on the target machine  
**Internal Protocol:** MQTT

### `service-android-driver`
Connects to an HTTP-based Android agent to retrieve information about the currently running app and device state. Used for activity tracking and presence inference.  
**Dependency:** `gladiolus-android-service`  
**Internal Protocol:** HTTP

### `service-xbox-driver` & `xbox-app-sniffer`
Communicates with Xbox consoles using the SmartGlass protocol to detect power state and currently running application. The `xbox-app-sniffer` is a lightweight helper exposing the active app over HTTP for internal use.  
**Dependency:** Xbox console with SmartGlass support  
**Internal Protocol:** HTTP

### `service-ip-checker`
Periodically checks the availability of configured IP addresses or hostnames to determine whether known devices are online.  
**Dependency:** static IP or hostname mapping  
**Internal Protocol:** ICMP, TCP

### `service-device-watcher`
Utility service that listens for heartbeat signals from all known devices (published by other services) and emits system notifications about device startups, restarts, or timeouts. Also generates a daily report summarizing device status, including uptime, IP address, and last heartbeat.  
**Dependency:** —  
**Internal Protocol:** —

### `service-telegram`
Integrates with a Telegram bot and delivers messages to two predefined chats: a private admin channel for system reports and alerts, and a shared family group for reminders, door status updates, and general notifications.  
**Dependency:** Telegram Bot API  
**Internal Protocol:** HTTP


## 5. Orchestration with Node-RED

Node-RED is the recommended orchestration layer for Gladioluz deployments. Its key advantage is a visual web interface that allows building and modifying automation flows directly from a phone or tablet—without writing code or recompiling anything.

Node-RED connects to the MQTT broker and listens for Gladioluz device events. It can react to state changes, send commands, generate reminders, and visualize system status.

Typical flows include:

- Door opened → Send Telegram message
- Xbox app changed → Pause smart lighting
- Device offline → Trigger recovery or alert

Thanks to the unified protocol and consistent device structure, flows remain portable and decoupled from specific devices or integrations.
