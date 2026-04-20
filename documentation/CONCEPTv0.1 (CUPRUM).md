# AURUM | Konzept v0.1 (CUPRUM)

* Version: v0.1 (CUPRUM), aktive Fassung
* Datum: 2026-04-20 (mit v0.11-Nachtrag vom selben Tag)
* Status: Aktive Fassung. Löst `CONCEPT_v3.md` als Diskussionsgrundlage ab. v1, v2, v3 bleiben als eingefrorene Referenz erhalten.
* Scope: AURUM (App als Konzept) mit CUPRUM als aktueller Werkstatt, AURUM-Monolith als eingefrorenem Live-Stand, ARGENTUM als Dark-Mode-Theme innerhalb der App, AURA als KI-Schicht im Hintergrund, Armreif als Signalquelle. ROMY ist nicht Teil dieses Konzepts.

Gegenüber `CONCEPT_v3.md` gelten folgende grundlegende Änderungen:

* **Namensauftrennung geklärt.** Drei Namen, drei Rollen, nach der Umentscheidung vom 2026-04-20:
  - **AURUM** = Live-Version (Monolith-HTML, frozen). Gleichzeitig der Konzept-Name für die App als Ganzes.
  - **CUPRUM** = Werkstatt (React + Vite + TypeScript). Hier passieren alle Änderungen. Wird zum neuen AURUM live, sobald reif.
  - **ARGENTUM** = Dark-Mode-Theme **innerhalb** der AURUM-App. Kein eigener Track mehr.
* **Stack-Wechsel** vollzogen. v3 plante Capacitor plus PWA auf einer HTML-Datei. v0.1 hat den React-Port bereits begonnen und führt ihn unter CUPRUM weiter. Die Capacitor-Schicht bleibt Zielbild, ist aber nachgelagert.
* **UI-Muster konkret.** Erste umsetzungsreife Spezifikationen für Scrollrad-Picker, Onboarding, Planned-Sheet, Week-Dots, Calendar-Sheet liegen in `documentation/_archiv/ui/`. Dieses Konzept verweist sie und beschreibt das gemeinsame Gestaltungssystem.
* **Archiv als Kernbestandteil.** Soft-Delete plus 60-Tage-Cleanup sind Teil des Konzepts, nicht nur Implementierungsdetail.
* **Admin-Modus** ist weiter Kernbestandteil, mit neuer Rolle: erlaubt manuelles Auslösen von Anker/Audiomarker/Live-Kompression in der App, solange der Armreif fehlt.

**Nachtrag v0.11 (2026-04-20):** Begriffs-Klärung, siehe `AURUMv0.11 (CUPRUM).md` für Details.

* **Kein "Marker" als Oberbegriff.** Anker, Audiomarker, Kompression, Termin und Ereignis sind **eigenständige Typen**, nicht Sub-Typen von "Marker". Frühere Formulierungen ("vier Marker-Typen") sind ersetzt durch "sechs Typen" (inklusive Notiz).
* **Termin und Ereignis** sind neu als eigene Typen. Ersetzen das alte Sammelfeld `planned`.
* **Rollen sauber getrennt.** User (Armreif als primäres Eingabegerät, App nur Planung/Auswertung) vs. Admin (alle Typen in App zur Simulation).
* **Armreif hat zwei Buttons**: Button 1 = Anker/Audiomarker, Button 2 = Kompression Start/Stop.

Alles, was v2 und v3 über Leitidee, zwei Ebenen, Timeline-Funktion und AURA-Zurückhaltung gesagt haben, bleibt inhaltlich unverändert. Das Begriffssystem ist in Abschnitt 5 aktualisiert.

---

## Inhaltsverzeichnis

0. Einordnung
1. Leitidee in einem Satz
2. Drei Namen, drei Rollen
3. Zwei Ebenen (AURUM, AURA)
4. Zwei Phasen (Moment, Reflexion)
5. Begriffssystem (Marker-Typen)
6. Beziehung Marker und Notiz
7. Archiv (Soft-Delete)
8. Die Timeline
9. AURA (KI-Schicht)
10. Hardware-Realitaet
11. Distribution in zwei Etappen
12. Versionsmodell
13. Armreif als Signalquelle
14. Datenmodell und Architektur
15. Admin- und Praesentationsmodus
16. Geraete-Reset
17. Nutzungsablauf
18. Designprinzipien
19. UI-Bereiche
20. UI-Muster im Detail
21. Dark-Mode-Theme ARGENTUM
22. Was bewusst nicht Teil des Systems ist
23. Systemkreislauf
24. Versionsstand (2026-04-20)
25. Roadmap
26. Offene Punkte und Spannungsfelder
27. Kritische Regeln
28. Glossar
29. Verhaeltnis zu anderen Dokumenten
30. Kurzfassung

---

## 0. Einordnung

AURUM ist keine klassische App, sondern ein zeitbasiertes Selbstwahrnehmungssystem. Die App ist das primaere Produkt. Sie erhaelt Signale von einem physischen Armreif, der im Moment den koerperlichen Input uebernimmt, und stellt sie als ruhige, strukturierende Schicht zwischen Wahrnehmung und Handlung dar.

Das System ist Kernartefakt einer Diplomarbeit. Stand Konzept v0.1: die Live-Version ist der Monolith-HTML-Stand (`AURUM/app/AURUM.html`), die aktive Weiterentwicklung laeuft als React + Vite + TypeScript in `CUPRUM/`. Beide teilen sich dasselbe Supabase-Projekt, dieselben User, dieselben Tabellen, denselben Storage-Bucket. Die Capacitor-Schicht liegt vorbereitet in `CUPRUM/mobile/`, ist aber noch nicht scharfgestellt.

---

## 1. Leitidee in einem Satz

Die App speichert und zeigt (AURUM), die KI transkribiert im Hintergrund (AURA), die Entscheidungen bleiben beim Nutzer, und die Praesenz im Moment gehoert dem Armreif.

---

## 2. Drei Namen, drei Rollen

Damit kuenftig kein Missverstaendnis mehr entsteht:

| Name | Rolle | Ort im Dateisystem | Stack | Domain |
|---|---|---|---|---|
| **AURUM** | Live-Version (frozen) UND Konzept-Name der App | `AURUM/` | Monolith-HTML, Vanilla JS | `aurum.marcodemont.ch` (Port 8006) |
| **CUPRUM** | Werkstatt, wird zum neuen AURUM live | `CUPRUM/` | React 18 + Vite 6 + TypeScript + Tailwind 4 | `cuprum.marcodemont.ch` (Port 8008) |
| **ARGENTUM** | Dark-Mode-Theme innerhalb der App | (Theme in CUPRUM, spaeter AURUM) | CSS-Variablen-Swap | keine eigene Domain |
| **AURA** | KI-Schicht, Hintergrund-Transkription | ausserhalb Frontend (Edge Function oder `server.js`) | Whisper via OpenAI | keine UI |

Frueher war ARGENTUM ein eigenstaendiger Track mit eigener Codebase. Durch Namenskonflikt mit dem Figma-Default-Supabase-Projekt wurde dieser Ansatz aufgegeben. Der frueher separate ARGENTUM-Code liegt als Legacy unter `CUPRUM/src/Argentum/` und steht fuer Cleanup an.

---

## 3. Zwei Ebenen

