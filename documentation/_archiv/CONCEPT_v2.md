# AURUM | Konzept v2

- Version: v2 (2026-04-19)
- Status: Aktive Fassung. Loest v1 als Diskussionsgrundlage ab. v1 (`CONCEPT_v1.md`) ist gefroren und bleibt als Referenz erhalten.
- Scope: AURUM (App, Armreif als Signalquelle, AURA als KI-Schicht). `.ROMY` ist ein getrenntes Projekt und kein Bestandteil dieses Konzepts.
- Wichtige Verschiebung gegenueber v1: **Der Fokus liegt auf der App.** Der Armreif wird nur so weit beschrieben, wie noetig ist, um klar zu machen, wie Signale per Bluetooth in die App kommen. Die somatisch-haptische Kopplung bleibt inhaltlich zentral, weil genau die Art der Rueckmeldung AURUM von klassischen Apps unterscheidet.

---

## 0. Einordnung

AURUM ist keine klassische App, sondern ein zeitbasiertes Selbstwahrnehmungssystem. Die App ist das primaere Produkt. Sie erhaelt Signale von einem physischen Armreif, der im Moment den koerperlichen Input uebernimmt, und stellt sie als ruhige, strukturierende Schicht zwischen Wahrnehmung und Handlung dar.

Die zweite Saeule neben der Darstellung ist die haptische Rueckmeldung am Koerper. Ohne diese somatische Ebene waere AURUM ein reiner Notizspeicher. Mit ihr wird es ein Uebersetzer zwischen Zeit und Koerper.

Das System ist Kernartefakt einer Diplomarbeit. Es ist bewusst reduziert und in einer PWA plus Supabase-Backend bereits in Teilen realisiert (aktueller Stand: v0.08).

---

## 1. Leitidee in einem Satz

Die App speichert und zeigt (AURUM), die KI transkribiert im Hintergrund (AURA), die Entscheidungen bleiben beim Nutzer, und die Praesenz im Moment gehoert ausschliesslich dem Armreif.

---

## 2. Zwei Ebenen

- **AURUM** | die App. Speicherung, Struktur, Kontext, Darstellung. Das ist das eigentliche Produkt.
- **AURA** | die KI-Schicht. Hauptzweck ist die **Transkription** von Audioaufnahmen. Weitere Faehigkeiten (Zusammenfassung, Auto-Tags) sind moeglich, aber ausdruecklich nachgelagert.

Wichtig ist die Trennung dieser Rollen:

- AURUM speichert, AURA transkribiert.
- AURA darf Daten verarbeiten, aber nicht bewerten.
- AURA darf vorschlagen, aber nicht entscheiden.
- Der Nutzer bleibt immer in Kontrolle.

---

## 3. Zwei Phasen

Das System teilt sich strikt in zwei Zeitlogiken.

### Phase 1 | Erfassen im Moment (ueber den Armreif)

- physisch, nicht digital
- minimale Interaktion
- keine kognitive Belastung
- keine Eingabeaufforderung, keine Unterbrechung
- keine sofortige Strukturierung

Der Armreif hat genau zwei Bedienelemente, mit bewusst unterschiedlicher Haptik:

- **Button 1 | Druckknopf.** Klassischer Klick.
  - *1x kurz druecken* | setzt einen **Anker** (Zeitpunkt ohne Inhalt)
  - *2x kurz druecken* | startet eine **Audioaufnahme**, erzeugt einen Audiomarker. Der Marker landet auf der Timeline, der eigentliche Rohinhalt (Audio, spaeter Transkript) wird direkt als **Notiz** gespeichert.
- **Button 2 | Hebel mit Rueckstellung.** Fuehlt sich deutlich anders an, wird hochgedrueckt, federt beim Loslassen zurueck.
  - *schnell hochdruecken* | sofort voller Druck (manuelle Kompression)
  - *langsam hochdruecken* | proportionaler Druckaufbau, folgt dem Hebel
  - *loslassen* | Hebel federt zurueck, Druck endet
  - *dasselbe Betaetigen* | unterbricht auch einen laufenden automatischen Druckaufbau (aus einem geplanten Marker)

