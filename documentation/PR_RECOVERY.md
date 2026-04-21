# PR Recovery (Stand 2026-04-21)

Diese Notiz wurde hinzugefuegt, um den "beschaedigten PR"-Zustand nachvollziehbar zu reparieren.

## Was wurde repariert?

1. Die Vollmatrix wird nicht mehr ad-hoc erzeugt, sondern ueber ein reproduzierbares Skript:
   - `migration/generate_full_matrix.py`
2. Die Datei `migration/FULL_MIGRATION_MATRIX.md` wurde neu aus diesem Skript generiert.

## Warum hilft das?

- Der PR-Inhalt ist nun reproduzierbar.
- Aenderungen an der Matrix koennen sauber nachvollzogen werden.
- Review-Kommentare koennen direkt gegen Skript-Logik gemappt werden.

## Rebuild-Befehl

```bash
python migration/generate_full_matrix.py
```
