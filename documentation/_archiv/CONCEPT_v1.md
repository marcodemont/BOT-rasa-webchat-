# AURUM | Konzept v1

- Version: v1 (2026-04-19)
- Status: Konsolidierte Erstfassung, basierend auf `CONCEPT.md` (Root), `Konzept.md`, `documentation/CONCEPT.md` und den Arbeitsnotizen in `.AURUM-neu/.AURUM/informationen/`
- Scope: nur AURUM (App, Armreif, AURA). `.ROMY` ist ein getrenntes Projekt und kein Bestandteil dieses Konzepts

---

## 0. Einordnung

AURUM ist keine klassische App, sondern ein zeitbasiertes Selbstwahrnehmungssystem, bestehend aus einem **physischen Armreif** (Erfassung im Moment) und einer **digitalen Anwendung** (Reflexion danach). Zwischen Wahrnehmung und Handlung soll eine ruhige, strukturierende Schicht entstehen, die Orientierung gibt, ohne Aufmerksamkeit zu fordern.

Das System ist das Kernartefakt einer Diplomarbeit. Es ist bewusst reduziert, technisch umsetzbar und in einer PWA plus Supabase-Backend bereits in Teilen realisiert (aktueller Stand: v0.08).

---

## 1. Leitidee in einem Satz

Die App speichert (AURUM), die KI verarbeitet im Hintergrund (AURA), die Entscheidungen bleiben beim Nutzer, und die Präsenz im Moment gehört ausschliesslich dem Armreif.

---

## 2. Zwei Ebenen

- **AURUM** | die App. Speicherung, Struktur, Kontext, Darstellung.
- **AURA** | die KI-Schicht. Interpretiert im Hintergrund, ist nur auf Anfrage aktiv, trifft keine Entscheidungen.

Wichtig ist die Trennung dieser Rollen:

- AURUM speichert, AURA interpretiert.
- AURA darf Daten verarbeiten, aber nicht bewerten.
- AURA darf vorschlagen, aber nicht entscheiden.
- Der Nutzer bleibt immer in Kontrolle.

---

## 3. Zwei Phasen

Das System teilt sich strikt in zwei Zeitlogiken:

### Phase 1 | Erfassen im Moment (Armreif)

- physisch, nicht digital
- minimale Interaktion
- keine kognitive Belastung
- keine Eingabeaufforderung, keine Unterbrechung
- keine sofortige Strukturierung

Der Armreif ist im Moment die ganze Schnittstelle. Die App soll im Moment **nicht** nötig sein.

### Phase 2 | Verstehen danach (App)

- ruhige, bewusste Nutzung
- Reflexion statt Reaktion
- hier entsteht Bedeutung, Struktur, Zusammenhang
- die App wird kurz nach Ereignissen oder gesammelt später genutzt, aber nie dauerhaft

Diese zeitliche Trennung ist nicht Dekoration, sondern das Kernprinzip des Systems.

---

## 4. Begriffssystem (Marker-Typen)

Das System kennt vier klar getrennte Eintragstypen. Sie liegen alle auf derselben Zeitachse, unterscheiden sich aber in Funktion und Inhalt.

| Typ | Funktion | Inhalt | Ausgeloest durch |
|---|---|---|---|
| **Anker** | kurzfristige Auslagerung eines Gedankens oder Zustands | leer oder minimal, Zeit plus optional Ort | Nutzer im Moment (Armreif oder App) |
| **Audiomarker** | Zeitpunkt mit Rohinhalt | Audio, Transkript, AURA-Zusammenfassung, Tags | Nutzer, ergaenzt spaeter durch AURA |
| **Kompression** | koerperlicher Eingriff am Armreif | Ereignis, kein Inhalt | Armreif oder geplanter Marker |
| **Geplanter Marker** | zukuenftiger Zeitpunkt mit haptischer Rueckmeldung | Titel, Zeit, optional Wiederholung | Nutzer in der App |

Im DB-Feld `marker_type` stehen die englischen Gegenstuecke: `anchor`, `audio`, `compression`, `planned`.

### 4.1 Anker | die kleinste Einheit

Ein Anker ist **kein** Marker im Sinne von „hier ist etwas passiert", sondern ein **temporaerer Speicher**. Er erlaubt es, einen Gedanken oder Zustand sofort loszulassen, ohne ihn zu verlieren.

