# AURUM v0.1

* Version: v0.1
* Datum: 2026-04-20
* Status: aktive Fassung. Neustart nach Track-Bereinigung.
* Scope: konsolidierter Ist-Stand der Codebasis. Versionsmodell startet mit v0.1 neu, frueherere Monolith- und Parallel-Track-Versionen (v0.01 bis v0.09) sind im `CHANGELOG.md` zusammengefuehrt.

---

## Inhaltsverzeichnis

1. Was v0.1 ist
2. Track-Struktur nach Neustart
3. Verzeichnisstruktur
4. Starter und Tunnel
5. Stack und Abhaengigkeiten
6. Supabase-Verbindung
7. Was in v0.1 funktioniert
8. Was offen bleibt
9. Bekannte Bugs und Beobachtungen
10. Konzept-Bezug
11. Roadmap
12. Kritische Regeln (Kurzform)
13. Kurzfassung

---

## 1. Was v0.1 ist

v0.1 ist der Neustart der AURUM-Codebasis auf React + Vite + TypeScript, nach dem Zusammenlegen frueher paralleler Tracks (Monolith-HTML, ARGENTUM-React, CUPRUM-React).

Stand 2026-04-20:

* **AURUM** ist die Live-Version. Codebase: ehemaliges CUPRUM (saubere React/TS-Neufassung), jetzt unter `AURUM/`.
* **CUPRUM** ist die Werkstatt, parallel weiterhin aktiv.
* **ARGENTUM** (ehemals eigener Track) ist aufgeloest und in CUPRUM integriert.
* Der alte Monolith-HTML-Stand (AURUM v0.01 bis v0.06, Vanilla JS) wurde geloescht. Historisches ist im `CHANGELOG.md` konsolidiert.

Das Versionsmodell faengt mit v0.1 neu an. Aeltere Versionsnummern werden nicht weitergezaehlt.

---

## 2. Track-Struktur nach Neustart

| Name | Rolle | Ordner | Stack | Port | Domain |
|---|---|---|---|---|---|
| **AURUM** | Live | `AURUM/` | React 18 + Vite 6 + TS + Tailwind 4 | 8006 | `aurum.marcodemont.ch` |
| **CUPRUM** | Werkstatt | `CUPRUM/` | React 18 + Vite 6 + TS + Tailwind 4 | 8008 | `cuprum.marcodemont.ch` |

Beide Tracks teilen:

* dasselbe Supabase-Projekt (`jitkxxpuzmopcrfvzzlz.supabase.co`)
* dieselben User, Markers, Notes, Settings
* denselben Storage-Bucket `audio-markers`

Schema-Aenderungen sind shared infrastructure. Migrationen muessen backward-kompatibel sein, damit die jeweils andere Codebase nicht bricht.

---

## 3. Verzeichnisstruktur

```
Desktop\.AURUM - claude\            (Root)
|
+-- AURUM\                          Live (ex-CUPRUM-Inhalt)
|   +-- src\
|   |   +-- main.tsx                React-Entry
|   |   +-- App.tsx
|   |   +-- lib\                    Supabase-Client, Config
|   |   +-- modules\aurum\          Timeline, NotesView, SettingsView, MarkerDetail, ...
|   |   +-- state\
|   |   +-- components\
|   +-- public\                     icon.svg, manifest.webmanifest, sw.js
|   +-- index.html
|   +-- package.json
|   +-- vite.config.ts              Port 8006, allowedHosts fuer .marcodemont.ch
|   +-- README.md
|   +-- supabase\schema.sql
+-- AURUM.bat                       Starter fuer AURUM (Port 8006, Tunnel)
|
+-- CUPRUM\                         Werkstatt
|   +-- src\ ...                    (analog zu AURUM\src\)
|   +-- package.json
|   +-- vite.config.ts              Port 8008
+-- CUPRUM.bat                      Starter fuer CUPRUM (Port 8008, Tunnel)
|
+-- documentation\                  Diese Datei liegt hier
|   +-- CONCEPTv0.1.md              Aktives Konzept
|   +-- AURUMv0.1.md                Diese Datei
|   +-- CHANGELOG.md                Versionsverlauf
+-- info.txt                        Diplomarbeits-Notizen, Optimierungs-Ideen
+-- README.md                       Projekt-Einstieg
+-- Verbesserung AURUM - 20.04.2026..pdf
```

---

## 4. Starter und Tunnel

### 4.1 AURUM.bat

Doppelklick startet:

