# AURUM

Digitales Gegenstueck zum Armreif. Ein zeitbasiertes
Selbstwahrnehmungssystem, das Moment (Armreif) und Reflexion (App)
klar trennt.

## Paketstruktur

```
.AURUM/
├── .AURUM.bat                  # startet die App lokal (Windows)
├── app/
│   └── AURUM.html              # die komplette App in einer Datei (PWA)
├── icons/
│   ├── icon.svg                # Icon-Quelle
│   ├── icon-180.png            # Apple Touch
│   ├── icon-192.png            # Android
│   ├── icon-512.png            # Android (gross)
│   ├── icon-512-maskable.png   # Android (maskable)
│   └── README.md               # wie die PNGs aus dem SVG erzeugt werden
├── manifest.webmanifest        # PWA-Manifest
├── sw.js                       # Service Worker (App-Shell-Cache)
├── supabase/
│   ├── config.md               # Projekt-URLs, Keys, Auth-Einstellungen
│   ├── schema.sql              # aktueller Endzustand der DB
│   └── migrations/
│       ├── 01_create_markers_table.sql
│       ├── 02_markers_add_auth.sql
│       ├── 03_markers_types_and_notes.sql
│       └── 04_v008_audio_geo_settings.sql
├── dokumentation/              # Projekt-Doku zum aktuellen Stand
│   ├── CHANGELOG.md            # Versionsverlauf
│   └── CONCEPT.md              # Begriffssystem und Kernlogik
├── dokumente/                  # Diplomarbeit-PDFs, Präsentationen
├── informationen/              # Ideen, Skizzen, Prototypen, Screenshots
├── _archiv/                    # alte Versionen als .zip
└── README.md                   # diese Datei
```

## Schnellstart

### App lokal oeffnen (Windows)

Doppelklick auf `.AURUM.bat` im Projekt-Root. Das Skript startet einen
lokalen Webserver auf Port 8000 und oeffnet die App im Browser.

### App lokal oeffnen (manuell)

`app/AURUM.html` in einem Browser oeffnen. Mikrofon und Geolocation
brauchen einen sicheren Kontext (HTTPS oder `localhost`); fuer schnelle
Tests reicht ein lokaler Server, z. B.:

```bash
python -m http.server 8000
# dann http://localhost:8000/app/AURUM.html aufrufen
```

Beim Start verbindet sich die App automatisch mit dem Supabase-Projekt
`Diplomarbeit`. Beim ersten Aufruf erscheint der Login-Screen.

- **Registrieren**, Bestaetigungs-Mail abwarten und bestaetigen.
- **Einloggen**.
- Session wird lokal gespeichert (`localStorage` im Browser,
  `window.storage` in Claude-Artifacts), der Login bleibt erhalten.

### Auf dem iPhone installieren (PWA)

1. App via HTTPS hosten (z. B. Vercel, Netlify, Cloudflare Pages,
   alles kostenlos). Lokal funktioniert nur via `localhost`.
2. Im iPhone-Safari die URL oeffnen, die zu `app/AURUM.html` fuehrt.
3. Teilen-Knopf → **Zum Home-Bildschirm**.
4. Beim Start fragt iOS nach Mikrofon- und Standort-Berechtigung,
   sobald die App das erste Mal eines davon braucht.

### Datenbank neu aufbauen

1. Neues Supabase-Projekt anlegen.
2. URL und Publishable Key in `app/AURUM.html` am Anfang des `<script>`
   austauschen (`SUPABASE_URL`, `SUPABASE_KEY`).
3. Migrationen der Reihe nach im SQL Editor ausfuehren, oder als
   Schnellweg `supabase/schema.sql` komplett einspielen.
4. Im Storage-Bereich des Dashboards einen Bucket `audio-markers`
   anlegen (Public: false). Die zugehoerigen RLS-Policies sind in der
   Migration 04 enthalten.

### Service Worker im Dev neu laden

Wenn du `sw.js` aenderst, im Browser unter Entwickler-Tools
*Application → Service Workers → Unregister* einmal abmelden, dann
Seite neu laden. Sonst zeigt Safari/Chrome die alte Version aus dem
Cache.

## Architektur in einem Satz

Die App speichert (AURUM), die KI verarbeitet im Hintergrund (AURA),
die Entscheidungen bleiben beim Nutzer.

Details zum Begriffssystem (Anker, Audiomarker, Kompression, geplanter
Marker, Notiz) stehen in `dokumentation/CONCEPT.md`.

## Was v0.08 jetzt kann

- Login mit eigenem Konto, Daten pro Nutzer geschuetzt (Row Level
  Security)
- Vier Marker-Typen manuell setzen oder, beim Anker, mit automatischer
  Ortsangabe
- **Audiomarker** mit echter Aufnahme im Browser, Wiedergabe vor dem
  Speichern, Upload in Supabase Storage
- **Marker-Detail-Screen** mit typ-spezifischer Ansicht, Audio-Player,
  Loeschen
- **Notizen** als zweite Ebene, mit Tags, optional verknuepft mit
  einem Marker
- **Einstellungen** fuer Druckaufbau-Dauer, Wiederholung, Geolocation
- **Installation als PWA** auf iOS und Android, mit Offline-App-Shell

## Was offen bleibt (v0.09 und spaeter)

- AURA-Edge-Functions fuer Whisper-Transkription, Moment-Zusammen-
  fassung und Auto-Tags. Die App-Felder (`transcript`, `summary`,
  `tags`) sind dafuer schon vorbereitet.
- Bluetooth-Anbindung des Armreifs. Erfordert Capacitor-Wrap fuer iOS,
  da Web Bluetooth in Safari nicht unterstuetzt wird. Das Feld
  `markers.source` und `user_settings.ring_paired_id` sind dafuer
  schon vorbereitet.
- Reverse-Geocoding (Koordinaten → "Cafe in Zuerich"), wahrscheinlich
  als Edge Function gegen Nominatim oder Apple MapKit.
- Wochen- und Monatsuebersicht der Marker-Dichte.
