# AURUM | Konzept v0.1

* Version: v0.1 (ueberarbeitet 2026-04-20 nach Begriffs-Saeuberung)
* Status: Aktive Fassung. Fruehere Fassungen sind geloescht.
* Scope: AURUM (App + Armreif + AURA) als Kern-Artefakt einer Diplomarbeit.

Dieses Dokument ist eigenstaendig lesbar. Es beschreibt die Leitidee, die Begriffe, die Regeln und die Architektur. Implementations-Stand steht in `AURUMv<version>.md`.

**Wichtig zu diesem Durchgang (2026-04-20):** Der frueher verwendete Sammelbegriff "Marker" ist ersatzlos entfernt. AURUM kennt **fuenf eigenstaendige Typen** plus **Notizen**. Technisch heisst die DB-Tabelle `events`, die TypeScript-Definition `TimelineEvent` — aber diese Namen tauchen im User-Interface nicht auf. Der User sieht nur die konkreten Typen.

---

## Inhaltsverzeichnis

0. Einordnung
1. Leitidee
2. Signal-System (kein Kalender)
3. Zwei Quellen (Armreif, App)
4. Rollen (User, Admin)
5. Die fuenf Typen
   * 5.1 Anker
   * 5.2 Audiomarker
   * 5.3 Kompression
   * 5.4 Termin
   * 5.5 Ereignis
6. Notiz
7. Armreif (zwei Buttons)
8. Archiv (Soft-Delete)
9. Die Timeline
10. AURA (KI-Schicht, still)
11. Hardware-Realitaet
12. Distribution in zwei Etappen
13. Versionsmodell
14. Datenmodell
15. Admin- und Praesentationsmodus
16. Geraete-Reset
17. Nutzungsablauf
18. Designprinzipien
19. UI-Bereiche
20. UI-Muster
21. Was bewusst nicht Teil des Systems ist
22. Kritische Regeln
23. Glossar
24. Kurzfassung

---

## 0. Einordnung

AURUM ist keine klassische App, sondern ein **zeitbasiertes Signal-System** mit nachgelagerter Kontextbildung. Die App ist das primaere Produkt. Sie erhaelt Signale von einem physischen Armreif, der im Moment den koerperlichen Input uebernimmt, und stellt sie als ruhige, strukturierende Schicht zwischen Wahrnehmung und Handlung dar.

---

## 1. Leitidee

Die App speichert und zeigt (AURUM), die KI transkribiert im Hintergrund (AURA), die Entscheidungen bleiben beim Nutzer, und die Praesenz im Moment gehoert dem Armreif.

---

## 2. Signal-System (kein Kalender)

AURUM ist im Kern **kein Kalender** und **kein Notiztool**, sondern ein **Signal-System mit nachgelagerter Kontextbildung**.

* Der Armreif ist die reale, unmittelbare Ebene. Hier entstehen Signale im Moment, ohne kognitive Belastung.
* Die App ist die Ebene der Planung und Reflexion. Hier werden Signale spaeter strukturiert, verstanden, in Bedeutung ueberfuehrt.

Der Nutzer erzeugt Realitaet primaer ueber den Armreif, nicht ueber die App. Die App dient dazu, diese Realitaet spaeter lesbar zu machen. Die strikte Trennung zwischen **Erleben** und **Auswerten** ist die Grundlage des gesamten Systems.

---

## 3. Zwei Quellen (Armreif, App)

**Zwei klar getrennte Quellen.** Die Trennung ist zentral und darf nicht vermischt werden.

### 3.1 Armreif — unmittelbar im Moment

* Anker
* Audiomarker
* Kompression (live gestartet)

### 3.2 App — bewusst, zeitversetzt

* Termin
* Ereignis
* Kompression (geplant)
* Notizen

Die App ist im Moment nicht noetig. Der Armreif benoetigt kein Telefon.

---

## 4. Rollen (User, Admin)

Zwei Rollen, funktional getrennt.

### 4.1 User

* Erfasst Anker, Audiomarker und Kompressions-Starts ausschliesslich am Armreif.
* In der App nur: **Termin, Ereignis, Kompression planen**.
* Anker und Audiomarker werden in der App nicht zum Anlegen angeboten.

