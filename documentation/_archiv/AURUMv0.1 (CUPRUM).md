## | AURUM | Version

# AURUM v0.1 (CUPRUM)

Neustart der Codebasis. Der Monolith-HTML-Stand (v0.01 bis v0.06) wird als "AURUM live" eingefroren. Die aktive Weiterentwicklung passiert ab jetzt unter dem Arbeitsnamen **CUPRUM** auf React + Vite + TypeScript. Sobald CUPRUM reif ist, wird es zum neuen AURUM live.

* Version: v0.1 (CUPRUM)
* Status: aktiv. Werkstatt. Nachfolger von v0.06 (Monolith).
* Scope: Technologie-Wechsel des Frontends, Konzept bleibt. Keine neuen Marker-Typen, kein neues DB-Schema.
* Arbeitsordner: `CUPRUM/` auf Root-Ebene.
* Starter: `CUPRUM.bat` auf Root-Ebene.
* Live-Tunnel: `cuprum.marcodemont.ch` (Cloudflare).
* Live-Port lokal: 8008.

Gegenueber v0.06 gelten folgende grundlegende Aenderungen:

* **Frontend-Stack gewechselt.** Monolith-HTML + Vanilla JS wird zu React 18 + Vite + TypeScript + Tailwind. Die Architektur basiert auf einem Figma-Export ("AURUM V2, DA-09.04.2026") und wurde um den AURUM-Supabase-Account und die AURUM-Konzept-Inhalte ergaenzt.
* **Namensauftrennung.** Drei Namen, drei Rollen:
  - **AURUM** = Live-Version (Monolith-HTML, frozen).
  - **CUPRUM** = Werkstatt (React/TS, hier passieren alle Aenderungen).
  - **ARGENTUM** = Dark-Mode-Theme **innerhalb** der AURUM-App. Kein eigener Track mehr. Der frueher eigenstaendige ARGENTUM-Ordner ist aufgeloest, dessen Code liegt als Legacy im Unterordner `CUPRUM/src/Argentum/`.
* **ARGENTUM-als-Track aufgeloest.** Grund: Namenskonflikt mit dem Figma-Default-Supabase-Projekt. Der Name wird nur noch fuer das Dark-Mode-Theme verwendet.
* **Cloudflare-Tunnel.** CUPRUM ist direkt unter `https://cuprum.marcodemont.ch/` erreichbar, ohne Portweiterleitung oder Hosting-Schritt.

Alles andere, was v0.06 und frueher definiert haben, bleibt inhaltlich bestehen: Konzept, Begriffssystem der vier Marker-Typen, Timeline-Funktion, AURA-Zurueckhaltung, Schweizer Orthographie.

---

## Inhaltsverzeichnis

1. Historie v0.01 bis v0.06 (konsolidiert)
2. Neu in v0.1 (CUPRUM)
3. Verzeichnisstruktur
4. Starter und Tunnel
5. Stack und Abhaengigkeiten
6. Supabase-Verbindung
7. Legacy-Unterordner
8. Konzept-Stand
9. Versionsmodell
10. Roadmap
11. Offene Punkte
12. Kritische Regeln
13. Glossar
14. Kurzfassung

---

## 1. Historie v0.01 bis v0.06 (konsolidiert)

Alle frueheren Versionen haben sich auf den Monolith-HTML-Stand (`AURUM/app/AURUM.html`) bezogen. Die Einzel-Dokus `AURUMv0.01.md` bis `AURUMv0.06.md` bleiben erhalten. Hier die Kern-Inhalte in Kurzform, damit v0.1 ohne Nachschlagen verstaendlich ist.

### 1.1 v0.01 | Klickdummy

* fuenf Screens (Timeline, Aufgabe anlegen, Notiz, Einstellungen, Login-Dummy)
* statisches Beispiel-Datenarray im Code, keine Persistenz
* dunkles Theme, Coral-Akzent (Structured-Inspiration)
* einzige HTML-Datei, Vanilla JavaScript
* Zweck: Interaktionsform festlegen, bevor eine Zeile Persistenzcode existiert

### 1.2 v0.02 | Pastell-Cream und Gold

* dunkles Theme entfaellt, Grundflaeche wird hell und papierartig
* Coral-Akzent entfaellt, ersetzt durch gezielte goldene Akzente (AURUM ist Gold)
* Farbsystem als CSS-Variablen, zentral im `:root`
* Formensprache: Kreise, Ovale, stark abgerundete Rechtecke, viel Negativraum
* funktional identisch zu v0.01

