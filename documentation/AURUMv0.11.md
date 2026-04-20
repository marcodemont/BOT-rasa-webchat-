# AURUM v0.11

* Version: v0.11 (laufend, in Arbeit)
* Datum: gestartet 2026-04-20
* Basis: v0.1 (siehe `AURUMv0.1.md`)
* Status: aktive Werkstatt-Doku. Wird Schritt fuer Schritt mit jeder UI- oder Verhaltens-Aenderung ergaenzt.

Diese Doku haelt fest, was sich gegenueber v0.1 aendert. Konzeptueller Rahmen bleibt `CONCEPTv0.1.md`. Wenn ein Punkt hier in mehreren Sessions waechst, wird er konsolidiert. Wenn v0.11 reif ist, wandert dieser Block ins `CHANGELOG.md`.

---

## Inhaltsverzeichnis

1. Modul-Struktur (Stand v0.11)
2. Aenderungen
   * 2.1 Anker → Notiz: sauberer Uebergang
   * 2.2 Schema-Fix: `compression_seconds`-Spalte ergaenzt
   * 2.3 User/Admin-Trennung im Erstellungs-Sheet
   * 2.4 DB- und Begriffs-Refactor: `markers` → `events`, kein "Marker" mehr
   * 2.5 Ereignis ohne Zeit → Notiz (Auto-Fallback)
3. Offene Punkte / kommende Aenderungen
4. Hinweise zur Doku-Pflege

---

## 1. Modul-Struktur (Stand v0.11)

Alle AURUM-spezifischen Komponenten und Logik liegen sauber gebuendelt unter:

```
AURUM/src/modules/aurum/
```

Damit ist der gesamte Feature-Code an **einem Ort**. Generische UI-Primitives (Button, Sheet, Input, Textarea, Badge, Label) leben in `src/components/ui/`, technische Helfer (Supabase-Client, Geo, Config) in `src/lib/`.

### Datei-Inventar im Modul

| Datei | Zweck |
|---|---|
| `AurumCore.tsx` | App-Shell. Routet Timeline / Notes / Settings, lade Marker zentral, haelt Top-Level-State (View, detailMarker, pendingNoteOpen). |
| `Timeline.tsx` | Timeline-Ansicht (Tag und Woche), Marker-Render, FAB. |
| `CreateMarker.tsx` | Bottom-Sheet zum Anlegen neuer Marker (Anker, Audio, Termin, Ereignis, Kompression). |
| `MarkerDetail.tsx` | Modal/Sheet fuer Marker-Detail. Typ-spezifischer Body. Aktionen: Notiz, Speichern (Audio), Loeschen. Ab v0.11: dynamischer Notiz-Button und Brueckenschlag zum Notes-Tab. |
| `NotesView.tsx` | Notizen-Liste plus Editor. Ab v0.11: kann eine spezifische Notiz beim Mount oeffnen via `initialOpenNoteId`. |
| `BottomNav.tsx` | Mobile-Bottom-Navigation: Timeline / Notizen / Einstellungen, plus FAB. |
| `SettingsView.tsx` | Einstellungen mit Sektionen (Geplante Marker, Anker, Armreif, Konto, Entwickler, Archiv). |
| `AuthScreen.tsx` | Login und Registrierung. |
| `WelcomeScreen.tsx` | Onboarding-Hinweis nach erstem Login. |
| `markers-api.ts` | Supabase-Calls fuer `markers`, plus Mapping `mapRowToMarker`, Typ-Konstanten (`MARKER_TYPE_COLORS`, `MARKER_TYPE_LABELS`), `signedAudioUrl`. |
| `notes-api.ts` | Supabase-Calls fuer `notes`. CRUD plus Row-zu-Note-Mapping. |
| `settings-api.ts` | Supabase-Calls fuer `user_settings`, plus `DEFAULT_SETTINGS`. |
| `useAdminMode.ts` | Hook fuer Admin-Modus-State (lokal in `localStorage['aurum_admin_mode']`). |
| `types.ts` | Zentrale TypeScript-Typen (Marker, MarkerType, Note, UserSettings). |

