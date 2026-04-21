# AURUM v0.12

* Version: v0.12
* Datum: 2026-04-21
* Basis: `AURUMv0.11.md`
* Status: Struktur-Release fuer Migration und GitHub-Betrieb

---

## Ziel von v0.12

v0.12 ist kein grosses Feature-Release, sondern ein **Ordnungs- und Betriebs-Release**:

1. Struktur nach v0.11 sauber herstellen.
2. GitHub-seitige Automatisierung vorbereiten.
3. Grundlage schaffen, damit fehlende Dateien kontrolliert nachgeladen und einsortiert werden koennen.

---

## Aenderungen in v0.12

### 1) Modulstruktur gemäss v0.11 hergestellt

Der AURUM-Modulpfad aus v0.11 wurde praktisch vorbereitet:

```text
AURUM/src/modules/aurum/
```

Die zentralen Moduldateien wurden in diesen Zielpfad uebernommen (AurumCore, Timeline, CreateMarker, MarkerDetail, NotesView, SettingsView, APIs, Types, Hooks usw.). Damit existiert der v0.11-Zielort jetzt physisch im Repo.

### 2) AURUM/CUPRUM-Scaffold fuer Migration

Als Migration-Basis wurde die Zielstruktur fuer beide Tracks angelegt:

```text
AURUM/src/{components,state,lib,modules/aurum}
AURUM/public
AURUM/supabase

CUPRUM/src/{components,state,lib,modules/aurum}
CUPRUM/public
CUPRUM/supabase

migration/unsorted-root
```

Damit koennen verstreute Root-Dateien schrittweise einsortiert werden, ohne dass etwas verloren geht.

### 3) GitHub-Workflows fuer Testbetrieb

* Geplante Testfenster via Cloudflare Named Tunnel (`aurum-scheduled-tunnel.yml`)
* Claude-Action via `@claude` Trigger (`claude.yml`)

Beide sind als v0.12-Betriebslayer gedacht, nicht als Ersatz fuer produktives Hosting.

### 4) Hostname/Start-Skript-Basis

`aurum.me.marcodemont.ch` ist in der lokalen Start-/Dev-Konfiguration vorbereitet, damit die Tunnel-Route stabil mit dem Zielhost funktioniert.

---

## Nicht Bestandteil von v0.12

* Kein finaler DB-Refactor `markers -> events`
* Keine vollstaendige Type-Umbenennung in allen Dateien
* Keine komplette Bereinigung aller Root-Dateien

Diese Punkte folgen im naechsten Migrationsschritt.

---

## Naechster Schritt (v0.12.x)

1. Datei-fuer-Datei-Migration aus Root -> `CUPRUM/src/...`
2. Danach gezielter Sync in `AURUM/src/...` fuer Live-Pfad
3. Fehlende Uploads direkt in Zielordner einspielen