### 1.3 v0.03 | "AI" wird "Notizen"

* Bottom-Nav-Eintrag `AI` wird umbenannt zu `Notizen`
* Icon: Dokument-Icon statt KI-Motiv
* Hintergrund: AURA (die KI-Schicht) soll nie im Vordergrund stehen. Ein Nav-Eintrag namens "AI" wuerde diese Rolle widersprechen
* keine neuen Screens, keine neuen Datenstrukturen

### 1.4 v0.04 | Geplante Marker mit Farbe, Anker mit Bezug

* geplante Marker erhalten eine kuratierte Farbauswahl (Bubble-Hintergrund, Erledigt-Toggle, Wochen-Dot)
* geplante Marker erhalten einfache Wiederholungen: einmalig, wochentags, taeglich, woechentlich
* Wiederholungen als naive Instanz-Kopien, ohne Serien-Relation
* Anker bekommt Hover-Tooltip mit Zeit und Ort
* Anker-Detail-Screen zeigt offene geplante Marker des Tages; ein Klick verknuepft Anker mit geplantem Marker (textbasiert, nicht relational)
* neue Felder: `markers.color`, `markers.repeat_type`, `markers.repeat_parent_id`

### 1.5 v0.05 | Fullscreen, Notch, Admin-Modus, Device-Reset

* Phone-Bezel entfaellt, Layout fuellt den Viewport vollstaendig
* iPhone-Notch wird ueber `env(safe-area-inset-top)` respektiert
* Wochen-Dots nutzen echte Marker-Farbe (`color`-Feld) statt Typ-Farbe, Fallback bleibt
* **Admin- und Praesentationsmodus** als lokaler Schalter, `localStorage`-Key `aurum_admin_mode`, Default `'1'`
* im Praesentationsmodus ausgeblendet: Anker-Option, Kompressions-Option, Armreif-Section, Diplomarbeits-Footer, Versionsangabe
* **"Komplett zuruecksetzen"-Knopf** in den Einstellungen (`resetDeviceState()`): loescht Session, Admin-Flag, Onboarding-Flag aus `localStorage`, laedt neu. Supabase-Daten bleiben unberuehrt
* kein DB-Schema-Change

### 1.6 v0.06 | Capacitor-Vorbereitung, Repo-Reorganisation

* Capacitor als native Schicht mit Plugin-Vollset: Core, CLI, iOS, Android, Bluetooth LE, Geolocation, Preferences, Filesystem
* `webDir` zeigt auf `../app/` (kein doppelter Code)
* Repo-Struktur neu organisiert, frueheres `.AURUM-neu/.AURUM/` aufgeloest
* Versionierung sichtbar: HTML-Dateiversionen (`AURUMv4.html`, `AURUMv5.html`) entfallen, eine einzige `app/AURUM.html` wird in-place aufgewertet
* ein Starter: `AURUM.bat` auf Root, Port 8006, zeigt WLAN-IPs fuer iPhone-Zugriff
* Versions-Differenzen ausschliesslich in `documentation/AURUMv0.XX.md`
* BLE-UUIDs definiert: Service `6e400001-b5a3-f393-e0a9-e50e24dcca9e`, Notify `6e400003-...`, Write `6e400002-...`
* iOS-Build blockiert ohne macOS (Xcode)

### 1.7 v0.09 | ARGENTUM-Track (aufgeloest in v0.1)

v0.09 war die erste React/TypeScript-Implementierung unter dem damaligen Track-Namen **ARGENTUM** (eigener Ordner `ARGENTUM/`, eigene Subdomain `argentum.marcodemont.ch`, Port 8007). Mit v0.1 wird dieser Track aufgeloest und nach CUPRUM umgewidmet. Der Code selbst lebt in CUPRUM weiter — entweder als aktive Basis oder als Legacy-Unterordner `CUPRUM/src/Argentum/`.

Die wichtigsten v0.09-Ergebnisse, die in v0.1 **bleiben**:

* **Schema-Migration** `add_archived_at_to_markers_and_notes` ist am 2026-04-20 via Supabase-MCP deployed. Spalten `archived_at timestamptz` auf `markers` und `notes`, plus Partial-Indizes `markers_archived_idx` und `notes_archived_idx`. AURUM live ignoriert die Spalten (backward-kompatibel).
* **Soft-Delete plus 60-Tage-Cleanup.** Markers und Notes werden nicht hart geloescht, sondern bekommen `archived_at`-Timestamp. Sie verschwinden aus Timeline und Notizenliste, sind im Archiv-Bereich der Einstellungen sichtbar (Wiederherstellen oder endgueltig loeschen). Auto-Hard-Delete nach 60 Tagen beim Login (client-seitig, fire-and-forget).
* **AURUM-treues Marker-Layout** in React:
  - Day-View Spalten-Grid `40px (Zeit) | 42px (Linie+Bubble) | 1fr (Content)`.
  - **Anker** = 20x20 roter Kreis (`#b85555`) auf der Linie, kein Content rechts.
  - **Audio / Kompression / Geplant** = 40x40 Squircle (border-radius 14px) in Typ-Farbe plus Card rechts (Uppercase-Label, Bold-Titel).
  - Typ-Farben: anchor `#c4bca8`, audio `#b89668`, compression `#c08a7a`, planned `#b5c5d5`.
  - Geplant in Vergangenheit: Border-Style solid, Label und Titel durchgestrichen, Opacity 0.6.
  - Hintergrund: AURUMs `#faf5eb` (Cream).
* **Marker-Detail-Modal** (Bottom-Sheet auf Mobile, zentriert auf Desktop): Typ-Label plus Schliessen, Bubble 48x48 plus Bold-Titel plus Zeit und Datum, typ-spezifischer Body (Audio-Player, Sub-Text, Location-Chip, Done-Toggle), Tags als Pills, Footer mit **Archivieren** (grau) und **Endgueltig loeschen** (rot mit Confirm).
* **Notizen-Editor** als Modal: Titel-Input, Content-Textarea, Tags-Input (Komma-getrennt), Aktionen Speichern, Archivieren, Loeschen.
* **Einstellungs-Sections** 1:1 uebernommen aus AURUMs `s-settings`: Geplante Marker (Druckaufbau-Slider 10-60s, Wiederholung-Select Aus / 5 / 10 / 15 / 30 / 60 min), Anker (Geo-Toggle), Armreif (Status-Anzeige), Konto (E-Mail plus Abmelden), **Entwickler** (Admin-Modus-Toggle), **Archiv** (kollabiert, Tabs Marker und Notizen). Live-Save, kein separater Speicher-Button.
* **Admin-Modus fuer manuelle Anker.** Solange der Armreif fehlt, kann im Admin-Modus (`localStorage`-Key `aurum_admin_mode`) in der Timeline-Header ein roter "Anker"-Button eingeblendet werden, der per `createAnchor()` eine Anker-Zeile in Supabase einfuegt (`marker_type='anchor'`, `source='app'`).
* **Force-Auth-Screen-Fix.** Im Demo-Mode war `signOut()` ein No-op. Neu setzt `handleLogout` ein Flag `forceAuthScreen=true`, das den Auth-Screen rendert; Flag reset-tet automatisch sobald ein User eingeloggt ist.
* **Mobile-First Layout.** Bottom-Nav (Timeline | Sheets | Einstellungen), Safe-Area-Padding (`env(safe-area-inset-bottom)`), FAB rechts unten (Gold, 56x56) nur in Timeline sichtbar, Mobile-Header 48px mit Logo plus Login/Logout-Icon. Desktop-Top-Nav erst ab 768px.
* **`index.html`-Meta** fuer iOS: `viewport-fit=cover`, `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=default`, `theme-color=#fef3c7`.
* **Tab-Label "Sheets"** bleibt, Inhalt sind Notes (User-Wunsch).

Was in v0.09 **nicht** umgesetzt wurde und in v0.1 weiter offen ist: Audio-Aufnahme in React, WeekView mit Stunden-Track, CreateMarker-Supabase-Anbindung fuer alle vier Typen (nicht nur Anker), AURA-Transkription, Cleanup der Figma-Ballast-Komponenten (LYNA, JOI, Chat-Bubbles, kv_store).

---

## 2. Neu in v0.1 (CUPRUM)

### 2.1 Technologie-Wechsel

