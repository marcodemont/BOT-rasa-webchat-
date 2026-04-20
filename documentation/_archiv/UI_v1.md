# AURUM | UI-Analyse v1

- Version: v1 (2026-04-19)
- Status: Erste systematische Aufnahme des aktuellen AURUM-UI (v0.08) plus Vergleich mit den drei Referenz-Klonen auf Root-Ebene (`me+`, `Planwoo`, `Struktured`).
- Zweck: Grundlage fuer die Entscheidung, welche UI-Muster aus den Klonen in AURUM einfliessen. Keine Umsetzung, nur Einordnung.
- Bezug: `CONCEPT_v2.md` (Abschnitt 12).

---

## 1. Material im Clone-Ordner

| Ordner | Was es ist | Struktur | Fonts | Farbwelt |
|---|---|---|---|---|
| `.AURUM-neu/.AURUM/app/AURUM.html` | **Das echte AURUM v0.08.** Single-File PWA. | 1 HTML, 1595 Zeilen, CSS und JS inline | system-ui, Georgia (Logo) | Pastell-Cream `#faf5eb`, Gold `#b89668` |
| `me+/` | UI-Klon (wirkt wie Kopie der Structured-App), mit AURUM-Branding drueber | `index.html`, `app.css`, `app.js` | Outfit, Nunito | Dark, Coral `#f08c8a` |
| `Struktured/` | **Byte-identisch mit `me+`.** Doppelt. | gleiche Dateien | gleich | gleich |
| `Planwoo/` | UI-Klon einer widget-basierten Planner-App, mit AURUM-Branding | `index.html`, `app.css`, `app.js` | Nunito Sans | Light, Lila `#7566f3` |

Auffaelligkeit: `me+` und `Struktured` haben identisches CSS und identisches HTML. Entweder Kopie vergessen oder bewusst zweigleisig. Entscheidung offen, hat keine Auswirkung auf die Analyse.

---

## 2. Ist-Zustand AURUM v0.08

AURUM ist weiter, als der erste Eindruck vermuten laesst. Es existieren bereits sieben funktionale Screens plus ein Bottom-Sheet.

### 2.1 Farbsystem (CSS-Variablen)

- Flaechen: `--bg-ambient #ebe3d3`, `--bg-screen #faf5eb`, `--bg-card #ffffff`, `--bg-subtle #f2ecdf`, `--bg-nav #f5efe2`
- Text: `--text-primary #2e2820`, `--text-secondary #7a7062`, `--text-tertiary #a89f8d`, `--text-quaternary #c4bca8`
- Akzent: `--gold #b89668`, `--gold-dark #9a7d52`, `--gold-soft #d4b88a`, `--gold-pale #ece0c6`
- Marker-Typ-Farben: `--mt-anchor #c4bca8`, `--mt-audio #b89668`, `--mt-compression #c08a7a`, `--mt-planned #b5c5d5`
- Spezial: `--rec-red #b85555` (Audio-Aufnahme)

Das System ist konsistent, warm, entspricht dem Konzept „AURUM ist Gold". Jeder Marker-Typ hat eine eigene Farbe.

### 2.2 Screens im Detail

**`s-login`** | Login und Registrierung
- grosses AURUM-Logo in Georgia-Serif, gespreizte Letters, Tagline „Verstehen · Erinnern · Ruhen"
- zwei Felder (Email, Passwort), Primary-Button in Gold, Toggle-Link zu Signup
- Fehler- und OK-Meldungen im selben Platz
- Footer: „AURUM · DIPLOMARBEIT · v0.08"

**`s-main`** | Timeline
- Header: grosses Datum mit Gold-Jahr, darunter Wochenstreifen (Mo bis So)
- Wochenstreifen mit `wday-dots` Container (aktuell leer, vorbereitet fuer Marker-Dichte pro Tag)
- Heutiger Tag als Gold-Kreis, ausgewaehlter Tag als Outline
- Timeline-Scroll: pro Marker eine Zeile mit Stundenspalte links (44px), vertikaler Linie, Card-Wrap rechts
- Bottom-Nav: Timeline, Notizen, Einstellungen plus FAB (Plus) rechts, FAB schwebt ueber der Nav
- Bottom-Sheet fuer Marker-Typ-Auswahl: vier Optionen (Anker, Audiomarker, Geplanter Marker, Kompression protokollieren), jede mit Icon in Typ-Farbe, Titel, Kurzbeschreibung

**`s-audio`** | Audiomarker erfassen
- Topbar: Zurueck-Pfeil, Speichern-Button (Gold, disabled bis Aufnahme/Transkript vorhanden)
- Heading: „Audiomarker" mit Gold-Akzent auf „Audio"
- Aufnahme-Karte: Status-Text, Timer in 32px Light, Pegel-Meter (kleine Balken), grosser runder Record-Button (64px), Player nach Aufnahme mit Verwerfen und Neu
- Zweites Feld: Transkript-Textarea (optional)
- Drittes Feld: `input[type=time]`

