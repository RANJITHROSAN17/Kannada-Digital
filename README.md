# Kannada Digital

A self-contained source snapshot of the **`mcp_doctor`** engine from
[Vexar-MCP](https://github.com/RANJITHROSAN17/Vexar-MCP): the static analyzer,
security scanner, schema validator and token-budget auditor for Model Context
Protocol (MCP) servers and AI agent tools.

This repository contains the complete `src/` tree plus everything needed to run
the test suite locally. GitHub Actions bot workflows are intentionally **not**
included — only the two roadmap-bot data files required by `tests/test_roadmap_bot.py`.

> Snapshot includes the `MCP009` hardcoded-secret detector from
> [PR #37](https://github.com/RANJITHROSAN17/Vexar-MCP/pull/37) (open at the time
> of this snapshot), so `src/` is slightly ahead of Vexar-MCP `main`.

## Layout

| Path | Contents |
|---|---|
| `src/mcp_doctor/` | Full package: CLI, engine, AST/TS/JSON loaders, 11 registered rules, reporters, token estimator |
| `tests/` | 142 unit/integration tests, including TS fixtures |
| `examples/` | `clean_server.py` (100/100 A+), `vulnerable_server.py`, `tools_manifest.json` |
| `pyproject.toml` | Editable-install metadata, dev extras, ruff/mypy/pytest configuration |
| `.github/scripts/sync_roadmap_issues.py`, `.github/roadmap.json` | Required by `tests/test_roadmap_bot.py`; no workflows shipped |
| `LICENSE` | MIT (Ranjith Rosan) |

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
python -m pip install -e ".[dev]"
python -m mcp_doctor scan examples/clean_server.py
python -m mcp_doctor scan examples/vulnerable_server.py --format json --fail-on never
```

## Quality gate

```bash
ruff check .
ruff format --check .
mypy src
pytest --cov=mcp_doctor --cov-report=term-missing --cov-fail-under=85
python .github/scripts/sync_roadmap_issues.py --dry-run
```

Verified on the initial commit: **142 passed**, **92.48 % coverage**,
`ruff`/`mypy` clean, and `examples/clean_server.py` scoring **100/100 (A+)**.

## Registered rules

`MCP001`–`MCP010` and `MCP013` (11 rules). `MCP009`
(`hardcoded-secret-in-tool`, `ERROR`, `SECURITY`) flags hardcoded
`ghp_` / `github_pat_` / `sk-` / `AKIA` / `xoxb-` / `AIza` / `glpat-` keys,
bearer credentials and sensitive string assignments inside `@mcp.tool()`
handlers, while ignoring placeholders and environment-variable lookups.
Diagnostics store only pattern metadata — never the raw secret value.

## Notes

- `pyproject.toml` retains the upstream package name `Vexar-MCP` and its
  `[project.urls]` so the editable install and tooling behave exactly as upstream.
  Update those fields if you intend to publish this repository under a new name.
- `src/mcp_doctor/rules/mcp009_protocol.py` is an unregistered scaffold that also
  claims ID `MCP009`; it is not imported by `rules/__init__.py`, so there is no
  runtime collision (roadmap item `RM-016` asks for it to be renumbered).
