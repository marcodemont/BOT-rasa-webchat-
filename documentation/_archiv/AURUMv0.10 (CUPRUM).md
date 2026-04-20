## | AURUM | Version

# AURUM v0.10 (CUPRUM)

Saubere Neuauflage im modernen Stack. Parallel zu AURUM (Monolith-HTML, Live-Stand) und ARGENTUM (Figma-Export zum Experimentieren) entsteht mit CUPRUM die dritte Spur: dieselbe App, derselbe Benutzer, dieselben Daten, aber technisch neu aufgesetzt. Inhaltliches Konzept bleibt AURUM, technische Substanz kommt aus ARGENTUM.

* Version: v0.10
* Ordner: `CUPRUM/`
* Starter: `CUPRUM.bat` (Root)
* Port: 8008
* Tunnel: `cuprum.marcodemont.ch` (Cloudflare, UUID `8baf2db6-a903-44a8-83ea-51922f6e25f0`)
* Status: aktiv, initialer Stand lauffaehig. Nachfolger offen.
* Scope: Erst-Aufsatz mit Timeline, CreateMarker-Wizard, MarkerDetail, Notes, Settings, Welcome-Onboarding und Auth. BLE-Adapter portiert, aber ohne sichtbares Pairing-UI.

Gegenueber AURUM v0.06 und dem ersten CUPRUM-Anlauf gelten folgende grundlegende Aenderungen:

* **Stack:** React 18 + TypeScript + Vite 6 + Tailwind v4 + shadcn/ui (Radix-Primitives) + `@supabase/supabase-js`. Ersetzt den Vanilla-JS-Monolith-Ansatz von AURUM und den undifferenzierten 360-Packages-Wildwuchs von ARGENTUM.
* **UI-Substanz aus ARGENTUM:** Lucide-Icons, shadcn-Komponenten (Button, Sheet, Dialog, Slider, Switch, Card, Input, Textarea, Label, Badge, Tabs, ScrollArea), Timeline-Logik mit Day/Week-Toggle und recurring-Filter, CreateMarker als 4-Step-Wizard, fixed BottomNav mit FAB.
* **Konzept-Filter aus AURUM:** die vier Marker-Typen (Anker, Audiomarker, Kompression, Geplant), Schweizer Orthographie, keine Push-Notifications, keine Gamification, Audio-Upload in Supabase-Storage-Bucket `audio-markers`, geteiltes Supabase-Projekt mit AURUM.
* **Kein Code-Duplikat zu AURUM:** CUPRUM lebt komplett im Ordner `CUPRUM/`, importiert nichts aus `AURUM/` oder `ARGENTUM/`.

---

## Inhaltsverzeichnis

0. Grundprinzip
1. Warum CUPRUM
2. Stack
3. Verzeichnisstruktur
4. Datenebene
5. UI-Inventar
6. Was funktioniert
7. Was offen bleibt
8. Starter und Tunnel
9. Kritische Regeln
10. Verhaeltnis zu AURUM und ARGENTUM
11. Kurzfassung

---

## 0. Grundprinzip

AURUM ist das Konzept, CUPRUM ist der Code. Die App speichert, die KI transkribiert, die Entscheidungen bleiben beim Nutzer. CUPRUM uebersetzt diese Leitidee in einen wartbaren React-Baum ohne die Altlasten des Monolith-HTML und ohne den Export-Ballast von ARGENTUM.

---

## 1. Warum CUPRUM

* **AURUM (Monolith-HTML):** 2841 Zeilen in einer Datei. Produktiv nutzbar, aber kaum erweiterbar ohne die Datei zu brechen. Bleibt als Live-Stand eingefroren.
* **ARGENTUM (Figma-Export):** 360 npm-Pakete, 47 Modul-Ordner, viele Duplikat-Dateien (`-1.tsx`, `alt...`). Gute Bausteine, aber zu unuebersichtlich fuer Produktion.
* **CUPRUM:** Dritte Spur, bewusst schlank. Uebernimmt, was in ARGENTUM gut ist (Komponenten-Qualitaet, Lucide-Icons, shadcn), und was in AURUM gut ist (Konzept, Datenmodell, Schweizer Orthographie). Laesst weg, was stoert (Sheets/Layers/Archive aus ARGENTUM, weil nicht im AURUM-Konzept).

---

## 2. Stack

```
react            ^18.3.1
react-dom        ^18.3.1
@supabase/supabase-js   ^2.45.4
lucide-react     ^0.487.0
@radix-ui/react-dialog, -label, -scroll-area, -select, -slider,
  -slot, -switch, -tabs, -tooltip
class-variance-authority, clsx, tailwind-merge, tw-animate-css

vite             ^6.0.0
@vitejs/plugin-react
typescript       ^5.4.0
tailwindcss      ^4.0.0
@tailwindcss/vite
```