### 4.2 Admin

* Darf zusaetzlich Anker, Audiomarker und Kompression in der App **simulieren** (Test- und Entwicklungs-Instanz, solange der Armreif fehlt).
* Sieht alle fuenf Typen im Erstellungs-Sheet.
* Sieht die Ring-Section und den Versionsfooter in den Einstellungen.

### 4.3 Stand der Implementierung (Prototyp)

Aktuell ist die Admin-Rolle ein **lokaler Toggle** pro Geraet (`localStorage['aurum_admin_mode']`) und auf jedem Account umschaltbar. Das ist bewusster Prototyp-/Praesentations-Stand.

Im spaeteren Produktions-Stand wird die Rolle account-gebunden (Server-seitig) und der Toggle verschwindet. Heute nicht Scope.

---

## 5. Die fuenf Typen

Jeder Typ ist eigenstaendig benannt. Es gibt keinen Sammelbegriff dazu.

### 5.1 Anker

* **Definition:** Markierung, dass ein Gedanke existiert. Kein Inhalt, nur die Existenz.
* **Quelle:** nur Armreif (Druckknopf, 1x kurz).
* **Zweck:** kognitive Entlastung im Moment, ohne dass der Nutzer in die Ausarbeitung gezwungen wird.
* **Datenumfang:** Zeit, optional Ort.
* **Timeline-Darstellung:** 20x20 roter Kreis (`#b85555`), ohne Content-Card.

### 5.2 Audiomarker

* **Definition:** Sprachaufnahme im Moment.
* **Quelle:** nur Armreif (Druckknopf, 2x kurz).
* **Datenumfang:** Zeit, Audio-Datei (Upload in Bucket `audio-markers`), optional Transkript.
* **Begleitung:** automatisch angelegte Notiz mit dem Transkript.
* **Timeline-Darstellung:** 40x40 Squircle in `#b89668`, Card rechts mit Vorschau.

### 5.3 Kompression

* **Definition:** Koerperlicher Eingriff am Armreif (gradueller Druckaufbau).
* **Zwei Wege:**
  * **App-geplant:** User legt in der App eine Kompression zu einem Termin an; Armreif startet automatisch zur Faelligkeitszeit; User stoppt mit dem Hebel.
  * **Armreif-initiiert:** User drueckt den Hebel hoch → Kompression startet sofort, Loslassen oder erneutes Betaetigen stoppt sie.
* **Datenumfang:** Start-Zeit, Dauer (Sekunden), Quelle (`app` oder `ring`).
* **Timeline-Darstellung:** 40x40 Squircle in `#c08a7a`, Card rechts.

### 5.4 Termin

* **Definition:** Geplanter Zeitpunkt mit Ring-Rueckmeldung bei Faelligkeit.
* **Quelle:** nur App.
* **Datenumfang:** Titel, Datum, Zeit (**Pflicht**), optional Details, Wiederholung, Kompressions-Sekunden.
* **Timeline-Darstellung:** 40x40 Squircle in `#b5c5d5`, dashed Border vor Faelligkeit, solid danach.

### 5.5 Ereignis

* **Definition:** Anlass oder Event mit Kontext, in der App festgehalten.
* **Quelle:** nur App.
* **Mit Zeit:** regulaerer Eintrag auf der Timeline (wie Termin, aber farblich gruen-grau `#94b2a1`, und ohne Ring-Druckaufbau als Default).
* **Ohne Zeit:** wird **automatisch als Notiz gespeichert**, nicht als Timeline-Eintrag. Die Notiz traegt den Hinweis "Spaeter Termin dazu setzen." Dies ist kein Fehler, sondern bewusster Zwischenzustand.

---

## 6. Notiz

* Freie Bedeutungsebene, in der App.
* Kann mit einem Timeline-Eintrag verknuepft sein (ueber `notes.event_id`) oder eigenstaendig.
* **Drei Entstehungs-Quellen:**
  1. Aus einem Audiomarker (automatisch, Transkript landet in der Notiz).
  2. Aus einem beliebigen Typ heraus (Button "Als Notiz weiterfuehren" im Detail).
  3. Aus einem Ereignis ohne Zeit (siehe 5.5).
