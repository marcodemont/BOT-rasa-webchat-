## | AURUM | Version

# AURUM v0.09

ARGENTUM-Track aktiviert. Mit dieser Version startet die parallele React/TypeScript-Implementierung (`ARGENTUM/`), die mittel-/langfristig die Monolith-HTML-PWA (`AURUM/app/AURUM.html`) ersetzen soll. AURUM-Live (v0.08) bleibt unangetastet eingefroren. ARGENTUM nutzt das **gleiche** Supabase-Projekt und damit dieselbe Datenbank, dieselben User, dieselben Tabellen — alles, was in einer der beiden Apps angelegt oder geaendert wird, ist in der anderen sofort sichtbar.

* Version: v0.09
* Status: aktiv. ARGENTUM laeuft parallel zu AURUM auf eigener Subdomain (`argentum.marcodemont.ch`, Port 8007), AURUM-Live bleibt auf `aurum.marcodemont.ch`, Port 8006.
* Scope: kompletter React-Port der Timeline-, Notizen- und Einstellungs-Screens, geteiltes Supabase-Projekt, Mobile-First Responsive-Layout, eine kleine DB-Migration fuer Soft-Archive.

Gegenueber v0.08 gelten folgende grundlegende Aenderungen:

* **Zwei parallele Tracks** auf einer Hardware: AURUM (Vanilla-HTML, Live, Port 8006, eingefroren) und ARGENTUM (React/Vite/Tailwind, Werkstatt, Port 8007). Beide haben eigene Bats (`AURUM.bat`, `ARGENTUM.bat`), eigene Cloudflare-Tunnels (`aurum`, `argentum`), eigene Subdomains.
* **Geteilter Supabase-Account.** ARGENTUM zeigte im Figma-Default auf ein Fremd-Projekt (`fpvhmsbkcrmpdismpgsu.supabase.co`); umgestellt auf AURUMs Projekt (`jitkxxpuzmopcrfvzzlz.supabase.co`). Heisst: ein Login, eine Markers-Tabelle, eine Notes-Tabelle, ein User-Settings.
* **Schema-Migration** `add_archived_at_to_markers_and_notes`: neue Spalten `archived_at timestamptz` auf `markers` und `notes` plus Partial-Indizes. AURUM-Live ignoriert sie (backward-kompatibel).
* **Keine sichtbare AI** in ARGENTUM. LYNA/JOI-Bubbles entfernt; AURA bleibt als Hintergrund-Modul (Transkription) ohne UI.

---

## Inhaltsverzeichnis

0. Grundprinzip
1. Repo-Struktur ARGENTUM
2. Geteilte Infrastruktur (Supabase, Tunnels, .env)
3. Auth & Login-Flow
4. Markers — Datenfluss + Detail-Modal
5. Notizen — Datenfluss + Editor
6. Einstellungen — Sections + Admin-Modus
7. Archiv — Soft-Delete + 60-Tage-Cleanup
8. Mobile-Layout — Bottom-Nav + FAB + Safe-Area
9. Schema-Migration (Detail)
10. Was bewusst NICHT in v0.09
11. Offene Punkte / nach v0.09
12. Kritische Regeln

---

## 0. Grundprinzip

AURUM (Monolith) wurde im Diplomarbeits-Sprint zu ueberladen. ARGENTUM ist die saubere Re-Implementierung in komponentisierter Architektur. Beide nutzen dieselbe Datenbank, damit der Switch jederzeit moeglich ist: ein Eintrag in AURUM erscheint in ARGENTUM und umgekehrt. Sobald ARGENTUM Feature-Parity erreicht und stabil ist, uebernimmt es die `aurum.marcodemont.ch`-Subdomain (Build statt Vite-Dev), und AURUM wird archiviert.

**Regel:** AURUM wird in dieser Phase nicht mehr veraendert (Bats, HTML, AURUM/supabase-Migrations). Aenderungen passieren ausschliesslich in `ARGENTUM/`. Die Doku darf weiterlaufen (`documentation/`).

---

## 1. Repo-Struktur ARGENTUM

