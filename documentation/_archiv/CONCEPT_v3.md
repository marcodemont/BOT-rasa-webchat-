# AURUM | Konzept v3

- Version: v3 (2026-04-19)
- Status: Aktive Fassung. Loest v2 (`CONCEPT_v2.md`) als Diskussionsgrundlage ab. v1 (`CONCEPT_v1.md`) und v2 bleiben als eingefrorene Referenz.
- Scope: AURUM (App plus kuenftige Armreif-Kopplung plus AURA als KI-Schicht). ROMY ist nicht Teil dieses Konzepts.

Gegenueber v2 gelten folgende grundlegende Aenderungen:

* **Hardware-Realitaet dokumentiert.** v2 hat implizit mit einem Entwicklungsrechner plus iPhone gerechnet. v3 macht das Setup explizit: Windows-Laptop, zwei iPhones, zwei iPads, kein Mac, keine Android-Geraete. Das schlaegt direkt auf alle Entscheidungen zur Distribution, Test-Moeglichkeiten und BLE-Zeitlinie durch.
* **Distribution in zwei Etappen.** Fuer v0.06 wird bewusst der PWA-Weg gewaehlt. Capacitor bleibt Zielbild, kommt aber erst, wenn macOS-Zugriff fuer iOS-Build organisiert ist.
* **Ein-App-Modell.** `app/AURUM.html` ist der einzige Web-Code. Aeltere Parallel-HTMLs existieren nicht mehr. Versionen werden in-place aufgewertet, pro Version bleibt nur eine Doku und ein Starter.
* **Admin-/Praesentationsmodus** ist Kernbestandteil, nicht Debug-Extra. Er schuetzt die Diplomarbeits-Praesentation.
* **Wochen-Dots in ehrlicher Markerfarbe.** Die Typ-Farbe ist Fallback, nicht Default.
* **Geraete-Reset** ist fest eingebaut. Jeder Nutzer kann ein Geraet in den neutralen Zustand zuruecksetzen, ohne Daten in Supabase zu verlieren.

Alles, was v2 ueber die Leitidee, die zwei Ebenen, das Begriffssystem der Marker-Typen, die Timeline-Funktion und die AURA-Zurueckhaltung gesagt hat, bleibt unveraendert.

---

## Inhaltsverzeichnis

0. Einordnung
1. Leitidee in einem Satz
2. Zwei Ebenen
3. Zwei Phasen
4. Begriffssystem (Marker-Typen)
5. Beziehung Marker und Notiz
6. Die Timeline
7. AURA
8. Hardware-Realitaet
9. Distribution in zwei Etappen
10. Versionsmodell
11. Armreif als Signalquelle
12. Datenmodell und Architektur
13. Admin- und Praesentationsmodus
14. Geraete-Reset
15. Nutzungsablauf
16. Designprinzipien
17. UI-Bereiche
18. Was bewusst nicht Teil des Systems ist
19. Systemkreislauf
20. Versionsstand (2026-04-19)
21. Roadmap
22. Offene Punkte und Spannungsfelder
23. Kritische Regeln
24. Glossar
25. Verhaeltnis zu anderen Dokumenten
26. Kurzfassung

---

## 0. Einordnung

AURUM ist keine klassische App, sondern ein zeitbasiertes Selbstwahrnehmungssystem. Die App ist das primaere Produkt. Sie erhaelt Signale von einem physischen Armreif, der im Moment den koerperlichen Input uebernimmt, und stellt sie als ruhige, strukturierende Schicht zwischen Wahrnehmung und Handlung dar.

Das System ist Kernartefakt einer Diplomarbeit. Stand Konzept v3: Die Web-App ist in einer einzigen HTML-Datei realisiert (Vanilla JavaScript, PWA-Manifest). Die native Schicht ist als Capacitor-Projekt unter `mobile/` vorbereitet, aber noch nicht aktiv gebaut.

---

## 1. Leitidee in einem Satz

Die App speichert und zeigt (AURUM), die KI transkribiert im Hintergrund (AURA), die Entscheidungen bleiben beim Nutzer, und die Praesenz im Moment gehoert dem Armreif.

