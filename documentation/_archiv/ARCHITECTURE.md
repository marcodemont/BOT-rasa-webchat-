# AURUM v0.11 | Architektur

## Zielbild

- Eine App-Codebasis (`app/AURUM.html`) bleibt die zentrale Quelle.
- BLE wird über eine dedizierte Schicht (`app/ble-ring.js`) integriert.
- Transport ist austauschbar:
  - Web Bluetooth (Desktop/Android)
  - Capacitor BLE Plugin (iOS App-Container)

## Schichten

### 1) UI- und App-Logik (`app/AURUM.html`)

- Auth, Timeline, Notizen, Marker-Detail, Aufnahme, Settings.
- Reagiert auf Ring-Events via `handleRingEvent(...)`.
- Schreibt Marker immer in Supabase (`markers`), nie nur lokal.
- Notiz-STT:
  - MediaRecorder im Browser
  - Upload als Base64 an lokales Backend (`/api/transcribe`)
  - Transkript wird in das Notizfeld eingefügt

### 2) BLE-Adapter (`app/ble-ring.js`)

- `createAurumRingClient(...)` liefert einen Ring-Client mit:
  - `connect(config)`
  - `disconnect()`
  - `sendCommand(command)`
- Eingehende Notifications werden normalisiert auf:
  - `anchor`
  - `audio_start`
  - `audio_stop`
  - `compression`
  - `compression_cancel`

### 3) Datenebene (Supabase)

- Marker und Notizen bleiben gleich.
- Audio-Dateien in Storage-Bucket `audio-markers`.
- Ring-Events werden als Marker persistiert:
  - `anchor` -> `marker_type='anchor'`
  - `compression` -> `marker_type='compression'`
  - `audio_stop` -> `marker_type='audio'` (vorläufig ohne Datei)
- Marker-Herkunft wird explizit gespeichert:
  - `source='app'` für App-seitige Erfassung/Planung
  - `source='ring'` für Ring-Events
- Nutzerbezogene App-Settings liegen in `user_settings`:
  - Kompression/Wiederholung
  - Ring-UUIDs und Prefix
  - optionale Ring-Kopplungs-ID

## BLE-Protokoll (v0.09)

Unterstützte Eingangsformate:

- Byte-Codes:
  - `0x01` Anchor
  - `0x02` Audio Start
  - `0x03` Audio Stop
  - `0x04` Compression
  - `0x05` Compression Cancel
- Text-Tokens:
  - `ANCHOR`, `AUDIO_START`, `AUDIO_STOP`, `COMPRESSION`, `COMP_ABORT`
- JSON:
  - `{"type":"anchor"}` (oder `event`)

### 4) Lokales STT-Backend (`server.js`)

- Lädt `.env` lokal.
- Statische Auslieferung von `app/`.
- API:
  - `GET /api/health`
  - `POST /api/transcribe`
- OpenAI-Key bleibt serverseitig, nicht im Browser.

Ausgehende Kommandos App -> Ring:

- `COMPRESS_START`
- `COMP_ABORT`

## iOS / Capacitor

- Browser-Safari kann kein Web Bluetooth.
- In iOS läuft BLE über den Capacitor-Container.
- Die App nutzt dafür denselben BLE-Client und wechselt automatisch
  auf den Capacitor-Adapter, sobald das Plugin verfügbar ist.