```
ARGENTUM/
├── index.html                  ← viewport-fit=cover, apple-mobile-web-app-capable
├── package.json
├── vite.config.ts              ← server.allowedHosts: argentum/aurum/.trycloudflare.com
├── src/
│   ├── App.tsx                 ← AppContent + Auth-Gate + handleLogout (Force-Auth-Screen)
│   ├── main.tsx
│   ├── index.css
│   ├── components/             ← shadcn/ui Primitives (Button, Card, …)
│   ├── modules/
│   │   ├── AURUM/              ← AURUM-Konzept-Code (Timeline, Notes, Settings)
│   │   │   ├── AurumCore.tsx   ← Top-/Mobile-Header, Routing, Marker-State
│   │   │   ├── Timeline.tsx    ← Day-/WeekView, MarkerRow im AURUM-Stil
│   │   │   ├── BottomNav.tsx   ← Mobile-only, Timeline | Sheets | Einstellungen + FAB
│   │   │   ├── NotesView.tsx   ← Liste + Editor-Modal
│   │   │   ├── SettingsView.tsx← Sections + Admin-Modus + ArchiveContent
│   │   │   ├── MarkerDetail.tsx← Modal je marker_type
│   │   │   ├── markers-api.ts  ← supabase.from('markers') CRUD + archive + cleanup
│   │   │   ├── notes-api.ts    ← supabase.from('notes') CRUD + archive + cleanup
│   │   │   ├── settings-api.ts ← supabase.from('user_settings') upsert
│   │   │   ├── useAdminMode.ts ← localStorage-backed Admin-Toggle
│   │   │   ├── types.ts        ← Marker (mit optionalen markerType/sub/audio*)
│   │   │   └── (alte Sheet/Layer-Components, ungenutzt nach v0.09 — Cleanup folgt)
│   │   ├── ARGENTUM/           ← ARGENTUM-eigenes Konzept (Surface/Flatten, eigene Spielwiese)
│   │   ├── auth/               ← AuthProvider (Supabase Auth)
│   │   ├── systems/            ← System-Switcher (AURUM | ARGENTUM Modes)
│   │   └── (LYNA/JOI/AURA-Reste — Figma-Ballast, beim naechsten Cleanup loeschen)
│   ├── utils/supabase/
│   │   ├── client.tsx          ← Singleton-Client
│   │   └── info.tsx            ← projectId + publicAnonKey (auf AURUMs Projekt)
│   └── ...
```

Strukturregel: alles AURUM-Konzept-bezogene unter `modules/AURUM/`, alles ARGENTUM-eigene unter `modules/ARGENTUM/`. Nicht zusammenlegen.

---

## 2. Geteilte Infrastruktur

### Supabase

* Project-URL: `https://jitkxxpuzmopcrfvzzlz.supabase.co`
* Publishable-Key: `sb_publishable_dUNie_zHEDP4PKdMgUO20Q_buLMANmM`
* Konfiguriert in `ARGENTUM/src/utils/supabase/info.tsx`. Bei Re-Extract des Figma-ZIPs ueberschreibt sich diese Datei zurueck auf den Figma-Default — dann wieder anpassen.
* Tabellen `markers`, `notes`, `user_settings`, Bucket `audio-markers` werden von beiden Tracks gelesen/geschrieben. RLS regelt Zugriff per `auth.uid()`.

### Cloudflare Tunnels

| Hostname                     | Tunnel    | Lokal              |
|------------------------------|-----------|--------------------|
| `aurum.marcodemont.ch`       | aurum     | `localhost:8006`   |
| `argentum.marcodemont.ch`    | argentum  | `localhost:8007`   |

Details siehe `documentation/environment-inventar.md`.

### Secrets / .env

Liegen am Projekt-Root (`.env`, `.env.example`). Wird von `server.js` automatisch gelesen. ARGENTUM-Frontend (Vite) liest aktuell keine LLM-Keys direkt; AI-Aufrufe gehen perspektivisch ueber Backend (server.js oder Supabase Edge Function) — niemals Keys im Browser.