* **AURUM** | die App. Speicherung, Struktur, Kontext, Darstellung.
* **AURA** | die KI-Schicht. Hauptzweck: Transkription. Alles andere nachgelagert.

Regel bleibt:

* AURUM speichert, AURA transkribiert.
* AURA darf Daten verarbeiten, nicht bewerten.
* AURA darf vorschlagen, nicht entscheiden.
* Der Nutzer bleibt in Kontrolle.
* AURA hat **kein UI**. Keine Chat-Bubbles, keine Floating-Buttons, keine "Frag den Assistenten"-Widgets.

---

## 4. Zwei Phasen

### Phase 1 | Erfassen im Moment (Armreif)

* physisch, nicht digital
* minimale Interaktion
* keine kognitive Belastung
* keine Eingabeaufforderung

Zwei Bedienelemente mit bewusst unterschiedlicher Haptik:

* **Button 1 | Druckknopf.** Klassischer Klick. 1x kurz = Anker. 2x kurz = Audiomarker.
* **Button 2 | Hebel mit Rueckstellung.** Hochdruecken = Kompression, Loslassen federt zurueck.

Die App ist im Moment nicht noetig.

### Phase 2 | Verstehen danach (App)

* ruhige, bewusste Nutzung
* Reflexion statt Reaktion
* niedrige Nutzungsfrequenz, bewusste Sitzungen

---

## 5. Begriffssystem: sechs eigenständige Typen

**Es gibt keinen Oberbegriff "Marker".** Die DB-Spalte `marker_type` heißt historisch so, aber in UI, Doku und Sprache werden die Typen einzeln benannt.

| Typ | Kategorie | Quelle | Inhalt | Ausgelöst durch |
|---|---|---|---|---|
| **Anker** | Instant | Armreif | leer, Zeit + optional Ort. "Gedanke existiert." | Button 1, 1x kurz |
| **Audiomarker** | Instant | Armreif | Zeitpunkt + automatisch verknüpfte Notiz mit Audio/Transkript | Button 1, 2x kurz |
| **Kompression** | Instant oder Planung | Armreif oder App | Ereignis, kein Inhalt, optional Dauer | Button 2 oder App-Plan |
| **Termin** | Planung | App | geplanter Zeitpunkt, Titel, Ring-Rückmeldung zum Zeitpunkt | Nutzer in App |
| **Ereignis** | Planung | App | Anlass mit Kontext. Ohne Zeit → wird zur Notiz | Nutzer in App |
| **Notiz** | nachgelagert | App (oder automatisch bei Audiomarker) | freier Inhalt, Tags, optional mit einem Typ verknüpft | Nutzer oder System |

DB-Feld `marker_type` nimmt künftig: `anchor`, `audio`, `compression`, `appointment`, `event`. Der alte Wert `planned` wird durch `appointment` bzw. `event` ersetzt. Notizen leben in der eigenen `notes`-Tabelle.

### 5.1 Anker

Ein Anker ist kein Eintrag im Sinne von "hier ist etwas passiert", sondern ein temporärer Speicher. Er erlaubt, einen Gedanken sofort loszulassen, ohne ihn zu verlieren. Quelle immer Armreif (außer Admin-Modus in App).

### 5.2 Audiomarker

Der Audiomarker trennt zwei Dinge:

* Auf der Timeline entsteht ein Eintrag, der nur den Zeitpunkt hält.
* Der eigentliche Rohinhalt wird automatisch als Notiz angelegt und mit dem Audiomarker verknüpft.

Quelle immer Armreif (außer Admin-Modus in App).

### 5.3 Kompression

Zentraler haptischer Mechanismus, zwei Modi:

* **Live** — per Armreif-Button 2 gestartet und gestoppt. `source='ring'`, `compression_seconds` wird mitgeschrieben.
* **Geplant** — in der App definiert, startet automatisch zum Zeitpunkt (Ring baut Druck auf). Stop per Button 2 am Armreif oder automatisch nach geplanter Dauer.

Aktuell ohne Armreif-Hardware wird Kompression als reiner Protokoll-Eintrag gespeichert.

### 5.4 Termin

Ein geplanter Zeitpunkt mit Ring-Rückmeldung. Ersetzt klassische Push-Reminder durch körperliches Signal am Armreif. Seit v0.04 mit:

* Farbauswahl aus kuratierter Palette
* vier Wiederholungstypen (einmalig, wochentags, täglich, wöchentlich) als naive Instanz-Kopien

Immer in App erstellt.

### 5.5 Ereignis

Ein Anlass oder Event mit Kontext. Unterscheidet sich vom Termin dadurch, dass Zeit optional ist:

* **Mit Zeit** → wird als Ereignis gespeichert (`marker_type='event'`).
* **Ohne Zeit** → wird zur Notiz mit Hinweis "Später einen Termin setzen". Bewusster Zwischenzustand, kein Fehler.

Immer in App erstellt.

### 5.6 Notiz

Nachgelagerte Bedeutungsebene. Eigene Tabelle `notes`. Optional verknüpft über `marker_id` mit Anker, Audiomarker, Termin oder Ereignis. Notizen können auch frei existieren, ohne Bezug zu einem anderen Typ.

---

## 6. Beziehung zwischen Typen und Notiz

Drei Rollen, sauber getrennt: **Typen** (Anker/Audiomarker/Kompression/Termin/Ereignis) gleich Moment oder Planung, **Audio** gleich Rohinhalt, **Notiz** gleich Bedeutung.

Regeln:

* Ein Audiomarker erzeugt automatisch eine verknüpfte Notiz (Rohinhalt landet dort).
* Ein Anker kann ohne Notiz bleiben.
* Eine Notiz kann ohne Verknüpfung zu einem anderen Typ existieren.
* Ein Ereignis ohne Zeit wird direkt als Notiz gespeichert.
* Die Verknüpfung entsteht über direkte, kontextuelle Interaktion, nicht über Menüs.
* Tags verbinden thematisch und zeitlich.

Klick auf einen Eintrag (Anker, Audiomarker, Kompression, Termin, Ereignis) öffnet den Detail-Screen. Bei Audiomarkern und Terminen führt von dort ein Button "Zur Notiz" direkt in die verknüpfte Notiz — oder legt eine neue mit `marker_id` an.

---

## 7. Archiv (Soft-Delete)

Neu als Konzept-Bestandteil seit v0.09, deployed via DB-Migration.

### 7.1 Grundregel

Markers und Notes werden **nicht hart geloescht**, sondern bekommen einen `archived_at`-Timestamp (Soft-Delete). Sie verschwinden aus Timeline und Notizen-Liste, bleiben in Supabase gespeichert.

### 7.2 Auffindbarkeit

Archivierte Eintraege sind im Archiv-Bereich der Einstellungen sichtbar. Bewusst kein eigener Nav-Tab, damit Archiv im Alltag nicht ablenkt. Einstellungen → Archiv ist kollabiert, ein Klick auf den Header klappt aus.

### 7.3 Wiederherstellung und endgueltiges Loeschen

Pro Eintrag zwei Aktionen:

* **Wiederherstellen** | setzt `archived_at = null`, Eintrag taucht wieder in der Liste auf.
* **Endgueltig loeschen** | hart-loeschen, mit Confirm-Dialog.

### 7.4 Auto-Cleanup