1. Pruefung `AURUM\package.json` vorhanden.
2. Pruefung `node` auf PATH.
3. `node_modules` vorhanden? Sonst `npm install`.
4. Port 8006 frei? Sonst Abbruch mit PID-Hinweis.
5. `cloudflared` vorhanden und `%USERPROFILE%\.cloudflared\aurum.yml` vorhanden? Dann Tunnel starten.
6. Browser oeffnen auf `http://localhost:8006/`.
7. `npm run dev -- --port 8006 --host --strictPort` im Vordergrund.

Strg+C im Server-Fenster beendet den Dev-Server. Das Tunnel-Fenster muss separat geschlossen werden.

### 4.2 Cloudflare-Tunnel

Config: `%USERPROFILE%\.cloudflared\aurum.yml`

```yaml
tunnel: aurum
credentials-file: C:\Users\marcodemont\.cloudflared\<UUID>.json
ingress:
  - hostname: aurum.marcodemont.ch
    service: http://localhost:8006
  - service: http_status:404
```

Voraussetzung Vite-seitig: `aurum.marcodemont.ch` muss in `AURUM/vite.config.ts` unter `server.allowedHosts` stehen. Aktuell via Wildcard `.marcodemont.ch` abgedeckt.

### 4.3 Lokale URLs

* `http://localhost:8006/` | AURUM am Laptop
* `http://<ipv4>:8006/` | AURUM im WLAN (HTTP, daher kein Mikro und kein Geo)
* `https://aurum.marcodemont.ch/` | AURUM via Tunnel (HTTPS)

CUPRUM analog auf 8008 bzw. `cuprum.marcodemont.ch`.

---

## 5. Stack und Abhaengigkeiten

Aus `AURUM/package.json`:

* **React 18** (`react`, `react-dom`)
* **Vite 6** (`vite`, `@vitejs/plugin-react`)
* **TypeScript 5** (ueber Vite)
* **Tailwind 4** (`tailwindcss`, `@tailwindcss/vite`)
* **Radix UI** Primitives (Dialog, Label, ScrollArea, Select, Slider, Slot, Switch, Tabs, Tooltip)
* **Lucide** fuer Icons (`lucide-react`)
* **Supabase** (`@supabase/supabase-js`)
* **Utilities**: `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`

Bewusst **nicht** im Stack: Figma-Ballast, Motion/Framer, schwere UI-Bibliotheken, Routing-Framework, Form-Library. Screen-Wechsel via Context-State.

Package-Name: `"aurum"` (seit Rename am 2026-04-20).

---

## 6. Supabase-Verbindung

* Projekt: `Diplomarbeit`
* Region: eu-central-2 (Zuerich)
* Project-Ref: `jitkxxpuzmopcrfvzzlz`
* Base-URL: `https://jitkxxpuzmopcrfvzzlz.supabase.co`
* Publishable Key: in `AURUM/src/lib/config.ts` hardcodiert (RLS-geschuetzt, darf im Client liegen)

Tabellen (Stand v0.1):

* `markers` | `id`, `user_id`, `marker_date`, `start_time`, `marker_type`, `latitude`, `longitude`, `location_label`, `audio_path`, `transcript`, `summary`, `tags`, `source`, `title`, `is_done`, `color`, `repeat_type`, `sub`, `archived_at`, **`compression_seconds`** (siehe Abschnitt 9)
* `notes` | freie Notizen, optional mit Marker verknuepft, plus `archived_at`
* `user_settings` | `compression_seconds`, `repeat_interval_minutes`, `geo_enabled`, Ring-UUIDs, `ring_paired_id`
* `auth.users` | Supabase-Standard

Storage-Bucket: `audio-markers` (Public: false, Pfad `<user_id>/<marker_id>.<ext>`).

Partial-Indizes (Migration `add_archived_at_to_markers_and_notes`, deployed 2026-04-20):

```sql
create index if not exists markers_archived_idx
  on public.markers (archived_at)
  where archived_at is not null;

create index if not exists notes_archived_idx
  on public.notes (archived_at)
  where archived_at is not null;
```

---

## 7. Was in v0.1 funktioniert