**`s-planned`** | Geplanter Marker
- gleiche Topbar-Logik
- Heading: „Geplanter Marker"
- zwei Felder: Titel, Zeit
- Hinweistext verweist auf Einstellungen fuer Druckaufbau

**`s-marker-detail`** | Marker-Detail (dynamisch)
- Topbar mit „Zur Notiz"-Button
- Body wird per JS befuellt je nach `marker_type`
- Anker: Zeit, Datum, Ort-Chip
- Audio: Zeit, Audio-Player, AURA-Summary-Card mit Gold-Linksrand, Transkript, Tags
- Kompression: Zeit, Ausloeser-Text
- Geplant: Zeit, Titel, Status, Done-Toggle
- Actions unten: Notiz oeffnen, evtl. Loeschen

**`s-notes`** | Notizenliste
- Heading „Notizen" mit Gold-Akzent
- Subtext: „Bedeutung, die nach dem Moment entsteht."
- Scrollbare Liste, jede Notiz als Karte mit Datum, Verknuepfungs-Badge (wenn Marker verlinkt), Titel, 3-Zeilen-Vorschau, Tag-Chips
- Bottom-Nav plus FAB fuer neue Notiz

**`s-note-edit`** | Notiz bearbeiten
- Titel-Input als grosse Headline ohne Umrandung
- Linked-Banner, wenn Notiz mit Marker verknuepft ist
- Freier Content-Textarea (keine Umrandung, fliessend)
- Tags-Row unten mit Chip-Liste plus Input
- Loesch-Button nur im Edit-Modus

**`s-settings`** | Einstellungen
- Heading „Einstellungen" mit Gold-Akzent
- Section „Geplante Marker": Druckaufbau-Slider (10 bis 60s) mit Gold-Thumb, Wiederholung-Select (aus / 5 / 10 / 15 / 30 / 60 min)
- Section „Anker": Geo-Toggle (Gold-Active)
- Section „Armreif": „Nicht gekoppelt"-Label mit disabled Toggle, Bluetooth-Hinweis
- Section „Konto": E-Mail-Anzeige, Logout-Button in Rot

### 2.3 Komponenten-Inventar

- Bottom-Nav mit FAB (3 Nav-Items plus Plus, uebernommen auf Main, Notes, Settings)
- Bottom-Sheet mit Handle, Titel, Subtext, Liste von Optionen, Cancel
- Timeline-Row mit Stundenspalte plus vertikaler Linie
- Marker-Cards pro Typ (4 Varianten)
- Aufnahme-Karte mit Meter und Timer
- Slider, Toggle, Select fuer Settings
- Chips fuer Tags

### 2.4 Was AURUM heute bewusst NICHT hat

- kein Onboarding. Nach Signup landet man direkt auf der Timeline.
- keine Wochen- oder Monatsdichte (wday-dots sind vorgesehen, aber leer)
- kein Scrollrad-Zeitpicker. Zeiten werden ueber `input[type=time]` eingegeben.
- keine Ring-Pairing-UI. Der Platz ist da (disabled Toggle), die Logik fehlt.
- keine Reverse-Geocoding-Anzeige. Nur Koordinaten.

---

## 3. Referenz-Klone im Detail

### 3.1 me+ / Struktured (identisch, Dark-Mode Wizard)

**Stil**
- Dark-Mode iPhone-Mockup mit schwarzer Shell und Notch
- Outfit-Font, 390x844 Phone-Shell
- Coral-Akzent fuer aktive Zustaende, Sekundaer-Blau
- radialer Dark-Gradient als Hintergrund

**Screens (bestaetigt anhand HTML)**
- `screen-welcome` | Pink-Onboarding mit Illustration, drei Dots, Skip
- `screen-benefits` | Nutzen-Liste mit Icons, drei Bullet-Points
- `screen-planning` | Intro in Dark, „Planung starten" CTA
- `screen-wake` | **Scrollrad-Zeitpicker** (Aufwachen)
- `screen-sleep` | **Scrollrad-Zeitpicker** (Schlaf)
- `screen-task-name` | Aufgaben-Titel-Eingabe mit Vorschlags-Grid

**UI-Muster (fuer Uebernahme bewertbar)**
- Wizard mit Fortschrittsbalken oben und Skip rechts
- eine Frage pro Screen, grosser Capsule-CTA unten
- Scrollrad-Picker mit aktiver Zeit in Pille
- Vorschlags-Grid fuer schnelle Auswahl
- Pink-Onboarding mit Illustration (Paper, Kaffee, Stift)
- Dark-Setup-Screens mit Orb-Illustrationen