* **Felder:** Titel, Inhalt, Tags, Verknuepfung.
* **UI-Label:** konsistent **"Notizen"** (nie "Sheets", nie "Marker").

---

## 7. Armreif (zwei Buttons)

**Button 1 | Druckknopf** (klassischer Klick)

* 1x kurz = Anker
* 2x kurz = Audiomarker

**Button 2 | Hebel mit Rueckstellung**

* Hebel hoch = Kompression starten
* Hebel loslassen = Kompression stoppen
* Waehrend laufender App-geplanter Kompression: Hebel betaetigen = Stop (Abbruch)

Die Haptik ist Teil der Botschaft: Button 1 ist mental und diskret, Button 2 ist koerperlich und regulierend. Die App nimmt die Unterscheidung ueber den Typ auf, nicht ueber Visualisierung.

---

## 8. Archiv (Soft-Delete)

### 8.1 Regel

Eintraege werden nicht hart geloescht, sondern bekommen einen `archived_at`-Timestamp. Sie verschwinden aus Timeline und Notizenliste, bleiben in Supabase gespeichert.

### 8.2 Auffindbarkeit

Archivierte Eintraege stehen im kollabierten Archiv-Bereich der Einstellungen. Kein eigener Nav-Tab, damit das Archiv im Alltag nicht ablenkt.

### 8.3 Aktionen

* **Wiederherstellen:** `archived_at = null`.
* **Endgueltig loeschen:** hartes Delete mit Confirm.

### 8.4 Auto-Cleanup

Eintraege aelter als 60 Tage werden beim Login client-seitig hart geloescht (fire-and-forget).

---

## 9. Die Timeline

Die Timeline ist **Rohprotokoll** von Zustaenden, Signalen und Reaktionen — kein Feed, keine Chronologie von Notizen.

### 9.1 Vier Perspektiven

* aktive Tagesstruktur
* Log (wann reagiert, wann nur markiert)
* somatisch gekoppelt (koerperliche Interaktionen sichtbar)
* Analysefeld (Mustererkennung ueber Zeit, kognitiv beim Nutzer)

### 9.2 Visuelle Auspraegung

| Typ | Darstellung |
|---|---|
| Anker | 20x20 roter Kreis auf der Linie, keine Card |
| Audiomarker | 40x40 Squircle `#b89668`, Card rechts |
| Kompression | 40x40 Squircle `#c08a7a`, Card rechts |
| Termin | 40x40 Squircle `#b5c5d5`, Card rechts, dashed vor Faelligkeit |
| Ereignis | 40x40 Squircle `#94b2a1`, Card rechts |

Hintergrund Cream `#faf5eb`. Spalten-Grid Day-View: `40px Zeit | 42px Linie+Bubble | 1fr Content`.

### 9.3 Wochen-Dots

Unter jedem Wochentag bis zu drei Dots (Audio, Kompression, Termin/Ereignis). Anker bewusst ausgeschlossen, weil zu haeufig.

### 9.4 Detail-Sheet

Klick auf einen Eintrag oeffnet ein Bottom-Sheet mit typ-spezifischem Body. Aktionen: Notiz (dynamischer Button "Als Notiz weiterfuehren" / "Notiz oeffnen"), Speichern (nur Audio), Loeschen.

---

## 10. AURA (KI-Schicht, still)

* **Hauptzweck:** Transkription des Audios via Whisper. Transkript landet direkt in der verknuepften Notiz.
* **Spaeter/optional:** Moment-Zusammenfassung, Auto-Tags (1–3), Verknuepfungsvorschlaege.
* **Keine UI.** Keine Chat-Bubbles, keine Floating-Buttons, kein "Frag den Assistenten"-Widget. AURA erscheint nur durch ihre Wirkung.
* **Keys:** niemals im Client-Code. Supabase Edge Function Secrets oder `server.js`.

---

## 11. Hardware-Realitaet

| Vorhanden | Nicht vorhanden |
|---|---|
| Windows-Laptop | macOS-Rechner |
| iPhone 16 Pro | Android-Geraet |
| iPhone 13 Pro | Apple-Developer-Account |
| iPad Pro 2018 | Armreif-Hardware |
| iPad Pro 2025 | |