---

## 2. Zwei Ebenen

* **AURUM** | die App. Speicherung, Struktur, Kontext, Darstellung.
* **AURA** | die KI-Schicht. Hauptzweck: Transkription. Alles andere nachgelagert.

Regel bleibt: AURUM speichert, AURA transkribiert. AURA darf Daten verarbeiten, nicht bewerten. AURA darf vorschlagen, nicht entscheiden. Der Nutzer bleibt in Kontrolle.

---

## 3. Zwei Phasen

### Phase 1 | Erfassen im Moment (Armreif)

* physisch, nicht digital
* minimale Interaktion
* keine kognitive Belastung
* keine Eingabeaufforderung

Zwei Bedienelemente mit bewusst unterschiedlicher Haptik:

* **Button 1 | Druckknopf.** Klassischer Klick. 1x kurz -> Anker. 2x kurz -> Audiomarker.
* **Button 2 | Hebel mit Rueckstellung.** Hochdruecken -> Kompression, Loslassen federt zurueck.

Die App ist im Moment nicht noetig.

### Phase 2 | Verstehen danach (App)

* ruhige, bewusste Nutzung
* Reflexion statt Reaktion
* niedrige Nutzungsfrequenz, bewusste Sitzungen

---

## 4. Begriffssystem (Marker-Typen)

| Typ | Funktion | Inhalt | Ausgeloest durch |
|---|---|---|---|
| **Anker** | kurzfristige Auslagerung eines Gedankens | leer oder minimal, Zeit plus optional Ort | Button 1, 1x kurz |
| **Audiomarker** | Zeitpunkt auf der Timeline, Rohinhalt in Notiz | nur Zeit plus Verweis auf Notiz | Button 1, 2x kurz |
| **Kompression** | koerperlicher Eingriff am Armreif | Ereignis, kein Inhalt | Button 2 oder geplanter Marker |
| **Geplanter Marker** | zukuenftiger Zeitpunkt mit haptischer Rueckmeldung | Titel, Zeit, optional Farbe, optional Wiederholung | Nutzer in der App |

Im DB-Feld `marker_type`: `anchor`, `audio`, `compression`, `planned`.

### 4.1 Anker

Ein Anker ist kein Eintrag im Sinne von „hier ist etwas passiert", sondern ein temporaerer Speicher. Er erlaubt, einen Gedanken sofort loszulassen, ohne ihn zu verlieren.

### 4.2 Audiomarker

Der Audiomarker trennt zwei Dinge:

* Auf der Timeline entsteht ein Marker, der nur den Zeitpunkt haelt.
* Der eigentliche Rohinhalt wird automatisch als Notiz angelegt und mit dem Marker verknuepft.

### 4.3 Kompression

Drei Zustaende: automatisch (aus geplantem Marker), manuell (Hebel), Abbruch (Hebel waehrend aktiver Kompression). Aktuell wird die Kompression nur als Protokoll-Eintrag gespeichert, solange die Ring-Kopplung nicht aktiv ist.

### 4.4 Geplanter Marker

Kein klassischer Reminder. Er ersetzt die Push-Notification durch einen graduellen koerperlichen Reiz am Armreif. Neu seit v0.04:

* Farbauswahl aus kuratierter Palette
* vier Wiederholungstypen (einmalig, wochentags, taeglich, woechentlich) als naive Instanz-Kopien

---

## 5. Beziehung Marker und Notiz

Drei Rollen, sauber getrennt: **Marker** gleich Moment, **Audio** gleich Rohinhalt, **Notiz** gleich Bedeutung.

Regeln:

* Ein Audiomarker erzeugt automatisch eine Notiz.
* Ein Anker kann ohne Notiz bleiben.
* Eine Notiz kann ohne Marker existieren.
* Die Verknuepfung entsteht ueber direkte, kontextuelle Interaktion, nicht ueber Menues.
* Tags verbinden thematisch und zeitlich.

Klick auf einen Marker oeffnet den Marker-Detail-Screen. Bei Audiomarkern fuehrt von dort ein Button direkt in die verknuepfte Notiz.