### Was wo lebt

* **Reine API/Logik** (kein React) → `*-api.ts`, `useAdminMode.ts`, `types.ts`
* **Sichtbare Screens und Modals** → `Timeline.tsx`, `MarkerDetail.tsx`, `NotesView.tsx`, `SettingsView.tsx`, `AuthScreen.tsx`, `WelcomeScreen.tsx`, `CreateMarker.tsx`
* **App-Shell und Navigation** → `AurumCore.tsx`, `BottomNav.tsx`

Keine Datei aus diesem Modul referenziert Code ausserhalb von `src/components/ui/`, `src/lib/` oder `src/modules/aurum/`. Damit bleibt das Modul portierbar und in sich geschlossen.

---

## 2. Aenderungen

### 2.1 Anker → Notiz: sauberer Uebergang

**Problem in v0.1:**

Im `MarkerDetail` zeigte der Anker (und andere Marker-Typen) einen "Notiz"-Button, dessen Verhalten halbfertig war:

* Existierte keine verknuepfte Notiz, wurde eine angelegt — aber leer (kein Titel, kein Inhalts-Vorschlag).
* Bestand bereits eine, kam nur ein `alert("Verknuepfte Notiz vorhanden. Wechsle zum Notizen-Tab.")` — der Nutzer musste manuell zum Notes-Tab wechseln und die Notiz suchen.
* TODO-Kommentar im Code: "hier koennten wir direkt zum Notes-Tab springen."

**Aenderung in v0.11:**

Sauberer UX-Fluss zwischen Marker-Detail und Notiz-Editor.

**Verhalten neu:**

1. Beim Oeffnen des Marker-Details prueft `MarkerDetail` per `fetchNotes()` einmal, ob eine verknuepfte Notiz existiert. Ergebnis landet in lokalem State `linkedNoteId`.
2. Der Button-Text ist dynamisch:
   * **"Als Notiz weiterfuehren"** wenn keine Notiz existiert.
   * **"Notiz oeffnen"** wenn bereits verknuepft.
3. Klick auf den Button:
   * Falls keine Notiz vorhanden: `createNote({ markerId, title: 'Anker · 20. Apr. 2026 · 07:11', content: '', tags })` — Titel mit Marker-Typ und Zeitstempel vorbefuellt, damit die Notiz beim ersten Anlegen schon Kontext mitbringt.
   * Anschliessend (oder direkt bei vorhandener Notiz): `onOpenNote(noteId)` ruft eine Funktion in `AurumCore`, die View auf `notes` setzt, das Marker-Detail schliesst und die Notiz im Editor oeffnet.
4. Kein `alert` mehr.

**Beteiligte Dateien:**

* `AurumCore.tsx`
  * Neuer State `pendingNoteOpen: string | null`.
  * Neue Funktion `navigateToNote(noteId)`: schliesst das Marker-Detail-Modal, setzt View auf `'notes'`, merkt sich die Note-ID.
  * `<NotesView>` bekommt Props `initialOpenNoteId` und `onConsumedInitial`.
  * `<MarkerDetail>` bekommt Prop `onOpenNote`.

* `NotesView.tsx`
  * Neue optionale Props `initialOpenNoteId?: string | null` und `onConsumedInitial?: () => void`.
  * Zweiter `useEffect`: Sobald die Notes-Liste geladen ist und eine Initial-ID gesetzt ist, wird die passende Notiz gefunden und `setEditing(target)` ruft den Editor auf. Anschliessend `onConsumedInitial()`, damit die ID nicht mehrfach reagiert.