Archivierte Eintraege aelter als 60 Tage werden automatisch hart-geloescht. Aktuell client-seitig beim Login (fire-and-forget). Edge-Function-basiertes Cron ist moeglich, aber nicht zwingend.

### 7.5 Shared Infrastructure

AURUM live ignoriert die `archived_at`-Spalten (backward-kompatibel). CUPRUM und AURUM schreiben in dieselbe Tabelle, aber nur CUPRUM respektiert das Archiv-Verhalten.

---

## 8. Die Timeline

Die Timeline ist kein Content-Feed und keine Chronologie von Notizen, sondern ein Rohprotokoll von Zustaenden, Signalen und Reaktionen.

### 8.1 Vier Perspektiven

* aktive Tagesstruktur
* Log (wann reagiert, wann Signal gesetzt, wann nur markiert)
* somatisch gekoppelt (Timeline enthaelt auch koerperliche Interaktionen)
* Analysefeld (zur Mustererkennung ueber Zeit, kognitiv durch den Nutzer, nicht algorithmisch)

### 8.2 Visuelle Auspraegung pro Typ (v0.09-Stand, in CUPRUM weitergetragen)

* **Anker** = 20x20 roter Kreis (`#b85555`) auf der Vertikal-Linie, kein Content rechts.
* **Audio / Kompression / Geplant** = 40x40 Squircle (border-radius 14px) in Typ-Farbe plus Card rechts mit Uppercase-Label und Bold-Titel.
* **Typ-Farben**: anchor `#c4bca8`, audio `#b89668`, compression `#c08a7a`, planned `#b5c5d5`.
* **Geplant in der Vergangenheit**: Border-Style solid statt dashed, Label und Titel durchgestrichen, Opacity 0.6.
* **Hintergrund**: AURUMs Cream `#faf5eb`.
* **Spalten-Grid Day-View**: `40px (Zeit) | 42px (Linie+Bubble) | 1fr (Content)`.

### 8.3 Wochen-Dots (seit v0.05)

Unter jedem Wochentag erscheinen bis zu drei Dots (Audio, Kompression, Geplant). Die Dot-Farbe ist die echte Marker-Farbe (aus dem `color`-Feld). Fallback auf die Typ-Variable `--mt-${type}`, wenn `color` leer. Anker sind bewusst nicht im Wochen-Dot enthalten, weil sie haeufig vorkommen wuerden.

### 8.4 Marker-Detail-Modal

Klick auf einen Marker oeffnet ein Modal. Auf Mobile Bottom-Sheet, auf Desktop zentriert.

* Header: Typ-Label, Schliessen-X.
* Bubble 48x48 plus Bold-Titel plus Zeit/Datum mit Clock-Icon.
* **Body je Typ**:
  - Audio: HTML5-Player fuer `audio_url`, AURA-Summary-Card mit Gold-Linksrand, Transkript-Card.
  - Kompression: Sub-Text.
  - Anker: Location-Chip.
  - Geplant: grosser Done-Toggle, schreibt `is_done` live in Supabase.
* Tags als Pills.
* Footer: **Archivieren** (grau) und **Endgueltig loeschen** (rot mit Confirm).

---

## 9. AURA (KI-Schicht)

AURA ist Algorithmus, kein Akteur.

### 9.1 Hauptzweck

Transkription des Audios via Whisper. Das Transkript landet direkt in der verknuepften Notiz.

### 9.2 Spaeter und optional

* Moment-Zusammenfassung in einem Satz
* Auto-Tags (1 bis 3)
* Verknuepfungsvorschlaege zwischen Markern und Notizen
* freier Chat mit AURA ueber die eigenen Daten

### 9.3 Technische Leitplanke

API-Keys fuer AURA gehoeren in Supabase Edge Function Secrets oder `server.js`, nie in den Browser-Code. Der Frontend-Quelltext ist oeffentlich einsehbar.

### 9.4 Keine UI

AURA hat **keine sichtbaren UI-Elemente**. Keine Chat-Bubbles (LYNA, JOI, BaseChatBubble), keine Floating-Action-Buttons, keine "Frag den Assistenten"-Widgets. AURA erscheint nur durch ihre Wirkung: Transkript-Text in der Notiz, Summary-Card im Marker-Detail.

---

## 10. Hardware-Realitaet

| Geraet | Rolle |
|---|---|
| Lenovo-Laptop, Windows | Entwicklungsrechner |
| iPhone 16 Pro | primaeres Test-Handy |
| iPhone 13 Pro | zweites Test-Handy |
| iPad Pro 2018 | grosses Test-Geraet |
| iPad Pro 2025 | grosses Test-Geraet |

Nicht vorhanden: macOS-Rechner, Android-Geraet, Apple-Developer-Account, Armreif-Hardware.

Konsequenzen:

* Web Bluetooth ist auf keinem Test-Geraet verfuegbar (iOS Safari und WebKit unterstuetzen es nicht).
* iOS-Capacitor-Build ist blockiert, bis macOS organisiert ist.
* Android-Capacitor-Build ist moeglich, nutzt uns aber nichts ohne Test-Geraet.
* HTTPS auf dem Laptop: Cloudflare-Tunnel vor `localhost`, ergibt `https://<name>.marcodemont.ch`, Safari akzeptiert.

---

## 11. Distribution in zwei Etappen

### 11.1 Etappe 1 | PWA via Cloudflare-Tunnel

* CUPRUM laeuft als Vite-Dev-Server auf Port 8008, via Cloudflare-Tunnel unter `https://cuprum.marcodemont.ch/` erreichbar.
* AURUM live laeuft als Python-Static-Server auf Port 8006, via Tunnel unter `https://aurum.marcodemont.ch/` erreichbar.
* Test-iPhones installieren via Safari → Teilen → Zum Home-Bildschirm.
* BLE ist nicht verfuegbar (iOS-Safari-Einschraenkung).

### 11.2 Etappe 2 | Capacitor (spaeter)

* Sobald macOS-Zugriff vorhanden: `npx cap add ios`, Xcode-Build, auf iPhone deployen.
* Capacitor-Plugins aus `CUPRUM/mobile/package.json` werden scharfgestellt: Bluetooth LE, Geolocation, Preferences, Filesystem.
* Die JavaScript-Bruecke erkennt die native Shell per `window.Capacitor?.isNativePlatform()` und schaltet die BLE-UI frei.

### 11.3 Was an der App nicht getrennt wird

Ein Code-Ort fuer Frontend: `CUPRUM/src/`. Capacitor laedt denselben Build in die WebView, kein Code-Duplikat.

---

## 12. Versionsmodell

### 12.1 Ein Code-Ort, viele Doku-Eintraege

* `CUPRUM/src/` ist der einzige aktive Frontend-Code.
* Pro Version gibt es eine Doku-Datei `documentation/AURUMv<version>.md` (Delta).
* Monolith-Versionen v0.01 bis v0.06 bleiben als historische Referenz erhalten, werden nicht weitergezaehlt.
* v0.09 war die erste React-Fassung (damals noch unter ARGENTUM-Namen). Doku bleibt erhalten.
* Ab v0.1 sind alle neuen Versionen auf CUPRUM-Basis.

### 12.2 Keine Parallelkopien mehr

`CUPRUM/src/main.tsx` ist der einzige React-Entry. Keine Parallel-Apps. Der Legacy-Unterordner `CUPRUM/src/Argentum/` ist nicht im aktiven Build-Pfad.