| Aspekt | v0.06 (Monolith) | v0.1 (CUPRUM) |
|---|---|---|
| Frontend | eine `AURUM.html` mit inline CSS und JS | React 18 Komponenten + TypeScript |
| Build | keiner (Python-Static-Server auf Port 8006) | Vite 6 Dev-Server auf Port 8008, `npm run dev` |
| Styling | inline `<style>` plus CSS-Variablen | Tailwind 4 + CSS-Variablen aus `src/index.css` |
| Komponenten | alles im HTML | `src/components/`, `src/modules/`, `src/utils/` |
| State | globale Variablen im Window-Scope | React-Hooks, Context |
| Hosting lokal | `python -m http.server 8006` | `vite` (HMR, Fast Refresh) |
| Hosting remote | `aurum.marcodemont.ch` via Cloudflare | `cuprum.marcodemont.ch` via Cloudflare |

### 2.2 Warum der Wechsel

* Der Monolith ist mit ~1600 Zeilen inline-Code an die Grenze der Wartbarkeit gekommen.
* Neue Features (Dark Mode als ARGENTUM-Theme, Onboarding-Wizard, Scrollrad-Picker, Calendar-Sheet) wuerden den Monolith weiter aufblaehen.
* Komponentisierung ermoeglicht, einzelne Screens isoliert zu aendern, ohne andere Bereiche zu beruehren.
* TypeScript faengt Fehler beim Schreiben, nicht erst beim Testen.
* Vite-HMR macht die Feedback-Schleife von "aendern bis sehen" deutlich kuerzer.

### 2.3 Was nicht umgezogen ist (bewusst)

* PWA-Manifest und Service Worker (`manifest.webmanifest`, `sw.js`) liegen in `CUPRUM/app/` bereit, sind aber an die React-App noch nicht angebunden. Reaktivierung optional.
* Capacitor-Schicht (`mobile/`) liegt in CUPRUM-Kopie bereit, ist aber noch nicht ausprobiert. iOS-Build weiterhin von macOS-Zugriff abhaengig.
* BLE-Adapter (`ble-ring.js`) liegt in `CUPRUM/app/` neben der alten AURUM.html, ist an die React-App noch nicht angebunden.

### 2.4 Was neu ist

* **Drei-Namen-Modell** statt zwei Tracks. ARGENTUM ist nicht mehr separat, sondern Dark-Mode-Theme in AURUM / CUPRUM.
* **Eigene Subdomain** `cuprum.marcodemont.ch` fuer den Werkstatt-Stand.
* **CUPRUM.bat** auf Root: prueft Node, installiert `node_modules` beim ersten Start, prueft Port 8008, startet Vite und Cloudflare-Tunnel parallel.
* **Tunnel-Config** in `~/.cloudflared/cuprum.yml`, routet `cuprum.marcodemont.ch` auf `localhost:8008`.
* **Legacy-Ordner** `CUPRUM/src/Argentum/` enthaelt den alten ARGENTUM-Track-Code. Wird bei naechstem Cleanup reduziert.

---

## 3. Verzeichnisstruktur

```
Desktop/.AURUM - claude/          (Root)
|
+-- AURUM/                         Live-Stand, Monolith (frozen, nicht anfassen)
|   +-- app/AURUM.html
|   +-- supabase/
|   +-- ...
+-- AURUM.bat                      Starter fuer AURUM live (Port 8006)
|
+-- CUPRUM/                        Werkstatt, React/Vite/TS
|   +-- index.html                 Vite-Einstiegspunkt, laedt src/main.tsx
|   +-- src/
|   |   +-- main.tsx               React-Entry
|   |   +-- App.tsx
|   |   +-- components/            UI-Komponenten
|   |   +-- modules/               Feature-Module
|   |   +-- utils/
|   |   |   +-- supabase/info.tsx  AURUMs Supabase-Keys
|   |   +-- styles/, index.css     Tailwind + CSS-Variablen
|   |   +-- Argentum/              Legacy (alter ARGENTUM-Track-Code)
|   |
|   +-- app/                       Alte AURUM-HTML-Files (Merge-Material)
|   |   +-- AURUM.html
|   |   +-- ble-ring.js
|   |   +-- sw.js, manifest.webmanifest, icon.svg
|   |
|   +-- mobile/                    Capacitor-Schicht (vorbereitet)
|   +-- supabase/                  Projekt-Referenz (config.md)
|   +-- package.json, vite.config.ts
|   +-- node_modules/
+-- CUPRUM.bat                     Starter fuer CUPRUM (Port 8008, Tunnel)
|
+-- documentation/                 Diese Datei liegt hier
+-- ...
+-- README.md, .env, .gitignore
```