Total 295 Pakete (inkl. transitive). Vite-Build: 1735 Module, 488 kB JS / 144 kB gzipped, 46 kB CSS / 8 kB gzipped, 3.2 s.

---

## 3. Verzeichnisstruktur

```
CUPRUM/
├── index.html
├── package.json
├── vite.config.ts                 port 8008, strictPort, allowedHosts *.marcodemont.ch
├── tsconfig.json, tsconfig.node.json
├── .gitignore, .npmrc
├── public/
│   ├── icon.svg
│   ├── manifest.webmanifest
│   └── sw.js                      App-Shell-Cache, nur in Production aktiv
├── src/
│   ├── main.tsx                   Einstiegspunkt, SW-Register
│   ├── App.tsx                    supabase.auth.onAuthStateChange, Auto-Routing
│   ├── index.css                  Tailwind v4, AURUM-Theme, shadcn-Mapping
│   ├── vite-env.d.ts
│   ├── components/ui/             shadcn-Primitives (button, input, textarea,
│   │                              dialog, sheet, slider, switch, label, badge,
│   │                              card, tabs, scroll-area, utils mit cn)
│   ├── lib/
│   │   ├── config.ts              SUPABASE_URL, SUPABASE_KEY (gleich wie AURUM),
│   │   │                          STORAGE_BUCKET, APP_VERSION, APP_NAME
│   │   ├── supabase-client.ts     @supabase/supabase-js Client, Auto-Refresh
│   │   ├── audio.ts               MediaRecorder-Wrapper, Auto-Stop nach 20 s,
│   │   │                          suggestTagsFromTranscript, blobToBase64
│   │   ├── geo.ts                 captureLocationSnapshot
│   │   └── ble-ring.ts            Web-Bluetooth + Capacitor-BLE-Adapter,
│   │                              identisches Protokoll wie AURUM-Original
│   ├── modules/aurum/
│   │   ├── types.ts               Marker, Note, UserSettings, MarkerType
│   │   ├── markers-api.ts         fetchMarkersForRange, createMarker,
│   │   │                          updateMarker, deleteMarker, uploadAudio,
│   │   │                          signedAudioUrl, MARKER_TYPE_COLORS/LABELS
│   │   ├── notes-api.ts           CRUD
│   │   ├── settings-api.ts        fetchSettings, saveSettings (Upsert)
│   │   ├── useAdminMode.ts        localStorage cuprum_admin_mode
│   │   ├── BottomNav.tsx          fixed bottom + FAB, safe-area-inset-bottom
│   │   ├── Timeline.tsx           Day/Week-Toggle, Datums-Navigation, KW,
│   │   │                          recurring-Filter, MarkerRow mit Anker-rot,
│   │   │                          WeekMarkerCard
│   │   ├── CreateMarker.tsx       4-Step-Wizard (Typ -> Inhalt -> Zeit ->
│   │   │                          Bestaetigen), Progress-Bar, Anker und
│   │   │                          Kompression sind Sofort-Buttons
│   │   ├── MarkerDetail.tsx       Bottom-Sheet, typ-spezifischer Inhalt,
│   │   │                          Audio-Player, Tag-Editor, Loeschen
│   │   ├── NotesView.tsx          Liste + Editor in einer Komponente, Suche
│   │   ├── SettingsView.tsx       Cards fuer Geplant/Anker/Modus/Ring/Konto/
│   │   │                          Geraet, Slider, Switch, Ring-Log
│   │   ├── AuthScreen.tsx         Login/Signup mit AURUM-Branding
│   │   ├── WelcomeScreen.tsx      4-Karten-Onboarding beim Erststart
│   │   └── AurumCore.tsx          App-Shell, Realtime-Subscription auf markers
│   └── supabase/
│       └── schema.sql             konsolidierter Endzustand (Dokumentation)
└── README.md
```

---

## 4. Datenebene

Gleiche Supabase-Instanz wie AURUM, keine zweite Instanz fuer CUPRUM. Projekt-URL und Publishable-Key sind in `src/lib/config.ts` hart gesetzt, identisch zu AURUMs `SUPABASE_URL` und `SUPABASE_KEY`. Damit:

* Gleicher Account funktioniert in AURUM und CUPRUM.
* Marker und Notizen erscheinen in beiden Apps.
* `markers.source` bleibt `'app'` fuer CUPRUM-Eintraege.
* Storage-Bucket `audio-markers` wird von beiden Apps geteilt.

Tabellen und Policies unveraendert gegenueber AURUM v0.08. Konsolidierter Endzustand in `CUPRUM/supabase/schema.sql`.

Supabase-Session wird ueber den offiziellen Client in `localStorage` persistiert (Key `sb-*-auth-token`). Token-Refresh laeuft automatisch.