### 12.3 Was eine neue Version rechtfertigt

Nicht jeder Commit. Eine neue `AURUMv<version>.md` wird geschrieben, wenn ein abgegrenzter Aenderungsblock dokumentiert gehoert, typischerweise:

* neues Feature-Bundle
* strukturelle Aenderung der Repo- oder UI-Struktur
* Migration auf neuen Stack

---

## 13. Armreif als Signalquelle

Bleibt Kernstueck, aber nicht prioritaer umsetzbar, solange Geraet und macOS-Zugriff fehlen.

### 13.1 Was die App vom Armreif wissen muss

* welcher Button betaetigt wurde (1 Druckknopf, 2 Hebel)
* wie (1x / 2x kurz bei Button 1; Hebelkurve plus Loslassen bei Button 2)
* wann (Zeitstempel)

### 13.2 Technische Umsetzung (vorbereitet, nicht aktiv)

* Bluetooth LE, GATT-Service im Capacitor-Wrap fuer iOS
* Plugin: `@capacitor-community/bluetooth-le`
* BLE-UUIDs (Default, anpassbar in Einstellungen):
  - Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
  - Notify Characteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
  - Write Characteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
* im Datenmodell vorbereitet: `markers.source` (`app` gegen `ring`), `user_settings.ring_paired_id`
* BLE-Adapter-Datei `ble-ring.js` liegt in `CUPRUM/app/`, ist an die React-App noch nicht angebunden

### 13.3 Haptik als Teil der Botschaft

Button 1 klar und diskret (mental), Button 2 koerperlich und regulierend. Die App nimmt die Unterscheidung ueber Marker-Typen auf, nicht visuell.

---

## 14. Datenmodell und Architektur

### 14.1 Stack

* **Frontend (aktiv, CUPRUM)**: React 18, Vite 6, TypeScript, Tailwind 4, Radix UI, Lucide, Framer Motion, TanStack Query, Supabase-JS
* **Frontend (Live, AURUM)**: eine HTML-Datei (`AURUM/app/AURUM.html`), Vanilla JavaScript
* **Backend**: Supabase-Projekt `Diplomarbeit` (Region eu-central-2, Zuerich), Postgres mit Row Level Security, Supabase Auth, Supabase Storage
* **Edge Functions (geplant)**: Whisper-Transkription
* **Service Worker**: liegt in `CUPRUM/app/sw.js` bereit, derzeit nicht aktiv
* **Native Schicht (vorbereitet)**: Capacitor mit Plugin-Vollset

### 14.2 Tabellen (Kurzform)

* `markers` | `id`, `user_id`, `marker_date`, `start_time`, `marker_type`, `latitude`, `longitude`, `location_label`, `audio_path`, `transcript`, `summary`, `tags`, `source`, `title`, `is_done`, `color`, `repeat_type`, `sub`, `archived_at`
* `notes` | freie Notizen, optional mit Marker verknuepft, mit Tags, plus `archived_at`
* `user_settings` | `compression_seconds`, `repeat_interval_minutes`, `geo_enabled`, Ring-UUIDs, `ring_paired_id`
* `auth.users` | Supabase-Standard

### 14.3 Storage

Bucket `audio-markers`, Public: false, Pfad `<user_id>/<marker_id>.<ext>`. RLS-Policies in Migration 04.

### 14.4 Lokale Persistenz

* **CUPRUM/PWA**: `localStorage` und hybrider Wrapper (falls vorhanden)
* **Capacitor (spaeter)**: `@capacitor/preferences` als Ersatz fuer `localStorage`

Lokale Keys:

* `aurum_session` | Auth-Session
* `aurum_admin_mode` | Admin-/Praesentationsmodus (`'1'` default)
* `aurum_onboarded` | reserviert fuer Onboarding-Wizard

---

## 15. Admin- und Praesentationsmodus

Neu als Kernbestandteil seit v0.05, erweitert in v0.09.

### 15.1 Technische Umsetzung

* Key: `localStorage['aurum_admin_mode']`, Default `'1'`
* React-Hook: `useAdminMode()` (in `modules/AURUM/useAdminMode.ts`)
* Im Nicht-Admin-Modus ausgeblendet: Anker-Option im Marker-Sheet, Kompressions-Option, Armreif-Section, Versions- und Diplomarbeits-Footer

### 15.2 Manuelle Anker-Erstellung

Solange der Armreif fehlt, erlaubt der Admin-Modus einen zusaetzlichen "Anker"-Button in der Timeline-Header. Klick ruft `createAnchor()`, das direkt in Supabase eine Anker-Zeile einfuegt (`marker_type='anchor'`, `source='app'`, Zeit = Jetzt).

### 15.3 Zweck

Der Modus ist primaer fuer Diplomarbeits-Praesentationen gebaut. Er gibt der Person am Laptop oder iPad eine ruhige, "verkaufsfertige" Oberflaeche. Gleichzeitig bleibt der Entwicklungsmodus einen Klick entfernt.

---

## 16. Geraete-Reset

Button in den Einstellungen ("Komplett zuruecksetzen"). Funktion `resetDeviceState()`:

1. Confirm-Dialog
2. `storage.del('aurum_session')`
3. `localStorage.removeItem('aurum_admin_mode')`
4. `localStorage.removeItem('aurum_onboarded')`
5. In-Memory-State zuruecksetzen
6. `location.reload()`

Daten in Supabase bleiben unberuehrt. Das Geraet startet nach Reload wie eine Neuinstallation.

---

## 17. Nutzungsablauf

### 17.1 Im Moment (Armreif)

1. Button 1, 1x kurz | Anker entsteht
2. oder Button 1, 2x kurz | Audiomarker startet, zweiter Doppelklick stoppt (oder Auto-Stop nach 5 Minuten)
3. oder Button 2 | Kompression startet. Erneut Button 2 | stoppt
4. kein Blick aufs Telefon nötig

### 17.2 Bei Fälligkeit eines Termins oder geplanter Kompression (Armreif)

1. Termin erreicht Zeitpunkt → Armreif gibt haptisches Signal
2. Geplante Kompression erreicht Zeitpunkt → Armreif baut graduell Druck auf
3. Nutzer kann Button 2 betätigen, um Kompression zu stoppen

### 17.3 Danach (App, User-Rolle)

1. App öffnen, Timeline zeigt die letzten Einträge
2. Klick auf einen Eintrag → Detail-Modal (typabhängig)
3. bei Audiomarker: "Zur Notiz"-Sprung mit vorbefülltem Transkript
4. Termin oder geplante Kompression planen
5. Ereignis anlegen (mit Zeit oder ohne → Notiz)
6. abends: Termine auf erledigt setzen
7. ggf. Einträge oder Notizen archivieren oder wiederherstellen

### 17.4 Danach (App, Admin-Rolle)

Zusätzlich zu 17.3:

* Anker, Audiomarker oder Live-Kompression können in der App ausgelöst werden (Simulation, solange Armreif fehlt)
* Das Erfassungs-Sheet zeigt alle fünf Instant/Planung-Typen (siehe `mobile/IMG_1370.PNG`, `mobile/IMG_1371.PNG`)

---

## 18. Designprinzipien

### 18.1 Farbwelt (Cream-Theme, Default)