Die App ist im Moment nicht noetig. Die beiden Buttons unterscheiden sich bewusst vom Gefuehl her, damit man sie im Dunkeln oder in Stress nicht verwechselt.

### Phase 2 | Verstehen danach (App)

- ruhige, bewusste Nutzung
- Reflexion statt Reaktion
- hier entsteht Bedeutung, Struktur, Zusammenhang
- die App wird kurz nach Ereignissen oder gesammelt spaeter genutzt, aber nie dauerhaft

Diese zeitliche Trennung ist nicht Dekoration, sondern das Kernprinzip des Systems.

---

## 4. Begriffssystem (Marker-Typen)

Das System kennt vier klar getrennte Eintragstypen auf derselben Zeitachse.

| Typ | Funktion | Inhalt | Ausgeloest durch |
|---|---|---|---|
| **Anker** | kurzfristige Auslagerung eines Gedankens oder Zustands | leer oder minimal, Zeit plus optional Ort | Button 1, 1x kurz |
| **Audiomarker** | Zeitpunkt auf der Timeline, Rohinhalt wandert in eine Notiz | nur Zeit und Verweis auf Notiz | Button 1, 2x kurz |
| **Kompression** | koerperlicher Eingriff am Armreif | Ereignis, kein Inhalt | Button 2 (Hebel) oder geplanter Marker |
| **Geplanter Marker** | zukuenftiger Zeitpunkt mit haptischer Rueckmeldung | Titel, Zeit, optional Wiederholung | Nutzer in der App |

Im DB-Feld `marker_type` stehen die englischen Gegenstuecke: `anchor`, `audio`, `compression`, `planned`.

### 4.1 Anker | die kleinste Einheit

Ein Anker ist kein Marker im Sinne von „hier ist etwas passiert", sondern ein **temporaerer Speicher**. Er erlaubt, einen Gedanken oder Zustand sofort loszulassen, ohne ihn zu verlieren.

- minimal: ein Klick am Armreif (Button 1) oder am Plus-Button in der App
- leer oder mit minimalen Metadaten (Zeit, optional Ort)
- kann spaeter ergaenzt, verknuepft oder geloescht werden
- psychologisch stabilisierend, bewusst gesetzt

Der Anker ist der niedrigschwellige Standard fuer „ich habe Stress, ich parke das kurz".

### 4.2 Audiomarker | Marker auf der Timeline, Inhalt als Notiz

Der Audiomarker trennt zwei Dinge sauber:

- **Auf der Timeline** entsteht ein Marker, dessen Aufgabe nur ist, den Zeitpunkt zu halten.
- **Der eigentliche Rohinhalt** (Audio, spaeter das Transkript aus AURA) wird **automatisch als Notiz angelegt** und mit dem Marker verknuepft.

Damit bleibt die Timeline bewusst schlank (Zeitpunkte, Zustaende), und der Gedaechtnisraum fuer Inhalt ist die Notizenebene.

- Doppelklick am Armreif (Button 1) oder Aufnahme-Button in der App
- Audio wird im Browser via MediaRecorder aufgenommen
- Auto-Stop nach 5 Minuten als Sicherheitsnetz
- Format: Safari `.m4a` (AAC), Chrome `.webm` (Opus)
- Upload in Supabase Storage Bucket `audio-markers`, Pfad `<user_id>/<marker_id>.<ext>`
- AURA transkribiert im Hintergrund, schreibt das Transkript in die verknuepfte Notiz

Der Audiomarker ist inhaltstragend, aber der Inhalt lebt in der Notiz, nicht in der Timeline-Card.

### 4.3 Kompression | physische Reaktion

Die Kompression ist kein Marker im klassischen Sinn, sondern ein direkter koerperlicher Eingriff. Sie ist Reaktion, nicht Erfassung. Sie entsteht entweder manuell ueber Button 2 oder automatisch aus einem geplanten Marker.

Drei Zustaende, abgebildet durch den **Hebel mit Rueckstellung**:

- **Automatisch.** Ein geplanter Marker loest bei Faelligkeit einen graduellen Druckaufbau aus. Dauer in den Einstellungen, 10 bis 60 Sekunden, Standard 30.
- **Manuell.** Der Nutzer drueckt Button 2 hoch. Wie stark und wie schnell der Druck aufgebaut wird, folgt dem Hebel: schnell hochgedrueckt heisst sofort voller Druck, langsam hochgedrueckt heisst proportional. Loslassen laesst den Hebel zurueckfedern und beendet den Druck.
- **Abbruch.** Dieselbe Betaetigung von Button 2 unterbricht auch einen laufenden automatischen Druckaufbau. Es gibt keinen separaten Abbruch-Mechanismus. Manuell steht logisch ueber automatisch.

Der Hebel ist bewusst kein Knopf. Die haptische Qualitaet ist Teil der Botschaft: Button 1 ist klar und diskret, Button 2 ist koerperlich, spuerbar, regulierend.

Aktuell bildet die App die Kompression nur als Protokoll-Eintrag ab, weil die Armreif-Kopplung noch offen ist.

### 4.4 Geplanter Marker | Zukunft mit haptischer Rueckmeldung

Ein geplanter Marker ist kein klassischer Reminder. Er ersetzt die Push-Notification durch einen graduellen koerperlichen Reiz am Armreif.

- bei Faelligkeit baut der Armreif graduell Druck auf
- Dauer aus den Einstellungen, 10 bis 60 Sekunden, Standard 30
- Abbruch ueber Button 2 (siehe 4.3), nicht in der App
- wenn nicht reagiert wird: Druckaufbau endet einfach
- optional einmalige Wiederholung, Intervall 5 bis 60 Minuten
- keine Snooze, keine Eskalation, keine Push-Notification
- Erledigt-Status wird zeitlich entkoppelt manuell in der App gesetzt, zum Beispiel abends

Der Unterschied zu klassischen Remindern ist fundamental: eine Notification fordert Aufmerksamkeit sofort, der geplante Marker baut Verbindlichkeit ueber Zeit auf.

---

## 5. Beziehung Marker und Notiz

Drei Rollen, sauber getrennt:

- **Marker** gleich Moment
- **Audio** gleich Rohinhalt
- **Notiz** gleich Bedeutung

Die Notiz ist die zweite Ebene. Sie ist nicht fuer den Moment gedacht, sondern fuer die spaetere Verarbeitung.

Regeln:

- ein **Audiomarker erzeugt automatisch eine Notiz** (Audio plus Transkript als Startpunkt). Siehe 4.2.
- ein **Anker** kann ohne Notiz bleiben
- eine **Notiz** kann ohne Marker existieren (freie Eingabe in der Notizenebene)
- die Verbindung entsteht ueber direkte, kontextuelle Interaktion, nicht ueber Menues
- Tags verbinden thematisch und zeitlich, ohne dass Inhalt in Kategorien gezwungen wird

Klick auf einen Marker in der Timeline oeffnet den **Marker-Detail-Screen**. Bei Audiomarkern fuehrt von dort ein Button direkt in die verknuepfte Notiz, bei der das Transkript bereits vorgefuellt ist.

---

## 6. Die Timeline

Die Timeline ist **kein Content-Feed** und **keine Chronologie von Notizen**, sondern ein **Rohprotokoll von Zustaenden, Signalen und Reaktionen**.

### 6.1 Vier Perspektiven auf dasselbe Ding

- **aktive Tagesstruktur** | Marker als Platzhalter fuer Zustaende, Aufgaben, Gedanken. Unvollstaendigkeit ist erlaubt und gewollt.
- **Log** | wann reagiert wurde, wann Unterstuetzung noetig war, wann nur ein Signal gesetzt wurde.
- **somatisch gekoppelt** | die Timeline enthaelt nicht nur mentale Ereignisse, sondern auch koerperliche Interaktionen (Kompressionen, manuelle Eingriffe, Abbrueche). Genau diese Kopplung unterscheidet AURUM von reinen Notiz-Apps.
- **Analysefeld** | langfristig nicht zum Lesen wie ein Tagebuch, sondern zum Erkennen von Haeufungen, wiederkehrenden Momenten, Uebergaengen.

### 6.2 Besondere Eigenschaften