Realtime-Subscription auf die `markers`-Tabelle: AurumCore meldet sich beim Supabase-Realtime-Channel an, jeder Insert/Update/Delete triggert ein `loadMarkers()`. Faellt still zurueck, wenn Realtime nicht verfuegbar.

---

## 5. UI-Inventar

**Screens:**
* AuthScreen (Login, Registrierung, Bestaetigungsmail-Hinweis)
* Timeline (Tages- und Wochenansicht, Datums-Navigation, KW-Anzeige, Heute-Button)
* NotesView (Liste + Editor, Suche, Tags)
* SettingsView (Geplante Marker, Anker/Geo, Admin-Modus, Ring-BLE, Konto, Geraete-Reset)
* MarkerDetail (Bottom-Sheet, typ-spezifisch)
* WelcomeScreen (4 Karten, einmalig)

**Komponenten:**
* BottomNav fixed bottom, safe-area-respektiert, FAB ueber der Nav
* 4-Step-Wizard CreateMarker: Anker und Kompression fallen heraus und werden sofort gesetzt, Audiomarker und Termin/Ereignis durchlaufen alle Schritte
* Timeline-MarkerRow: 40px Zeit, 42px Track mit vertikaler Linie, Bubble-Squircle (40x40) mit Lucide-Icon, Anker als roter Punkt ohne Card
* Timeline-WeekView: 7 Karten nebeneinander, pro Tag kleine Marker-Cards

