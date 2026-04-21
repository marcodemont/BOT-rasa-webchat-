# AURUM - Timeline & Notizen System

> Status 2026-04: **AURUM ist die Haupt-App (ex-CUPRUM-Stand)**.
> Der Ordner `CUPRUM/` ist derzeit als leeres Werkstatt-Template reserviert.

## Konzept

AURUM integriert **zwei zentrale Ebenen**, die über **Tags** miteinander verbunden sind:

### 1. Timeline & Marker (Zeitliche Struktur)
- **Marker** sind Zeitpunkte mit Bedeutung (keine Tasks!)
- Strukturieren den Tag visuell entlang eines Zeitstrahls
- Können geplant oder spontan gesetzt werden
- Eigenschaften:
  - Titel, Zeit, Dauer (optional)
  - Farbe (6 Pastelltöne)
  - Verknüpfte Notizen (noteIds)
  - Tags für Organisation

### 2. Sheets & Layers (Inhaltliche Tiefe)
- **Sheets** = Digitale Blätter für Notizen, Zeichnungen, Ideen
- **Layers** = Mehrere Ebenen pro Sheet (nichts geht verloren)
- **Niedrige Eintrittshürde**: Spontane Erfassung ohne sofortige Strukturierung
- Layer-Typen:
  - Text (Notizen, Gedanken)
  - Drawing (Freihand-Zeichnungen)
  - Sketch (Strukturierte Skizzen)

### 3. Tags (Verbindende Ebene)
- Strukturierende Metadaten
- Ermöglichen flexible, mehrdimensionale Organisation
- Verknüpfen Marker und Notizen
- Beispiele: "Tagebuch", "Einkaufsliste", "Idee", "Projekt"

## Workflow

### Erfassung (Spontan)
1. Marker setzen → Zeitpunkt markieren
2. Sheet erstellen → Gedanken festhalten
3. Keine sofortige Strukturierung nötig!

### Strukturierung (Nachträglich)
1. Tags hinzufügen
2. Notizen mit Markers verknüpfen
3. In Timeline-Kontext einbetten

## Philosophie

> "Marker bilden die orientierende Ebene, Notizen liefern die inhaltliche Tiefe, Tags fungieren als verbindendes Element."

### AURUM-Prinzipien:
- ✅ **Permanenz**: Nichts ist gelöst (Archive)
- ✅ **Layering**: Ideen stapeln sich über Zeit
- ✅ **History**: Vollständige Versionierung
- ✅ **Reflexion**: Retrospektive Analyse möglich

## Design

### Pastelliges Design mit goldenen Akzenten
- **Grundflächen**: Hell, leicht gebrochen (nicht reines Weiß)
- **Pastelltöne**: Zustandsmarkierung, Orientierung
- **Goldene Akzente**: Systemische Hervorhebung (AURUM = Gold)
- **Formensprache**: Kreise, Ovals, abgerundete Rechtecke

### Farbpalette Marker:
- 🟠 Koralle (#FF6B6B)
- 🟡 Gold (#FFD93D)
- 🟢 Grün (#6BCB77)
- 🔵 Blau (#4D96FF)
- 🟣 Lila (#9D84B7)
- 🩷 Rosa (#FFB6C1)

## Features

### Timeline
- 24-Stunden Visualisierung
- Aktuelle Zeit-Indikator (animiert)
- Marker-Interaktion
- Filter nach Datum

### Sheets
- Layer-Stacking mit Transparenz
- Fold Mode (komprimieren)
- Letter Mode (exportieren)
- Version History pro Layer

### Archive
- Strukturierter Raum für Archiviertes
- Restore-Funktion
- "Nichts ist verloren"

## Demo-Modus

Das System funktioniert **vollständig ohne Backend** via localStorage:
- Marker werden lokal gespeichert
- Sheets persistieren im Browser
- Echtzeit-Updates ohne API-Calls
- Perfekt für Prototyping & Testing

## Integration mit Diplomarbeit

Dieses System implementiert das Konzept aus der Diplomarbeit:

**"Das System reduziert sich bewusst auf zwei Kernfunktionen, die strukturell miteinander verknüpft sind, wodurch ein einfaches Interface mit funktionaler Tiefe entsteht."**

- Zeitliche Struktur durch Marker ✅
- Inhaltliche Erfassung durch Notizen ✅
- Verbindung durch Tags ✅
- Niedrige Eintrittshürde ✅
- Nachträgliche Strukturierung ✅

## Technische Details

### Komponenten
- `AurumCore.tsx` - Hauptkomponente mit State-Management
- `Timeline.tsx` - Marker-Visualisierung
- `CreateMarker.tsx` - 4-Step Wizard
- `Sheet.tsx` - Layer-basiertes Notizen-System
- `SheetList.tsx` - Übersicht aller Sheets
- `Archive.tsx` - Archivierte Sheets

### State Management
- Zentraler Marker-State in `AurumCore`
- LocalStorage-Persistence
- Token-Validierung mit Fallback

### Next Steps
- [ ] Tag-System UI implementieren
- [ ] Marker-Sheet Verknüpfung UI
- [ ] Quick-Capture für Notizen in Timeline
- [ ] Export-Funktionen erweitern