* Flaechen: `--bg-ambient #ebe3d3`, `--bg-screen #faf5eb`, `--bg-card #ffffff`, `--bg-subtle #f2ecdf`, `--bg-nav #f5efe2`
* Text: `--text-primary #2e2820`, `--text-secondary #7a7062`, `--text-tertiary #a89f8d`, `--text-quaternary #c4bca8`
* Akzent: `--gold #b89668`, `--gold-dark #9a7d52`, `--gold-soft #d4b88a`, `--gold-pale #ece0c6`
* Marker-Typ: `--mt-anchor #c4bca8`, `--mt-audio #b89668`, `--mt-compression #c08a7a`, `--mt-planned #b5c5d5`
* Audio-Aufnahme-Akzent: `--rec-red #b85555`

Leitlinien:

* helle Pastelltoene, warme Papiertoene
* keine reinen Weisstoene
* gezielte goldene Akzente (AURUM ist Gold)
* Farbe markiert Zustaende, nicht Dekoration

### 18.2 Formensprache

* Kreise, Ovale, stark abgerundete Rechtecke
* keine harten Ecken
* Capsule-Form fuer Fortschritt, Auswahl, CTA
* viel Negativraum, duenne Linien

### 18.3 Typografie

* klare Hierarchie
* dominante Headlines, einzelne Schluesselwoerter farblich hervorgehoben
* Sekundaertext reduziert
* Logo in Georgia-Serif mit gespreizten Letters ("Verstehen · Erinnern · Ruhen")
* Tabular-Nums fuer Zeiten

### 18.4 Interaktion

* direkte Manipulation, wenig Menues
* wenige, reduzierte Gesten: tippen, halten, verschieben
* klare Zustaende statt komplexer Optionen
* ein Screen, eine Entscheidung
* Live-Save in den Einstellungen (kein separater Save-Button)

### 18.5 Sprache und Orthographie

* **Schweizer Orthographie, kein Eszett.**
* **Keine Em-Dashes.**
* ruhige, analytische Sprache, nicht werbend
* keine motivationalen Floskeln ("Toller Plan!", "x7 Konzentration")

### 18.6 Wirkung

* ruhig, stabil, konsistent
* niedrige visuelle Aggressivitaet
* Orientierung ohne Aufmerksamkeit zu fordern

---

## 19. UI-Bereiche

### 19.1 Login und Registrierung (`s-login` / `AurumAuthScreen`)

* grosses AURUM-Logo in Georgia-Serif
* Tagline "Verstehen · Erinnern · Ruhen"
* zwei Felder (Email, Passwort), Primary-Button in Gold, Toggle-Link zu Signup
* Fehler- und OK-Meldungen im selben Platz
* Footer: "AURUM · DIPLOMARBEIT · v..." (nur im Admin-Modus sichtbar)
* Force-Auth-Screen-Flag bei Demo-Mode-Logout (aus v0.09)

### 19.2 Timeline (`s-main` / `Timeline.tsx`)

* Header: grosses Datum mit Gold-Jahr, darunter Wochenstreifen (Mo bis So)
* Wochenstreifen mit Marker-Dichte-Dots (siehe UI-Spec `04_weekstrip_dots.md`)
* heutiger Tag als Gold-Kreis, ausgewaehlter Tag als Outline
* Day-View mit AURUM-Layout (Spalten-Grid, Anker als Punkt, andere Typen als Squircle)
* Week-View noch als Karten-Liste (Refactor auf Stunden-Track offen)
* Bottom-Nav (Mobile): Timeline | Sheets | Einstellungen, plus FAB rechts unten
* Bottom-Sheet fuer Marker-Typ-Auswahl (vier Optionen)

### 19.3 Marker-Detail-Modal

Siehe Abschnitt 8.4. Ersetzt den vollbildigen `s-marker-detail`-Screen aus dem Monolith.

### 19.4 Notizen (`s-notes` / `NotesView.tsx`)

* Heading "Sheets" (Label), Inhalt sind Notes
* Subtext: "Bedeutung, die nach dem Moment entsteht."
* Scrollbare Liste, jede Notiz als Karte mit Datum, Verknuepfungs-Badge, Titel, 3-Zeilen-Vorschau, Tag-Chips
* FAB fuer neue Notiz
* Editor als Modal: Titel-Input (grosse Headline, keine Umrandung), Linked-Banner bei Marker-Verknuepfung, Content-Textarea fliessend, Tags-Row unten, Loesch-Button nur im Edit-Modus

### 19.5 Einstellungen (`s-settings` / `SettingsView.tsx`)

* Heading "Einstellungen" mit Gold-Akzent
* **Geplante Marker**: Druckaufbau-Slider (10 bis 60s) mit Gold-Thumb, Wiederholung-Select
* **Anker**: Geo-Toggle (Gold-Active)
* **Armreif**: Status-Anzeige (gekoppelt / nicht gekoppelt), Hinweis-Text
* **Konto**: E-Mail-Anzeige, Logout-Button in Rot
* **Entwickler**: Admin-Modus-Toggle
* **Archiv**: kollabiert, Tabs Marker / Notizen, Wiederherstellen und Endgueltig loeschen
* **Theme**: Toggle Cream / ARGENTUM (Dark)

Alle Werte schreiben live in Supabase (`user_settings`).

---

## 20. UI-Muster im Detail

Detaillierte Spezifikationen liegen in `documentation/ui/` und werden beim Merge in CUPRUM umgesetzt.

| Nr. | Datei | Thema | Status |
|---|---|---|---|
| 01 | [ui/01_scrollwheel.md](./ui/01_scrollwheel.md) | Scrollrad-Zeitpicker | Spezifikation |
| 02 | [ui/02_onboarding.md](./ui/02_onboarding.md) | Onboarding-Wizard nach Signup | Spezifikation |
| 03 | [ui/03_planned_bottomsheet.md](./ui/03_planned_bottomsheet.md) | Bottom-Sheet fuer geplanten Marker | Spezifikation |
| 04 | [ui/04_weekstrip_dots.md](./ui/04_weekstrip_dots.md) | Week-Strip mit Marker-Dichte | Spezifikation |
| 05 | [ui/05_calendar_sheet.md](./ui/05_calendar_sheet.md) | Calendar-Bottom-Sheet | Spezifikation |

### 20.1 Scrollrad-Picker (Ersatz fuer `input[type=time]`)

Vertikaler Picker mit aktivem Wert in Gold-Pille. Ruhiger als der native Zeit-Input, passt zur organischen Formensprache. Einsatzorte: Audiomarker-Zeit, geplanter Marker, eventuell Druckaufbau-Slider in den Einstellungen.

### 20.2 Onboarding-Wizard

Vier Screens nach Signup: Welcome, Marker-Typen erklaeren, Armreif-Hinweis, Permissions-Erklaerung. Skip jederzeit. Keine Illustrationen mit Stift und Kaffee, keine motivationale Sprache. Ein Icon pro Screen in Typ-Farbe. Progress-Dots oben, Capsule-CTA unten.

### 20.3 Planned-Bottom-Sheet

Ersetzt den vollbildigen `s-planned`-Screen. Drei Felder: Titel, Zeit (via Scrollrad), Wiederholung (Select). Gold "Speichern" unten. Notiz wird **nicht** beim Anlegen erfasst, sondern nachtraeglich verknuepft.