---

## 4. Starter und Tunnel

### 4.1 CUPRUM.bat

Doppelklick startet:

1. Pruefung: `CUPRUM\package.json` vorhanden?
2. Pruefung: `node` auf PATH?
3. `node_modules` vorhanden? Sonst `npm install`.
4. Port 8008 frei? Sonst Abbruch mit PID-Hinweis.
5. `cloudflared` auf PATH und `cuprum.yml` vorhanden? Dann Tunnel starten.
6. Browser oeffnen auf `http://localhost:8008/`.
7. `npm run dev -- --port 8008 --host --strictPort` im Vordergrund-Fenster.

Strg+C im Server-Fenster beendet den Dev-Server. Das Tunnel-Fenster muss separat geschlossen werden.

### 4.2 Cloudflare-Tunnel

Config: `%USERPROFILE%\.cloudflared\cuprum.yml`

```yaml
tunnel: cuprum
credentials-file: C:\Users\marcodemont\.cloudflared\8baf2db6-a903-44a8-83ea-51922f6e25f0.json

ingress:
  - hostname: cuprum.marcodemont.ch
    service: http://localhost:8008
  - service: http_status:404
```

Voraussetzung Vite-seitig: `cuprum.marcodemont.ch` muss in `CUPRUM/vite.config.ts` unter `server.allowedHosts` stehen, sonst wird der Request von Vite abgelehnt ("Blocked request. This host is not allowed.").

### 4.3 Lokale URLs

* `http://localhost:8008/` vom Laptop
* `http://<ipv4>:8008/` vom iPhone/iPad im selben WLAN (HTTP, daher kein Mikro und kein Geo)
* `https://cuprum.marcodemont.ch/` ueber den Tunnel (HTTPS, Mikro und Geo erlaubt)

---

## 5. Stack und Abhaengigkeiten

Aus `CUPRUM/package.json`:

* **React 18** (`react`, `react-dom`)
* **Vite 6** (`vite`, `@vitejs/plugin-react`)
* **TypeScript** (ueber Vite)
* **Tailwind 4** (`tailwindcss`, `@tailwindcss/vite`)
* **Radix UI** (ca. 25 Primitives, von Figma-Maker importiert)
* **Lucide** fuer Icons (`lucide-react`)
* **Framer Motion** (`framer-motion`, `motion`)
* **Supabase** (`@supabase/supabase-js`, plus `@jsr/supabase__supabase-js` aus Figma-Export)
* **TanStack Query** (`@tanstack/react-query`)
* **React Hook Form**, **Sonner**, **Vaul**, **Embla**, **Day Picker**, **DnD-Kit** etc.
* **OpenAI SDK** (noch nicht angebunden, STT kommt ueber Supabase Edge Function oder `server.js`)

Version der App im `package.json`: `0.1.0`. `name`-Feld: `"AURUM V2 (DA-09.04.2026)"` (aus Figma-Export, nicht gefixt, kosmetisch).

---

## 6. Supabase-Verbindung

CUPRUM nutzt dasselbe Supabase-Projekt wie AURUM live.

* Projekt: `Diplomarbeit`
* Region: eu-central-2 (Zuerich)
* Project-Ref: `jitkxxpuzmopcrfvzzlz`
* Base-URL: `https://jitkxxpuzmopcrfvzzlz.supabase.co`
* Publishable Key: `sb_publishable_dUNie_zHEDP4PKdMgUO20Q_buLMANmM` (RLS-geschuetzt, darf im Client liegen)

Zu finden in `CUPRUM/src/utils/supabase/info.tsx`. Der Figma-Default-Supabase-Account im Legacy-Pfad `CUPRUM/src/Argentum/utils/supabase/info.tsx` ist **nicht** aktiv und zeigt auf ein fremdes Projekt (`lmhplpqiykqwukuuzxxb`). Darf nicht verwendet werden.

Tabellen (unveraendert gegenueber v0.06, plus `archived_at` aus v0.09):

* `markers` | `id`, `user_id`, `marker_date`, `start_time`, `marker_type`, `latitude`, `longitude`, `location_label`, `audio_path`, `transcript`, `summary`, `tags`, `source`, `title`, `is_done`, `color`, `repeat_type`, `sub`, `archived_at`
* `notes` | freie Notizen, optional mit Marker verknuepft, plus `archived_at`
* `user_settings` | Druckaufbau-Dauer, Wiederholungs-Intervall, Geolocation, Ring-UUIDs, Ring-Pairing-ID
* Storage-Bucket `audio-markers` (Public: false, Pfad `<user_id>/<marker_id>.<ext>`)

