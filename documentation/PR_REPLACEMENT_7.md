# PR Replacement fuer gestoppten PR #7

Der vorherige PR mit Titel:

`Add QuickCreate UI, repo migration scaffolding, and GitHub Actions for scheduled Cloudflare tunnel`

wurde gestoppt, weil er als beschaedigt eingestuft wurde.

Diese Datei markiert den Neustart mit reproduzierbarer Basis:

1. PR-Recovery dokumentiert (`documentation/PR_RECOVERY.md`)
2. Vollmatrix reproduzierbar per Skript:
   - `migration/generate_full_matrix.py`
   - `migration/FULL_MIGRATION_MATRIX.md`
3. Aktive Haupt-App eindeutig:
   - `AURUM/` = Main (ex-CUPRUM)
   - `CUPRUM/` = leeres Werkstatt-Template

## Ziel des Ersatz-PRs

- Gleiches fachliches Ziel wie PR #7, aber mit sauberer, nachvollziehbarer
  Historie und klarer Migrationsgrundlage fuer die naechsten Schritte.