---

## 6. Die Timeline

Die Timeline ist kein Content-Feed und keine Chronologie von Notizen, sondern ein Rohprotokoll von Zustaenden, Signalen und Reaktionen.

### 6.1 Vier Perspektiven

* aktive Tagesstruktur
* Log (wann reagiert, wann Signal gesetzt, wann nur markiert)
* somatisch gekoppelt (Timeline enthaelt auch koerperliche Interaktionen)
* Analysefeld (zur Mustererkennung ueber Zeit, kognitiv durch den Nutzer, nicht algorithmisch)

### 6.2 Visuelle Auspraegung pro Typ

* Anker: minimaler Punkt plus Label
* Audiomarker: Karte mit Transkript-Snippet
* Kompression: eigene warme Darstellung
* Geplanter Marker: gestrichelt bis erreicht, danach regulaer, Status offen oder erledigt

### 6.3 Wochen-Dots (seit v0.05)

Unter jedem Wochentag erscheinen bis zu drei Dots (Audio, Kompression, geplant). Die Dot-Farbe ist die echte Marker-Farbe (aus dem `color`-Feld). Fallback auf die Typ-Variable `--mt-${type}`, wenn `color` leer.

---

## 7. AURA (KI-Schicht)

AURA ist Algorithmus, kein Akteur.

### 7.1 Hauptzweck

Transkription des Audios via Whisper. Das Transkript landet direkt in der verknuepften Notiz.

### 7.2 Spaeter und optional

* Moment-Zusammenfassung in einem Satz
* Auto-Tags (1 bis 3)
* Verknuepfungsvorschlaege
* freier Chat mit AURA ueber die eigenen Daten

### 7.3 Technische Leitplanke

API-Keys fuer AURA gehoeren in Supabase Edge Function Secrets, nie in den Browser-Code.

---

## 8. Hardware-Realitaet

v3 dokumentiert explizit die verfuegbaren Geraete des Entwicklers, weil sie konkrete Konsequenzen fuer die Distribution haben.

### 8.1 Vorhanden

| Geraet | Rolle |
|---|---|
| Lenovo-Laptop, Windows | Entwicklungsrechner |
| iPhone 16 Pro | primaeres Test-Handy |
| iPhone 13 Pro | zweites Test-Handy |
| iPad Pro 2018 | grosses Test-Geraet |
| iPad Pro 2025 | grosses Test-Geraet |

### 8.2 Nicht vorhanden

* macOS-Rechner
* Android-Geraet
* Apple-Developer-Account (noch)
* Armreif-Hardware (noch)

### 8.3 Konsequenzen

* **Web Bluetooth ist auf keinem Test-Geraet verfuegbar.** iOS Safari und WebKit unterstuetzen Web Bluetooth nicht. Keine PWA auf iPhone oder iPad kann direkt BLE.
* **iOS-Capacitor-Build ist blockiert, bis macOS organisiert ist.** Xcode ist macOS-only. Die Optionen sind: Mac leihen, MacinCloud mieten, Mac kaufen, alternative CI (ioniclewebapp / EAS) pruefen.
* **Android-Capacitor-Build ist moeglich**, nutzt uns aber nichts, solange kein Android-Testgeraet vorhanden ist.
* **HTTPS auf dem Laptop** ist die einzige Moeglichkeit, das PWA-Verhalten auf dem iPhone sauber zu testen. Loesung: Cloudflare Quick Tunnel vor `localhost:8000`, ergibt eine `https://*.trycloudflare.com`-URL, die Safari akzeptiert.

---

## 9. Distribution in zwei Etappen

### 9.1 Etappe 1 | v0.06 | PWA

* `app/AURUM.html` wird via Cloudflare-Tunnel oder statischem Hosting (Netlify, Vercel, Cloudflare Pages) mit HTTPS ausgeliefert.
* Test-iPhones installieren sie ueber Safari → Teilen → Zum Home-Bildschirm.
* Vollbild, Notch-Respekt, Mikrofon und Geolocation funktionieren.
* BLE **nicht** verfuegbar. Die UI zeigt im Admin-Modus einen „BLE erst mit v0.07"-Hinweis statt Ring-Pairing.

