#!/usr/bin/env python3
"""Generate FULL_MIGRATION_MATRIX.md from tracked files.

Normalizes filenames, escapes markdown pipes, and keeps UTF-8 output stable.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path


def classify(path: str) -> tuple[str, str, str]:
    if path.startswith("documentation/_archiv/") or path.startswith("build/"):
        return ("Archiv", "documentation/_archiv/", "archivieren")
    if path.startswith("documentation/"):
        return ("Dokumentation", path, "behalten")
    if path.startswith(".github/workflows/"):
        return ("CI/CD", path, "behalten")
    if path.startswith("AURUM/"):
        return ("Main-AURUM", path, "behalten/refactor")
    if path.startswith("CUPRUM/"):
        return ("CUPRUM-Template", path, "template")
    if path.startswith("supabase/"):
        return ("Shared-Infra", path, "behalten")
    if path.startswith("ARGENTUM/"):
        return ("Feature/Flatmode", f"AURUM/src/modules/argentum/{path.split('/', 1)[1]}", "migrieren")
    if path.startswith("systems/"):
        return ("System-Module", f"AURUM/src/modules/systems/{path.split('/', 1)[1]}", "migrieren")
    if path.startswith("src/"):
        return ("Legacy-widget", f"legacy/rasa-widget/{path.split('/', 1)[1]}", "evaluieren")
    if path.startswith("utils/"):
        return ("Utilities", f"AURUM/src/lib/{path.split('/', 1)[1]}", "migrieren")
    if path.endswith(".bat"):
        return ("Launcher", path, "behalten")
    if path.endswith((".md", ".txt", ".html", ".png", ".gif", ".svg", ".jpg", ".webmanifest")):
        return ("Assets/Doku", path, "behalten/einordnen")
    if path.endswith((".tsx", ".ts")):
        base = os.path.basename(path)
        if base in {"main.tsx", "App.tsx"}:
            return ("App-Entry", f"AURUM/src/{base}", "migrieren")
        if base in {"markers-api.ts", "notes-api.ts", "settings-api.ts", "aurum-client.ts", "types.ts"}:
            return ("Domain-Lib", f"AURUM/src/lib/{base}", "migrieren")
        return ("AURUM-Feature", f"AURUM/src/modules/aurum/{base}", "migrieren")
    if path.endswith((".js", ".css", ".scss")):
        return ("Tooling/Legacy", path, "evaluieren")
    return ("Sonstiges", path, "evaluieren")


def md_cell(value: str) -> str:
    return value.replace("|", "\\|")


def main() -> None:
    files = subprocess.check_output(["git", "ls-files"], text=True).splitlines()
    files.sort()

    lines = [
        "# FULL_MIGRATION_MATRIX",
        "",
        "Automatisch erzeugte Vollinventur aller versionierten Dateien mit Zielvorschlag.",
        "",
        "| Datei | Bereich | Ziel (Vorschlag) | Aktion |",
        "|---|---|---|---|",
    ]

    for path in files:
        area, target, action = classify(path)
        lines.append(
            f"| `{md_cell(path)}` | {md_cell(area)} | `{md_cell(target)}` | {md_cell(action)} |"
        )

    out = Path("migration/FULL_MIGRATION_MATRIX.md")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {out} with {len(files)} rows.")


if __name__ == "__main__":
    main()