* **Auth** | Login und Registrierung ueber Supabase Auth, Session in `localStorage`, Force-Auth-Screen-Flag fuer Demo-Mode-Logout
* **Timeline** | Tag- und Wochenansicht (5 und 7 Tage, Long-Press auf Wochen-Toggle), Wochen-Dots in echter Marker-Farbe, AURUM-treues Layout (Anker = Punkt, andere = Squircle mit Card)
* **Marker erstellen** | Anker, Audiomarker (Aufnahme + Upload), Termin geplant, Ereignis geplant, Kompression
* **Marker-Detail** | Modal mit typ-spezifischer Ansicht, Audio-Player fuer signierte URLs, Tag-Editor, Done-Toggle fuer geplante Marker live in Supabase
* **Notizen** | Liste, Editor, Tags, optional mit Marker verknuepft
* **Settings** | Druckaufbau (10 bis 60s), Wiederholungs-Intervall, Ring-UUIDs, Admin-Modus, Konto, Geraete-Reset
* **Admin- und Praesentationsmodus** | blendet Ring-Sektion und Versionsangabe aus, gibt Zugriff auf manuelle Anker-Erstellung
* **Geraete-Reset** | loescht lokale Sitzung und Einstellungen, Supabase-Daten bleiben
* **PWA-Manifest und Service Worker** | vorbereitet, Cache-Name `aurum-v0-1-shell`
* **BLE-Adapter** | portiert (Web Bluetooth + Capacitor), UI fuer Verbindung in den Einstellungen unter Admin-Modus
* **Archiv** | Soft-Delete, 60-Tage-Cleanup client-seitig beim Login (fire-and-forget), Tab fuer Marker und Notizen in Settings
* **Bottom-Nav Mobile** | Timeline | Sheets | Einstellungen, FAB rechts unten, Safe-Area-Insets
* **lokale Keys** | alle mit Prefix `aurum_` (seit Rename). Legacy-Prefix `cuprum_` wird beim Reset mit aufgeraeumt.

---

## 8. Was offen bleibt

### 8.1 Feature-Luecken

* **AURA-Transkription** | geplant via Supabase Edge Function gegen Whisper
* **Capacitor-Wrapping** fuer iOS (braucht macOS)
* **Reverse-Geocoding** (Koordinaten → Ortsname)
* **Wochen- und Monatsuebersicht** der Marker-Dichte als eigene Ansicht
* **Onboarding-Wizard** nach Signup (Spec liegt im Konzept, nicht implementiert)
* **Scrollrad-Picker** als Ersatz fuer `input[type=time]` (Spec im Konzept)
* **Calendar-Bottom-Sheet** zum Datum-Springen (Spec im Konzept)
* **Week-View-Refactor** auf Stunden-Track (statt Karten-Liste)
* **Ereignis ohne Zeit → Notiz**-Flow (Spec im Konzept, noch nicht UI-seitig abgebildet)

### 8.2 Hardware- und Plattform-Blocker

* **macOS-Zugriff** bleibt Blocker fuer iOS-Capacitor-Build. Entscheidung offen: Mac leihen, MacinCloud mieten, Mac kaufen, oder CI-Alternative.
* **Ring-Hardware** existiert noch nicht. BLE-UUIDs sind definiert, der Adapter liegt vor, aber ohne Geraet keine Tests.

---

## 9. Bekannte Bugs und Beobachtungen

### 9.1 compression_seconds-Schema-Bug

**Fehler:** "Could not find the 'compression_seconds' column of 'markers'"

**Ursache:** Frontend sendet `compression_seconds`, Tabelle `markers` hat die Spalte (noch) nicht oder Supabase-Schema-Cache ist veraltet.

**Loesung:**

```sql
alter table markers add column if not exists compression_seconds integer;
notify pgrst, 'reload schema';
```

Oder im Supabase-Dashboard einmal Schema-Refresh ausloesen.

**Triff:** Wizard, Marker-Sheet, Planung.

### 9.2 Geolocation und Audio ueber Cloudflare-Tunnel auf iOS

**Beobachtung:** Laptop funktioniert, iPhone ueber Tunnel nicht.

**Ursache:** Safari-iOS-Sicherheitsmodell in Kombination mit wechselnden Subdomains und nicht-persistenten Permissions. Kein Bug der App.

**Saubere Wege:**

* eigene Domain mit echtem SSL (aktuell: `aurum.marcodemont.ch` via Cloudflare Full Strict)
* Capacitor-Wrap (native Permissions, kein Browser-Problem)

**Workaround (temporaer):** Safari-Einstellungen → Kamera/Mikro explizit erlauben, Seite einmal manuell oeffnen (nicht als PWA).

### 9.3 Package- und String-Rest

Nach dem Rename am 2026-04-20 sind die primaeren Stellen (package.json name, README, vite.config.ts, manifest, sw.js, icon.svg, src/lib/config.ts, src/App.tsx, modules/aurum/AurumCore.tsx, useAdminMode.ts, types.ts) auf "AURUM" umgestellt. Rest-Strings in `build/` und `package-lock.json` werden beim naechsten `npm run build` bzw. `npm install` automatisch regeneriert.