1. **Leere Marker als primaere Datenstruktur.** Ein grosser Teil der Timeline besteht aus leeren Eintraegen (Anker). Das ist untypisch, weil klassische Apps sofort Inhalt verlangen.
2. **Typen auf derselben Linie.** Alle vier Marker-Typen liegen im selben Fluss und unterscheiden sich nur durch Icon, Farbe und Verhalten.
3. **Bedeutung entsteht nachtraeglich.** Nicht „ich schreibe, weil ich verstehe", sondern „ich markiere, weil es passiert ist, verstehen kommt spaeter".
4. **Planen, Erinnern, Reagieren, Verstehen** bilden einen geschlossenen Kreis.

### 6.3 Visuelle Auspraegung pro Typ

- **Anker** | minimaler Punkt plus Label, ohne Karte
- **Audiomarker** | Karte mit Transkript-Snippet und Audio-Hinweis. Klick fuehrt in die verknuepfte Notiz.
- **Kompression** | eigene warme Darstellung, ohne Inhalt, als Ereignis lesbar
- **Geplanter Marker** | gestrichelte Darstellung bis zum Erreichen, danach visuell zusammenfallend mit einem regulaeren Eintrag, plus Status (offen, erledigt)

---

## 7. AURA (KI-Schicht)

AURA ist der Algorithmus, kein Akteur. Die App spricht ihn an, wenn ein Audiomarker neu entsteht, oder wenn der Nutzer aktiv eine Auswertung anfordert.

### 7.1 Hauptzweck (v0.09)

- **Transkription** des Audios via Whisper. Das Transkript landet direkt in der verknuepften Notiz.

Das ist der eigentliche Daseinszweck von AURA fuer das System.

### 7.2 Spaeter und optional

- Moment-Zusammenfassung in einem Satz
- Auto-Tags (1 bis 3) aus dem Transkript
- Verknuepfungsvorschlaege (neuer Marker sucht passende bestehende Notiz)
- freier Chat mit AURA ueber die eigenen Daten

Diese Faehigkeiten sind wuenschenswert, aber nicht Teil des MVP. Die Felder `summary` und `tags` bleiben im Schema, damit sie spaeter gefuellt werden koennen, ohne Migration.

### 7.3 Prioritaet sehr spaet

- Stimmungs- oder Zustandserkennung aus Audio

### 7.4 Bewusst raus

- Mustererkennung ueber Zeit im Sinne von „an Dienstagen viele Kompressionen"
- automatische Bewertung
- proaktive Vorschlaege ohne Anlass

### 7.5 Technische Leitplanken

- API-Keys fuer AURA gehoeren in **Supabase Edge Function Secrets**, nie in den Browser-Code. Der PWA-Quelltext ist oeffentlich einsehbar.
- Die Felder `transcript`, `summary`, `tags` auf `markers` sind in Schema-Migration 04 bereits vorbereitet.

---

## 8. Armreif als Signalquelle

Der Armreif ist in v2 nicht mehr gleichwertiges Produkt, sondern die Eingangsseite. Inhaltlich bleibt er zentral, weil ohne haptische Rueckmeldung das ganze System seine Wirkung verliert.

### 8.1 Was die App vom Armreif wissen muss

- **welcher Button betaetigt wurde** (Button 1 Druckknopf, Button 2 Hebel)
- **wie** (bei Button 1: 1x oder 2x kurz; bei Button 2: wie schnell der Hebel hochgedrueckt wurde, wann losgelassen)
- **wann** (Zeitstempel)

Mehr nicht. Die App uebersetzt diese Signale in Marker-Typen (siehe 4.1 bis 4.3).

### 8.2 Technische Umsetzung

- Kopplung ueber **Bluetooth LE**, GATT-Service im Capacitor-Wrap fuer iOS, weil Web Bluetooth in Safari nicht unterstuetzt wird
- im Datenmodell bereits vorbereitet: `markers.source` (`app` gegen `ring`), `user_settings.ring_paired_id`
- aktuell wird nur `source='app'` geschrieben, das Ring-Feld ist Vorbereitung

### 8.3 Haptik als Teil der Botschaft

Die beiden Bedienelemente haben bewusst unterschiedliche haptische Qualitaeten. Das ist kein technisches Detail, sondern inhaltlich wichtig:

- **Button 1 (Druckknopf)** ist klar, diskret, mental. Er markiert Zeitpunkte.
- **Button 2 (Hebel)** ist koerperlich, spuerbar, regulierend. Er fuehrt den Koerper zurueck in den Moment.