* `MarkerDetail.tsx`
  * Neue optionale Prop `onOpenNote?: (noteId: string) => void`.
  * Neuer State `linkedNoteId: string | null`.
  * `useEffect`: laedt einmal pro Marker die Notes und setzt `linkedNoteId`. Cleanup mit `cancelled`-Flag.
  * `openLinkedNote()` ueberarbeitet:
    * Wenn `linkedNoteId` leer: erstellt Notiz mit `title = '<TypLabel> · <Datum> · <Zeit>'` (Schweizer Locale `de-CH`).
    * Anschliessend `onOpenNote?.(noteId)`.
    * Fallback: `alert(...)` wenn der Parent keinen `onOpenNote` reicht (Komponente bleibt eigenstaendig nutzbar).
  * Button-Label dynamisch: `'Als Notiz weiterfuehren'` vs. `'Notiz oeffnen'`. `disabled={busy}` bleibt erhalten.

**Auswirkung auf den Anker-Flow konzeptuell:**

Der Anker bleibt bewusst leer. Wenn der Nutzer ihn spaeter mit Bedeutung fuellen will, fuehrt **ein Klick** ihn direkt in einen vorbefuellten Notiz-Editor, in dem er nur noch schreiben muss. Die Verknuepfung Marker↔Notiz wird automatisch persistiert (`notes.marker_id`).

**Was bewusst nicht geaendert wurde:**

* `tags` werden vom Marker uebernommen, aber nicht erweitert. Anker hat in der Regel keine Tags.
* `content` bleibt leer, falls der Marker kein Transkript / keine Summary hat. Der vorbefuellte Titel reicht als Kontext.
* Der `sub`-basierte Anker-erfuellt-Plan-Mechanismus aus dem v4-Fork (Liste offener geplanter Marker im Anker-Detail) ist **nicht** Teil dieser Aenderung. Bleibt als eigene Iteration offen (siehe Abschnitt 3).

---

### 2.2 Schema-Fix: `compression_seconds`-Spalte ergaenzt

**Problem in v0.1:**

Beim Anlegen eines Markers schlug Supabase mit folgender Meldung fehl:

> "Marker konnte nicht erstellt werden: Could not find the 'compression_seconds' column of 'markers' in the schema cache"

Das Frontend sendete das Feld `compression_seconds` (beim Kompressions-Typ und aus dem Planned-Flow), die Tabelle `markers` kannte die Spalte aber nicht. Triff nicht nur den Kompressions-Typ, sondern alle Marker-Anlagen, weil das Feld teilweise im CreateMarker-Flow mitgeschickt wurde.

**Aenderung in v0.11:**

Migration `add_compression_seconds_to_markers` via Supabase-MCP deployed:

```sql
alter table public.markers add column if not exists compression_seconds integer;
notify pgrst, 'reload schema';
```

* `compression_seconds` ist nullable integer.
* Der `notify pgrst`-Aufruf leert den PostgREST-Schema-Cache, damit das Feld sofort in der JSON-API bekannt ist.
* Backward-kompatibel: bestehende Zeilen bekommen `null`, AURUM-live-Clients ignorieren das Feld weiterhin.

**Beteiligte Stellen:**

* Supabase-Migration (ausserhalb des Repos, in Supabase-Projekt `jitkxxpuzmopcrfvzzlz`).
* Keine Frontend-Aenderung noetig, der Code sendete das Feld bereits.

---

### 2.3 User/Admin-Trennung im Erstellungs-Sheet

**Problem in v0.1:**

Das Bottom-Sheet "Was moechtest du erfassen?" (`CreateMarker.tsx`) zeigte **immer alle fuenf Marker-Typen**, unabhaengig vom Admin-Modus. Das widerspricht dem Konzept (`CONCEPTv0.1.md` Abschnitt 7):

* Normal-User erfasst Instant-Marker (Anker, Audiomarker, Kompression) am Armreif, nicht in der App.
* Nur in der App gehoeren Planung-Marker (Termin, Ereignis) zum User-Modus.
* Admin darf zusaetzlich alle Instant-Typen in der App ausloesen, als Test- oder Simulations-Instanz.

Code-Befund: `CreateMarker.tsx` importierte `useAdminMode` nicht und hatte keinen Sichtbarkeits-Filter.

**Aenderung in v0.11:**

