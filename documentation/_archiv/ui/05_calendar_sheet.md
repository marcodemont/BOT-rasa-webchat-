# 05 | Calendar-Bottom-Sheet

## 1. Was es ist

Ein Bottom-Sheet mit einem Monats-Grid, das erlaubt, auf einen beliebigen Tag der aktuellen oder benachbarten Monate zu springen. Ergaenzt den Wochenstreifen, der nur sieben Tage zeigt.

## 2. Warum uebernehmen

- AURUM kennt heute nur die aktuelle Woche. Es gibt keinen Weg, rueckwaerts oder vorwaerts zu einem bestimmten Datum zu springen.
- Planwoo bietet dafuer ein sauberes Monats-Grid, das sich direkt uebernehmen laesst.
- passt zur langfristigen Idee „Muster ueber Zeit sichtbar machen". Ohne Kalender ist das unmoeglich.

## 3. Quelle

- Klon: `Planwoo/index.html`
- Element im Klon: `.bottom-sheet.calendar-sheet` unter `screen-home`
- CSS-Klassen: `.calendar-grid-head`, `.calendar-grid`

## 4. AURUM-Anpassung

| Aspekt | Klon | AURUM |
|---|---|---|
| Akzent | Lila | Gold |
| aktiver Tag | Lila-Kreis | Gold-Kreis (wie im Wochenstreifen) |
| heutiger Tag | hervorgehoben | Gold-Ring, bei Auswahl zusaetzlich gefuellt |
| Tage mit Markern | farbige Punkte unter der Zahl | gleiche Punkte-Logik wie im Wochenstreifen (siehe `04_weekstrip_dots.md`) |
| Icon-Leiste | Expand-Icon | nur Close (X) oben links, Monatstitel Mitte, Monatswechsel-Pfeile unten |
| Buttons | „Auswaehlen" als Primary | optional: direkt beim Klick auf einen Tag schliesst Sheet und springt (kein separater Confirm) |

Ruhige Gestaltung, keine Bannertexte, keine motivationale Sprache.

## 5. Layout-Skizze

```
─────────────────────────────────
      (Backdrop)

   ┌───────────────────────────┐
   │         ▬                 │   Handle
   │                           │
   │   ✕      April 2026       │   Topbar
   │                           │
   │   Mo Di Mi Do Fr Sa So    │   Wochentage-Kopf
   │                           │
   │    ·  1  2  3  4  5  6    │
   │   7  8  9 10 11 12 13     │
   │  14 15 16 17 18 19 20     │
   │  21 22 23 24 25 26 27     │
   │  28 29 30  ·  ·  ·  ·     │
   │                           │
   │        ◀  Heute  ▶        │   Monatsnavigation, „Heute" springt zurueck
   └───────────────────────────┘
```

## 6. Platz im Code

- neues Sheet-Element unter `#s-main`, parallel zu `#marker-sheet`
- ID: `calendar-sheet`
- CSS-Klassen: `.calendar-sheet`, `.cal-grid-head`, `.cal-grid`, `.cal-cell`
- Aufruf ueber ein neues Icon in der Timeline-Topbar oder per Tippen auf das grosse Datum
- JS:
  - `openCalendarSheet(month, year)` — befuellt das Grid
  - `fetchMonthSummary(month, year)` — liefert pro Tag die Set-of-Typen (wie in `04`)
  - `selectCalendarDay(date)` — setzt `selectedDay`, laedt Timeline, schliesst Sheet

## 7. Verhalten und Interaktion

- Klick auf Tag schliesst das Sheet und springt direkt auf diesen Tag (kein Bestaetigungs-Button)
- Monatspfeile unten wechseln den sichtbaren Monat, laden Monats-Summary neu
- „Heute" zentriert auf den aktuellen Monat und selektiert den heutigen Tag
- Tage in fremden Monaten (vor dem 1., nach dem letzten) werden neutral grau oder weggelassen
- Swipe nach links oder rechts auf dem Grid wechselt den Monat (spaeter, nicht MVP)
- ESC oder Tippen auf Backdrop schliesst ohne Aktion

## 8. Offene Punkte

- Soll der Aufruf ueber ein Icon in der Topbar laufen oder ueber einen Tipp auf den Datumstext? Tipp auf Datum ist implizit und elegant, aber nicht offensichtlich.
- Soll es eine Markierung fuer den ausgewaehlten Tag geben, die sich vom heutigen Tag unterscheidet? Empfehlung: heutiger Tag ist Gold-Ring, ausgewaehlter Tag ist Gold-Fuellung.
- Swipe-Navigation zwischen Monaten jetzt oder spaeter? Empfehlung: spaeter.
- Sollen Marker-Dots im Kalender angezeigt werden oder reichen die Zahlen? Wenn ja, nur ein Dot pro Tag (Gold), nicht die Typen-Aufschluesselung.