- minimal: ein Klick am Armreif oder am Plus-Button in der App
- leer oder mit minimalen Metadaten (Zeit, optional Ort)
- kann spaeter ergaenzt, verknuepft oder geloescht werden
- psychologische Wirkung: stabilisierend, bewusst gesetzt, im Gegensatz zum neutralen Begriff Marker

Der Anker ist der niedrigschwellige Standard fuer „ich habe Stress, ich parke das kurz".

### 4.2 Audiomarker | Anker plus Rohinhalt

Ein Audiomarker entsteht, wenn mehr Kontext noetig ist oder der Gedanke bereits klar genug ist, um kurz aufgenommen zu werden.

- Doppelklick am Armreif (geplant) oder Aufnahme-Button in der App (umgesetzt)
- Audio wird im Browser via MediaRecorder aufgenommen
- Auto-Stop nach 5 Minuten als Sicherheitsnetz
- Format: Safari `.m4a` (AAC), Chrome `.webm` (Opus)
- Upload in Supabase Storage Bucket `audio-markers`, Pfad `<user_id>/<marker_id>.<ext>`
- AURA transkribiert spaeter, schreibt Zusammenfassung und Tags zurueck

Der Audiomarker ist inhaltstragend, aber im Moment immer noch minimal (nur Aufnahme starten, nicht tippen).

### 4.3 Kompression | physische Reaktion

Die Kompression ist **kein Marker im klassischen Sinn**, sondern ein direkter koerperlicher Eingriff am Armreif. Sie ist Reaktion, nicht Erfassung.

Sie hat drei Zustaende:

- **Automatisch** | von einem geplanten Marker ausgeloest, mit graduellem Druckaufbau. Dauer in den Einstellungen, 10 bis 60 Sekunden, Standard 30.
- **Manuell** | am Armreif direkt ausgeloest, als Reaktion im Moment.
- **Abbruch** | laufender Prozess wird am Armreif aktiv beendet (Button 2 am Ring).

Priorisierung: manuell steht logisch ueber automatisch. Ein aktiver Eingriff unterbricht oder ueberschreibt geplantes Verhalten.

Aktuell bildet die App die Kompression nur als Protokoll-Eintrag ab, weil die Armreif-Kopplung noch offen ist.

### 4.4 Geplanter Marker | Zukunft mit haptischer Rueckmeldung

Ein geplanter Marker ist kein klassischer Reminder. Er ersetzt die Push-Notification durch einen graduellen koerperlichen Reiz am Armreif.

- bei Faelligkeit baut der Armreif graduell Druck auf
- Dauer aus den Einstellungen, 10 bis 60 Sekunden, Standard 30
- Abbruch nur am Armreif, nicht in der App
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

Die Notiz ist die zweite Ebene. Sie ist nicht fuer den Moment gedacht, sondern fuer die spaetere Verarbeitung. Hier entsteht Struktur, Lesbarkeit, Wiederverwendbarkeit.

Regeln:

- keine Pflicht zur Verknuepfung
- ein Marker kann ohne Notiz bleiben
- eine Notiz kann ohne Marker existieren
- die Verbindung entsteht ueber direkte, kontextuelle Interaktion, nicht ueber Menues
- Tags verbinden thematisch und zeitlich, ohne dass Inhalt in Kategorien gezwungen wird

Klick auf einen Marker oeffnet seit v0.08 zuerst den **Marker-Detail-Screen** (Audio-Player, Transkript, AURA-Zusammenfassung, Tags). Von dort fuehrt ein Button zur verknuepften Notiz oder legt eine neue an, in der Zusammenfassung oder Transkript als Startpunkt vorgefuellt ist.

---

## 6. Die Timeline

Die Timeline ist **kein Content-Feed** und **keine Chronologie von Notizen**, sondern ein **Rohprotokoll von Zustaenden, Signalen und Reaktionen**.

### 6.1 Vier Perspektiven auf dasselbe Ding

- **aktive Tagesstruktur** | Marker als Platzhalter fuer Zustaende, Aufgaben, Gedanken. Unvollstaendigkeit ist erlaubt und gewollt.
- **Log** | wann reagiert wurde, wann Unterstuetzung noetig war, wann nur ein Signal gesetzt wurde.
- **somatisch gekoppelt** | die Timeline enthaelt nicht nur mentale Ereignisse, sondern auch koerperliche Interaktionen (Kompressionen, manuelle Eingriffe, Abbrueche).
- **Analysefeld** | langfristig nicht zum Lesen wie ein Tagebuch, sondern zum Erkennen von Haeufungen, wiederkehrenden Momenten, Uebergaengen (zum Beispiel immer vor Meetings).