---

## 3. Auth & Login-Flow

* `AuthProvider` (`src/modules/auth/AuthProvider.tsx`) wrappt die App, liefert `user`, `accessToken`, `signIn`, `signOut`.
* `App.tsx` zeigt `AurumAuthScreen` wenn nicht eingeloggt UND nicht in Demo-Mode. AURUM-System hat einen Demo-Mode (localStorage-basiert), ARGENTUM nicht.
* **Force-Auth-Screen-Bug behoben** in v0.09: in Demo-Mode war `signOut()` ein No-op, User sass fest. Neu setzt `handleLogout` ein Flag `forceAuthScreen=true`, das den Auth-Screen rendert. Das Flag reset-tet automatisch sobald ein User eingeloggt ist.
* In Mobile-Header und Settings ist der Button labeling-aware: zeigt **Login** im Demo-Mode, **Logout** wenn auth.

---

## 4. Markers — Datenfluss + Detail-Modal

### Lade-Logik (`AurumCore.tsx`)

* Wenn auth: `fetchMarkersForRange(today-31d, today+31d)` aus Supabase, Mapping via `mapRowToMarker`. Filtert `archived_at IS NULL`.
* Wenn nicht auth: localStorage-Demo-Fallback (alte ARGENTUM-Marker-Shape).
* Auto-Cleanup laeuft fire-and-forget direkt nach Load: `cleanupOldArchivedMarkers()` + `cleanupOldArchivedNotes()`.

### Anzeige (`Timeline.tsx`, `MarkerRow`)

AURUM-treues Layout im Day-View:

* Spalten-Grid `40px (Zeit) | 42px (Linie+Bubble) | 1fr (Content)`.
* **Anker** = 20×20 roter Kreis (`#b85555`) auf der Linie, **kein** Content rechts.
* **Audio/Compression/Planned** = 40×40 Squircle (border-radius 14px) in Typ-Farbe + Card rechts (uppercase Label, Bold-Titel, Body je Typ).
* Typ-Farben aus `MARKER_TYPE_COLORS`: anchor `#c4bca8`, audio `#b89668`, compression `#c08a7a`, planned `#b5c5d5`.
* Geplant + passed (Vergangenheit oder heute < jetzt): Border-Style solid statt dashed, Label/Titel durchgestrichen, opacity .6.
* Hintergrund: AURUMs `#faf5eb` (cream).

Week-View ist noch der alte Karten-Stil (Refactor auf Stunden-Track wie AURUM `renderWeekView` ist offen, siehe Punkt 11).

### Detail-Modal (`MarkerDetail.tsx`)

Klick auf einen Marker oeffnet das Modal (Bottom-Sheet auf Mobile, zentriert auf Desktop):

* Header: Typ-Label, Schliessen-X.
* Bubble (48×48) + Bold-Titel + Zeit/Datum mit Clock-Icon.
* **Body je Typ**:
  - Audio: HTML5-Player fuer `audio_url`, AURA-Summary-Card mit Gold-Linksrand, Transkript-Card.
  - Compression: Sub-Text.
  - Anker: Location-Chip.
  - Planned: grosser Done-Toggle (`is_done`-Toggle live in Supabase).
* Tags als Pills.
* **Footer**: **Archivieren** (grau) und **Endgueltig loeschen** (rot, mit Confirm).

### Admin-Modus: manuelle Anker-Erstellung

Da der Armreif noch nicht fertig ist, gibt es im Settings unter „Entwickler" einen Toggle „Admin-Modus" (lokal pro Geraet via localStorage, key `aurum_admin_mode`). Wenn an UND eingeloggt: in der Timeline-Header erscheint ein roter „Anker"-Button. Klick ruft `createAnchor()`, das per Supabase eine Anker-Marker-Zeile mit aktueller Zeit, heutigem Datum, `marker_type='anchor'`, `source='app'` einfuegt und die Markers neu laedt.

---

## 5. Notizen — Datenfluss + Editor