* `useAdminMode` wird in `CreateMarker.tsx` importiert und gelesen.
* Das Interface `TypeOption` bekommt ein neues Flag `adminOnly?: boolean`.
* Im `TYPE_OPTIONS`-Array sind `anchor`, `audio` und `compression` mit `adminOnly: true` markiert. `termin` und `ereignis` bleiben fuer alle Nutzer.
* Eine neue Konstante `visibleOptions = TYPE_OPTIONS.filter(o => adminMode || !o.adminOnly)` filtert zur Render-Zeit.
* Im JSX wird statt `TYPE_OPTIONS.map(...)` nun `visibleOptions.map(...)` verwendet.

**Resultat:**

* **User-Modus**: 2 Optionen — Termin, Ereignis.
* **Admin-Modus**: 5 Optionen — Anker, Audiomarker, Termin, Ereignis, Kompression.

**Beteiligte Dateien:**

* `AURUM/src/modules/aurum/CreateMarker.tsx` — Import `useAdminMode`, `adminOnly`-Flag, `visibleOptions`-Filter, `visibleOptions.map` im JSX.

**Was bewusst nicht geaendert wurde:**

* Innere Funktionen wie `TYPE_OPTIONS.find(o => o.id === type)` (z. B. fuer Farbe/Icon bei der Bestaetigung) bleiben auf der Gesamt-Liste, weil ein Admin, der etwas ausgewaehlt hat, die Darstellung auch durchlaeuft.
* Die Logik in `AurumCore.tsx`, die den schnellen "Anker"-Shortcut (`quickAnchor()`) auf der Timeline ausloest, ist ein separater Pfad. Die Sichtbarkeit dieses Buttons haengt an einer anderen Stelle (Timeline-Header im Admin-Modus) und ist nicht Teil dieser Aenderung.

**Konzept-Abgleich:**

Deckt sich mit `CONCEPTv0.1.md` Abschnitt 7.1 (User), 7.2 (Admin), 21.1 (Sichtbarkeits-Regeln) und 25.2 (Bottom-Sheet-Logik). Der einzige Rest-Dissens: Abschnitt 25.2 erwaehnt "Kompression" im User-Modus, waehrend Abschnitt 6.1 und 7 sie als Instant behandeln (Armreif-only). Entscheidung: **Instant = Armreif-only**, Abschnitt 25.2 wird beim naechsten Konzept-Pass korrigiert.

---

### 2.4 DB- und Begriffs-Refactor: `markers` → `events`, kein "Marker" mehr

**Problem in v0.1:**

Der Sammelbegriff "Marker" existierte in UI-Strings, TypeScript-Types, API-Funktionen und in der DB (Tabelle `markers`, Spalte `marker_type`). Im Konzept laut `info.txt` Zeile 311 gilt jedoch: **Marker = Ereignis**. Der Oberbegriff "Marker" ist kein User-Begriff. Die DB-Benennung suggerierte eine falsche Hierarchie, und in der UI wurden Anker, Audiomarker, Termin, Ereignis, Kompression als gleichrangige "Marker-Typen" behandelt, obwohl sie aus verschiedenen Quellen kommen (Armreif vs. App).

Zusaetzlich wurden Termin und Ereignis nur als Unterfaelle von `marker_type='planned'` mit `sub`-Feld-Unterscheidung gespeichert — obwohl sie konzeptuell zwei eigenstaendige Typen sind.

**Aenderung in v0.11:**

Komplette Entfernung des Sammelbegriffs "Marker" aus UI, Code und DB. Dafuer:

**DB-Migration (Supabase, deployed):**