### 6.2 Besondere Eigenschaften

1. **Leere Marker als primaere Datenstruktur.** Ein grosser Teil der Timeline besteht aus leeren Eintraegen. Das ist untypisch, weil klassische Apps sofort Inhalt verlangen. Hier ist es bewusst reduziert, damit der Moment nicht gestoert wird.
2. **Typen auf derselben Linie.** Es gibt keine separaten Ansichten fuer Anker, Audiomarker, Kompression und geplante Marker. Alle liegen im selben Fluss und unterscheiden sich nur durch Icon und Verhalten.
3. **Bedeutung entsteht nachtraeglich.** Die Logik ist nicht „ich schreibe, weil ich verstehe", sondern „ich markiere, weil es passiert ist, verstehen kommt spaeter".
4. **Planen, Erinnern, Reagieren, Verstehen** bilden einen geschlossenen Kreis, nicht vier getrennte Schritte.

### 6.3 Visuelle Auspraegung pro Typ

- **Anker** | minimaler Punkt plus Label, ohne Karte
- **Audiomarker** | Karte mit Transkript-Snippet, Tags und Audio-Hinweis
- **Kompression** | eigene warme Darstellung, ohne Inhalt, als Ereignis lesbar
- **Geplanter Marker** | gestrichelte Darstellung bis zum Erreichen, danach visuell zusammenfallend mit einem regulaeren Eintrag, plus Status (offen, erledigt)

---

## 7. AURA (KI-Schicht)

AURA ist der Algorithmus, kein Akteur. Die App spricht ihn an, wenn ein Audiomarker neu entsteht, oder wenn der Nutzer aktiv eine Auswertung anfordert.

### 7.1 MVP (v0.09)

- **Transkription** des Audios via Whisper
- **Moment-Zusammenfassung** in einem Satz
- **Auto-Tags** (1 bis 3) aus dem Transkript, automatisch gesetzt, nicht als Vorschlag. Der Nutzer kann sie nachtraeglich aendern.

### 7.2 Prioritaet 2 (spaeter)

- Verknuepfungsvorschlaege (neuer Marker sucht passende bestehende Notiz)
- freier Chat mit AURA ueber die eigenen Daten

### 7.3 Prioritaet 3

- Stimmungs- oder Zustandserkennung aus Audio

### 7.4 Bewusst raus

- Mustererkennung ueber Zeit im Sinne von „an Dienstagen viele Kompressionen"
- automatische Bewertung
- proaktive Vorschlaege ohne Anlass

### 7.5 Technische Leitplanken

- API-Keys fuer AURA gehoeren in **Supabase Edge Function Secrets**, nie in den Browser-Code. Der PWA-Quelltext ist oeffentlich einsehbar.
- Die Felder `transcript`, `summary`, `tags` auf `markers` sind in Schema-Migration 04 bereits vorbereitet.

---

## 8. Armreif (physische Ebene)

Der Armreif ist in diesem Konzept gleichwertig zur App, nicht nachgelagert.

### 8.1 Rolle

- **Trigger fuer Zustaende**, kein Interface im klassischen Sinn
- **Reaktionsobjekt** bei manueller Kompression
- **Empfaenger** fuer geplante Marker, gradueller Druckaufbau statt Notification

### 8.2 Interaktionsbausteine (Zielbild)

- **1x kurz** | Anker setzen
- **2x kurz** | Audiomarker starten, zweiter Doppelklick oder Auto-Stop beendet
- **1x lang** | manuelle Kompression
- **Button 2** | Abbruch einer laufenden Kompression

### 8.3 Technische Umsetzung

- Kopplung ueber **Bluetooth LE**, GATT-Service im Capacitor-Wrap fuer iOS, weil Web Bluetooth in Safari nicht unterstuetzt wird
- im Datenmodell bereits vorbereitet: `markers.source` (`app` gegen `ring`), `user_settings.ring_paired_id`
- aktuell wird nur `source='app'` geschrieben, das Ring-Feld ist Vorbereitung

### 8.4 Drei Zustaende (nochmals)

Die drei Zustaende der Kompression (siehe Abschnitt 4.3) bilden die ganze haptische Dynamik ab: automatisch, manuell, Abbruch. Sie duerfen sich nicht widersprechen, sondern sind klar priorisiert. Die App steuert geplante Zustaende, der Armreif erlaubt situative Kontrolle im Moment.

