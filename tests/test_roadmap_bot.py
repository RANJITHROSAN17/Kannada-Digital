"""Unit tests for the autonomous GitHub Roadmap & Issue Curator Bot."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT_PATH = ROOT / ".github" / "scripts" / "sync_roadmap_issues.py"

spec = importlib.util.spec_from_file_location("sync_roadmap_issues", SCRIPT_PATH)
assert spec is not None and spec.loader is not None
bot_mod = importlib.util.module_from_spec(spec)
sys.modules["sync_roadmap_issues"] = bot_mod
spec.loader.exec_module(bot_mod)


def test_roadmap_json_is_valid_and_unique() -> None:
    roadmap = json.loads((ROOT / ".github" / "roadmap.json").read_text(encoding="utf-8"))
    ids = [item["id"] for item in roadmap["items"]]
    assert len(ids) == len(set(ids))
    assert len(ids) >= 12
    label_names = {lbl["name"] for lbl in roadmap["labels"]}
    for item in roadmap["items"]:
        assert set(item["labels"]).issubset(label_names)
        rendered = bot_mod.render_issue_body(item)
        assert f"<!-- roadmap-id: {item['id']} -->" in rendered


def test_queue_replenishment_deduplicates_open_and_closed_issues() -> None:
    roadmap = {
        "max_open_roadmap_issues": 2,
        "items": [
            {"id": "RM-001", "title": "first", "summary": "s", "motivation": "m"},
            {"id": "RM-002", "title": "second", "summary": "s", "motivation": "m"},
            {"id": "RM-003", "title": "third", "summary": "s", "motivation": "m"},
        ],
    }
    existing = [
        {"state": "closed", "body": "<!-- roadmap-id: RM-001 -->\ndone"},
        {"state": "open", "body": "<!-- roadmap-id: RM-002 -->\nin progress"},
    ]
    queued = bot_mod.select_items_to_open(roadmap, existing)
    assert [i["id"] for i in queued] == ["RM-003"]