```sql
-- Alten Check-Constraint entfernen
alter table public.markers drop constraint if exists markers_marker_type_check;

-- Werte aufsplitten: 'planned' → 'ereignis' / 'termin' abhaengig vom sub-Feld
update public.markers set marker_type = 'ereignis' where marker_type = 'planned' and sub = 'ereignis';
update public.markers set marker_type = 'termin' where marker_type = 'planned';

-- Tabelle und Spalte umbenennen
alter table public.markers rename to events;
alter table public.events rename column marker_type to type;

-- Neuen Check-Constraint mit fuenf zulaessigen Werten
alter table public.events add constraint events_type_check
  check (type in ('anchor', 'audio', 'compression', 'termin', 'ereignis'));

-- FK-Spalte in notes umbenennen
alter table public.notes rename column marker_id to event_id;

-- Index umbenennen
alter index if exists markers_archived_idx rename to events_archived_idx;

-- Schema-Cache neu laden
notify pgrst, 'reload schema';
```

**Code-Refactor:**

* `AURUM/src/modules/aurum/markers-api.ts` geloescht, neue Datei `events-api.ts`:
  * `MarkerRow` → `EventRow` (mit Spalte `type`)
  * `fetchMarkersForRange` → `fetchEventsForRange` (aus Tabelle `events`)
  * `mapRowToMarker` → `mapRowToEvent`
  * `createMarker`, `updateMarker`, `deleteMarker` → `createEvent`, `updateEvent`, `deleteEvent`
  * `MARKER_TYPE_COLORS` → `EVENT_TYPE_COLORS` (erweitert um `termin` und `ereignis`, kein `planned` mehr)
  * `MARKER_TYPE_LABELS` → `EVENT_TYPE_LABELS` (erweitert)
  * Farbe fuer `ereignis`: `#94b2a1` (zentral definiert, nicht mehr hardcoded in CreateMarker)

* `types.ts`:
  * `MarkerType = 'anchor' | 'audio' | 'compression' | 'planned'` → `TimelineEventType = 'anchor' | 'audio' | 'compression' | 'termin' | 'ereignis'`
  * Interface `Marker` → `TimelineEvent`. Property `markerType?` → `type?`.
  * `Note.markerId` → `Note.eventId`.
  * `TimelineEvent` als Name statt `Event`, damit keine Kollision mit dem globalen DOM-`Event` entsteht.

* `notes-api.ts`:
  * `marker_id` → `event_id` in Row und Insert.
  * `CreateNoteInput.markerId` → `CreateNoteInput.eventId`.

* `Timeline.tsx`:
  * Alle `Marker`-Typ-Refs → `TimelineEvent`.
  * Props `markers`/`onMarkerClick`/`onCreateMarker` → `events`/`onEventClick`/`onCreateEntry`.
  * Helper `markerColor` → `eventColor`, `MarkerTypeIcon` → `EventTypeIcon`.
  * Sub-Komponenten `MarkerRow` → `EventRow`, `WeekMarkerCard` → `WeekEventCard`.
  * Behandlung von `'planned'` entfernt; stattdessen `isPlanned = type === 'termin' || type === 'ereignis'`.
  * `EventTypeIcon` hat jetzt fuenf Cases (Calendar-Icon fuer `ereignis`).

* `MarkerDetail.tsx`: (Komponenten-Filename nicht umbenannt, weil MarkerDetail.tsx im Rest des Repos referenziert ist)
  * Prop-Name `marker` bleibt aus Konsistenzgruenden, intern `event` benannt.
  * Body behandelt `isTermin` und `isEreignis` einzeln; `isPlanned = isTermin || isEreignis`.
  * Import aus `./events-api`, Funktionen `updateEvent`, `deleteEvent`, `EVENT_TYPE_COLORS`, `EVENT_TYPE_LABELS`.
  * Ereignis-spezifischer Body zeigt Text "Anlass, in der App festgehalten." statt "geplanter Termin".
  * Typ-Icon: `Calendar` fuer Ereignis.
  * `event.type` statt `marker.markerType`.
  * Link-Notiz-Abfrage nutzt `event_id` statt `marker_id`.

* `CreateMarker.tsx`:
  * `WizardType = MarkerType | 'termin' | 'ereignis'` vereinfacht zu `TimelineEventType`.
  * `createMarker({ markerType: 'planned', sub: 'ereignis' })` entfaellt — direkter `createEvent({ type: 'ereignis' })`.
  * `TYPE_OPTIONS` nutzt `EVENT_TYPE_COLORS.termin` und `EVENT_TYPE_COLORS.ereignis`.
  * `labelForType` hat fuenf Cases, kein Fallback "Marker".

