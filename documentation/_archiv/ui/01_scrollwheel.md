# 01 | Scrollrad-Zeitpicker

## 1. Was es ist

Ein vertikaler Scrollrad-Picker fuer Zeitwerte. Der aktive Wert sitzt mittig in einer farbigen Pille, daruber und darunter stehen die benachbarten Werte abgedunkelt und verkleinert. Oben und unten zwei kleine Chevron-Pfeile als Orientierungshilfe.

## 2. Warum uebernehmen

- `input[type=time]` in AURUM v0.08 fuehlt sich technisch und fremd an
- der Scrollrad-Picker ist haptisch ruhiger und passt zur reduzierten, organischen Formensprache
- er zwingt zu einer klaren Auswahl, ohne Menue
- eine Eingabe pro Screen bleibt erhalten

## 3. Quelle

- Klon: `me+/index.html` (identisch in `Struktured/`)
- Screen-IDs im Klon: `screen-wake`, `screen-sleep`
- CSS-Klassen: `.wheel-scene`, `.wheel-values`, `.wheel-pill`

## 4. AURUM-Anpassung

| Aspekt | Klon | AURUM |
|---|---|---|
| Akzentfarbe der Pille | Coral `#f08c8a` | Gold `var(--gold)` |
| Hintergrund | Dark radialer Gradient | `var(--bg-screen)` (Pastell-Cream) |
| Wert-Typografie | Outfit, 600 | system-ui, 500, tabular-nums |
| Inaktive Werte | Grau-transparent | `var(--text-tertiary)` mit reduzierter Opacity |
| Icons in der Pille | Emoji (Sonne, Mond) | keine Icons, nur Zahl |

Sprachlich keine Aufforderung wie „Weiter", stattdessen stiller Save-Button oben rechts (wie schon in `s-audio` und `s-planned`).

## 5. Layout-Skizze

```
┌─────────────────────────────────┐
│  ‹          ●●─────        ···  │   Topbar (Back, Progress, Skip)
│                                 │
│  Wann soll der                  │   Heading (Frage)
│  Marker fällig sein?            │
│                                 │
│  ┌─────────────────────────┐    │
│  │   07:15  (grau, klein)  │    │   Wheel oben
│  │   07:30  (grau, klein)  │    │
│  │                         │    │
│  │  ┌──────────────────┐   │    │
│  │  │     07:45        │   │    │   Pille Gold, aktiv
│  │  └──────────────────┘   │    │
│  │                         │    │
│  │   08:00  (grau, klein)  │    │   Wheel unten
│  │   08:15  (grau, klein)  │    │
│  └─────────────────────────┘    │
│                                 │
│                                 │
│  ┌─────────────────────────┐    │
│  │       Weiter            │    │   CTA Capsule Gold
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

## 6. Platz im Code

- neue Komponente, wiederverwendbar
- HTML-Block ersetzt `input[type=time]` auf:
  - `s-audio`, Feld `audio-time`
  - `s-planned`, Feld `planned-time`
  - spaeter: im Bottom-Sheet fuer geplanten Marker (siehe `03_planned_bottomsheet.md`)
- CSS-Klassen neu: `.wheel`, `.wheel-values`, `.wheel-pill`
- JS: Touch- und Scroll-Handler, Snap auf 15-Minuten-Raster als Default (anpassbar)

## 7. Verhalten und Interaktion

- Tippen auf einen sichtbaren Wert oberhalb oder unterhalb rastet auf diesen Wert
- vertikales Wischen scrollt durch die Werte, Snap bei Loslassen
- Chevron-Pfeile oben und unten als stille Hilfe, optional
- Schrittweite: Default 15 Minuten; fuer Einstellungen-Slider (Druckaufbau-Dauer) eventuell 5 Sekunden-Raster
- Keyboard: Pfeil hoch und runter, Enter bestaetigt
- versteckter nativer `<input type="time">` bleibt fuer Fallback und Formular-Submit

## 8. Offene Punkte

- Soll es eine zweite Variante fuer Dauer (Minuten und Sekunden) geben, oder reicht ein Zeitwert-Picker?
- Wird das Scrollrad auch in den Einstellungen eingesetzt (Druckaufbau-Sekunden) oder bleibt dort der Slider?
- Darkmode-freie Version bestaetigt, keine Coral-Alternative.