### 20.4 Week-Strip mit Marker-Dichte-Dots

Container `wday-dots` existiert seit v0.05. Pro Tag bis zu drei Dots (Audio, Kompression, Geplant), in echter `color`-Feld-Farbe, Fallback auf Typ-Variable. Anker bewusst ausgeschlossen, weil sie haeufig vorkommen und die Uebersicht dominieren wuerden.

### 20.5 Calendar-Bottom-Sheet

Monats-Grid zum Datum-Springen, ruft die Timeline auf das gewaehlte Datum. Gold-Ring fuer heute, Gold-Fuellung fuer ausgewaehlten Tag. Monats-Navigation unten mit Pfeilen plus "Heute"-Link. Aufruf ueber Tipp auf das grosse Datum in der Timeline-Header.

### 20.6 Wiederverwendete Komponenten

* Bottom-Nav mit FAB (3 Nav-Items plus Plus-Knopf, uebernommen auf Timeline, Notes, Settings)
* Bottom-Sheet-Primitive mit Handle, Titel, Subtext, Liste von Optionen, Cancel
* Chips fuer Tags
* Slider, Toggle, Select (aus Radix UI, mit Gold-Active-States)

---

## 21. Dark-Mode-Theme ARGENTUM

Neu in v0.1: der Name **ARGENTUM** bezeichnet nicht mehr einen separaten Code-Track, sondern ein Dark-Mode-Theme **innerhalb** der AURUM-App.

### 21.1 Prinzip

Das Cream-Theme (hell, Papier, Gold) bleibt der Default und die Konzept-Identitaet. ARGENTUM ist eine Alternative fuer nacht- oder spaetabend-Nutzung, nicht der Standard.

### 21.2 Umsetzung

* CSS-Variablen-Swap im `:root` bzw. `[data-theme='argentum']`.
* Kein Bildwechsel, keine andere Typografie.
* Gold-Akzent bleibt, auf dunklem Grund subtil gedaempft (nicht Coral, nicht Neon).
* Marker-Typ-Farben werden auf dunklem Untergrund kalibriert, behalten aber die Semantik.

### 21.3 Nutzer-Schalter

Theme-Toggle in den Einstellungen, unter einem eigenen Abschnitt "Darstellung". `localStorage`-Key `aurum_theme` mit Werten `'cream'` (Default) oder `'argentum'`.

### 21.4 Abgrenzung

* ARGENTUM ist **kein** Gegenentwurf zum Cream-Theme (kein Dark-Mode-Gamification).
* Keine eigene Marken-Identitaet, keine eigene Tagline, kein eigenes Logo.
* Die Schweizer Orthographie, die ruhige Sprache und die reduzierten Formen gelten unveraendert.

---

## 22. Was bewusst nicht Teil des Systems ist

AURUM ist **nicht**:

* klassisches Notiztool
* Tracking-System (kein Verhaltens-Scoring, keine Quantifizierung)
* aktiver KI-Assistent (AURA agiert nie ungefragt, AURA hat kein UI)
* Gamification-System (keine Streaks, Scores, Levels, Trophies)
* Push-basiertes Remindersystem (Praesenz im Moment gehoert dem Armreif)
* kommerzielles Produkt mit Paywall (Diplomarbeits-Scope)
* Content-Feed (die Timeline ist Rohprotokoll, kein Lesestoff)

**Feste Regel:** Die App schickt nie Push-Notifications. Alles, was die App tut, ist nachgelagert und freiwillig.

---

## 23. Systemkreislauf

1. Signal wird gesetzt (am Armreif oder in der App)
2. Ereignis wird gespeichert (AURUM / CUPRUM, Supabase)
3. bei Audiomarker: Notiz wird angelegt, Audio gespeichert
4. Audio wird transkribiert (AURA, v0.2) und Transkript in die Notiz geschrieben
5. Nutzer reflektiert spaeter (App)
6. ggf. Archivieren, spaeter Wiederherstellen oder endgueltig loeschen
7. Muster entstehen ueber Zeit (kognitiv beim Nutzer)

---

## 24. Versionsstand (2026-04-20)

Monolith (AURUM live):

* **v0.01** | Klickdummy, 5 Screens, dunkles Theme
* **v0.02** | Pastell-Cream plus Gold, CSS-Variablen
* **v0.03** | AI-Nav-Eintrag zu Notizen
* **v0.04** | Geplante Marker mit Farbe und Wiederholung, Anker mit Tagesliste
* **v0.05** | Vollbild, Notch, Wochen-Dots mit echter Farbe, Admin-Modus, Geraete-Reset
* **v0.06** | Capacitor-Vorbereitung, Repo-Reorganisation, eine App eine Code-Datei
* **v0.08** | Audio-Aufnahme plus Upload, Marker-Detail-Screen, Geolocation am Anker, Einstellungs-Screen, PWA-Manifest, Service Worker

React (CUPRUM):

* **v0.09** | erster React-Port als damaliger ARGENTUM-Track. AURUM-treue Timeline, Detail-Modal, Notes-Editor, Settings mit allen AURUM-Sections plus Archiv, Mobile-BottomNav plus FAB, Schema-Migration `archived_at`, Force-Auth-Screen-Fix, Keine sichtbare AI
* **v0.1 (CUPRUM)** | Namensauftrennung geklärt (AURUM live, CUPRUM Werkstatt, ARGENTUM Theme), Subdomain `cuprum.marcodemont.ch`, Starter `CUPRUM.bat`, `vite.config.ts` `allowedHosts` für Tunnel, UI-Spezifikationen in `documentation/_archiv/ui/`
* **v0.11 (CUPRUM)** | Begriffs-Klärung: kein "Marker" als Oberbegriff, sechs eigenständige Typen (Anker, Audiomarker, Kompression, Termin, Ereignis, Notiz), Termin und Ereignis als eigene Typen statt `planned`, Rollen-Trennung User/Admin explizit, Armreif-Button-Belegung dokumentiert. Keine Code-Änderungen, nur Konzept-Update. Siehe `AURUMv0.11 (CUPRUM).md`

Aktueller Fokus: Umsetzung der v0.11-Begriffe im Code (DB-Schema `compression_seconds`, neue `marker_type`-Werte `appointment`/`event`, Admin-Gating im Erfassungs-Sheet).

---

## 25. Roadmap

### 25.1 v0.1.x | Merge und Stabilisierung

* alle AURUM-Monolith-Screens nach React portieren (Login, Timeline, Marker-Sheet, Marker-Detail, Notes, Settings)
* CreateMarker in Supabase schreiben fuer alle vier Typen (nicht nur Anker im Admin-Modus)
* Audio-Aufnahme in React (MediaRecorder plus Bucket-Upload)
* WeekView-Refactor auf Stunden-Track (06 bis 22h)
* Marker-Notiz-Verknuepfung im Detail-Modal ("Zur Notiz"-Button, automatische Notiz-Erstellung bei Bedarf)
* UI-Specs `01_scrollwheel` bis `05_calendar_sheet` implementieren
* Dark-Mode-Theme ARGENTUM umsetzen

### 25.2 v0.2 | AURA MVP

* Supabase Edge Function fuer Whisper-Transkription
* Transkript landet in der verknuepften Notiz
* UI zeigt Transkript in Notiz und Vorschau im Marker-Detail