* `AurumCore.tsx`:
  * State `markers` → `events`, `detailMarker` → `detailEvent`, Loader `loadMarkers` → `loadEvents`.
  * Supabase-Channel `aurum-markers` → `aurum-events`, Tabelle `events` subscribed.
  * `apiCreateMarker` → `apiCreateEvent`.
  * Props an Timeline und MarkerDetail entsprechend angepasst.

* UI-Strings ueberall bereinigt:
  * `BottomNav.tsx`: `aria-label="Neuer Marker"` → `"Neuer Eintrag"`.
  * `SettingsView.tsx`: Section-Titel "Geplante Marker" → "Termine und Ereignisse", Header-Untertitel analog.
  * `NotesView.tsx`: "Marker halten den Moment" → "Anker halten den Moment". `n.marker_id` → `n.event_id`.
  * `WelcomeScreen.tsx`: Erste Karte ohne "Marker"-Wort. Zweite Karte "Vier Marker-Typen" → "Fuenf Eintrags-Typen" mit neuem Bullet fuer Ereignis.
  * `AuthScreen.tsx`: "deine Marker" → "deine Eintraege".

**Beteiligte Dateien (11):**

* Neu: `AURUM/src/modules/aurum/events-api.ts`
* Geloescht: `AURUM/src/modules/aurum/markers-api.ts`
* Geaendert: `types.ts`, `notes-api.ts`, `Timeline.tsx`, `MarkerDetail.tsx`, `CreateMarker.tsx`, `AurumCore.tsx`, `BottomNav.tsx`, `SettingsView.tsx`, `NotesView.tsx`, `WelcomeScreen.tsx`, `AuthScreen.tsx`

**Breaking Change fuer CUPRUM:**

CUPRUM ist nach dieser Migration **gebrochen**, weil es weiter auf Tabelle `markers` und Spalte `marker_type` zugreift. Der User hat das akzeptiert (Fokus: nur AURUM). CUPRUM muss in einer eigenen Session nachgezogen oder als Legacy stehengelassen werden.

**Was bewusst nicht geaendert wurde:**

* Komponenten-Dateinamen `MarkerDetail.tsx` und `CreateMarker.tsx` bleiben (weil sie in vielen Stellen importiert sind — File-Rename ist eigene Aufraeumrunde). Interne Implementation ist sauber auf `TimelineEvent`/`event` umgestellt.
* Spalte `marker_date` in `events` behaelt ihren Namen (hat keine semantische Verbindung mehr zum "Marker"-Begriff, ist nur technischer Datums-Key).
* Der Kommentar in `types.ts` erwaehnt explizit, dass es **keinen Sammelbegriff "Marker"** gibt — als Leitplanke fuer kuenftige Leser.

---

### 2.5 Ereignis ohne Zeit → Notiz (Auto-Fallback)

**Konzept (aus `info.txt` Zeile 122–130):**

> "Ein Ereignis ohne Zeit wird als Notiz interpretiert und entsprechend gespeichert. Dies ist kein Fehler, sondern ein bewusster Zwischenzustand."

Ein Ereignis, fuer das der Nutzer keinen Zeitpunkt setzt, ist ein **Gedanke ueber etwas Kommendes** — nicht fix genug fuer die Timeline. Es gehoert in die Notiz-Ebene, mit dem Hinweis, spaeter einen Termin daraus zu machen.

**Aenderung in v0.11:**

Neue Checkbox **"Kein Zeitpunkt"** in Schritt 3 des Erstellungs-Wizards, die nur bei Typ `ereignis` sichtbar wird. Beschreibung: "Wird als Notiz gespeichert. Spaeter kannst du dazu einen Termin setzen."

**Verhalten beim Speichern:**