Partial-Indizes aus Migration `add_archived_at_to_markers_and_notes`:

```sql
create index if not exists markers_archived_idx
  on public.markers (archived_at)
  where archived_at is not null;

create index if not exists notes_archived_idx
  on public.notes (archived_at)
  where archived_at is not null;
```

Schema-Aenderungen sind **shared infrastructure** mit AURUM live. Jede Migration muss backward-kompatibel sein, damit AURUM-Monolith weiter funktioniert (nullable Spalten, keine Constraints die bestehende Zeilen verletzen).

---

## 7. Legacy-Unterordner

`CUPRUM/src/Argentum/` enthaelt Alt-Code aus der frueheren ARGENTUM-als-Track-Phase:

* `App.tsx`, `main.tsx`, `components/`, `modules/`, `utils/`
* `modules/core/AurumCore.tsx`, `modules/argentum/ArgentumCore.tsx` (alte Track-Dualitaet)
* `modules/systems/LYNA/LYNA_Chat.tsx` (Figma-Ballast, Chat-Bubbles)
* `supabase/functions/server/*.tsx` (Hono-basierte Edge-Function-Prototypen)
* eigenes `info.tsx` mit Figma-Default-Supabase-Projekt (nicht verwenden)

Status: **Legacy**. Nicht aktiv im Build-Pfad, nicht in `src/App.tsx` importiert. Kann beim naechsten Cleanup reduziert oder entfernt werden. Bis dahin: nicht editieren, nur als Referenz lesen.

---

## 8. Konzept-Stand

Unveraendert gegenueber `CONCEPT_v3.md`. Kurz zur Orientierung:

### 8.1 Leitidee

Die App speichert und zeigt (AURUM), die KI transkribiert im Hintergrund (AURA), die Entscheidungen bleiben beim Nutzer, und die Praesenz im Moment gehoert dem Armreif.

### 8.2 Zwei Ebenen

* **AURUM** | die App. Speicherung, Struktur, Kontext, Darstellung.
* **AURA** | die KI-Schicht. Hauptzweck Transkription.

### 8.3 Vier Marker-Typen

* **Anker** | Zeitpunkt ohne Inhalt, Button 1 (1x kurz)
* **Audiomarker** | Zeitpunkt plus Verweis auf Notiz, Button 1 (2x kurz)
* **Kompression** | koerperlicher Eingriff, Button 2 (Hebel)
* **Geplanter Marker** | zukuenftiger Zeitpunkt mit haptischer Rueckmeldung

### 8.4 Designprinzipien

* Farbwelt: Pastell-Cream plus Gold
* Formensprache: Kreise, Ovale, abgerundete Rechtecke
* Sprache: Schweizer Orthographie, kein Eszett, keine Em-Dashes, ruhig und analytisch
* Interaktion: direkte Manipulation, wenige Gesten, ein Screen eine Entscheidung

### 8.5 Admin-Modus

Bleibt Kernbestandteil. `localStorage`-Key `aurum_admin_mode`, Default `'1'`. Im Nicht-Admin-Modus werden Anker-Option, Kompressions-Option, Armreif-Section und Diplomarbeits-Footer ausgeblendet.

### 8.6 Device-Reset

Bleibt Kernbestandteil. Button "Komplett zuruecksetzen" in den Einstellungen: loescht Session, Admin-Flag, Onboarding-Flag aus `localStorage`, laedt neu. Supabase-Daten bleiben unberuehrt.

---

## 9. Versionsmodell

* Eine Code-Basis: `CUPRUM/src/`.
* Pro abgegrenztem Aenderungsblock eine eigene MD in `documentation/`, Nummerierung wird unter v0.1 als v0.1.x fortgefuehrt (v0.1.1, v0.1.2 etc.) oder als v0.2, sobald ein groesserer Meilenstein erreicht ist.
* Die Monolith-Versionsnummern v0.01 bis v0.06 werden nicht weitergezaehlt.
* Die historischen Einzel-Dokus (`AURUMv0.01.md` bis `AURUMv0.06.md`) bleiben als Referenz erhalten und werden nicht veraendert.