Die App nimmt diese Unterscheidung nicht visuell auf, aber sie kennt den Unterschied und bildet ihn ueber die Marker-Typen ab.

---

## 9. Datenmodell und Architektur

### 9.1 Stack

- **Frontend** | eine einzige HTML-Datei (`app/AURUM.html`), Vanilla JavaScript, installierbar als PWA
- **Backend** | Supabase Projekt `Diplomarbeit`, Postgres mit Row Level Security, Supabase Auth, Supabase Storage
- **Edge Functions** (geplant, v0.09) | Whisper-Transkription (Hauptzweck), spaeter Summary und Auto-Tags
- **Service Worker** (`sw.js`) | App-Shell-Cache fuer Offline-Start

### 9.2 Tabellen (Kurzform)

- `markers` | ein Eintrag pro Ereignis, Felder: `id`, `user_id`, `marker_date`, `start_time`, `marker_type`, `latitude`, `longitude`, `location_label`, `audio_path`, `transcript`, `summary`, `tags`, `source`, `title`, `is_done`
- `notes` | freie Notizen, optional verknuepft mit einem Marker, mit Tags
- `user_settings` | Druckaufbau-Dauer, Wiederholungs-Intervall, Geolocation an oder aus, Ring-Pairing-ID
- `auth.users` | Supabase-Standard

### 9.3 Storage

- Bucket `audio-markers`, Public: false
- Pfadkonvention `<user_id>/<marker_id>.<ext>`
- RLS-Policies in Migration 04 enthalten

### 9.4 Sicherheit

- Daten pro Nutzer isoliert ueber Row Level Security
- Session im `localStorage` (normaler Browser) oder `window.storage` (Claude-Artifacts)
- automatischer Refresh bei 401
- Tag-Anzeige escaped HTML zum Schutz vor XSS bei Sonderzeichen

---

## 10. Nutzungsablauf (typisch)

### 10.1 Im Moment (Armreif)

1. Button 1, 1x kurz | Anker entsteht
2. oder Button 1, 2x kurz | Audiomarker entsteht, Aufnahme laeuft, Notiz wird im Hintergrund angelegt
3. oder Button 2, Hebel hoch | manuelle Kompression, Staerke folgt dem Hebel
4. kein Blick aufs Telefon noetig

### 10.2 Bei Faelligkeit (Armreif)

1. geplanter Marker erreicht Zeitpunkt
2. Armreif baut graduell Druck auf
3. Nutzer kann Button 2 betaetigen, um abzubrechen, oder den Druck laufen lassen
4. optional einmalige Wiederholung nach x Minuten

### 10.3 Danach (App)

1. App oeffnen, Timeline zeigt die letzten Ereignisse
2. Klick auf einen Marker | Detail-Screen
3. bei Audiomarker: Button „Zur Notiz" fuehrt direkt in die automatisch angelegte Notiz, Transkript ist vorgefuellt
4. optional: Anker nachtraeglich ergaenzen oder loeschen
5. abends: geplante Marker auf erledigt setzen

---

## 11. Designprinzipien

### 11.1 Farbwelt

- helle Pastelltoene, warme Papiertoene
- keine reinen Weisstoene, leicht gebrochene Grundflaechen
- gezielte goldene Akzente (AURUM ist Gold)
- Farbe markiert Zustaende, nicht Dekoration
- klarer Gegenentwurf zu dunklen, stark gamifizierten Referenzsystemen

### 11.2 Formensprache

- Kreise, Ovale, stark abgerundete Rechtecke
- keine harten Ecken, keine kantigen Buttons
- Capsule-Form fuer Fortschritt, Auswahl, CTA
- viel Negativraum, duenne Linien
- konsistent ueber alle Komponenten

### 11.3 Typografie

- klare Hierarchie
- dominante Headlines, einzelne Schluesselwoerter farblich hervorgehoben
- Sekundaertext reduziert, gut lesbar, niemals konkurrierend
- Fokus auf Entscheidungsrelevanz

### 11.4 Interaktion

- direkte Manipulation von Elementen statt Menues
- wenige, reduzierte Gesten: tippen, halten, verschieben
- klare Zustaende statt komplexer Optionen
- ein Screen, eine Entscheidung