---

## 9. Datenmodell und Architektur

### 9.1 Stack

- **Frontend** | eine einzige HTML-Datei (`app/AURUM.html`), Vanilla JavaScript, installierbar als PWA
- **Backend** | Supabase Projekt `Diplomarbeit`, Postgres mit Row Level Security, Supabase Auth, Supabase Storage
- **Edge Functions** (geplant, v0.09) | Whisper-Transkription, Summary, Auto-Tags
- **Service Worker** (`sw.js`) | App-Shell-Cache fuer Offline-Start

### 9.2 Tabellen (Kurzform)

- `markers` | ein Eintrag pro Ereignis, Felder: `id`, `user_id`, `created_at`, `marker_type`, `latitude`, `longitude`, `location_label`, `audio_path`, `transcript`, `summary`, `tags`, `source`
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

1. kurzer Impuls | Klick am Armreif | Anker entsteht
2. oder: Doppelklick | Audiomarker entsteht, Aufnahme laeuft
3. oder: langes Druecken | manuelle Kompression
4. kein Blick aufs Telefon noetig

### 10.2 Bei Faelligkeit (Armreif)

1. geplanter Marker erreicht Zeitpunkt
2. Armreif baut graduell Druck auf
3. Nutzer kann abbrechen oder laufen lassen
4. optional einmalige Wiederholung nach x Minuten

### 10.3 Danach (App)

1. Oeffnen der App, Timeline zeigt die letzten Ereignisse
2. Klick auf einen Marker | Detail-Screen
3. bei Audiomarker: Audio anhoeren, AURA-Zusammenfassung und Tags pruefen
4. optional: Notiz anlegen oder oeffnen
5. optional: Anker nachtraeglich ergaenzen oder loeschen
6. abends: geplante Marker auf erledigt setzen

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
- viel Negativraum, dünne Linien
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

Details zu den einzelnen Bereichen folgen in separaten Dokumenten in `documentation/` und `documentation/ui/`. Hier nur die Grobstruktur.

1. **Timeline** | zentrale Ansicht, Marker aller Typen auf einer Linie, Wochen- und Tagesbezug
2. **Marker-Detail** | typ-spezifische Ansicht (Anker zeigt Ort, Audiomarker zeigt Player plus Summary, Kompression zeigt Ausloeser, geplanter Marker zeigt Status)
3. **Notizen** | Liste, Editor, Tags, optional verknuepft mit Marker
4. **Einstellungen** | Druckaufbau, Wiederholung, Geolocation, Konto, Abmelden
5. **Auth** | Login, Registrierung, Bestaetigungs-Mail

---

## 13. Was bewusst nicht Teil des Systems ist

AURUM ist **nicht**:

- klassisches Notiztool (Inhalt ist nicht der Startpunkt, Zeit und Zustand sind es)
- Tracking-System (kein Verhaltens-Scoring, keine Quantifizierung)
- aktiver KI-Assistent (AURA agiert nie ungefragt)
- Gamification-System (keine Streaks, keine Scores, keine Levels)
- Push-basiertes Remindersystem (Praesenz im Moment uebernimmt der Armreif)

Feste Regel: **Die App schickt nie Push-Notifications.** Alles, was die App tut, ist nachgelagert und freiwillig.

---

## 14. Systemkreislauf

1. Marker wird gesetzt (am Armreif oder in der App)
2. Ereignis wird gespeichert (AURUM, Supabase)
3. Audio wird optional verarbeitet (AURA, Edge Function)
4. Nutzer reflektiert spaeter (App)
5. Muster entstehen ueber Zeit (kognitiv beim Nutzer, nicht algorithmisch durch AURA)

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

Aktueller Paketaufbau:

```
.AURUM/
  .AURUM.bat                startet die App lokal (Windows)
  app/AURUM.html            die komplette App in einer Datei (PWA)
  icons/                    icon.svg plus PNGs fuer Apple und Android
  manifest.webmanifest      PWA-Manifest
  sw.js                     Service Worker (App-Shell-Cache)
  supabase/
    config.md               Projekt-URLs, Keys, Auth-Einstellungen
    schema.sql              aktueller Endzustand der DB
    migrations/01..04       SQL-Migrationen der Reihe nach
  dokumentation/            Projektdoku (diese Datei liegt auf Root-Ebene)
  dokumente/                Diplomarbeit-PDFs, Praesentationen
  informationen/            Ideen, Skizzen, Prototypen, Screenshots
  _archiv/                  alte Versionen als .zip
  README.md
```

