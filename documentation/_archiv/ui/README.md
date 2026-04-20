# AURUM | UI-Spezifikationen

Dieser Ordner enthaelt konkrete Screen- und Komponenten-Spezifikationen fuer AURUM. Jede Datei beschreibt genau ein Muster oder einen Screen, was uebernommen wird, wie es fuer AURUM angepasst wird und wo es im Code landet.

## Index

| Nr. | Datei | Thema | Herkunft | Status |
|---|---|---|---|---|
| 01 | [01_scrollwheel.md](./01_scrollwheel.md) | Scrollrad-Zeitpicker | me+ | Spezifikation |
| 02 | [02_onboarding.md](./02_onboarding.md) | Onboarding-Wizard nach Signup | me+ (Form), AURUM (Inhalt) | Spezifikation |
| 03 | [03_planned_bottomsheet.md](./03_planned_bottomsheet.md) | Bottom-Sheet fuer geplanten Marker | Planwoo | Spezifikation |
| 04 | [04_weekstrip_dots.md](./04_weekstrip_dots.md) | Week-Strip mit Marker-Dichte | Planwoo (Muster), AURUM (Struktur) | Spezifikation |
| 05 | [05_calendar_sheet.md](./05_calendar_sheet.md) | Calendar-Bottom-Sheet zum Datum-Springen | Planwoo | Spezifikation |

## Konvention fuer neue Dateien

- Dateiname: `NN_thema.md` mit zweistelliger Nummer
- Struktur jeder Datei:
  1. Was es ist
  2. Warum uebernehmen
  3. Quelle (Klon plus Screen-ID)
  4. AURUM-Anpassung (Farbe, Sprache, Verhalten)
  5. Layout-Skizze
  6. Platz im Code (`s-xxx`, neue ID, Komponenten-Klasse)
  7. Verhalten und Interaktion
  8. Offene Punkte

## Bezug

- Konzept: [`../CONCEPT_v2.md`](../CONCEPT_v2.md)
- UI-Analyse und Uebersicht: [`../UI_v1.md`](../UI_v1.md)