Konsequenzen: Web Bluetooth ist auf keinem Test-Geraet verfuegbar. iOS-Capacitor-Build ist blockiert bis macOS. HTTPS ueber Cloudflare-Tunnel, aber Geolocation und Audio sind auf iOS-Tunnel-Routen fragil.

---

## 12. Distribution in zwei Etappen

### 12.1 Etappe 1 — PWA via Cloudflare-Tunnel

* AURUM auf Port 8006, `https://aurum.marcodemont.ch/`.
* iPhone ueber Safari + "Zum Home-Bildschirm".
* BLE nicht verfuegbar. Geolocation/Audio iOS-fragil.

### 12.2 Etappe 2 — Capacitor

* Sobald macOS-Zugriff: Xcode-Build, BLE-Plugin aktiv, native Permissions.
* Ein Code-Ort: `AURUM/src/`. Capacitor laedt denselben Build.

---

## 13. Versionsmodell

* `AURUM/src/modules/aurum/` ist der **einzige aktive Code-Ort**.
* Pro Aenderungsblock eine Datei `documentation/AURUMv<version>.md`.
* Konzept-Aenderungen landen hier in `CONCEPTv0.1.md` (wird in-place aktualisiert).
* `CHANGELOG.md` fuer konsolidierte Versions-Historie.

---

## 14. Datenmodell

### 14.1 Tabelle `events` (Supabase)

Spalten (Auswahl): `id`, `user_id`, `marker_date`, `start_time`, **`type`** (`anchor` | `audio` | `compression` | `termin` | `ereignis`), `title`, `sub`, `tags`, `latitude`, `longitude`, `location_label`, `audio_path`, `transcript`, `summary`, `color`, `source` (`app` | `ring`), `is_done`, `repeat`, `repeat_interval_minutes`, `compression_seconds`, `archived_at`.

Check-Constraint `events_type_check`: `type` auf die fuenf genannten Werte.

### 14.2 Tabelle `notes`

Spalten: `id`, `user_id`, `event_id` (FK auf `events.id`, nullable), `title`, `content`, `tags`, `archived_at`, Timestamps.

### 14.3 Storage

Bucket `audio-markers`, Public false, Pfad `<user_id>/<marker_date>/<timestamp>.<ext>`.

### 14.4 Lokale Persistenz

* **PWA:** `localStorage`. Keys mit Prefix `aurum_`.
* **Capacitor (spaeter):** `@capacitor/preferences`.

Lokale Keys:

* `aurum_session` — Auth (Supabase verwaltet meist selbst)
* `aurum_admin_mode` — Admin-Toggle, Default `'1'`
* `aurum_welcome_seen` — Welcome gesehen

---

## 15. Admin- und Praesentationsmodus

* Key: `localStorage['aurum_admin_mode']`, Default `'1'`.
* Hook: `useAdminMode()` in `src/modules/aurum/useAdminMode.ts`.
* Sichtbarkeits-Filter im Erstellungs-Sheet: Anker, Audiomarker, Kompression nur im Admin-Modus.
* Ring-Section und Versionsfooter in den Einstellungen haben Klasse `admin-only`.

Dieser Modus ist **keine Security-Schicht** im Prototyp-Stand. Er steuert Sichtbarkeit. Im spaeteren Produktionsstand wird die Rolle server-seitig.

---

## 16. Geraete-Reset

Button "Komplett zuruecksetzen" in den Einstellungen:

1. Confirm.
2. Alle Keys mit Prefix `aurum_` (und Legacy `cuprum_`, `sb-`) aus `localStorage` entfernen.
3. In-Memory-State zuruecksetzen.
4. `location.reload()`.

Supabase-Daten bleiben unberuehrt.

---

## 17. Nutzungsablauf

### 17.1 Im Moment (Armreif)

1. Button 1, 1x kurz → Anker.
2. Button 1, 2x kurz → Audiomarker, Aufnahme laeuft.
3. Button 2, Hebel hoch → Kompression startet. Loslassen → Stop.

### 17.2 Bei Faelligkeit (App-geplante Kompression)

