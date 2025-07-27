# Running a Gladioluz Plugin in Development Mode with systemd

This guide explains how to run a Gladioluz plugin as a user-level `systemd` service for development purposes.

---

## 1. Clone the Gladioluz Repository

Clone the main Gladioluz repository into the standard location:

```bash
git clone https://your.git.repo/gladioluz.git /opt/local/gladioluz
```

This will create the base plugin directory structure expected by systemd.

---

## 2. Create systemd Template Unit

Create the following file:

```
~/.config/systemd/user/gladioluz-plugin@.service
```

With the following content:

```ini
[Unit]
Description=Gladioluz Plugin %i
After=network.target

[Service]
WorkingDirectory=/opt/local/gladioluz/plugins/%i
ExecStartPre=/usr/bin/npm install --no-audit --no-fund
ExecStart=/usr/bin/npm run stage
Restart=on-failure
EnvironmentFile=/opt/local/gladioluz/plugins/%i/.env

[Install]
WantedBy=default.target
```

---

## 3. Create Plugin .env File

Each plugin must contain an `.env` file in its root directory with the following content:

```
PLUGIN_PORT=5551
```

Example path:
```
/opt/local/gladioluz/plugins/gladioluz-youtube-music-kiosk/.env
```

---

## 4. Service Management Commands

### Reload systemd user services:
```bash
systemctl --user daemon-reexec
systemctl --user daemon-reload
```

### Start the plugin:
```bash
systemctl --user start gladioluz-plugin@gladioluz-youtube-music-kiosk.service
```

### Enable the plugin at login:
```bash
systemctl --user enable gladioluz-plugin@gladioluz-youtube-music-kiosk.service
```

### View plugin logs:
```bash
journalctl --user -u gladioluz-plugin@gladioluz-youtube-music-kiosk.service -f
```

