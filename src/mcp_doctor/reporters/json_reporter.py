"""Structured JSON output reporter."""

from __future__ import annotations

import json

from mcp_doctor import __version__
from mcp_doctor.models import ScanReport


def render_json(report: ScanReport) -> str:
    """Serialize a ScanReport as deterministic pretty-printed JSON."""
    s = report.summary
    payload = {
        "version": __version__,
        "summary": {
            "files_scanned": s.files_scanned,
            "tools_scanned": s.tools_scanned,
            "total_estimated_tokens": s.total_estimated_tokens,
            "errors": s.errors,
            "warnings": s.warnings,
            "infos": s.infos,
            "total_diagnostics": s.total_diagnostics,
            "score": s.score,
            "grade": s.grade,
        },
        "tools": [
            {
                "name": t.name,
                "source_file": t.source_file,
                "line": t.line,
                "estimated_tokens": t.estimated_tokens,
                "parameter_count": len(t.parameters),
            }
            for t in report.tools
        ],
        "diagnostics": [
            {
                "rule_id": d.rule_id,
                "rule_slug": d.rule_slug,
                "severity": d.severity.value,
                "category": d.category.value,
                "tool_name": d.tool_name,
                "source_file": d.source_file,
                "line": d.line,
                "message": d.message,
                "remediation": d.remediation,
            }
            for d in report.diagnostics
        ],
    }
    return json.dumps(payload, indent=2)