1. Zeit erreicht → Armreif baut graduell Druck auf.
2. Nutzer kann Button 2 betaetigen → Abbruch.

### 17.3 Danach (App)

1. App oeffnen → Timeline zeigt letzte Eintraege.
2. Klick auf Eintrag → Detail-Sheet.
3. Bei Audiomarker: automatische Notiz mit Transkript.
4. Abends: Termine auf erledigt setzen, ggf. Eintrag oder Notiz archivieren.

---

## 18. Designprinzipien

### 18.1 Farbwelt (Cream, Default)

* Flaechen: `--bg-ambient #ebe3d3`, `--bg-screen #faf5eb`, `--bg-card #ffffff`, `--bg-subtle #f2ecdf`, `--bg-nav #f5efe2`
* Text: `--text-primary #2e2820`, `--text-secondary #7a7062`, `--text-tertiary #a89f8d`, `--text-quaternary #c4bca8`
* Akzent: `--gold #b89668`, `--gold-dark #9a7d52`, `--gold-soft #d4b88a`, `--gold-pale #ece0c6`
* Typ-Farben: anchor `#c4bca8` (Wochen-Dot), audio `#b89668`, compression `#c08a7a`, termin `#b5c5d5`, ereignis `#94b2a1`
* Rec-Akzent: `#b85555`

### 18.2 Formensprache

Kreise, Ovale, abgerundete Rechtecke (Squircle, border-radius 14px). Capsule-Form fuer CTA und Fortschritt. Keine harten Ecken.

### 18.3 Typografie

Logo Georgia-Serif, gespreizte Letters, Tagline "Verstehen · Erinnern · Ruhen". Tabular-Nums fuer Zeiten. Reduzierter Sekundaertext.

### 18.4 Sprache

**Schweizer Orthographie, kein Eszett, keine Em-Dashes.** Ruhig, analytisch, nicht werbend. Keine motivationalen Floskeln.

### 18.5 Interaktion

Direkte Manipulation, wenige Gesten. Ein Screen, eine Entscheidung. Live-Save in den Einstellungen (kein Save-Button).

---

## 19. UI-Bereiche

* **AuthScreen** — Login und Registrierung. Georgia-Logo, Tagline, E-Mail/Passwort, Gold-Primary-Button, Footer mit Version (admin-only).
* **Timeline** — Header mit Datum, Wochenstreifen, Day/Week-Toggle, Dots pro Tag, FAB rechts unten, im Admin-Modus zusaetzlicher "Anker jetzt setzen"-Shortcut.
* **Erstellungs-Sheet** — Wizard mit 4 Schritten (Typ, Inhalt, Zeit, Bestaetigen). User-Modus zeigt 3 Optionen, Admin-Modus 5.
* **Detail-Sheet** — Bottom-Sheet mit typ-spezifischem Body. Button "Als Notiz weiterfuehren" / "Notiz oeffnen".
* **Notizen** — Liste und Editor. Filter-Input, FAB, Tags.
* **Einstellungen** — Termine und Ereignisse, Anker/Ort (Geo-Toggle), Modus (Admin-Toggle), Ring (admin-only), Konto, Geraete-Reset.

---

## 20. UI-Muster

* **Scrollrad-Picker** — Ersatz fuer `input[type=time]`, Gold-Pille fuer aktiven Wert. Einsatzorte: Audiomarker-Zeit, Termin/Ereignis-Zeit.
* **Planned-Bottom-Sheet** — kompaktere Variante statt vollbildigem Screen.
* **Week-Strip-Dots** — bis zu drei Dots pro Tag, echte Marker-Farbe aus `color`-Feld.
* **Calendar-Bottom-Sheet** — Monatsgrid zum Datum-Springen, aktiviert per Tap auf das grosse Datum.
* **Bottom-Nav mit FAB** — Timeline / Notizen / Einstellungen.

---

## 21. Was bewusst nicht Teil des Systems ist

* klassisches Notiztool
* Tracking-System (keine Scores, kein Quantifizieren)
* aktiver KI-Assistent (AURA hat kein UI, agiert nie ungefragt)
* Gamification (keine Streaks, Trophies, Levels)
* Push-basiertes Remindersystem (Praesenz gehoert dem Armreif)
* kommerzielles Produkt mit Paywall
* Content-Feed (Timeline ist Rohprotokoll)
* Kalender