---

## 16. Roadmap

### 16.1 v0.09 | AURA MVP

- Edge Function fuer Whisper-Transkription
- Edge Function fuer Zusammenfassung
- Edge Function fuer Auto-Tags
- Felder `transcript`, `summary`, `tags` in `markers` werden gefuellt
- UI zeigt Summary und Tags im Marker-Detail

### 16.2 v0.10 | Ring-Kopplung

- Capacitor-Wrap fuer iOS (weil Safari kein Web Bluetooth hat)
- Bluetooth-Pairing-Flow
- Marker mit `source='ring'`
- `user_settings.ring_paired_id`
- haptisches Verhalten fuer geplante Marker auf dem Ring

### 16.3 v0.11 | Ort und Uebersicht

- Reverse-Geocoding als Edge Function (Nominatim oder Apple MapKit)
- Wochen- und Monatsuebersicht der Marker-Dichte
- Filter nach Tag, Typ und Ort

### 16.4 Spaeter

- Verknuepfungsvorschlaege zwischen Markern und Notizen
- freier Chat mit AURA ueber die eigenen Daten
- Stimmungs- oder Zustandserkennung aus Audio

---

## 17. Offene Punkte und Spannungsfelder

- **Begriffsspannung Anker und Marker.** Der Anker fuehlt sich psychologisch gewichtiger an als der technische Marker. Das kann gewollt sein (bewusstes Ablegen) oder zu Zoegern fuehren. Beobachten, falls noetig sprachlich anpassen.
- **Kompression in der App.** Aktuell nur Protokoll-Eintrag. Bis zur Ring-Kopplung bleibt die Darstellung bewusst neutral.
- **Ort am Anker.** Geolocation steht, Reverse-Geocoding fehlt. Bis dahin wird nur die Koordinate gespeichert.
- **Audiodauer.** Auto-Stop nach 5 Minuten ist Sicherheitsnetz, kein Nutzungslimit. Kann bei Bedarf angepasst werden.
- **Abbruch der Kompression nur am Ring.** Bewusste Designentscheidung, damit die App im Moment nicht noetig ist. Ergibt aber bis zur Ring-Kopplung einen nicht beendbaren Zustand in der Simulation. Solange wird in der App ein Notaus moeglich sein.
- **Icons der Marker-Typen.** Bedienung soll einfach bleiben, Logik im Hintergrund sauber. Konkrete Icon-Festlegung folgt in `documentation/ui/`.

---

## 18. Glossar

- **AURUM** | das digitale Gegenstueck zum Armreif, Speicherung und Struktur.
- **AURA** | die KI-Schicht, Interpretation im Hintergrund, keine Entscheidungen.
- **Armreif** | das physische Objekt, im Moment der einzige Trigger.
- **Anker** | Zeitpunkt ohne Inhalt, kurzfristige Auslagerung.
- **Audiomarker** | Zeitpunkt mit Audio, Transkript, Summary und Tags.
- **Kompression** | koerperlicher Eingriff am Armreif, Ereignis ohne Inhalt.
- **Geplanter Marker** | zukuenftiger Zeitpunkt mit haptischer Rueckmeldung.
- **Marker** | Oberbegriff fuer Eintraege auf der Timeline, umfasst Anker, Audiomarker, Kompression und geplanten Marker.
- **Notiz** | freie Bedeutungsebene, optional mit einem Marker verknuepft.
- **Tag** | verbindet Marker und Notiz thematisch und zeitlich.

---

## 19. Verhaeltnis zu bestehenden Dokumenten

Dieses Dokument konsolidiert und aktualisiert:

- `CONCEPT.md` (Root, kompakte Fassung)
- `.AURUM-neu/.AURUM/dokumentation/CONCEPT.md`
- `.AURUM-neu/AURUM/documentation/CONCEPT.md`
- `.AURUM-neu/AURUM/documents/Konzept.md`
- die Arbeitsnotizen in `.AURUM-neu/.AURUM/informationen/`

Die bestehenden Dokumente bleiben erhalten, dienen aber ab jetzt als Quellen. Weitere Detaildokumente (UI pro Screen, Datenmodell im Detail, AURA-Prompts, Ring-Protokoll) entstehen als eigene Dateien neben diesem Konzept in `documentation/`.
