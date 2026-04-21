# Migration.md — AURUM/CUPRUM Neuordnung (Root -> saubere Struktur)

## 1) Zielbild

Wir migrieren von einem historisch gewachsenen Root-Mix in eine klare Doppelstruktur:

- `CUPRUM/` = Werkversion (aktiver Entwicklungszweig, zuerst stabilisieren)
- `AURUM/` = Live-Version (nur freigegebene Features aus CUPRUM uebernehmen)

Kernprinzip:
1. **Erst Struktur + Inventar**, dann Dateiverschiebung.
2. **CUPRUM first** (Build lauffaehig machen), danach AURUM spiegeln.
3. Altbestand nicht blind loeschen, sondern in **Migrationswellen** uebernehmen oder archivieren.

---

## 2) Ist-Zustand (kurz)

### Bereits vorhanden

- Root hat weiterhin die aktiven Build-Dateien:
  - `package.json`, `package-lock.json`, `vite.config.ts`
- Root enthaelt viele AURUM-nahe Komponenten:
  - `AurumCore.tsx`, `AurumWorkspace.tsx`, `Timeline.tsx`, `NotesView.tsx`, `SettingsView.tsx`, `CreateMarker.tsx`, usw.
- Parallel existieren viele System-Module:
  - `systems/AURA`, `systems/JOI`, `systems/LYNA`, `systems/shared`
- Supabase-Bestand ist vorhanden:
  - `supabase/migrations/*`, `supabase/schema.sql`, `supabase/functions/server/*`
- Zielordner wurden bereits als Geruest angelegt:
  - `AURUM/src/...`, `CUPRUM/src/...`, `migration/unsorted-root/`

### Auffaelligkeiten / Schulden

- Viele Dateien liegen noch im Root statt in `CUPRUM/src/...`.
- Doppelte/Versionierungsreste (`*-1.tsx`, `*-1.ts`) deuten auf Merge-Artefakte.
- Build ist derzeit inkonsistent (Webpack-Scripts, aber Vite-Konfiguration ebenfalls vorhanden).
- In `AURUM/` und Root liegen thematisch aehnliche Dateien doppelt vor.

---

## 3) Was fehlt fuer ein sauberes Konzept-Projekt

1. **Projektgrenzen klarziehen**
   - `CUPRUM/package.json` + `CUPRUM/vite.config.ts` + `CUPRUM/src/main.tsx`
   - `AURUM/package.json` + `AURUM/vite.config.ts` + `AURUM/src/main.tsx`

2. **Single Source of Truth**
   - Feature-Code nur an einem Ort pflegen (zuerst `CUPRUM/src/modules/aurum`).

3. **Modulierte Architektur**
   - `src/modules/aurum` (Timeline, Marker, Notes, Settings)
   - `src/lib` (supabase client, config, analytics, api-clients)
   - `src/state` (Context/Stores/Reducer)
   - `src/components` (shared UI)

4. **Klare Legacy-Zone**
   - Altbestand, der nicht sofort migriert wird, nach `migration/unsorted-root/` oder `documentation/_archiv` referenzieren.

---

## 4) Was wir vom alten Projekt sehr gut wiederverwenden koennen

### Direkt wiederverwendbar (hoher Wert)

- AURUM-UI-Bausteine aus Root/AURUM:
  - `Timeline`, `MarkerDetail`, `CreateMarker`, `NotesView`, `SettingsView`, `BottomNav`, `Sheet`
- Datenebene:
  - `markers-api.ts`, `notes-api.ts`, `settings-api.ts`, `aurum-client.ts`
- Supabase:
  - Migrations + Schema + Server-Funktionen in `supabase/`

### Mit Refactoring wiederverwendbar (mittlerer Wert)

- `systems/*` (AURA/JOI/LYNA) als optionale Module/Experimente
- `utils/*` und `utils/supabase/*` nach Namenskonzept konsolidieren

### Eher Legacy (niedriger Wert)

- `src/components/Widget/*` (rasa-webchat Altbestand), nur behalten wenn explizit benoetigt
- `build/` Artefakte nicht als Source behandeln
- Dateien mit `-1` Suffix zuerst vergleichen, dann entscheiden (merge/loeschen)

---

## 5) Konkreter Ablaufvorschlag (Migrationswellen)

## Welle A — Inventar + Mapping (1 Session)

- Root-Dateien in Mapping-Tabelle aufnehmen:
  - Quelle -> Ziel (`CUPRUM/src/...`) -> Status (`keep/refactor/archive`)
- `-1` Duplikate paarweise diffen und entscheiden.

## Welle B — CUPRUM bootfaehig machen (1-2 Sessions)

- `CUPRUM/package.json`, `CUPRUM/vite.config.ts`, `CUPRUM/index.html`, `CUPRUM/src/main.tsx`
- Danach Module schrittweise aus Root nach `CUPRUM/src/modules/aurum` verschieben.
- Imports nachziehen, Build gruen bekommen.

## Welle C — Daten- und API-Schicht stabilisieren

- `lib/supabase`, API-Clients, env-Handling vereinheitlichen.
- Supabase-Migrationsstand dokumentiert einfrieren.

## Welle D — AURUM spiegeln (Release-Track)

- Nur getestete CUPRUM-Features nach AURUM uebernehmen.
- AURUM bleibt schlanker/stabiler als Werkstatt.

## Welle E — Aufraeumen + Guardrails

- Lint/Typecheck/Test Baseline
- CI fuer Build + minimale Smoke-Tests
- Legacy-Dateien markieren oder entfernen

---

## 6) Erste Mapping-Empfehlung (Startpunkt)

- Root `App.tsx`, `main.tsx` -> `CUPRUM/src/`
- Root Feature-Views (`Timeline.tsx`, `NotesView.tsx`, `SettingsView.tsx`, ...) -> `CUPRUM/src/modules/aurum/`
- Root API-Dateien (`markers-api.ts`, `notes-api.ts`, `settings-api.ts`, `aurum-client.ts`) -> `CUPRUM/src/lib/`
- Root `types.ts` -> `CUPRUM/src/modules/aurum/types.ts` oder `CUPRUM/src/lib/types.ts`
- `supabase/*` bleibt zentral im Root (shared infra), bis bewusst entkoppelt wird

---

## 7) Definition of Done fuer die Migration (v1)

1. `CUPRUM` laeuft isoliert mit eigenem `package.json` + `vite.config.ts`.
2. Keine produktiven Feature-Dateien mehr lose im Root.
3. Keine ungeklaerten `-1` Duplikate.
4. `AURUM` uebernimmt nur freigegebene Features.
5. Dokumentation beschreibt finale Struktur + Startbefehle eindeutig.

---

## 8) Naechster konkreter Schritt

Im naechsten Schritt erstelle ich eine **Datei-fuer-Datei Migrationsmatrix** (CSV/Markdown) fuer alle relevanten Root-Dateien mit:

- Zielpfad
- Prioritaet
- Aufwand (S/M/L)
- Risiko
- Entscheidung: Keep / Refactor / Archive

