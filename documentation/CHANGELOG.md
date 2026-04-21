# CHANGELOG

## v0.12

- **Struktur-Release nach v0.11.** Zielpfad `AURUM/src/modules/aurum/`
  im Repo physisch aufgebaut und mit den zentralen Moduldateien
  befuellt.
- **AURUM/CUPRUM-Scaffold angelegt.** Basisordner fuer
  `src/components`, `src/state`, `src/lib`, `src/modules/aurum`,
  `public`, `supabase` sowie `migration/unsorted-root` als Sammelort
  fuer unsortierte Uploads.
- **GitHub-Testbetrieb vorbereitet.** Geplante Cloudflare-Tunnel-Slots
  via Actions-Workflow plus `@claude`-Workflow fuer Repo-Interaktion.
- **Hostname-Basis aktualisiert.** `aurum.me.marcodemont.ch` in
  Dev-/Start-Kontext hinterlegt, damit Tests ueber den Named Tunnel
  stabil auf demselben Host laufen.

## v0.09

- **ARGENTUM-Track aktiviert.** React/Vite/Tailwind-Implementierung
  parallel zu AURUM (Monolith-HTML), eigene Subdomain
  `argentum.marcodemont.ch` auf Port 8007. AURUM bleibt eingefroren auf
  `aurum.marcodemont.ch`. Beide Tracks teilen Supabase, also dieselben
  User, dieselbe `markers`/`notes`/`user_settings`-Tabelle.
- **Geteiltes Supabase-Projekt.** ARGENTUM zeigte im Figma-Default auf
  ein Fremd-Projekt; umgestellt auf AURUMs `jitkxxpuzmopcrfvzzlz`.
- **Schema-Migration `add_archived_at_to_markers_and_notes`**: neue
  Spalte `archived_at timestamptz` auf `markers` und `notes` plus
  Partial-Indizes. Backward-kompatibel — AURUM ignoriert die Spalte.
- **Timeline (Day-View) im AURUM-Stil**: Cream-BG, Anker als kleiner
  roter Kreis ohne Card, Audio/Compression/Planned als 40x40 Squircle
  mit Card rechts in Typ-Farben (`#c4bca8`/`#b89668`/`#c08a7a`/`#b5c5d5`).
  Geplant + passed = solid statt dashed Border, Titel durchgestrichen.
- **Marker-Detail-Modal** (`MarkerDetail.tsx`): typ-spezifische Layouts,
  Audio-Player fuer `audio_url`, AURA-Summary-Card, Transkript,
  Done-Toggle fuer planned. Aktionen: Archivieren, Endgueltig loeschen.
- **Notizen** (`NotesView.tsx`): Liste + Editor-Modal mit Titel,
  Content, Tags. Speichern/Archivieren/Loeschen direkt in Supabase
  `notes`-Tabelle.
- **Einstellungen** (`SettingsView.tsx`) ersetzt das alte „Archive"-Tab.
  Sections analog AURUM (Geplante Marker, Anker, Armreif, Konto) plus
  „Entwickler" mit Admin-Modus-Toggle. Live-Save in `user_settings`.
- **Admin-Modus** (lokal pro Geraet, localStorage): schaltet einen
  „Anker"-Button in der Timeline frei, der manuell einen Anker-Marker
  in Supabase einfuegt — Hardware-Workaround bis Armreif fertig ist.
- **Archiv-Bereich** ganz unten in den Einstellungen, kollabiert.
  Tabs Marker / Notizen, Wiederherstellen, Endgueltig loeschen.
  Auto-Hard-Delete nach 60 Tagen client-seitig beim Login (Variant A).
- **Mobile-Layout (Bildschirmerkennung).** Bottom-Nav (Timeline |
  Sheets | Einstellungen) + FAB nur < md. Top-Nav nur >= md. iOS
  Safe-Area-Insets, `viewport-fit=cover`, `apple-mobile-web-app-capable`.
- **AI-Bubbles entfernt** (LYNA/JOI). AURA bleibt als Hintergrund-Modul
  ohne UI. Browser-Tab-Title in `ARGENTUM/index.html` auf „Argentum".
- **Force-Auth-Screen-Bug behoben**: aus dem Demo-Mode konnte sich der
  User nicht zum Login bewegen, weil `signOut` im no-session-Zustand
  no-op war. Neuer `forceAuthScreen`-Flag im `App.tsx` triggert den
  Auth-Screen, reset-tet sich automatisch nach erfolgreichem Login.
- **`.env` an Projekt-Root** verschoben (war in
  `documentation/diverses/`), damit `server.js` sie liest. Anthropic-
  und Venice-Stubs durch echte Keys ersetzt. `.env.example` als
  Template ergaenzt.
- **Vite-`allowedHosts`** in `ARGENTUM/vite.config.ts` ergaenzt,
  `open: true` entfernt (Browser oeffnete sich doppelt).

## v0.08

