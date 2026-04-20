## | AURUM | Version

# AURUM v0.11 (CUPRUM)

Begriffs-Klärung und Rollen-Trennung. Keine Code-Änderungen, sondern erst mal sauberer konzeptioneller Boden, damit spätere Implementierung strukturell fundiert erfolgen kann. Quelle: `x_neustart/info.txt` (Abschnitt „Verständnis") plus User-Klärung vom 2026-04-20 und die zwei Admin-Screenshots in `mobile/` (IMG_1370.PNG, IMG_1371.PNG).

* Version: v0.11 (CUPRUM)
* Status: aktiv. Nachfolger von v0.1 (CUPRUM). Konzept-Doku, noch kein Code-Refactor.
* Scope: Terminologie, Rollen, Button-Belegung, was im aktuellen Code **falsch** ist und korrigiert werden muss.

Gegenüber v0.1 (CUPRUM) gelten folgende grundlegende Änderungen:

* **„Marker" ist kein Begriff.** Es gibt keinen gemeinsamen Oberbegriff für Anker, Audiomarker, Kompression, Termin und Ereignis. Frühere Dokumente (v1, v2, v3, v0.1) haben das falsch zusammengefasst. Im Code erscheint `marker_type` weiterhin, weil das der DB-Spaltenname ist — aber in UI-Strings, Code-Kommentaren und Doku wird das Wort „Marker" nicht mehr verwendet.
* **Audiomarker bleibt so heißen.** Die Silbe „marker" im Wort ist ein Eigenname, kein Typ-Oberbegriff.
* **User-Rolle vs. Admin-Rolle** klar getrennt. Im User-Modus ist die App **reine Planung und Auswertung**. Im Admin-Modus können alle Typen in der App ausgelöst werden (Simulation, Test, Diplomarbeits-Präsentation).
* **Armreif hat genau zwei Buttons.** Button 1 = Anker und Audiomarker. Button 2 = Kompression Start/Stop (oder nur Stop).

---

## Inhaltsverzeichnis

1. Die sechs Typen
2. Quelle pro Typ (Armreif oder App)
3. Kategorien: Instant vs. Planung
4. Rollen: User und Admin
5. Armreif: zwei Buttons
6. Kompression im Detail
7. Ereignis ohne Zeit
8. Was im aktuellen CUPRUM-Code falsch ist
9. Offene Punkte und nächste Schritte
10. Abgrenzung gegen frühere Dokumente
11. Glossar
12. Kurzfassung

---

## 1. Die sechs Typen

Es gibt genau **sechs** Typen im System. Kein gemeinsamer Oberbegriff.

| Typ | Beschreibung | DB `marker_type` |
|---|---|---|
| **Anker** | Leerer Zeitpunkt. „Gedanke existiert." Optional Ort. Kein Inhalt. | `anchor` |
| **Audiomarker** | Sprachaufnahme mit Upload, optional Transkript (via AURA). | `audio` |
| **Kompression** | Haptischer Eingriff am Armreif. Zwei Modi: live oder geplant. | `compression` |
| **Termin** | Geplanter Zeitpunkt mit Ring-Rückmeldung zum Zeitpunkt. | `appointment` (neu) |
| **Ereignis** | Anlass oder Event mit Kontext. Ohne Zeit → wird zur Notiz. | `event` (neu) |
| **Notiz** | Nachgelagerte Bedeutung. Optional verknüpft mit Anker/Audiomarker/Termin/Ereignis. Eigene Tabelle `notes`. | — |

Die DB-Spalte `marker_type` heißt weiterhin so (technischer Name, aus v0.08 historisch). Neue Werte `appointment` und `event` kommen hinzu, `planned` wird ersetzt. Schema-Migration notwendig (siehe Abschnitt 8).

---

## 2. Quelle pro Typ

Jeder Typ hat genau eine primäre Quelle. Das ist nicht verhandelbar.

| Typ | Primäre Quelle | In App (User) | In App (Admin) |
|---|---|---|---|
| **Anker** | Armreif (Button 1, 1x kurz) | Nein | Ja, zur Simulation |
| **Audiomarker** | Armreif (Button 1, 2x kurz) | Nein | Ja, zur Simulation |
| **Kompression (live)** | Armreif (Button 2) | Nein | Ja, zur Simulation |
| **Kompression (geplant)** | App | Ja | Ja |
| **Termin** | App | Ja | Ja |
| **Ereignis** | App | Ja | Ja |
| **Notiz** | App (nachgelagert) | Ja | Ja |

**Der Nutzer erzeugt Realität primär über den Armreif, nicht über die App.** Die App ist für Planung und Auswertung da.

---

## 3. Kategorien: Instant vs. Planung

Das System kennt zwei Interaktionsarten. Die Trennung ist zentral und darf nicht vermischt werden.

### 3.1 Instant (sofort, ohne Unterbrechung)

Kommen alle vom Armreif. Zweck: kognitive Entlastung im Moment.

* **Anker setzen** — Button 1, 1x kurz. Kein Inhalt, nur Zeitpunkt.
* **Audiomarker aufnehmen** — Button 1, 2x kurz. Aufnahme läuft bis Button erneut gedrückt oder Auto-Stop nach 5 Minuten.
* **Kompression starten** — Button 2. Siehe Abschnitt 6.

### 3.2 Planung (bewusst, später)

Kommen aus der App. Zweck: Struktur vorbereiten.

* **Termin planen** — Zeitpunkt + Titel. Ring gibt zum Zeitpunkt haptische Rückmeldung.
* **Ereignis planen** — Anlass mit Kontext. Wenn ohne Zeit: wird als Notiz gespeichert mit Hinweis, später einen Termin zu setzen.
* **Kompression definieren (optional)** — vorgeplante Kompression zu einem Zeitpunkt.

---

## 4. Rollen: User und Admin

Wichtig: Im aktuellen **Prototyp-Stand** sind das keine Account-Rollen, sondern lokale Toggle-Zustände pro Gerät (`localStorage['aurum_admin_mode']`). Jeder Account kann den Toggle umlegen. Später (**Produktions-Stand**, ferne Zukunft) wird das entweder entfernt oder an eine Account-Rolle gebunden — nicht Thema in v0.11.

### 4.1 User-Modus (Toggle aus)

* Zeigt den sauberen User-Flow: Armreif als primäres Eingabegerät.
* Kann in der App **keine** Anker, Audiomarker oder Live-Kompression auslösen.
* Kann in der App: Termine planen, Ereignisse planen, Kompressionen vorplanen, Notizen schreiben, alle Typen nachträglich ansehen, archivieren, verknüpfen.
* Für Diplomarbeits-Vorführung: Zuschauer sehen nur die sauberen Planung-Optionen, keine Simulation-Buttons.

### 4.2 Admin-Modus (Toggle an, Default)

* Kann in der App **alle fünf** Instant/Planung-Typen auslösen (inklusive Anker, Audiomarker, Live-Kompression).
* Dient zur Simulation und zum Testen, solange Armreif-Hardware fehlt.
* Admin-Modus ist **keine Security-Schicht**, nur Sichtbarkeits-Schalter (`localStorage['aurum_admin_mode']`). Kein Server-Call, keine Auth-Rolle.

### 4.3 UI-Konsequenz

Das Bottom-Sheet „Was möchtest du erfassen?" (siehe `mobile/IMG_1370.PNG`, `mobile/IMG_1371.PNG`) zeigt im aktuellen Stand fünf Optionen (Anker, Audiomarker, Termin, Ereignis, Kompression). Das ist die **Admin-Ansicht**. Im User-Modus müssen Anker, Audiomarker und Live-Kompression **ausgeblendet** werden. Sichtbar bleiben: Termin, Ereignis, (geplante) Kompression.

---

## 5. Armreif: zwei Buttons

Der Armreif hat genau zwei Bedienelemente. Bewusst unterschiedliche Haptik, damit sie blind nicht verwechselt werden.

### 5.1 Button 1 — Druckknopf (klassischer Klick)

| Interaktion | Aktion |
|---|---|
| 1x kurz | Anker setzen |
| 2x kurz | Audiomarker starten |
| 2x kurz (während Aufnahme läuft) | Audiomarker stoppen |

### 5.2 Button 2 — Hebel oder Kompressions-Button

Die genaue Mechanik (Hebel mit Rückstellung, proportionaler Druck, Snap-Back) ist in `CONCEPT_v3.md` Abschnitt 3 und `CONCEPTv0.1 (CUPRUM).md` Abschnitt 4 beschrieben und bleibt gültig. Zusammenfassend:

| Interaktion | Aktion |
|---|---|
| Betätigen (Druck aufbauen) | Kompression starten |
| Loslassen / Gegenbetätigung | Kompression stoppen |
| Betätigen während geplanter Kompression läuft | Laufende Kompression stoppen |

### 5.3 Aufteilung

* **Button 1** ist mental/diskret. Er markiert Zeitpunkte.
* **Button 2** ist körperlich/regulierend. Er beginnt oder beendet haptische Zustände.

---

## 6. Kompression im Detail

Kompression ist der zentrale Mechanismus des Armreifs (USP der Diplomarbeit). Sie existiert in zwei Modi, beide sind gewollt.

### 6.1 Live (Instant)

* Gestartet per Button 2 am Armreif.
* Gestoppt per Button 2 am Armreif.
* Wird als Event in `markers` protokolliert (`marker_type='compression'`, `source='ring'`, `start_time`, `compression_seconds`).

### 6.2 Geplant

* In App vorab definiert: Zeitpunkt, optional Dauer.
* Start erfolgt automatisch zum geplanten Zeitpunkt (Ring baut Druck auf).
* Stop per Button 2 am Armreif (manueller Abbruch) oder automatisch nach Dauer.
* Wird als Event in `markers` protokolliert, `source='app'` (Plan) bzw. bei Auslösung `source='ring'`.

### 6.3 Konsequenz für die DB

Die Spalte `compression_seconds` muss existieren. Aktuell fehlt sie (siehe Abschnitt 8, Fehlermeldung auf `mobile/IMG_1370.PNG`).

---

## 7. Ereignis ohne Zeit

Wenn ein Ereignis in der App ohne Zeit angelegt wird:

* Wird **nicht** als Ereignis gespeichert, sondern als Notiz (`notes`-Tabelle).
* Die Notiz bekommt einen Hinweis: „Später einen Termin setzen."
* Das ist kein Fehler, sondern bewusster Zwischenzustand.

Damit wird die Regel „Ereignis hat Kontext aber optional Zeit" mit der Regel „Termin hat fixe Zeit" sauber getrennt.

---

## 8. Was im aktuellen CUPRUM-Code falsch ist

### 8.1 Terminologie in UI und Kommentaren

* `MarkerDetail.tsx`, `Timeline.tsx`, `markers-api.ts` und weitere Dateien verwenden „Marker" als Oberbegriff. **Falsch.** In UI-Strings und Kommentaren ersetzen durch den konkreten Typ-Namen (Anker, Audiomarker, Kompression, Termin, Ereignis) oder neutral „Eintrag".
* DB-Spalte `marker_type` darf bleiben (technisch).
* Funktionsnamen wie `createMarker`, `fetchMarkersForRange` können technisch bleiben, sind aber Kandidaten für späteren Rename.

### 8.2 Fehlende Typen `termin` und `ereignis`

Aktuell existieren in `markers-api.ts`:

```ts
export type MarkerType = 'anchor' | 'audio' | 'compression' | 'planned';
```

`planned` muss ersetzt werden durch:

```ts
export type MarkerType = 'anchor' | 'audio' | 'compression' | 'appointment' | 'event';
```

Plus UI-Label:

```ts
export const MARKER_TYPE_LABELS: Record<MarkerType, string> = {
  anchor: 'Anker',
  audio: 'Audiomarker',
  compression: 'Kompression',
  appointment: 'Termin',
  event: 'Ereignis',
};
```

### 8.3 Admin-Gating im Erfassungs-Sheet

Das Sheet zeigt aktuell alle Optionen. Im User-Modus müssen Anker, Audiomarker und Live-Kompression ausgeblendet werden. Sichtbar im User-Modus: Termin, Ereignis, geplante Kompression.

### 8.4 Konkreter Fehler: `compression_seconds` fehlt

Aus `x_neustart/info.txt` Abschnitt 3 und sichtbar auf `mobile/IMG_1370.PNG`:

> `Could not find the 'compression_seconds' column of 'markers' in the schema cache`

Ursache: Frontend sendet die Spalte, sie existiert aber nicht in der DB. Fix (Supabase-MCP-Migration, backward-kompatibel, AURUM live ignoriert die Spalte):

```sql
alter table public.markers add column if not exists compression_seconds integer;
notify pgrst, 'reload schema';
```

### 8.5 Schema-Migration für neue `marker_type`-Werte

Wenn `marker_type` als Enum-Constraint auf DB-Ebene existiert (CHECK-Constraint), muss es gelockert werden, bevor `appointment` und `event` erlaubt sind. Wenn es nur eine Text-Spalte ist, reicht die Frontend-Änderung. Vor Umsetzung prüfen.

### 8.6 Geo/Audio im Cloudflare-Tunnel

Aus `x_neustart/info.txt` Abschnitt 3: Geolocation und Audio funktionieren lokal (`localhost:8008`), aber nicht via `cuprum.marcodemont.ch` (iOS Safari blockiert wegen Tunnel-Eigenheiten).

Lösung kurzfristig: Test auf Laptop. Lösung mittelfristig: Capacitor-Build (native Permissions), sobald macOS-Zugriff vorliegt.

---

## 9. Offene Punkte und nächste Schritte

1. **Schema-Fix** für `compression_seconds` via Supabase-MCP. Blockiert aktuell die Kompressions-Erstellung.
2. **Neue `marker_type`-Werte** `appointment` und `event` einführen. `planned` migrieren oder parallel laufen lassen.
3. **Admin-Gating** im Erfassungs-Sheet: User-Modus zeigt nur Termin, Ereignis, geplante Kompression.
4. **UI-Texte aufräumen**: überall „Marker" durch spezifischen Namen ersetzen.
5. **Type-Icons** im Detail-Modal pro Typ prüfen: Anker, Audiowellen, Kompression, Termin-Uhr, Ereignis-Kalender.
6. **Ereignis ohne Zeit** → Notiz-Flow implementieren.
7. **Armreif-Button-Mapping** im Code vorbereiten, Event-Normalisierung in `ble-ring.js` bleibt gültig.

---

## 10. Abgrenzung gegen frühere Dokumente

* `CONCEPT_v1.md` bis `CONCEPT_v3.md` sprechen von „Marker" als Oberbegriff. **Falsch.** Die alten Dokumente bleiben als historische Referenz, aber die neue Regel ist: kein Oberbegriff.
* `CONCEPTv0.1 (CUPRUM).md` führt vier „Marker-Typen" auf. Muss entsprechend v0.11 nachgezogen werden.
* `AURUMv0.09.md` beschreibt die frühe React-Arbeit unter ARGENTUM-Namen. Terminologie dort ebenfalls veraltet.
* Die Termin/Ereignis-Trennung ist neu in v0.11. Vorher gab es nur `planned`.

---

## 11. Glossar

**Anker** | Leerer Zeitpunkt, „Gedanke existiert", Button 1 am Armreif, 1x kurz.

**Audiomarker** | Sprachaufnahme, Button 1 am Armreif, 2x kurz. Inhalt landet in verknüpfter Notiz.

**Kompression** | Haptischer Eingriff am Armreif. Live (Button 2) oder geplant (App → Ring).

**Termin** | App-geplanter Zeitpunkt mit Ring-Rückmeldung.

**Ereignis** | App-geplanter Anlass mit Kontext. Ohne Zeit → Notiz.

**Notiz** | Nachgelagerte Bedeutung, optional verknüpft, eigene Tabelle.

**Armreif** | Physisches Eingabegerät. Zwei Buttons. Primäre Quelle für Instant-Interaktion.

**Button 1** | Druckknopf für Anker und Audiomarker.

**Button 2** | Hebel für Kompression Start/Stop.

**User** | Normale Rolle. App für Planung und Auswertung. Keine Instant-Typen in App.

**Admin** | Simulations-Rolle. Alle Typen in App auslösbar. Nur Sichtbarkeits-Schalter, keine Security.

**Instant** | Sofortige Interaktion ohne Unterbrechung im Moment. Anker, Audiomarker, Kompression live.

**Planung** | Bewusste, zeitversetzte Interaktion in der App. Termin, Ereignis, Kompression geplant.

---

## 12. Kurzfassung

v0.11 korrigiert die Begriffe:

* Kein „Marker"-Oberbegriff. Sechs eigenständige Typen: Anker, Audiomarker, Kompression, Termin, Ereignis, Notiz.
* User-Rolle bekommt in der App nur Planung (Termin, Ereignis, geplante Kompression, Notizen). Admin-Rolle kann alles zur Simulation auslösen.
* Armreif hat zwei Buttons: Button 1 für Anker/Audiomarker, Button 2 für Kompression Start/Stop.
* Kompression hat zwei Modi: live (Ring) oder geplant (App-Start, Ring-Stop).
* Ereignis ohne Zeit wird zur Notiz (Zwischenzustand, kein Fehler).

Code-Konsequenzen sind in Abschnitt 8 aufgeführt. Umsetzung erfolgt in nachfolgenden v0.11.x-Schritten, Reihenfolge siehe Abschnitt 9.