### 25.3 v0.3 | PWA und Capacitor

* PWA-Manifest und Service Worker an die React-App binden
* Capacitor-Schicht scharfstellen, iOS-Build (braucht macOS)
* BLE-Plugin aktivieren, Ring-Pairing-Flow in den Einstellungen

### 25.4 v0.4+ | Ort und Uebersicht

* Reverse-Geocoding als Edge Function (Nominatim oder Apple MapKit)
* Wochen- und Monatsuebersicht der Marker-Dichte
* Filter nach Tag, Typ und Ort

### 25.5 Spaeter

* Summary und Auto-Tags durch AURA
* Verknuepfungsvorschlaege zwischen Markern und Notizen
* freier Chat mit AURA ueber die eigenen Daten
* Stimmungs- oder Zustandserkennung aus Audio
* Cleanup der Figma-Ballast-Komponenten (LYNA, JOI, Chat-Bubbles, kv_store) im Legacy-Unterordner

---

## 26. Offene Punkte und Spannungsfelder

* **macOS-Zugriff.** Ohne macOS bleibt iOS-Capacitor-Build blockiert. Entscheidung offen: Mac leihen, MacinCloud mieten, Mac kaufen, oder CI-Alternative.
* **Ring-Hardware.** Existenz und Firmware-Stand offen. App ist vorbereitet, bleibt bis zur Verfuegbarkeit auf Protokoll-Eintraege beschraenkt.
* **Legacy-Unterordner** `CUPRUM/src/Argentum/` wartet auf Cleanup. Bis dahin: nicht editieren, nur lesen.
* **Begriffsspannung Anker und Marker.** Der Anker fuehlt sich psychologisch gewichtiger an als der technische Marker. Beobachten.
* **Wiederholungs-Serien.** Aktuell naive Instanzen, keine Serien-Relation. Beobachten, ob Einfachheit haelt.
* **Kompression in der App.** Bleibt neutraler Protokoll-Eintrag, solange der Ring fehlt.
* **Audiodauer.** Auto-Stop nach 5 Minuten als Sicherheitsnetz, kein Nutzungslimit.
* **Anker-Verknuepfung zum geplanten Marker.** Lebt im Text-Feld `sub`, nicht als Relation. Zieht bei Titel-Aenderung nicht mit.
* **Package-Name** in `CUPRUM/package.json` lautet noch `"AURUM V2 (DA-09.04.2026)"` (Figma-Export). Kosmetisch, beim naechsten Cleanup auf `"cuprum"` aendern.
* **`index.html`-Title** in CUPRUM steht auf `"Argentum"`. Sollte auf `"AURUM"` oder `"CUPRUM"` geaendert werden.

---

## 27. Kritische Regeln

Architektonische Leitplanken. Gelten ab v0.1.

1. **AURUM live ist frozen.** Niemals Files unter `AURUM/` oder `AURUM.bat` aendern.
2. **CUPRUM ist Werkstatt.** Alle Aenderungen passieren in `CUPRUM/src/`.
3. **ARGENTUM ist Theme, kein Track.** Wenn der User "ARGENTUM" sagt, meint er das Dark-Mode-Theme.
4. **Ein Code-Ort, ein Entry.** `CUPRUM/src/main.tsx` ist der aktive Entry. `CUPRUM/src/Argentum/` ist Legacy.
5. **Capacitor duplicates nichts.** `webDir` zeigt auf den Build-Output von CUPRUM, kein doppelter Code.
6. **Versionsartefakte sind Doku, nicht Code.** Aeltere Starter oeffnen den aktuellen Stand.
7. **Kein API-Key im Client-Code.** AURA-Keys gehoeren in Supabase Edge Function Secrets oder `server.js`.
8. **Keine Push-Notifications.** Praesenz im Moment gehoert dem Armreif.
9. **AURA agiert nie ungefragt.** Transkription auf neuen Audiomarker ist dokumentierter Standard-Flow, kein Ungefragt-Handeln.
10. **Keine sichtbare AI-UI.** Keine Chat-Bubbles, keine Floating-AI-Buttons.
11. **Der Nutzer bleibt in Kontrolle.** Keine automatische Bewertung, keine automatischen Tags ohne Zustimmung.
12. **Schweizer Orthographie.** Kein Eszett, keine Em-Dashes. Gilt fuer Code-Kommentare, UI-Strings und Doku.
13. **Admin-Modus ist keine Security-Schicht.** Er steuert Sichtbarkeit, nicht Zugriff.
14. **Geraete-Reset beruehrt nur lokales.** Daten in Supabase bleiben unter allen Umstaenden erhalten.
15. **BLE kommt erst mit Capacitor.** Keine Web-Bluetooth-Fallback-Versuche im PWA-Modus auf iOS.
16. **Schema-Änderungen sind shared infrastructure.** AURUM live und CUPRUM nutzen dieselbe DB. Migrationen müssen backward-kompatibel sein.
17. **Tunnel-Hosts in `vite.config.ts` eintragen.** Jeder neue Subdomain-Name muss unter `server.allowedHosts` landen, sonst blockt Vite.
18. **Kein "Marker" als Oberbegriff.** Die sechs Typen (Anker, Audiomarker, Kompression, Termin, Ereignis, Notiz) heißen einzeln. DB-Spalte `marker_type` bleibt technisch so, in UI und Doku wird sie nicht als Oberbegriff verwendet.
19. **User vs. Admin sauber trennen.** Im User-Modus sind Anker, Audiomarker und Live-Kompression in der App nicht auslösbar. Im Admin-Modus alle fünf Instant/Planung-Typen sichtbar.
20. **Umlaute bleiben.** Schweizer Orthographie heißt: kein ß (→ ss), aber ä/ö/ü bleiben erhalten. Nicht ASCII-konvertieren zu oe/ae/ue.

---

## 28. Glossar

**AURUM** | die App als Konzept und als Live-Stand. Der frozen Monolith-HTML unter `AURUM/`.

**CUPRUM** | Werkstatt fuer die React/TS-Weiterentwicklung. Wird zum neuen AURUM live, sobald reif.

**ARGENTUM** | Dark-Mode-Theme innerhalb der AURUM-App. Kein Track, kein separater Ordner.

**AURA** | die KI-Schicht. Hauptzweck Transkription. Kein UI.

**Armreif** | das physische Objekt, Signalquelle fuer die App.

**Button 1** | Druckknopf am Armreif, loest Anker (1x) und Audiomarker (2x) aus.

**Button 2** | Hebel am Armreif, loest Kompressionen aus und unterbricht laufenden Druck.

**Anker** | Zeitpunkt ohne Inhalt, kurzfristige Auslagerung. Quelle: Armreif Button 1, 1x kurz.

**Audiomarker** | Zeitpunkt auf der Timeline, Inhalt in automatisch verknüpfter Notiz. Quelle: Armreif Button 1, 2x kurz.

**Kompression** | körperlicher Eingriff am Armreif, Ereignis ohne Inhalt, optional Dauer. Zwei Modi: live (Armreif Button 2) oder geplant (App).

**Termin** | in der App geplanter Zeitpunkt mit Ring-Rückmeldung zum Zeitpunkt.

**Ereignis** | in der App geplanter Anlass mit Kontext. Ohne Zeit → wird zur Notiz gespeichert (bewusster Zwischenzustand).