- **Echte Audio-Aufnahme** im Browser via MediaRecorder. Mic-Permission
  wird beim ersten Klick auf den Aufnahme-Button angefordert. Auto-Stop
  nach 5 Minuten als Sicherheitsnetz. Live-Pegelanzeige waehrend der
  Aufnahme. Vorhoer- und Verwerf-Aktionen vor dem Speichern.
- **Audio-Upload** in den Supabase-Storage-Bucket `audio-markers`.
  Pfad-Konvention `<user_id>/<marker_id>.<ext>`. Format wird automatisch
  gewaehlt (Safari: `.m4a`/AAC, Chrome: `.webm`/Opus).
- **Marker-Detail-Screen (V1)** mit typ-spezifischen Layouts. Klick auf
  einen Marker oeffnet jetzt diesen Screen statt direkt die Notiz. Von
  dort fuehrt ein Button zur verknuepften Notiz oder legt eine neue an.
  Audiomarker zeigen Player, AURA-Zusammenfassung, Transkript und Tags;
  Anker zeigen Ort; geplante Marker zeigen Status mit Done-Toggle;
  Kompressionen zeigen den Ausloeser. Marker koennen aus dem Detail
  geloescht werden.
- **Geolocation am Anker**: Beim Setzen eines Ankers werden Koordinaten
  via `navigator.geolocation` gespeichert, wenn die Einstellung aktiv
  ist und der Nutzer den Standort freigibt. Reverse-Geocoding zu einem
  Ortsnamen kommt spaeter ueber AURA.
- **Einstellungs-Screen** (`s-settings`) statt Logout-Confirm:
  Druckaufbau-Dauer (10-60 s, Slider), Wiederholungs-Intervall (aus
  oder 5/10/15/30/60 min), Geolocation an/aus, Konto-Info, Abmelden.
  Werte landen in der neuen Tabelle `user_settings`.
- **PWA-Manifest und Service Worker**: App ist jetzt installierbar
  (iPhone Safari → Teilen → "Zum Home-Bildschirm"). Vollbild-Modus
  ohne Telefonrahmen. App-Shell wird offline ausgeliefert, Supabase-
  Anfragen laufen weiterhin live.
- **Schema-Migration 04**: `markers` um `latitude`, `longitude`,
  `location_label`, `audio_path`, `summary`, `source` erweitert. Neue
  Tabelle `user_settings`. Storage-Policies fuer den Audio-Bucket.
- **Source-Feld** unterscheidet Marker, die aus der App entstehen
  (`source='app'`) von denen, die aus dem Ring kommen (`source='ring'`).
  Aktuell wird nur 'app' geschrieben, das Ring-Feld ist Vorbereitung.
- Kleine Korrektur: Tag-Anzeige escaped jetzt HTML, beugt XSS bei
  Sonderzeichen vor.

## v0.07

- Hybrid-Storage: Session funktioniert jetzt in Claude-Artifacts
  (`window.storage`) und im normalen Browser (`localStorage`).

## v0.06

- Begriffssystem nach Konzept durchgezogen: *Anker*, *Audiomarker*,
  *Kompression*, *Geplanter Marker*.
- Structured-Aufgabenflow entfernt, stattdessen Bottom-Sheet mit den
  vier Marker-Typen am FAB.
- Anker als minimale Darstellung in der Timeline (nur Punkt plus
  Label), Audiomarker als Karte mit Transkript und Tags, Kompression
  mit eigener warmer Darstellung, geplanter Marker gestrichelt bis
  erreicht.
- Notizen als eigene Ebene mit eigenem Screen, Liste, Editor, Tags.
- Klick auf einen Marker oeffnet die verknuepfte Notiz oder legt eine
  neue mit Marker-Verknuepfung an.
- DB: neue `notes`-Tabelle, `markers.marker_type` erweitert um
  `anchor` und `planned`, Constraint angepasst.

## v0.05

- Login/Registrierung über Supabase Auth.
- `markers.user_id` eingeführt, Policies auf `auth.uid()` umgestellt.
- Session-Management mit automatischem Refresh bei 401.
- Logout über Einstellungen in der Bottom-Nav.

## v0.04

- Timeline lädt echte Daten aus Supabase statt aus hartkodiertem Array.
- Wochen-Anzeige dynamisch auf aktuelle Kalenderwoche.
- Neue Aufgaben werden tatsächlich in die DB geschrieben.
- Check-Toggle ist optimistisch mit Rollback bei Fehler.

## v0.03

- *AI* in der Bottom-Nav durch *Notizen* ersetzt (mit passendem
  Dokument-Icon).

## v0.02

- Farbwelt von Dark-Mode mit Coral auf helles Pastell-Cream mit
  goldenen Akzenten umgestellt, gemäss AURUM-Designprinzipien.
- Farbsystem als CSS-Variablen.
- Farbauswahl neu kuratiert: 7 harmonische Pastelle statt kräftiger
  Primärfarben.

## v0.01

- Ausgangspunkt: Klickdummy einer Tagesplaner-App im Structured-Stil,
  5 Screens, Vanilla JS, dunkles Theme, Coral-Akzent.