**Feste Regel:** Die App schickt nie Push-Notifications.

---

## 22. Kritische Regeln

1. **Kein Sammelbegriff "Marker"** im User-Interface oder in der Doku. Fuenf eigenstaendige Typen plus Notiz.
2. **Anker und Audiomarker sind Armreif-only** fuer normale User. In der App nur im Admin-Modus als Simulation.
3. **Ereignis ohne Zeit wird Notiz**, automatisch beim Speichern.
4. **Kompression hat doppelte Rolle** (Armreif-Instant oder App-geplant). Beides ist Teil des Designs.
5. **Kein API-Key im Client-Code.** Server-Keys in Edge Function Secrets oder `server.js`.
6. **Keine Push-Notifications.**
7. **AURA hat kein UI.**
8. **Schweizer Orthographie** (kein Eszett, keine Em-Dashes) in Code-Kommentaren, UI-Strings und Doku.
9. **Admin-Modus ist im Prototyp-Stand ein lokaler Toggle**, keine Security-Schicht.
10. **Geraete-Reset beruehrt nur Lokales.** Supabase-Daten bleiben.
11. **BLE kommt erst mit Capacitor.**
12. **Schema-Aenderungen sind shared infrastructure** — beim geteilten Supabase-Projekt (AURUM + CUPRUM) backward-kompatibel halten oder beide Tracks gleichzeitig migrieren.
13. **Tunnel-Hosts** in `vite.config.ts` unter `server.allowedHosts` eintragen, sonst blockt Vite.

---

## 23. Glossar

**AURUM** — das System als Ganzes (Produkt-Name), gleichzeitig der Name der Live-Codebase unter `AURUM/`.

**CUPRUM** — Werkstatt-Codebase, parallel zu AURUM, teilt sich das Supabase-Projekt.

**AURA** — die KI-Schicht. Transkription. Kein UI.

**Armreif** — das physische Objekt mit zwei Buttons (Druckknopf + Hebel).

**Anker** — Gedanken-Existenz-Markierung, nur Armreif.

**Audiomarker** — Sprachaufnahme am Armreif.

**Kompression** — Koerperlicher Eingriff am Armreif, startet per App-Plan oder Hebel.

**Termin** — Geplanter Zeitpunkt mit Zeit, in der App angelegt.

**Ereignis** — Anlass in der App. Ohne Zeit → Notiz.

**Notiz** — Bedeutungsebene, verknuepft oder frei.

**Timeline** — Ansicht der zeitlich geordneten Eintraege.

**Admin-Modus** — lokaler Sichtbarkeits-Schalter (Prototyp-Stand).

**Praesentations-Modus** — synonym zum Nicht-Admin-Modus.

**Geraete-Reset** — lokales Aufraeumen, Supabase bleibt.

**Capacitor** — Framework, wrappt Web-Code in native iOS-Shell.

**PWA** — Progressive Web App.

**Cloudflare-Tunnel** — lokaler Port als HTTPS-Subdomain. Configs in `~/.cloudflared/aurum.yml`, `cuprum.yml`.

**allowedHosts** — Vite-Feld, das den Tunnel-Hostname erlauben muss.

---

## 24. Kurzfassung

AURUM in v0.1 ist:

* ein zeitbasiertes **Signal-System** (kein Kalender, kein Notiztool)
* mit klarer Trennung zwischen **Moment** (Armreif) und **Reflexion** (App)
* mit **fuenf eigenstaendigen Typen** (Anker, Audiomarker, Kompression, Termin, Ereignis) plus **Notizen**
* **kein Sammelbegriff "Marker"** — weder in UI noch in der Sprache
* zwei Rollen (User, Admin), im Prototyp als lokaler Toggle
* Supabase-Backend, Soft-Delete-Archiv, Audio-Upload
* als PWA unter `aurum.marcodemont.ch` erreichbar, Capacitor vorbereitet fuer iOS
* ruhige, reduzierte Diplomarbeits-Scope — kein KI-Tool, kein Reminder-System, kein Gamification-Objekt