### 9.2 Etappe 2 | v0.07 oder spaeter | Capacitor

* Sobald macOS-Zugriff vorhanden: `npx cap add ios`, Xcode-Build, auf iPhone deployen.
* Capacitor-Plugins aus `mobile/package.json` werden scharfgestellt: Bluetooth LE, Geolocation, Preferences, Filesystem.
* Der Web-Code bleibt identisch. Der JavaScript-Bruecke in `app/AURUM.html` erkennt die native Shell per `window.Capacitor?.isNativePlatform()` und schaltet die BLE-UI frei.

### 9.3 Was an der App nicht getrennt wird

Eine `app/AURUM.html`. Sie wird sowohl in der PWA geladen als auch von Capacitor in die WebView gehievt. Kein Code-Duplikat.

---

## 10. Versionsmodell

### 10.1 Ein Code-Ort, viele Doku-Eintraege

* `app/AURUM.html` ist der **einzige** Web-Code.
* Pro Version gibt es eine Doku-Datei `documentation/AURUMv0.XX.md` (Delta).
* Ob pro Version zusaetzlich eine `AURUMv0.XX.bat` auf Root liegt, ist Historie-Frage, nicht Code-Frage. Ab v0.07 ist der Plan: **eine `AURUM.bat`** startet immer den aktuellen Stand.

### 10.2 Keine Parallelkopien mehr

Frueher existierten `AURUMv2.html ... AURUMv5.html` parallel. Ab v0.06 entfaellt dieses Muster. Historische Code-Staende liegen nur noch in extern gesicherten Zip-Backups.

### 10.3 Was neue Version rechtfertigt

Nicht jeder Commit. Eine neue `AURUMv0.XX.md` wird geschrieben, wenn ein abgegrenzter Aenderungsblock dokumentiert gehoert, typischerweise:

* neues Feature-Bundle
* strukturelle Aenderung der Repo- oder UI-Struktur
* Migration auf neuen Stack (z. B. v0.06 mit Capacitor-Schicht)

---

## 11. Armreif als Signalquelle

Bleibt Kernstueck, aber nicht prioritaer umsetzbar, solange das Geraet und macOS-Zugriff fehlen.

### 11.1 Was die App vom Armreif wissen muss

* welcher Button betaetigt wurde (1 Druckknopf, 2 Hebel)
* wie (1x/2x kurz bei Button 1; Hebelkurve plus Loslassen bei Button 2)
* wann (Zeitstempel)

### 11.2 Technische Umsetzung (vorbereitet, nicht aktiv)

* Bluetooth LE, GATT-Service im Capacitor-Wrap fuer iOS
* Plugin: `@capacitor-community/bluetooth-le`
* BLE-UUIDs (Default, anpassbar in Settings):
  * Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
  * Notify Characteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
  * Write Characteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
* im Datenmodell vorbereitet: `markers.source` (`app` gegen `ring`), `user_settings.ring_paired_id`

### 11.3 Haptik als Teil der Botschaft

Button 1 klar und diskret (mental), Button 2 koerperlich und regulierend. Die App nimmt die Unterscheidung ueber Marker-Typen auf, nicht visuell.

---

## 12. Datenmodell und Architektur

### 12.1 Stack

* **Frontend** | eine einzige HTML-Datei (`app/AURUM.html`), Vanilla JavaScript, installierbar als PWA
* **Backend** | Supabase Projekt `Diplomarbeit`, Postgres mit Row Level Security, Supabase Auth, Supabase Storage
* **Edge Functions** (geplant, v0.09) | Whisper-Transkription
* **Service Worker** (`sw.js`) | derzeit deaktiviert, Rekativierung optional
* **Native Schicht** (vorbereitet in `mobile/`) | Capacitor mit Plugin-Vollset

### 12.2 Tabellen (Kurzform)