**Notiz** | freie Bedeutungsebene, bei Audiomarkern automatisch angelegt, sonst manuell. Eigene Tabelle `notes`.

**Tag** | verbindet Einträge und Notizen thematisch.

**"Marker" (nicht verwenden)** | kein Oberbegriff. Historische DB-Spalte `marker_type` bleibt technisch, in UI und Doku nicht als Sammelbegriff nutzen.

**Archiv** | Soft-Delete ueber `archived_at`. Ausserhalb der aktiven Listen, wiederherstellbar, nach 60 Tagen hart-geloescht.

**Admin-Modus** | lokaler Sichtbarkeits-Schalter pro Gerät (`localStorage['aurum_admin_mode']`). Default: an. Im Prototyp-Stand für alle Accounts verfügbar. Wenn an: alle fünf Instant/Planung-Typen im Erfassungs-Sheet. Wenn aus: nur Planung-Typen (Termin, Ereignis, geplante Kompression).

**User-Modus** | Synonym zum Nicht-Admin-Modus (Toggle aus). Zeigt den sauberen User-Flow: Anker, Audiomarker und Live-Kompression kommen **nur vom Armreif**, nicht aus der App. Für Diplomarbeits-Vorführung und als Vorschau des späteren Produktions-Stands.

**Prototyp-Stand (aktuell)** | Der Admin-Toggle ist für jeden Account lokal verfügbar. Keine Server-seitige Rollen-Prüfung.

**Produktions-Stand (später)** | Der Toggle wird entfernt oder an eine Account-Rolle gebunden. Nicht Thema in v0.1/v0.11.

**Praesentationsmodus** | synonym zum Nicht-Admin-Modus. Elemente mit Klasse `admin-only` werden ausgeblendet.

**Geraete-Reset** | loescht lokalen Geraete-Zustand (Session, Admin-Flag, Onboarding-Flag). Supabase-Daten bleiben.

**Capacitor** | Open-Source-Framework, wrappt Web-Code in eine native Shell.

**PWA** | Progressive Web App. Im Kontext CUPRUM: React-Build plus Manifest plus optional Service Worker.

**webDir** | Verzeichnis, das Capacitor beim Sync in die native Shell kopiert.

**Plugin** | Capacitor-Bruecke JavaScript-zu-Native. Jedes hat einen Web-Fallback.

**Cloudflare-Tunnel** | lokaler Port wird ueber Cloudflare-Client als `https://<name>.marcodemont.ch` exponiert. Fuer CUPRUM: `~/.cloudflared/cuprum.yml` → `localhost:8008`.

**allowedHosts** | Vite-Feld in `server`-Config. Muss den Tunnel-Hostnamen enthalten, sonst blockt Vite den Request.

**Vite** | moderner Frontend-Build-Tool. Basis von CUPRUM.

**Tailwind 4** | Utility-first CSS-Framework. Basis des CUPRUM-Stylings, neben CSS-Variablen.

**Radix UI** | Headless-UI-Primitives. Quelle vieler Komponenten aus dem Figma-Export.

**Legacy-Unterordner** | `CUPRUM/src/Argentum/`. Alt-Code aus der ARGENTUM-als-Track-Phase. Nicht im aktiven Build, steht fuer Cleanup an.

**Persona (Anti-Muster)** | jede Modellierung eines Prozesses als benannter Agent (LYNA, JOI). In AURUM ausgeschlossen.

---

## 29. Verhaeltnis zu anderen Dokumenten

* `CONCEPT_v1.md` | gefrorene Erstfassung, Referenz.
* `CONCEPT_v2.md` | gefrorene Zwischenfassung, App-Fokus plus Ring-Haptik.
* `CONCEPT_v3.md` | gefrorene Vorgaengerfassung, Hardware-Realitaet plus Capacitor-Plan.
* `CONCEPTv0.1 (CUPRUM).md` | **dieses Dokument, aktive Fassung.**
* `AURUMv0.1 (CUPRUM).md` | Versions-Doku des aktuellen Stands, konsolidiert v0.01 bis v0.09.
* `AURUMv0.01.md` bis `AURUMv0.06.md` | historische Einzel-Dokus fuer den Monolith-Stand.
* `AURUMv0.09.md` | historische Doku des ersten React-Ports (damals unter ARGENTUM-Namen).
* `ARCHITECTURE.md` | technische Detailarchitektur (BLE-Adapter, STT-Backend).
* `UI_v1.md` | UI-Analyse plus Referenz-Klone.
* `ui/01_scrollwheel.md` bis `ui/05_calendar_sheet.md` | konkrete UI-Specs fuer Scrollrad, Onboarding, Planned-Sheet, Week-Dots, Calendar-Sheet.
* `dns-marcodemont.ch.md`, `dns-studiodemont.ch.md` | DNS-Backups.
* `diverses/SECRETS.md` | Richtlinien fuer Geheimnisse.
* `diverses/API-Keys.md` | **Achtung:** enthaelt aktive Keys im Klartext, nie comiten, liegt in `.gitignore` pruefen.

---

## 30. Kurzfassung

AURUM in v0.1 ist:

* ein zeitbasiertes Selbstwahrnehmungssystem mit drei Namen für drei Rollen (AURUM live, CUPRUM Werkstatt, ARGENTUM Dark-Mode-Theme) und AURA als stiller KI-Schicht im Hintergrund
* mit **sechs eigenständigen Typen** (Anker, Audiomarker, Kompression, Termin, Ereignis, Notiz) — kein "Marker"-Oberbegriff
* mit Supabase-Backend, Row Level Security, Audio-Upload, Notizen-Ebene, Soft-Delete-Archiv
* als PWA unter `aurum.marcodemont.ch` (live, Monolith) und `cuprum.marcodemont.ch` (Werkstatt, React) erreichbar
* mit Capacitor-Schicht vorbereitet, aktiviert sobald macOS-Zugriff vorliegt
* mit Admin- und Präsentationsmodus für Diplomarbeits-Kontext
* mit Geräte-Reset für neutralen Neustart ohne Datenverlust
* mit dokumentierten UI-Mustern für Scrollrad, Onboarding, Planned-Sheet, Week-Dots, Calendar-Sheet

mit klarer Trennung von:

* **Moment** (Armreif, minimal, physisch) — Anker, Audiomarker, Kompression live
* **Planung** (App, bewusst) — Termin, Ereignis, Kompression geplant
* **Reflexion** (App, ruhig, nachgelagert)
* **Rohinhalt** (Audio, Transkript)
* **Bedeutung** (Notiz)

und klarer Rollen-Trennung:

* **User** — Armreif als primäres Eingabegerät. App nur Planung und Auswertung.
* **Admin** — alle Typen in der App auslösbar zur Simulation.

und klaren Regeln für:

* Frozen Live-Stand (AURUM)
* Werkstatt-Stand (CUPRUM)
* Theme (ARGENTUM)
* Stille KI (AURA)
* Schweizer Orthographie mit Umlauten (kein ß, ä/ö/ü bleiben)
* shared DB-Infrastructure (backward-kompatible Migrationen)

Alles andere bleibt wie in v3. Das System ist ruhig, reduziert, Diplomarbeit-Scope. Es wird nicht zum KI-Tool, nicht zum Reminder-System und nicht zum Gamification-Objekt.