### 3.2 Planwoo (Light, widget-basiert)

**Stil**
- hell, Lila `#7566f3`, Nunito Sans
- weiche Schatten, Widget-Karten

**Screens (bestaetigt)**
- `screen-intro` | Welcome mit Orbit-Illustration und schwebenden Emoji-Icons
- `screen-widget-setup` | Widget-Liste zum Aktivieren auf der Homepage
- `screen-notify-permission` | **Push-Notification-Permission** (nicht uebernehmbar fuer AURUM)
- `screen-paywall` | Subscription mit drei Preisen (CHF 4 Monat, CHF 20 Jahr, CHF 8 Quartal), Features-Liste mit Trophy-Emojis
- `screen-home` | Homepage mit Week-Strip, konfigurierbaren Widgets, zwei Icon-Gruppen (Settings, Stats, Customize, Calendar)
- Bottom-Sheets: Calendar, Task, Templates
- `screen-stats` | mit „Statistik freischalten" Paywall-Trigger
- `screen-settings` | klassische Gruppen (Datum, Erscheinung, Allgemein)

**UI-Muster**
- Week-Strip mit Tages-Navigation
- Calendar-Bottom-Sheet mit Grid
- Task-Bottom-Sheet mit Feld-Zeilen (Titel, Notiz, Tag, Uhrzeit, Wiederholen, Erinnerung)
- Templates-Panel mit Tabs (Gute, Gesundheit, Schlechte, To-Do) plus Suche
- Widget-basierte Homepage (individuell konfigurierbar)
- Paywall mit Drei-Preise-Grid
- Settings in klassischen Listen-Gruppen

---

## 4. Uebernahme-Kandidaten

Bewertung pro Muster: passt zu AURUM v2, passt teilweise, passt nicht. Letzte Spalte ist Platz fuer deine Entscheidung (ja / nein / teilweise plus kurzer Grund).

| Nr. | Muster | Aus | Relevant fuer AURUM-Screen | Einschaetzung | Entscheidung |
|---|---|---|---|---|---|
| 1 | Scrollrad-Zeitpicker | me+ | `s-planned`, Settings-Slider evtl. erweitert | **passt.** Ruhiger als `input[type=time]`, haptisch schoener. Farbe von Coral auf Gold umlegen. | |
| 2 | Wizard mit Fortschrittsbalken, Skip, Capsule-CTA | me+ | neues Onboarding nach Signup, spaeter Ring-Pairing-Flow | **passt.** Form uebernehmen, Farben umlegen, Sprache auf ruhig statt motivierend. | |
| 3 | Task-Bottom-Sheet mit Feldzeilen (Titel, Zeit, Wiederholen) | Planwoo | Ersatz fuer `s-planned`-Screen (schneller, modaler als eigener Screen) | **passt.** Entschlackt den Flow. Emoji-Icons raus. | |
| 4 | Week-Strip mit kleinen Marker-Punkten pro Tag | Planwoo | Timeline-Header `main-week`. AURUM hat `wday-dots` bereits vorbereitet, aber leer. | **passt.** Konkret implementieren: pro Tag max. drei Dots in Typ-Farben. | |
| 5 | Calendar-Bottom-Sheet mit Grid | Planwoo | neue Option auf Timeline zum Datum-Springen | **passt.** Einfaches Monats-Grid, Tage mit Eintraegen markiert. | |
| 6 | Vorschlags-Grid fuer schnelle Eingabe | me+ | Titel-Eingabe bei geplantem Marker, evtl. Tag-Chips | **passt teilweise.** Sinnvoll fuer Anker-Labels oder Tag-Chips, aber nicht fuer Titel (zu stark geführt). | |
| 7 | Widget-basierte Homepage | Planwoo | — | **passt nicht.** AURUM ist Timeline-zentriert, nicht Dashboard-zentriert. Fragmentiert den Fokus. | |
| 8 | Paywall-Screen | Planwoo | — | **passt nicht** fuer AURUM. Siehe Abschnitt 5. | |
| 9 | Push-Notification-Permission | Planwoo | — | **passt nicht.** Feste Regel: keine Push. | |
| 10 | Dark-Mode | me+ | — | **passt nicht.** Gegenentwurf zum Konzept. | |
| 11 | Emoji-Illustrationen (Trophy, Mops, Karten-Emojis) | Planwoo | — | **passt nicht.** Ruhige Sprache, keine gamifizierte Bildwelt. | |
| 12 | Coral-Akzent | me+ | — | **passt nicht.** Wird durch Gold ersetzt. | |
| 13 | Pink-Onboarding-Screens mit Illustrationen | me+ | — | **passt nicht direkt.** Farbwelt und Sprache inkompatibel. Falls Onboarding kommt, eigene ruhige Gestaltung. | |
| 14 | Settings in klassischen Listen-Gruppen | Planwoo | AURUM-`s-settings` | **teilweise.** AURUM hat bereits gute Settings mit Sections. Planwoo-Variante bietet keinen echten Mehrwert. | |
| 15 | Templates-Panel mit Tabs und Suche | Planwoo | — | **teilweise.** Koennte fuer Tag-Verwaltung nuetzlich sein, aber nicht Prioritaet. | |

