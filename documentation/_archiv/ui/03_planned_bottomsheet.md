# 03 | Bottom-Sheet fuer geplanten Marker

## 1. Was es ist

Ein Bottom-Sheet, das von unten hochfaehrt und in einer einzigen Ansicht alle Felder eines geplanten Markers enthaelt: Titel, Zeit, optional Wiederholung. Ersetzt den bisherigen Vollbild-Screen `s-planned`.

## 2. Warum uebernehmen

- der aktuelle `s-planned`-Screen reisst den Nutzer aus der Timeline heraus
- ein Bottom-Sheet ist leichter, schneller, modaler
- es passt zum bereits bestehenden Marker-Sheet (das beim Plus-Klick erscheint)
- weniger Navigation, mehr direktes Handeln

## 3. Quelle

- Klon: `Planwoo/index.html`
- Screen-ID im Klon: das `.bottom-sheet.task-sheet` unter `screen-home`
- CSS-Klassen: `.sheet-backdrop`, `.bottom-sheet`, `.sheet-row`, `.field`

## 4. AURUM-Anpassung

| Aspekt | Klon | AURUM |
|---|---|---|
| Emojis in Zeilen | `📅 Tag`, `🕒 Uhrzeit`, `🔁 Wiederholen`, `⏰ Erinnerung` | kleine SVG-Icons in Gold oder Typ-Farbe |
| Felder | Titel, Notiz, Tag, Uhrzeit, Wiederholen, Erinnerung | Titel, Zeit, Wiederholung (nur diese drei) |
| Primary-Button | Lila „Erstellen" | Gold „Speichern" (konsistent mit bestehender `.mk-save` Logik) |
| Backdrop | dunkel transluzent | `rgba(46,40,32,0.35)` (AURUM-Standard aus `.sheet-backdrop`) |
| Handle oben | lila Pill | `.sheet-handle` (AURUM-Standard) |

Kein Feld fuer Notiz im Sheet. Notizen entstehen bei geplanten Markern nachtraeglich, nicht bei der Anlage.

## 5. Layout-Skizze

```
─────────────────────────────────
      (Backdrop, halbtransparent)

   ┌───────────────────────────┐
   │         ▬                 │   Handle
   │                           │
   │   Geplanter Marker        │   Titel-Text
   │   Zukuenftiger Zeitpunkt  │   Sub
   │   mit haptischer          │
   │   Rueckmeldung.           │
   │                           │
   │   ┌─────────────────────┐ │
   │   │ Titel               │ │   Input (Titel)
   │   └─────────────────────┘ │
   │                           │
   │   ┌─────────────────────┐ │
   │   │ ○ Zeit        14:30 │ │   Feldzeile mit Scrollrad (siehe 01)
   │   └─────────────────────┘ │   oder Kurzanzeige, die Picker oeffnet
   │                           │
   │   ┌─────────────────────┐ │
   │   │ ↻ Wiederholung  aus │ │   Feldzeile mit Select
   │   └─────────────────────┘ │
   │                           │
   │   ┌─────────────────────┐ │
   │   │      Speichern      │ │   CTA Capsule Gold
   │   └─────────────────────┘ │
   └───────────────────────────┘
```

## 6. Platz im Code

- neues Sheet-Element unter `#s-main`, parallel zum bestehenden `#marker-sheet`
- ID: `planned-sheet`
- CSS wiederverwenden: `.sheet-backdrop`, `.sheet`, `.sheet-handle`
- neue Klassen: `.sheet-field-row` fuer Feldzeilen mit Icon plus Label plus Wert
- JS: `openPlannedSheet()`, `closePlannedSheet()`, `savePlannedFromSheet()` anstelle des `goTo('s-planned')`-Sprungs
- der Screen `s-planned` kann bleiben als Fallback, wird aber vom Marker-Sheet nicht mehr gerufen

## 7. Verhalten und Interaktion

- aus dem Marker-Sheet (bei Plus-Klick) oeffnet sich direkt das `planned-sheet`, kein Zwischenscreen
- Klick auf die Zeit-Feldzeile oeffnet den Scrollrad-Picker als Overlay oder im selben Sheet (zu entscheiden, siehe offene Punkte)
- Speichern disabled, solange Titel oder Zeit leer sind
- ESC oder Tippen auf Backdrop schliesst das Sheet ohne Speichern
- erstellt einen `markers`-Eintrag mit `marker_type='planned'`, `is_done=false`

## 8. Offene Punkte

- Zeit-Picker inline im Sheet, oder als weiteres Overlay? Inline ist schneller, braucht aber mehr Platz.
- Soll das Sheet auch fuer `anchor` verwendet werden koennen (Anker mit manuellem Zeitpunkt statt Jetzt)? Aktuell setzt Anker immer Jetzt.
- Reicht der bestehende Select fuer Wiederholung, oder braucht es einen eigenen Picker?