---

## 10. Roadmap

### 10.1 v0.1.x | Stabilisierung und Merge

* Cloudflare-Tunnel verifiziert (`cuprum.marcodemont.ch` antwortet mit Vite-Dev-Page)
* AURUM-Konzept-Komponenten aus der Monolith-HTML nach React portieren:
  - Login + Register
  - Timeline + Week-Strip + Week-Dots
  - Marker-Sheet (vier Typen)
  - Marker-Detail (typ-spezifisch)
  - Notizen-Liste + Editor
  - Einstellungen (Slider, Toggles, Device-Reset)
* Supabase-Anbindung: `markers`-CRUD, `notes`-CRUD, Audio-Upload
* Admin-Modus und Device-Reset portieren
* Dark-Mode-Theme "ARGENTUM" als Toggle in den Einstellungen

### 10.2 v0.2 | AURA MVP

* Supabase Edge Function fuer Whisper-Transkription
* Transkript landet in der verknuepften Notiz
* UI zeigt Transkript in Notiz und Vorschau im Marker-Detail

### 10.3 v0.3 | PWA und Capacitor

* PWA-Manifest und Service Worker an die React-App binden (aus `CUPRUM/app/`)
* Capacitor-Schicht scharfstellen, iOS-Build (braucht macOS)
* BLE-Plugin aktivieren, Ring-Pairing-Flow in den Einstellungen

### 10.4 Spaeter

* Reverse-Geocoding als Edge Function
* Wochen- und Monatsuebersicht Marker-Dichte
* Verknuepfungsvorschlaege zwischen Markern und Notizen
* Chat mit AURA ueber die eigenen Daten
* Stimmungs- und Zustandserkennung aus Audio

---

## 11. Offene Punkte

* **AURUM-Merge steht aus.** Die Monolith-HTML-Features sind noch nicht in die React-Komponenten portiert. CUPRUM zeigt derzeit die Figma-Maker-Oberflaeche, nicht den AURUM-Flow.
* **Legacy-Ordner `CUPRUM/src/Argentum/`.** Enthaelt Alt-Code, der im Build nicht aktiv ist. Cleanup offen.
* **PWA und Capacitor** sind vorbereitet, aber noch nicht angebunden.
* **Package-Name** `"AURUM V2 (DA-09.04.2026)"` stammt aus dem Figma-Export. Kosmetisch, kann beim naechsten Cleanup auf `"cuprum"` oder `"aurum"` umgestellt werden.
* **`index.html`-Title** steht auf `"Argentum"`. Sollte beim Merge auf `"AURUM"` oder `"CUPRUM"` geaendert werden.
* **Zwei `info.tsx`** existieren parallel (aktive und Legacy). Die Legacy-Version kann entfernt werden, sobald der `Argentum/`-Ordner aufgeraeumt ist.
* **macOS-Zugriff** bleibt Blocker fuer iOS-Build (unveraendert seit v0.06).
* **Ring-Hardware** existiert noch nicht. BLE-UUIDs sind definiert, der Adapter `ble-ring.js` liegt in `CUPRUM/app/`.

---

## 12. Kritische Regeln

Uebernommen aus `CONCEPT_v3.md` Abschnitt 23 plus v0.1-spezifische Ergaenzungen.

1. **AURUM ist frozen.** Niemals Files unter `AURUM/` oder `AURUM.bat` aendern. Alle Aenderungen passieren in `CUPRUM/`.
2. **CUPRUM ist Werkstatt, nicht Spielwiese.** Schema-Aenderungen bleiben backward-kompatibel zu AURUMs laufender Instanz.
3. **ARGENTUM ist Theme, kein Track.** Wenn der User "ARGENTUM" sagt, meint er das Dark-Mode-Theme in der App, nicht einen separaten Ordner.
4. **Eine App, ein Code-Ort.** `CUPRUM/src/` ist der einzige aktive Code-Pfad. `CUPRUM/src/Argentum/` ist Legacy, nicht aktiv.
5. **Kein API-Key im Client-Code.** AURA-Keys gehoeren in Supabase Edge Function Secrets bzw. `server.js`.
6. **Keine Push-Notifications.** Praesenz im Moment gehoert dem Armreif.
7. **AURA agiert nie ungefragt.** Transkription auf neuen Audiomarker ist dokumentierter Standard-Flow, kein Ungefragt-Handeln.
8. **Keine sichtbare AI-UI.** Keine Chat-Bubbles, keine Floating-AI-Buttons, keine "Frag den Assistenten"-Widgets. AURA bleibt still im Hintergrund.
9. **Schweizer Orthographie.** Kein Eszett, keine Em-Dashes. Gilt fuer Code-Kommentare, UI-Strings und Doku.
10. **Admin-Modus ist keine Security-Schicht.** Er steuert Sichtbarkeit fuer Praesentationen, nicht Zugriff.
11. **Device-Reset beruehrt nur lokales.** Daten in Supabase bleiben unter allen Umstaenden erhalten.
12. **BLE kommt erst mit Capacitor.** Keine Web-Bluetooth-Fallback-Versuche im PWA-Modus auf iOS.
13. **Tunnel-Hosts in `vite.config.ts` eintragen.** Neuer Subdomain-Name muss unter `server.allowedHosts` landen, sonst blockt Vite.