```ts
if (isEreignis && noTime) {
  await createNote({
    title: title.trim() || 'Ereignis',
    content: body ? `${body}\n\n${hint}` : hint,
    tags: ['ereignis'],
  });
  // kein createEvent, keine Zeit, keine Timeline-Eintrag
}
```

Die Notiz enthaelt Titel + evtl. Details + den Hinweis-Text "Hinweis: Spaeter Termin dazu setzen." Tag `ereignis` macht sie per Filter auffindbar. Keine Verknuepfung zu einem Event (`event_id` bleibt null), weil keiner existiert.

**UI-Details:**

* Bei aktivem "Kein Zeitpunkt": Datums-Picker und Druckaufbau/Wiederholungs-Felder werden ausgeblendet.
* Step 4 (Bestaetigen) zeigt dann statt Datum/Zeit den Hinweis "Ohne Zeit · wird als Notiz gespeichert".
* Fuer andere Typen (Termin, Audiomarker, Anker, Kompression) bleibt das Verhalten unveraendert — die Checkbox erscheint gar nicht.

**Beteiligte Dateien:**

* `AURUM/src/modules/aurum/CreateMarker.tsx` — neuer State `noTime`, Checkbox-Rendering in Step 3, Verzweigung in `saveFinal()`, Anpassung des Bestaetigungs-Labels.
* `createNote` wird aus `notes-api` zusaetzlich importiert.

**Was bewusst nicht geaendert wurde:**

* Die Notiz ist **nicht rueckwandelbar** in ein Event durch UI-Geste. Wenn der User spaeter einen Termin daraus machen will, legt er einen neuen Termin an und verlinkt ihn manuell ueber die Notiz-Edit-Ansicht (spaetere Iteration). Das ist bewusst, um den Flow simpel zu halten.
* Reihenfolge der Tags (`['ereignis']`) ist stabil, damit Filtern verlaesslich ist.

---

## 3. Offene Punkte / kommende Aenderungen

Platzhalter, wird ergaenzt sobald Entscheidungen fallen:

* **Anker erfuellt geplanten Marker** (Funktion aus v4-Fork, `fulfillPlannedFromAnchor`): Liste offener Planned-Marker im Anker-Detail, Klick markiert Plan als erledigt und merkt im Anker-`sub` "erledigt: <Titel>".
* **Begriffs-Konsolidierung Sheets/Notizen**: in AURUM bereits konsistent "Notizen". CUPRUM hat noch "Sheets" als Tab-Label — Entscheidung offen, ob das spaeter angeglichen wird.
* **Ereignis ohne Zeit → Notiz** (siehe `CONCEPTv0.1.md` Abschnitt 10): UI-Flow noch nicht abgebildet.
* **`compression_seconds`-Schema-Fix** in Supabase (siehe `AURUMv0.1.md` Abschnitt 9.1) noch offen.
* **Direkter Editor-Sprung**: aktuell oeffnet `NotesView` den Editor, sobald die Notes geladen sind. Bei sehr grosser Notes-Liste koennte das eine kurze Verzoegerung erzeugen. Bei Bedarf: Editor synchron mit pre-fetched Note rendern statt auf Liste warten.

---

## 4. Hinweise zur Doku-Pflege

* Jede neue Aenderung in v0.11 bekommt einen Unterabschnitt `2.x` mit:
  * **Problem in v0.1** (was war vorher)
  * **Aenderung in v0.11** (was ist jetzt)
  * **Beteiligte Dateien**
  * **Was bewusst nicht geaendert wurde**
* Dateien werden mit ihrem Pfad relativ zu `AURUM/` referenziert.
* Konzept-relevante Aenderungen wandern parallel ins `CONCEPTv0.1.md` (z. B. wenn ein UI-Muster sich aus einer v0.11-Aenderung etabliert).
* Wenn v0.11 als Release-Stand reif ist: alle `2.x`-Bloecke konsolidieren, in `CHANGELOG.md` als v0.11-Eintrag uebernehmen, diese Datei als historische Referenz stehen lassen.