---

## 5. Paywall: bewusst nicht uebernehmen, aber hier dokumentiert

Der Paywall-Flow von Planwoo ist absichtlich aufgefuehrt, damit klar ist, dass es diese Referenz gibt, und damit die Entscheidung dagegen dokumentiert ist.

**Was Planwoo macht**

- `screen-paywall` erscheint nach dem Onboarding (direkt nach Notification-Permission)
- drei Preiskarten in einem Grid: 1 Monat CHF 4, 12 Monate CHF 20 (mit „3 Tage kostenlos"), 3 Monate CHF 8
- Feature-Liste mit Trophy-Emojis (Unbegrenzter Planer, eigene Widgets, Statistiken, „x7 Konzentration")
- zusaetzlich in `screen-stats` ein „Statistik freischalten"-Button, der zurueck auf den Paywall fuehrt

**Warum das fuer AURUM nicht passt**

- AURUM ist Kernartefakt einer Diplomarbeit, kein kommerzielles Produkt
- die Sprache („x7 Steigerung der Konzentration", Trophy-Emojis) widerspricht der ruhigen, analytischen Tonalitaet
- Gamification (Trophy, Serien, Achievements) ist explizit nicht Teil des Konzepts (siehe `CONCEPT_v2.md` Abschnitt 13)
- Feature-Gating wuerde der Kernlogik widersprechen, dass AURUM unterstuetzt, nicht einschraenkt

Der Paywall-Flow bleibt in Planwoo als Referenz erhalten, wird aber nicht in AURUM uebernommen.

---

## 6. Gap-Liste AURUM

Was AURUM heute noch nicht hat, nach Prioritaet:

**hoch**
- Onboarding nach Signup (kurze Einfuehrung in Marker-Typen, Ring-Hinweis)
- Kompression-Simulation in der App (bis Ring da ist, einfacher Button statt komplexer Hebel-Nachbildung)
- Wochen-Dichte im `wday-dots` Container fuellen

**mittel**
- Scrollrad-Zeitpicker fuer geplante Marker (ersetzt `input[type=time]`)
- Task-Bottom-Sheet fuer geplanten Marker (optional statt `s-planned`-Screen, macht den Flow schneller)
- Calendar-Bottom-Sheet zum Datum-Springen in der Timeline

**spaeter (v0.10 und weiter)**
- Ring-Pairing-UI (Bluetooth-Flow, Pairing-Status, Testen der Button-Events)
- Reverse-Geocoding-Anzeige (Koordinaten werden zu lesbarem Ort)
- Monatsuebersicht Marker-Dichte

---

## 7. Abgrenzungen fuer AURUM-UI

Damit in Diskussionen die Leitplanken klar bleiben:

- **kein Dark-Mode**. AURUM bleibt Pastell-Cream.
- **kein Coral, kein Lila**. Akzent ist und bleibt Gold.
- **keine Emoji-Illustrationen**. Stattdessen zurueckhaltende SVG-Icons.
- **keine Push-Notifications**. Feste Regel.
- **keine Paywall, kein Feature-Gating**.
- **keine gamifizierten Elemente** (Serien, Achievements, Trophies, Scores).
- **keine motivationale Sprache** („x7 Steigerung", „Super!", „Toller Plan!").
- **iPhone-Mockup mit Notch** in den Klonen ist Dev-Illustration, nicht relevant fuer AURUM-PWA (AURUM rendert schon Vollbild im Standalone-Modus).

---

## 8. Vorgehen

Dieses Dokument ist die Diskussionsgrundlage. Naechster Schritt:

1. Du gehst durch Abschnitt 4 und traegst in der Spalte „Entscheidung" ja / nein / teilweise ein, kurz mit Grund.
2. Ich baue aus den Ja-Entscheidungen konkrete Screen-Spezifikationen (eine Datei pro grosser Uebernahme, z. B. `UI_scrollwheel.md`, `UI_onboarding.md`, `UI_bottomsheet_planned.md`).
3. Parallel oder danach: Umsetzung im bestehenden `AURUM.html`.

Alternativ: Wenn du Prioritaeten setzen willst statt die ganze Liste zu bearbeiten, nenn mir die zwei oder drei wichtigsten Muster, und wir starten dort.
