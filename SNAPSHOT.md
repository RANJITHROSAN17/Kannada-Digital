# About this snapshot

**Kannada-Digital** holds a complete, single-commit snapshot of the
[Vexar-MCP](https://github.com/RANJITHROSAN17/Vexar-MCP) project working tree —
all 84 tracked files: `src/`, `tests/`, `examples/`, `.github/` (workflows,
bots, issue templates, roadmap manifest and scripts), `docs/`, `assets/`,
`marketing/`, `rulesets/`, `action.yml`, `pyproject.toml`, `LICENSE` and the
project `README.md`.

This file (`SNAPSHOT.md`) is the only addition not present upstream. No upstream
git history was imported; the repo contains exactly one snapshot commit.

## What is in the snapshot

- The `mcp_doctor` package with **11 registered rules**, including the
  `MCP009` / `hardcoded-secret-in-tool` detector from
  [PR #37](https://github.com/RANJITHROSAN17/Vexar-MCP/pull/37), which was still
  open on the upstream `main` branch at snapshot time.
- Full test suite: **142 tests**, **92.48 % coverage** (gate: 85 %).
- All GitHub Actions workflows, bot scripts, governance rulesets, docs,
  marketing material and image assets.

## Run it locally

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"

ruff check .
ruff format --check .
mypy src
pytest --cov=mcp_doctor --cov-report=term-missing --cov-fail-under=85
python .github/scripts/sync_roadmap_issues.py --dry-run

python -m mcp_doctor scan examples/clean_server.py          # 100/100 (A+)
python -m mcp_doctor scan examples/vulnerable_server.py --format json --fail-on never
```

Verified in a clean virtualenv before publishing: `ruff`, `mypy`, roadmap
dry-run and `pytest` all pass, `examples/clean_server.py` scores **100/100 (A+)**
with 0 diagnostics.

## Notes

- `pyproject.toml` and `README.md` retain the upstream project name and URLs so
  the CLI, packaging and documentation behave exactly as they do upstream.
  Change them if this repository becomes a separately published project.
- The copied `.github/workflows/` files will run on pushes to this repository.
  Several bot workflows need repository secrets (e.g. `OPENAI_API_KEY`) and
  already fail on upstream pushes; disable them here if you don't want the noise.
- `src/mcp_doctor/rules/mcp009_protocol.py` is an unregistered scaffold that
  also claims ID `MCP009`; it is not imported by `rules/__init__.py`, so there is
  no runtime collision (roadmap item `RM-016` asks for a renumber).
- License: MIT (see `LICENSE`).