### 9.4 Admin-Modus Default

Aktuell `localStorage['aurum_admin_mode']` Default `'1'`. Fuer Produktion zu ueberdenken (dann Default `'0'` und Aktivierung ueber versteckten Toggle).

---

## 10. Konzept-Bezug

Das Konzept dieser Version liegt in `documentation/CONCEPTv0.1.md`. Zusammenfassend:

* AURUM ist ein Signal-System mit nachgelagerter Kontextbildung, kein Kalender.
* Instant (Armreif) und Planung (App) sind strikt getrennt.
* User kann Instants nur am Armreif, Admin kann alles in der App (Test/Simulation).
* Anker = "Gedanke existiert", kein Inhalt.
* Ereignis ohne Zeit = Notiz, nicht geplanter Marker.
* Kompression ist USP mit doppelter Rolle (Instant + Planung).
* AURA transkribiert im Hintergrund, hat kein UI.

---

## 11. Roadmap

### 11.1 v0.1.x | Stabilisierung

* compression_seconds-Schema-Fix auf Supabase auslösen
* Ereignis-ohne-Zeit-Flow UI-seitig abbilden
* CreateMarker fuer alle vier Typen durchgehend (aktuell nur teilweise)
* WeekView-Refactor auf Stunden-Track
* Marker-Notiz-Verknuepfung im Detail-Modal ("Zur Notiz"-Button, automatische Notiz-Erstellung bei Bedarf)
* UI-Specs Scrollrad, Onboarding, Planned-Sheet, Week-Dots (bereits da), Calendar-Sheet umsetzen

### 11.2 v0.2 | AURA MVP

* Supabase Edge Function fuer Whisper-Transkription
* Transkript landet in der verknuepften Notiz
* UI zeigt Transkript in Notiz und Vorschau im Marker-Detail

### 11.3 v0.3 | PWA und Capacitor

* PWA-Manifest und Service Worker an den React-Build binden
* Capacitor-Schicht scharfstellen, iOS-Build (sobald macOS verfuegbar)
* BLE-Plugin aktivieren, Ring-Pairing-Flow in den Einstellungen

### 11.4 v0.4+ | Ort und Uebersicht

* Reverse-Geocoding als Edge Function
* Wochen- und Monatsuebersicht der Marker-Dichte
* Filter nach Tag, Typ und Ort

### 11.5 Spaeter

* Summary und Auto-Tags durch AURA
* Verknuepfungsvorschlaege zwischen Markern und Notizen
* Chat mit AURA ueber die eigenen Daten
* Stimmungs- und Zustandserkennung aus Audio

---

## 12. Kritische Regeln (Kurzform)

1. AURUM und CUPRUM teilen Supabase. Schema-Aenderungen backward-kompatibel.
2. AURUM live, CUPRUM Werkstatt. Klare Rollen, keine Vermischung in Scripts und Tunneln.
3. Kein API-Key im Client-Code.
4. Keine Push-Notifications.
5. AURA hat kein UI.
6. Schweizer Orthographie, kein Eszett, keine Em-Dashes.
7. Admin-Modus = Sichtbarkeits-Schalter, keine Security.
8. Geraete-Reset beruehrt nur Lokales.
9. BLE kommt erst mit Capacitor.
10. Tunnel-Hosts in `vite.config.ts`.
11. Instant am Armreif, Planung in der App.
12. Anker sind Existenz, keine Inhalte.
13. Ereignis ohne Zeit = Notiz.

Detaillierte Fassung in `CONCEPTv0.1.md` Abschnitt 29.

---

## 13. Kurzfassung

AURUM v0.1 ist die konsolidierte Live-Version nach dem Track-Rename am 2026-04-20. React + Vite + TS + Tailwind, Port 8006, Domain `aurum.marcodemont.ch`. CUPRUM laeuft parallel als Werkstatt. Supabase ist shared. Die wichtigsten v0.1-Features sind Auth, Timeline mit AURUM-treuer Darstellung, vier Marker-Typen, Marker-Detail-Modal, Notizen-Editor, Settings mit Admin-Modus und Archiv, Bottom-Nav mit FAB, Soft-Delete mit 60-Tage-Cleanup. Offen: AURA-Transkription, Capacitor, Onboarding, Scrollrad-Picker, Calendar-Sheet, Ereignis-ohne-Zeit-Flow. Bekannter Bug: `compression_seconds`-Spalte (Schema-Fix siehe 9.1). Cloudflare-Tunnel auf iOS ist fragil fuer Geo und Audio, Capacitor ist der langfristige Pfad.
