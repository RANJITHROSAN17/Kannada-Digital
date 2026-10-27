"""TOML configuration loader supporting `.mcp-doctor.toml` and `pyproject.toml`."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from mcp_doctor.models import ScanConfig

if sys.version_info >= (3, 11):
    import tomllib
else:  # pragma: no cover
    import tomli as tomllib


def _read_toml(path: Path) -> dict[str, Any]:
    with path.open("rb") as fh:
        data = tomllib.load(fh)
    return data if isinstance(data, dict) else {}


def load_config(
    config_path: Path | None = None,
    start_dir: Path | None = None,
    *,
    max_tokens_override: int | None = None,
    extra_ignored_rules: set[str] | None = None,
) -> ScanConfig:
    """Resolve effective ScanConfig from TOML files and CLI overrides."""
    raw_cfg: dict[str, Any] = {}
    search_root = (start_dir or Path.cwd()).resolve()
    if search_root.is_file():
        search_root = search_root.parent

    if config_path is not None:
        raw_cfg = _read_toml(config_path)
        if "tool" in raw_cfg and isinstance(raw_cfg["tool"], dict):
            raw_cfg = raw_cfg["tool"].get("mcp-doctor", raw_cfg)
    else:
        dedicated = search_root / ".mcp-doctor.toml"
        pyproject = search_root / "pyproject.toml"
        if dedicated.is_file():
            raw_cfg = _read_toml(dedicated)
        elif pyproject.is_file():
            doc = _read_toml(pyproject)
            tool_tbl = doc.get("tool", {})
            if isinstance(tool_tbl, dict) and isinstance(tool_tbl.get("mcp-doctor"), dict):
                raw_cfg = tool_tbl["mcp-doctor"]

    max_tool_tokens = int(raw_cfg.get("max-tool-tokens", 250))
    if max_tokens_override is not None:
        max_tool_tokens = max_tokens_override

    max_server_tokens = int(raw_cfg.get("max-server-tokens", 4000))

    ignored = {str(r).strip().upper() for r in raw_cfg.get("ignore", []) if str(r).strip()}
    if extra_ignored_rules:
        ignored |= {r.strip().upper() for r in extra_ignored_rules if r.strip()}

    default_excludes = ScanConfig().exclude_globs
    custom_excludes = tuple(str(x) for x in raw_cfg.get("exclude", []) if str(x).strip())
    exclude_globs = custom_excludes if custom_excludes else default_excludes

    return ScanConfig(
        max_tool_tokens=max_tool_tokens,
        max_server_tokens=max_server_tokens,
        ignored_rules=frozenset(ignored),
        exclude_globs=exclude_globs,
    )