* `markers` | `id`, `user_id`, `marker_date`, `start_time`, `marker_type`, `latitude`, `longitude`, `location_label`, `audio_path`, `transcript`, `summary`, `tags`, `source`, `title`, `is_done`, `color`, `repeat_type`, `sub`
* `notes` | freie Notizen, optional verknuepft mit einem Marker, mit Tags
* `user_settings` | Druckaufbau-Dauer, Wiederholungs-Intervall, Geolocation an oder aus, Ring-UUIDs, Ring-Pairing-ID
* `auth.users` | Supabase-Standard

### 12.3 Storage

Bucket `audio-markers`, Public: false, Pfad `<user_id>/<marker_id>.<ext>`. RLS-Policies in Migration 04.

### 12.4 Lokale Persistenz

* **PWA:** `localStorage` und hybrider Wrapper `storage` im Code.
* **Capacitor (ab v0.07):** `@capacitor/preferences` als Ersatz fuer `localStorage`. Migration per Einmal-Skript beim ersten nativen Start.

Lokale Keys:

* `aurum_session` | Auth-Session
* `aurum_admin_mode` | Admin-/Praesentationsmodus (`'1'` default)
* `aurum_onboarded` | reserviert fuer v0.07-Onboarding

---

## 13. Admin- und Praesentationsmodus

Neu als Kernbestandteil seit v0.05. Schaltet im Nicht-Admin-Modus folgende Elemente aus:

* Anker-Option im Marker-Sheet
* Kompressions-Option im Marker-Sheet (solange BLE nicht aktiv ist)
* Armreif-Section in den Einstellungen
* Versions-/Diplomarbeits-Footer auf Login und Einstellungen
* spaeter optional: BLE-Pairing-UI

### 13.1 Technische Umsetzung

* Key: `localStorage['aurum_admin_mode']`, Default `'1'`
* JS: `isAdminMode()`, `applyAdminVisibility()`, `onAdminToggle()`
* CSS: `body:not(.admin-mode) .admin-only { display:none !important }`
* Init ruft `applyAdminVisibility()` vor der ersten Render-Operation

### 13.2 Zweck

Der Modus ist primaer fuer Diplomarbeits-Praesentationen gebaut. Er gibt der Person am Laptop oder iPad eine ruhige, „verkaufsfertige" Oberflaeche. Gleichzeitig bleibt der Entwicklungsmodus einen Klick entfernt.

---

## 14. Geraete-Reset