**Stilprinzipien:**
* Pastell-Cream Hintergrund (`#faf5eb`), goldene Akzente (`#b89668`, `#9a7d52`), Marker-Typ-Farben (anchor #c4bca8, audio #b89668, compression #c08a7a, planned #b5c5d5, event #94b2a1)
* Anker-Rot als Akzent fuer sofort gesetzte Marker (`#b85555`)
* Abgerundete Rechtecke, keine harten Ecken
* Lucide-Icons in Strichstaerke 2

**Admin-/Praesentationsmodus:** `body.admin-mode`-Klasse, gesteuert ueber `useAdminMode`. Blendet Ring-Sektion, Anker-Button in der Timeline, Versionsangabe aus.

---

## 6. Was funktioniert

* Login und Registrierung ueber Supabase Auth (geteilter Account mit AURUM)
* Timeline mit Day/Week-Toggle, Datums-Navigation (Pfeile, Heute), KW-Anzeige, recurring-Filter
* Vier Marker-Typen erstellen:
  * Anker: ein Klick, sofort mit Geolocation
  * Audiomarker: Wizard mit MediaRecorder-Aufnahme, Upload in Supabase Storage, optionales Transkript und Zusammenfassung
  * Termin / Ereignis: Wizard mit Titel, Details, Zeit, Druckaufbau-Sekunden, Wiederholungs-Intervall
  * Kompression: ein Klick, sofort mit gespeicherter Druckaufbau-Dauer
* Marker-Detail als Bottom-Sheet, typ-spezifisch, mit signierter Audio-URL, Tag-Editor, Loeschen
* Notizen-Ansicht mit Liste, Editor, Tags, Suche, optional mit Marker verknuepft
* Settings: Druckaufbau-Slider, Wiederholung, Geo-Switch, Admin-Modus-Switch, Ring-UUIDs, Konto (Abmelden), Geraete-Reset
* Welcome-Onboarding beim ersten Start, speichert `cuprum_welcome_seen=1`
* Admin-/Praesentationsmodus mit `.admin-only`-Klasse und `useAdminMode`
* Geraete-Reset: loescht alle lokalen `cuprum_*` und `sb-*` Keys, danach Reload. Daten in Supabase bleiben.
* PWA-Manifest, Service Worker (nur in Production-Build aktiv)
* BLE-Adapter portiert (Web Bluetooth + Capacitor-Fallback), mit Pairing-UI in den Einstellungen unter Admin-Modus
* Realtime-Subscription auf markers-Tabelle
* Cloudflare-Tunnel `cuprum.marcodemont.ch`, Pairing auf `localhost:8008`

---

## 7. Was offen bleibt

* **AURA-Transkription:** Supabase Edge Function gegen Whisper. Felder `transcript` und `summary` sind vorbereitet, laufen aktuell manuell.
* **Reverse-Geocoding:** Koordinaten zu lesbarem Ort. Feld `location_label` wird aktuell mit Zahlen befuellt.
* **Wochen- und Monatsuebersicht der Marker-Dichte:** als eigene Ansicht, nicht nur als Wochenstreifen.
* **Capacitor-Wrap fuer iOS:** blockiert ohne macOS. BLE-Plugin ist schon vorgesehen.
* **Notizen-Navigation aus MarkerDetail:** aktuell zeigt der Button nur einen Hinweis und legt bei Bedarf eine Notiz an. Direkter Tab-Sprung mit Fokus auf die angelegte Notiz fehlt.
* **Realtime-Reaktivitaet in NotesView und SettingsView:** aktuell laedt nur die Timeline auf Realtime-Events neu.
* **Tests:** keine Unit- oder E2E-Tests angelegt.
* **Konsolidierung:** sobald CUPRUM sich bewaehrt hat, Umstieg auf CUPRUM als Live-Stand und Einfrieren von AURUM als historisch.

---

## 8. Starter und Tunnel

**`CUPRUM.bat` auf Root-Ebene:**
* Wechselt in `CUPRUM/`
* Prueft Node.js im PATH
* Installiert Dependencies automatisch beim ersten Start (`npm install` wenn `node_modules/` fehlt)
* Prueft Port 8008 vor Vite-Start: wenn belegt, sichtbarer Fehler mit PID und Abbruch (Vite haette sonst still auf 8009/8010 ausweichen koennen, der Tunnel wuerde ins Leere zeigen)
* Startet Cloudflare-Tunnel in separatem Fenster, wenn `~/.cloudflared/cuprum.yml` existiert
* Startet Vite mit `--port 8008 --host --strictPort`
* Oeffnet Browser auf `http://localhost:8008/`

**Tunnel-Setup (einmalig):**
```
cloudflared tunnel create cuprum
cloudflared tunnel route dns cuprum cuprum.marcodemont.ch
```
Dann `~/.cloudflared/cuprum.yml` mit Tunnel-Name, Credentials-File und Ingress auf `http://localhost:8008`. Danach startet der Tunnel automatisch mit dem BAT.

Details siehe `CUPRUM/README.md`.

---

## 9. Kritische Regeln

Architektonische Leitplanken fuer CUPRUM:

1. **Standalone-Ordner.** `CUPRUM/` importiert nichts aus `AURUM/` oder `ARGENTUM/`. Alle Dependencies sind in `CUPRUM/package.json`.
2. **Konzept kommt von AURUM.** Schweizer Orthographie, keine Em-Dashes, keine Push, keine Gamification, vier Marker-Typen, Ruhe vor Features.
3. **Substanz kommt von ARGENTUM.** shadcn-Primitives, Lucide-Icons, Tailwind v4. Keine Eigenbauten, wo ARGENTUM schon etwas ausgereiftes hat.
4. **Kein API-Key im Browser-Code.** Publishable-Key von Supabase ist gewollt im Client-Code, alle Service-Role-Keys und OpenAI-Keys gehoeren in Edge Function Secrets.
5. **Admin-Modus ist keine Security-Schicht.** Nur Sichtbarkeit. Keine Geheimnisse dahinter.
6. **Geraete-Reset loescht nur lokales.** Supabase-Daten bleiben unter allen Umstaenden.
7. **Port 8008 strict.** Kein Fallback auf 8009/8010, sonst zeigt der Tunnel ins Leere. BAT bricht mit klarer Meldung ab, wenn Port belegt ist.
8. **Vite allowedHosts als Wildcard.** `.marcodemont.ch` und `.trycloudflare.com`. Damit iPhone-Safari den Custom-Host nicht blockt.

---

## 10. Verhaeltnis zu AURUM und ARGENTUM

| Spur | Rolle | Stack | Port | Subdomain |
|---|---|---|---|---|
| AURUM | Live-Stand, eingefroren | Vanilla-JS Monolith-HTML | 8006 | aurum.marcodemont.ch |
| ARGENTUM | Experimentier-Spur, Figma-Export | React + TS + Vite + 360 Packages | 8007 | argentum.marcodemont.ch |
| CUPRUM | Neuer Live-Stand-Kandidat | React + TS + Vite + schlank | 8008 | cuprum.marcodemont.ch |

Alle drei laufen parallel auf demselben Laptop, alle drei zeigen auf dasselbe Supabase-Projekt, alle drei sind auf dem iPhone installierbar.

Migrationspfad: wenn CUPRUM sich in mehreren Wochen Nutzung bewaehrt, wird AURUM als historische Referenz archiviert, ARGENTUM bleibt Experimentier-Spur und CUPRUM wird zum `AURUM/`-Ordner umbenannt. Aktuell noch Parallelbetrieb.

---

## 11. Kurzfassung

v0.10 ist der Schnitt. AURUM bleibt als Monolith bestehen, ARGENTUM bleibt als Baustelle, CUPRUM wird zur sauberen Fassung. Gleicher Supabase-Account, gleiche Daten, gleiche Marker-Typen, gleiche Tonalitaet, aber React-Komponenten statt 2800 Zeilen HTML und 14 Pakete statt 360. Der Stack ist schlank genug, um wartbar zu bleiben, und reich genug, um shadcn-Qualitaet zu haben.

Naechste Schritte: AURA-Transkription als Edge Function, Reverse-Geocoding, Monatsuebersicht. Capacitor, sobald macOS-Zugriff da ist.