* `notes-api.ts`: `fetchNotes`, `fetchArchivedNotes`, `createNote`, `updateNote`, `deleteNote` (hard), `archiveNote`, `unarchiveNote`, `cleanupOldArchivedNotes`. Alle direkt gegen Supabase.
* `NotesView.tsx`: Liste mit Datum, Titel, 3-Zeilen-Vorschau, Tags, „verknuepft"-Badge wenn `marker_id` gesetzt. Click oeffnet `NoteEditor`. Mobile-FAB unten rechts fuer neue Notiz.
* `NoteEditor` (Modal): Titel-Input, Content-Textarea, Tags-Input (Komma-getrennt). Aktionen: **Speichern** (gold), **Archivieren** (grau), **Loeschen** (rot, mit Confirm).
* Tab-Label im Nav heisst weiterhin „Sheets" (User-Wunsch), die Daten sind Notes.

---

## 6. Einstellungen — Sections + Admin-Modus

`SettingsView.tsx` portiert AURUMs `s-settings` 1:1 plus Erweiterungen:

* **Geplante Marker**: Druckaufbau-Slider (10–60 s), Wiederholung-Select (Aus / 5 / 10 / 15 / 30 / 60 min). Werte schreiben/lesen `compression_seconds` und `repeat_interval_minutes` in `user_settings`.
* **Anker**: Geo-Lokalisierung-Toggle (`geo_enabled`).
* **Armreif**: Status-Anzeige (`ring_paired_id`-Snippet oder „Nicht gekoppelt"), Hinweis-Text.
* **Konto**: E-Mail-Anzeige (aus `useAuth().user.email`), Abmelden-Button (rot).
* **Entwickler**: Admin-Modus-Toggle (siehe Punkt 4).
* **Archiv**: Versteckte Section, ein Klick auf den Header klappt aus.

Live-Save: Toggle/Slider/Select rufen `upsertUserSettings(patch)` direkt — kein Save-Button.

---

## 7. Archiv — Soft-Delete + 60-Tage-Cleanup

### Konzept

Markers und Notes werden nicht hart geloescht, sondern bekommen einen `archived_at`-Timestamp (Soft-Delete). Sie verschwinden aus Timeline/Notizen-Liste, sind im Archiv-Bereich der Settings sichtbar, koennen wiederhergestellt oder endgueltig geloescht werden. Auto-Hard-Delete nach 60 Tagen (Variant A: client-seitig beim Login).

### Sichtbarkeit

Bewusst kein eigener Nav-Tab. Archiv steckt unter Einstellungen → Archiv (kollabiert), damit es im Alltag nicht ablenkt.

### UI (`ArchiveContent` in `SettingsView.tsx`)

* Tabs **Marker (n)** und **Notizen (n)**.
* Pro Item: Typ-Dot (Marker) oder Titel-Snippet (Note), Datum, **Wiederherstellen** (Rotate-Icon, gold) und **Endgueltig loeschen** (Trash-Icon, rot, mit Confirm).
* Reload nach Aktion.

### Cleanup-Logik

* `cleanupOldArchivedMarkers(daysOld=60)` und `cleanupOldArchivedNotes(daysOld=60)` in den jeweiligen `*-api.ts`.
* `AurumCore` ruft beide direkt nach erfolgreichem Marker-Load auf (fire-and-forget). Logged Anzahl geloeschter Eintraege in die Console wenn > 0.
* Genauigkeit: nicht aufs Datum genau (laeuft nur bei App-Open). Reicht fuer Soft-Delete-Zweck.

---

## 8. Mobile-Layout — Bottom-Nav + FAB + Safe-Area

* `BottomNav.tsx`: fixed bottom, 3 Items (Timeline | Sheets | Einstellungen), Safe-Area-Padding (`env(safe-area-inset-bottom)`).
* **FAB** rechts unten (gold, 56×56) sichtbar nur in Timeline-View, oeffnet `CreateMarker`-Modal.
* Desktop-Top-Nav: nur ≥`md` (768px), versteckt auf Mobile.
* Mobile-Header: 48-px-Strip mit Logo + Login/Logout-Icon.
* Timeline-Header auf Mobile entschlackt: Toggle-Buttons nur Icons, Datum kompakt formatiert (Wochentag + 2-stellig Tag).
* `index.html`: `viewport-fit=cover`, `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=default`, `theme-color=#fef3c7`.

---

## 9. Schema-Migration (Detail)

Migration-Name: `add_archived_at_to_markers_and_notes` (deployed via Supabase MCP am 2026-04-20).

```sql
alter table public.markers add column if not exists archived_at timestamptz;
alter table public.notes   add column if not exists archived_at timestamptz;

create index if not exists markers_archived_idx
  on public.markers (archived_at)
  where archived_at is not null;

create index if not exists notes_archived_idx
  on public.notes (archived_at)
  where archived_at is not null;
```

Backward-Kompatibilitaet: AURUMs Live-Code liest die Spalten nicht und schreibt sie nicht. Da nullable, werden bestehende Zeilen mit `archived_at = null` als „nicht archiviert" gewertet.

---

## 10. Was bewusst NICHT in v0.09

* **Markers in ARGENTUM erstellen**: `CreateMarker.tsx` schreibt aktuell noch in localStorage (Demo-Path). Erstellen via Supabase nur fuer Anker (Admin-Modus). Audio-/Compression-/Planned-Erstellung in ARGENTUM kommt in v0.10.
* **Audio-Aufnahme in ARGENTUM**: AURUM v0.08 hat MediaRecorder + Bucket-Upload. ARGENTUM kann audio_url nur abspielen (im Detail-Modal), nicht selbst aufnehmen.
* **WeekView mit Stunden-Track**: aktuell Karten-Liste. AURUM-Style 06–22h-Grid mit absolut positionierten Dots ist offen.
* **Edge-Function-Cleanup als Cron**: Variante B aus dem Plan. Aktuell Variante A (client-side beim Login). Wenn jemand 60 Tage offline ist, laufen Cleanups erst beim naechsten Login.
* **AI-Anbindung in ARGENTUM**: AURA-Modul ist da, aber noch nicht gewired. Provider-Code muss noch ueber Backend (server.js oder Edge Function) gehen.
* **Capacitor-Build von ARGENTUM**: nur AURUM ist fuer iOS/Android vorbereitet (v0.06). ARGENTUM laeuft als PWA via Cloudflare-Tunnel.
* **Cleanup der Figma-Reste**: LYNA/JOI/Bubble-Components, kv_store, Edge-Functions sind tot, Dateien liegen noch.

---

## 11. Offene Punkte / nach v0.09

* **WeekView refactor** auf Stunden-Track.
* **CreateMarker** schreibt in Supabase (alle 4 Typen), nicht nur Demo.
* **Audio-Aufnahme** in ARGENTUM (MediaRecorder + Bucket-Upload analog AURUM).
* **AI-Anbindung** (AURA-Transkription, ggf. weitere Provider via Edge Function).
* **Cleanup der toten Figma-Module** (LYNA/JOI/Bubbles/kv_store/etc.).
* **Marker-Notiz-Verknuepfung** UI (im Detail-Modal „Zur Notiz" Button, automatische Notiz-Erstellung bei Bedarf).

---

## 12. Kritische Regeln

* AURUM (`AURUM/`, `AURUM.bat`) wird nicht angefasst. Aenderungen passieren ausschliesslich in `ARGENTUM/`.
* Doku in `documentation/` darf weiterlaufen (Versions-Doku, Inventar, DNS).
* Schema-Migrationen sind erlaubt — sie sind shared infrastructure, keine AURUM-Code-Aenderung. Backward-kompatibel halten.
* `ARGENTUM/src/utils/supabase/info.tsx` muss auf AURUMs Projekt zeigen, sonst getrennte User. Nach Re-Extract des Figma-ZIPs neu setzen.
* Keine sichtbare AI-UI in ARGENTUM. AURA bleibt als Hintergrund-Modul ohne Widget.
* `modules/AURUM/` und `modules/ARGENTUM/` getrennt halten — beide repraesentieren ein eigenes Konzept.