Button in den Einstellungen („Komplett zuruecksetzen"). Funktion `resetDeviceState()`:

1. Confirm-Dialog
2. `storage.del('aurum_session')`
3. `localStorage.removeItem('aurum_admin_mode')`
4. `localStorage.removeItem('aurum_onboarded')` (Vorbereitung v0.07)
5. In-Memory-State zuruecksetzen
6. `location.reload()`

Daten in Supabase bleiben unberuehrt. Das Geraet startet nach Reload wie eine Neuinstallation.

---

## 15. Nutzungsablauf

### 15.1 Im Moment (Armreif)

1. Button 1, 1x kurz | Anker entsteht
2. oder Button 1, 2x kurz | Audiomarker entsteht, Aufnahme laeuft
3. oder Button 2, Hebel hoch | manuelle Kompression
4. kein Blick aufs Telefon noetig

### 15.2 Bei Faelligkeit (Armreif)

1. Geplanter Marker erreicht Zeitpunkt
2. Armreif baut graduell Druck auf
3. Nutzer kann Button 2 betaetigen, um abzubrechen

### 15.3 Danach (App)

1. App oeffnen, Timeline zeigt die letzten Ereignisse
2. Klick auf Marker -> Detail-Screen
3. bei Audiomarker: Notiz-Sprung mit vorbefuelltem Transkript
4. abends: geplante Marker auf erledigt setzen

---

## 16. Designprinzipien

### 16.1 Farbwelt

* helle Pastelltoene, warme Papiertoene
* keine reinen Weisstoene
* gezielte goldene Akzente
* Farbe markiert Zustaende, nicht Dekoration

### 16.2 Formensprache

* Kreise, Ovale, stark abgerundete Rechtecke
* keine harten Ecken
* viel Negativraum

### 16.3 Typografie

* klare Hierarchie
* dominante Headlines, einzelne Schluesselwoerter farblich hervorgehoben
* Sekundaertext reduziert

### 16.4 Interaktion

* direkte Manipulation, wenig Menues
* klare Zustaende statt komplexer Optionen
* ein Screen, eine Entscheidung

### 16.5 Sprache und Orthographie

* **Schweizer Orthographie, kein Eszett.**
* **Keine Em-Dashes.**
* ruhige, analytische Sprache, nicht werbend
* keine motivationalen Floskeln

### 16.6 Wirkung

* ruhig, stabil, konsistent
* niedrige visuelle Aggressivitaet
* Orientierung ohne Aufmerksamkeit zu fordern

---

## 17. UI-Bereiche

Die detaillierte UI-Analyse mit Uebernahme-Kandidaten aus den Referenz-Klonen (`me+`, `Planwoo`, `Struktured`) liegt in `documentation/UI_v1.md`. Grobstruktur:

1. **Login** | Anmelde- und Registrier-Screen mit Bestaetigungs-Mail
2. **Timeline** | zentrale Ansicht, Marker aller Typen auf einer Linie, Wochen- und Tagesbezug
3. **Marker-Detail** | typ-spezifisch
4. **Notizen** | Liste, Editor, Tags, optional mit Marker verknuepft
5. **Einstellungen** | Druckaufbau, Wiederholung, Geolocation, Ring (ab v0.07 aktiv), Admin-Modus, Konto, Geraete-Reset

---

## 18. Was bewusst nicht Teil des Systems ist

AURUM ist **nicht**:

* klassisches Notiztool
* Tracking-System (kein Verhaltens-Scoring, keine Quantifizierung)
* aktiver KI-Assistent (AURA agiert nie ungefragt)
* Gamification-System (keine Streaks, Scores, Levels)
* Push-basiertes Remindersystem
* kommerzielles Produkt mit Paywall

**Feste Regel:** Die App schickt nie Push-Notifications. Alles, was die App tut, ist nachgelagert und freiwillig.

---

## 19. Systemkreislauf

1. Signal wird gesetzt (am Armreif oder in der App)
2. Ereignis wird gespeichert (AURUM, Supabase)
3. bei Audiomarker: Notiz wird angelegt, Audio gespeichert
4. Audio wird transkribiert (AURA, v0.09) und Transkript in die Notiz geschrieben
5. Nutzer reflektiert spaeter (App)
6. Muster entstehen ueber Zeit (kognitiv beim Nutzer)

---

## 20. Versionsstand (2026-04-19)

* **v0.01** | Klickdummy, 5 Screens, dunkles Theme
* **v0.02** | Pastell-Cream plus goldene Akzente, CSS-Variablen
* **v0.03** | AI-Nav-Eintrag zu Notizen
* **v0.04** | Timeline mit echten Supabase-Daten, dynamische Wochen, Check-Toggle
* **v0.05** | Login ueber Supabase Auth, RLS, Logout
* **v0.06** | Begriffssystem vereinheitlicht, Audiomarker-Flow, Geo-Anker, Einstellungen, PWA-Manifest, Schema-Migration 04, Wochen-Dots mit echter Markerfarbe, Admin-/Praesentationsmodus, Geraete-Reset, Repo-Reorganisation, Capacitor-Schicht vorbereitet (`mobile/`)

Aktueller Fokus: Stabilisierung von v0.06 als PWA auf iPhone und iPad.

---

## 21. Roadmap

### 21.1 v0.07 | PWA-Reife plus Onboarding

* Onboarding-Sequenz fuer neue Geraete (wird durch Reset scharfgestellt)
* Mobile- und Desktop-Modus in einer Datei (Bezel-Demo gegen Fullscreen)
* Einheitliche `AURUM.bat` als einziger Starter
* Service-Worker optional reaktivieren

### 21.2 v0.08 | Capacitor scharfgestellt

* macOS-Zugriff organisieren (Mac leihen oder mieten)
* iOS-Build, Deployment auf iPhone 16 Pro und iPhone 13 Pro
* Preferences-Plugin ersetzt `localStorage`
* Geolocation-Plugin ersetzt `navigator.geolocation` in der nativen Shell

### 21.3 v0.09 | AURA MVP

* Supabase Edge Function fuer Whisper-Transkription
* Transkript landet in der verknuepften Notiz
* UI zeigt Transkript in Notiz und als Vorschau im Marker-Detail

### 21.4 v0.10 | Ring-Kopplung

* BLE-Plugin aktivieren
* Ring-Pairing-Flow in den Einstellungen
* `markers.source='ring'` wird geschrieben
* Button-1-Events (1x, 2x) und Button-2-Events (Hebelkurve, Loslassen) in die App

### 21.5 v0.11+ | Ort und Uebersicht

* Reverse-Geocoding als Edge Function (Nominatim oder Apple MapKit)
* Wochen- und Monatsuebersicht der Marker-Dichte
* Filter nach Tag, Typ und Ort

### 21.6 Spaeter

* Summary und Auto-Tags durch AURA
* Verknuepfungsvorschlaege zwischen Markern und Notizen
* freier Chat mit AURA ueber die eigenen Daten
* Stimmungs- oder Zustandserkennung aus Audio

---

## 22. Offene Punkte und Spannungsfelder

* **macOS-Zugriff.** Entscheidung noch offen: Mac leihen, MacinCloud mieten, Mac kaufen, oder CI-Alternative. Ohne diese Entscheidung bleibt v0.08 blockiert.
* **Ring-Hardware.** Existenz und Firmware-Stand des Armreifs sind fuer den aktuellen Zeitpunkt offen. Die App ist vorbereitet, bleibt aber bis zur Hardware-Verfuegbarkeit auf Protokoll-Eintraege beschraenkt.
* **Begriffsspannung Anker und Marker.** Der Anker fuehlt sich psychologisch gewichtiger an als der technische Marker. Beobachten.
* **Wiederholungs-Serien.** Aktuell naive Instanzen, keine Serien-Relation. Wird beobachtet, ob die Einfachheit haelt oder ausbricht.
* **Kompression in der App.** Bleibt neutraler Protokoll-Eintrag, solange der Ring fehlt.
* **Audiodauer.** Auto-Stop nach 5 Minuten als Sicherheitsnetz, kein Nutzungslimit.
* **Anker-Verknuepfung zum geplanten Marker.** Lebt im Text-Feld `sub`, nicht als Relation. Zieht bei Titel-Aenderung nicht mit.

---

## 23. Kritische Regeln

Architektonische Leitplanken. Gelten fuer jede Version ab v0.06.

1. **Eine App, ein Code-Ort.** `app/AURUM.html` ist der einzige Web-Code. Keine Parallel-HTMLs pro Version.
2. **Capacitor duplicates nichts.** `webDir: "../app"` ist fix. Keine Kopie in `mobile/www/`.
3. **Versionsartefakte sind Doku, nicht Code.** Aeltere Starter oeffnen den aktuellen Stand, nicht ihren historischen Urzustand.
4. **Kein API-Key im Web-Code.** AURA-Keys gehoeren in Supabase Edge Function Secrets.
5. **Keine Push-Notifications.** Praesenz im Moment gehoert dem Armreif.
6. **AURA agiert nie ungefragt.** Transkription auf neuen Audiomarker ist kein Ungefragt-Handeln, sondern dokumentierter Standard-Flow.
7. **Der Nutzer bleibt in Kontrolle.** Keine automatische Bewertung, keine automatischen Tags, keine automatischen Verknuepfungen ohne explizite Zustimmung.
8. **Schweizer Orthographie.** Kein Eszett, keine Em-Dashes. Gilt fuer Code-Kommentare, UI-Strings und Doku.
9. **Admin-Modus ist keine Security-Schicht.** Er steuert Sichtbarkeit fuer Praesentationen, nicht Zugriff. Keine Geheimnisse dahinter verstecken.
10. **Geraete-Reset beruehrt nur lokales.** Daten in Supabase bleiben unter allen Umstaenden erhalten.
11. **BLE kommt erst mit Capacitor.** Keine Web-Bluetooth-Fallback-Versuche im PWA-Modus auf iOS.

---

## 24. Glossar

**AURUM** | die App. Speicherung und Struktur.

**AURA** | die KI-Schicht, Hauptzweck Transkription.

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

**Capacitor** | Open-Source-Framework, wrappt Web-Code in eine native Shell.

**PWA** | Progressive Web App. Im Kontext AURUM: `app/AURUM.html` plus `manifest.webmanifest` plus optional `sw.js`.

**webDir** | Verzeichnis, das Capacitor beim Sync in die native Shell kopiert. In AURUM auf `../app` gesetzt.

**Plugin** | Capacitor-Bruecke JavaScript-zu-Native. Jedes hat einen Web-Fallback.

**Cloudflare Quick Tunnel** | Ein-Zeilen-Kommando, gibt eine temporaere HTTPS-URL vor `localhost`, funktioniert ohne Account.

**Admin-Modus** | lokaler Sichtbarkeits-Schalter fuer Debug- und Entwicklungs-Elemente. Default: an.

**Praesentationsmodus** | synonym zum Nicht-Admin-Modus. Elemente mit Klasse `admin-only` werden ausgeblendet.

**Geraete-Reset** | loescht lokalen Geraete-Zustand (Session, Admin-Flag, Onboarding-Flag). Supabase-Daten bleiben.

**Persona (Anti-Muster)** | jede Modellierung eines Prozesses als benannter Agent. In AURUM ausgeschlossen.

---

## 25. Verhaeltnis zu anderen Dokumenten

* `CONCEPT_v1.md` | gefrorene Vorfassung, Referenz.
* `CONCEPT_v2.md` | gefrorene Vorgaengerfassung.
* `CONCEPT_v3.md` | **dieses Dokument, aktive Fassung.**
* `CONCEPT.md` | Kompakt-Version des aktuellen Konzepts. Wird synchron zu v3 gehalten.
* `CHANGELOG.md` | technischer Versionsverlauf (v0.01 bis v0.06 dokumentiert).
* `AURUMv0.XX.md` | Pro-Version-Delta-Doku, je eine Datei pro App-Version.
* `ARCHITECTURE.md` | technische Detailarchitektur des Clients.
* `UI_v1.md` | detaillierte UI-Analyse, Ist-Zustand plus Uebernahme-Kandidaten aus den Referenz-Klonen.
* `README.md` | Projekt-Einstiegspunkt, Schnellstart.
* `SECRETS.md` | Richtlinien fuer Geheimnisse, keine Geheimnisse selbst.
* `API-Keys.md` | private Kopien der Schluessel, niemals comiten.

---

## 26. Kurzfassung

AURUM in v3 ist:

* ein zeitbasiertes Selbstwahrnehmungssystem in einer einzigen HTML-Datei
* mit Supabase-Backend, Row Level Security, Audio-Upload, Notizen-Ebene
* als PWA heute auf iPhone und iPad installierbar, ueber Cloudflare-Tunnel oder statisches Hosting
* mit Capacitor-Schicht vorbereitet, aktiviert sobald macOS-Zugriff vorliegt
* mit Admin-/Praesentationsmodus fuer Diplomarbeits-Kontext
* mit Geraete-Reset fuer neutralen Neustart ohne Datenverlust

mit klarer Trennung von:

* Moment (Armreif, minimal, physisch)
* Reflexion (App, ruhig, nachgelagert)
* Rohinhalt (Audio, Transkript)
* Bedeutung (Notiz)

und einem ehrlichen Blick auf die Hardware-Realitaet:

* Entwicklung auf Windows
* Tests auf iPhone und iPad
* BLE und iOS-Build warten auf macOS-Zugriff
* Android und Web-Bluetooth sind kein Pfad

Alles andere bleibt wie in v2. Das System ist ruhig, reduziert, Diplomarbeit-Scope. Es wird nicht zum KI-Tool, nicht zum Reminder-System und nicht zum Gamification-Objekt.