---

## 13. Glossar

**AURUM** | die App als Konzept und als Live-Stand. Der frozen Monolith-HTML unter `AURUM/`.

**CUPRUM** | Werkstatt fuer die React/TS-Weiterentwicklung. Wird zum neuen AURUM live, sobald reif.

**ARGENTUM** | Dark-Mode-Theme **innerhalb** der AURUM-App. Kein Track, kein separater Ordner mehr.

**AURA** | die KI-Schicht. Hauptzweck Transkription.

**Armreif** | das physische Objekt, Signalquelle fuer die App.

**Button 1** | Druckknopf am Armreif, loest Anker (1x) und Audiomarker (2x) aus.

**Button 2** | Hebel am Armreif, loest Kompressionen aus und unterbricht laufenden Druck.

**Anker** | Zeitpunkt ohne Inhalt, kurzfristige Auslagerung.

**Audiomarker** | Zeitpunkt auf der Timeline, Inhalt in verknuepfter Notiz.

**Kompression** | koerperlicher Eingriff, Ereignis ohne Inhalt.

**Geplanter Marker** | zukuenftiger Zeitpunkt mit haptischer Rueckmeldung.

**Marker** | Oberbegriff fuer Eintraege auf der Timeline.

**Notiz** | freie Bedeutungsebene, bei Audiomarkern automatisch angelegt.

**Tag** | verbindet Marker und Notiz thematisch.

**Vite** | moderner Frontend-Build-Tool, Dev-Server mit HMR. Basis von CUPRUM.

**Tailwind 4** | Utility-first CSS-Framework. Basis des CUPRUM-Stylings, neben CSS-Variablen.

**Radix UI** | Headless-UI-Primitives. Quelle vieler Komponenten aus dem Figma-Export.

**Cloudflared Tunnel** | Cloudflare-Client, der eine oeffentliche HTTPS-URL auf einen lokalen Port leitet. Fuer CUPRUM konfiguriert in `~/.cloudflared/cuprum.yml`.

**Legacy-Ordner** | `CUPRUM/src/Argentum/`. Alt-Code, nicht im Build aktiv, steht fuer Cleanup an.

**Admin-Modus** | lokaler Sichtbarkeits-Schalter fuer Debug- und Entwicklungs-Elemente. Default: an.

**Praesentationsmodus** | synonym zum Nicht-Admin-Modus. Elemente mit Klasse `admin-only` werden ausgeblendet.

**Device-Reset** | loescht lokalen Geraete-Zustand (Session, Admin-Flag, Onboarding-Flag). Supabase-Daten bleiben.

---

## 14. Kurzfassung

v0.1 ist der Neustart der Codebasis auf React + Vite + TypeScript unter dem Arbeitsnamen CUPRUM. Der alte Monolith-HTML-Stand (AURUM, v0.01 bis v0.06) bleibt als eingefrorene Live-Version bestehen. ARGENTUM ist kein eigener Track mehr, sondern Dark-Mode-Theme innerhalb der App. CUPRUM ist unter `https://cuprum.marcodemont.ch/` via Cloudflare-Tunnel erreichbar, lokal auf Port 8008. Das Konzept, das Datenmodell und die Design-Prinzipien bleiben unveraendert gegenueber CONCEPT_v3. Der eigentliche Feature-Merge (Portierung der AURUM-Screens nach React) steht noch aus und wird unter v0.1.x schrittweise angegangen.
