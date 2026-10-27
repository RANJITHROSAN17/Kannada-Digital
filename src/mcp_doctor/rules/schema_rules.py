"""Input schema typing and bounds validation rules (MCP003, MCP004)."""

from __future__ import annotations

from collections.abc import Sequence

from mcp_doctor.models import Category, Diagnostic, ScanConfig, Severity, ToolSpec
from mcp_doctor.rules.base import register_rule

_WEAK_TYPES = frozenset({"Any", "typing.Any", "object", "dict", "list"})
_PAGINATION_OR_BATCH_NAMES = frozenset(
    {"limit", "page_size", "max_results", "top_k", "count", "items", "ids", "urls", "queries"}
)


@register_rule(
    rule_id="MCP003",
    slug="untyped-or-any-parameter",
    severity=Severity.WARNING,
    category=Category.SCHEMA,
    summary="Tool parameter lacks a concrete type or uses unconstrained `Any` / bare `dict`.",
    remediation="Annotate every tool parameter with concrete Python types or JSON Schema `type` constraints.",
)
def check_untyped_parameters(tools: Sequence[ToolSpec], config: ScanConfig) -> list[Diagnostic]:
    del config
    out: list[Diagnostic] = []
    for tool in tools:
        for param in tool.parameters:
            tname = (param.type_name or "").strip()
            if not tname or tname in _WEAK_TYPES:
                reason = (
                    "has no type annotation" if not tname else f"uses unconstrained type '{tname}'"
                )
                out.append(
                    Diagnostic(
                        rule_id="MCP003",
                        rule_slug="untyped-or-any-parameter",
                        severity=Severity.WARNING,
                        category=Category.SCHEMA,
                        message=f"Parameter '{param.name}' in tool '{tool.name}' {reason}.",
                        source_file=tool.source_file,
                        line=param.line or tool.line,
                        tool_name=tool.name,
                        remediation="Provide an explicit scalar, `Literal[...]`, `TypedDict`, or Pydantic `BaseModel` type.",
                    )
                )
    return out


@register_rule(
    rule_id="MCP004",
    slug="unbounded-collection-or-limit",
    severity=Severity.INFO,
    category=Category.SCHEMA,
    summary="Pagination/batch/list parameter has no upper bound, risking context-window output floods.",
    remediation="Add `Field(le=...)`, `maxItems`, `maximum`, or clamp the value with `min(limit, MAX_LIMIT)`.",
)
def check_unbounded_parameters(tools: Sequence[ToolSpec], config: ScanConfig) -> list[Diagnostic]:
    del config
    out: list[Diagnostic] = []
    for tool in tools:
        for param in tool.parameters:
            if param.has_bounds:
                continue
            tname = (param.type_name or "").lower()
            is_collection = tname.startswith(("list[", "sequence[")) or tname == "array"
            is_limit_name = param.name.lower() in _PAGINATION_OR_BATCH_NAMES
            if is_collection or is_limit_name:
                out.append(
                    Diagnostic(
                        rule_id="MCP004",
                        rule_slug="unbounded-collection-or-limit",
                        severity=Severity.INFO,
                        category=Category.SCHEMA,
                        message=(
                            f"Parameter '{param.name}' in tool '{tool.name}' has no upper bound "
                            "(`maximum` / `maxItems` / `Field(le=...)` / `min(...)`)."
                        ),
                        source_file=tool.source_file,
                        line=param.line or tool.line,
                        tool_name=tool.name,
                        remediation="Enforce a strict ceiling (e.g. `Field(default=50, le=200)` or `maxItems: 100`).",
                    )
                )
    return out