### 11.5 Sprache und Orthographie

- Schweizer Orthographie, kein Eszett
- keine Em-Dashes
- ruhige, analytische Sprache, nicht werbend
- keine motivationalen Floskeln

### 11.6 Wirkung

- ruhig, stabil, konsistent
- niedrige visuelle Aggressivitaet
- Orientierung ohne Aufmerksamkeit zu fordern
- Aufforderung zur Nutzung kommt nicht vom Bildschirm, sondern vom Koerper

---

## 12. UI-Bereiche (Uebersicht)

Die detaillierte UI-Analyse und die Auswahl uebernehmbarer Muster aus den Referenz-Klonen (`me+`, `Planwoo`, `Struktured`) liegt in `documentation/UI_v1.md`. Hier nur die Grobstruktur.

1. **Timeline** | zentrale Ansicht, Marker aller Typen auf einer Linie, Wochen- und Tagesbezug
2. **Marker-Detail** | typ-spezifische Ansicht (Anker zeigt Ort, Audiomarker zeigt Verweis auf Notiz plus Transkript-Vorschau, Kompression zeigt Ausloeser, geplanter Marker zeigt Status)
3. **Notizen** | Liste, Editor, Tags, optional verknuepft mit Marker; bei Audiomarkern automatisch angelegt
4. **Einstellungen** | Druckaufbau, Wiederholung, Geolocation, Ring-Pairing (spaeter), Konto, Abmelden
5. **Auth** | Login, Registrierung, Bestaetigungs-Mail

---

## 13. Was bewusst nicht Teil des Systems ist

AURUM ist **nicht**:

- klassisches Notiztool (Inhalt ist nicht der Startpunkt, Zeit und Zustand sind es)
- Tracking-System (kein Verhaltens-Scoring, keine Quantifizierung)
- aktiver KI-Assistent (AURA agiert nie ungefragt)
- Gamification-System (keine Streaks, keine Scores, keine Levels)
- Push-basiertes Remindersystem (Praesenz im Moment uebernimmt der Armreif)
- kommerzielles Produkt mit Paywall (AURUM ist Diplomarbeit, siehe Abgrenzung in `UI_v1.md`)

Feste Regel: **Die App schickt nie Push-Notifications.** Alles, was die App tut, ist nachgelagert und freiwillig.

---

## 14. Systemkreislauf

1. Signal wird gesetzt (am Armreif oder in der App)
2. Ereignis wird gespeichert (AURUM, Supabase)
3. bei Audiomarker: Notiz wird automatisch angelegt, Audio gespeichert
4. Audio wird transkribiert (AURA, Edge Function) und Transkript in die Notiz geschrieben
5. Nutzer reflektiert spaeter (App)
6. Muster entstehen ueber Zeit (kognitiv beim Nutzer, nicht algorithmisch durch AURA)

---

## 15. Versionsstand (Stand 2026-04-19)

- **v0.01** | Klickdummy, 5 Screens, Vanilla JS, dunkles Theme
- **v0.02** | Umstellung auf Pastell-Cream plus goldene Akzente, Farbsystem als CSS-Variablen
- **v0.03** | AI in der Bottom-Nav durch Notizen ersetzt
- **v0.04** | Timeline laedt echte Daten aus Supabase, optimistisches Check-Toggle mit Rollback
- **v0.05** | Login und Registrierung ueber Supabase Auth, RLS, Logout in den Einstellungen
- **v0.06** | Begriffssystem eingefuehrt (Anker, Audiomarker, Kompression, geplanter Marker), Notizen als eigene Ebene
- **v0.07** | Hybrid-Storage (`localStorage` und `window.storage`)
- **v0.08** | Echte Audio-Aufnahme plus Upload, Marker-Detail-Screen, Geolocation am Anker, Einstellungs-Screen, PWA-Manifest und Service Worker, Schema-Migration 04, Source-Feld, XSS-Escape fuer Tags

---

## 16. Roadmap

### 16.1 v0.09 | AURA MVP (schlank)

