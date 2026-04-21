# Ordnerstruktur wiederhergestellt (Basis fuer Migration)

Stand: Diese Struktur wurde als **sauberes Zielgeruest** angelegt, damit wir die aktuell verstreuten Dateien kontrolliert migrieren koennen.

## Zielstruktur

```text
AURUM/
  src/
    components/
    state/
    lib/
    modules/aurum/
  public/
  supabase/

CUPRUM/
  src/
    components/
    state/
    lib/
    modules/aurum/
  public/
  supabase/

migration/
  unsorted-root/
```

## Vorgehen fuer den naechsten Schritt

1. Dateien aus dem Projekt-Root schrittweise in `CUPRUM/src/...` einordnen.
2. Live-relevante Teile danach gezielt nach `AURUM/src/...` uebernehmen.
3. Fehlende Dateien, die du noch hochlaedst, direkt in die Zielordner legen (nicht mehr ins Root).
4. Erst nach der Zuordnung Entrypoints (`main.tsx`, `App.tsx`, `vite.config.ts`) final verdrahten.

## Hinweis

Die Wiederherstellung in diesem Schritt ist **strukturell** (Ordner + Platzhalter), ohne harte Datei-Verschiebungen. So bleibt der aktuelle Stand nachvollziehbar und wir koennen die Migration iterativ machen.