- Edge Function fuer Whisper-Transkription
- Transkript wird direkt in die verknuepfte Notiz geschrieben
- UI zeigt Transkript in der Notiz und kurze Vorschau im Marker-Detail
- Summary und Auto-Tags NICHT Teil des MVP (kommen spaeter, siehe 7.2)

### 16.2 v0.10 | Ring-Kopplung

- Capacitor-Wrap fuer iOS (weil Safari kein Web Bluetooth hat)
- Bluetooth-Pairing-Flow
- Marker mit `source='ring'`
- `user_settings.ring_paired_id`
- Button-1-Events (1x, 2x) in die App
- Button-2-Events (Hebel-Kurve, Loslassen) in die App
- haptisches Verhalten fuer geplante Marker auf dem Ring

### 16.3 v0.11 | Ort und Uebersicht

- Reverse-Geocoding als Edge Function (Nominatim oder Apple MapKit)
- Wochen- und Monatsuebersicht der Marker-Dichte
- Filter nach Tag, Typ und Ort

### 16.4 Spaeter

- Summary und Auto-Tags durch AURA
- Verknuepfungsvorschlaege zwischen Markern und Notizen
- freier Chat mit AURA ueber die eigenen Daten
- Stimmungs- oder Zustandserkennung aus Audio

---

## 17. Offene Punkte und Spannungsfelder

- **Begriffsspannung Anker und Marker.** Der Anker fuehlt sich psychologisch gewichtiger an als der technische Marker. Beobachten, falls noetig sprachlich anpassen.
- **Audiomarker und Notiz.** Die automatische Notiz-Erzeugung ist komfortabel, erzeugt aber zwei Eintraege pro Audioaufnahme (Marker plus Notiz). Das ist korrekt nach Modell, muss in der UI aber so gefuehrt werden, dass der Nutzer nicht denkt, er habe duplizierte Daten. Loesung: Marker-Detail zeigt klar „Inhalt liegt in Notiz" und fuehrt per Klick hin.
- **Kompression in der App.** Aktuell nur Protokoll-Eintrag. Bis zur Ring-Kopplung bleibt die Darstellung bewusst neutral.
- **Hebel-Simulation in der App.** Solange der Ring fehlt, gibt es keine echte haptische Entsprechung. In der App zeigt ein einfacher Knopf „Kompression simulieren" das Event an, ohne die Hebel-Physik nachzubilden.
- **Ort am Anker.** Geolocation steht, Reverse-Geocoding fehlt.
- **Audiodauer.** Auto-Stop nach 5 Minuten ist Sicherheitsnetz, kein Nutzungslimit.

---

## 18. Glossar

- **AURUM** | die App. Speicherung und Struktur.
- **AURA** | die KI-Schicht, Hauptzweck Transkription.
- **Armreif** | das physische Objekt, Signalquelle fuer die App.
- **Button 1** | Druckknopf am Armreif, loest Anker und Audiomarker aus.
- **Button 2** | Hebel mit Rueckstellung am Armreif, loest Kompressionen aus und unterbricht laufenden Druck.
- **Anker** | Zeitpunkt ohne Inhalt, kurzfristige Auslagerung.
- **Audiomarker** | Zeitpunkt auf der Timeline, Inhalt liegt in einer verknuepften Notiz.
- **Kompression** | koerperlicher Eingriff, Ereignis ohne Inhalt. Automatisch, manuell oder Abbruch.
- **Geplanter Marker** | zukuenftiger Zeitpunkt mit haptischer Rueckmeldung.
- **Marker** | Oberbegriff fuer Eintraege auf der Timeline.
- **Notiz** | freie Bedeutungsebene, bei Audiomarkern automatisch angelegt.
- **Tag** | verbindet Marker und Notiz thematisch und zeitlich.

---

## 19. Verhaeltnis zu anderen Dokumenten

- `CONCEPT_v1.md` | gefrorene Vorfassung, Referenz.
- `CONCEPT_v2.md` | **dieses Dokument, aktive Fassung.**
- `UI_v1.md` | detaillierte UI-Analyse, Ist-Zustand AURUM v0.08, Uebernahme-Kandidaten aus den Klonen (`me+`, `Planwoo`, `Struktured`), Abgrenzungen (z. B. Paywall).
- bestehende Dokumente in `.AURUM-neu/` bleiben als Quellen erhalten.
