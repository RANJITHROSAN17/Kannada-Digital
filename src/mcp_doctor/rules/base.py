"""Pluggable rule registry for mcp-doctor."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from dataclasses import dataclass

from mcp_doctor.models import Category, Diagnostic, ScanConfig, Severity, ToolSpec

RuleCheckFn = Callable[[Sequence[ToolSpec], ScanConfig], list[Diagnostic]]


@dataclass(frozen=True)
class RuleDefinition:
    """Metadata and execution callback for a registered lint rule."""

    rule_id: str
    slug: str
    severity: Severity
    category: Category
    summary: str
    remediation: str
    check: RuleCheckFn


_REGISTRY: dict[str, RuleDefinition] = {}


def register_rule(
    *,
    rule_id: str,
    slug: str,
    severity: Severity,
    category: Category,
    summary: str,
    remediation: str,
) -> Callable[[RuleCheckFn], RuleCheckFn]:
    """Decorator registering a lint rule in the global rule table."""

    def _decorator(fn: RuleCheckFn) -> RuleCheckFn:
        _REGISTRY[rule_id] = RuleDefinition(
            rule_id=rule_id,
            slug=slug,
            severity=severity,
            category=category,
            summary=summary,
            remediation=remediation,
            check=fn,
        )
        return fn

    return _decorator


def get_all_rules() -> list[RuleDefinition]:
    """Return all registered rules ordered by rule ID."""
    return [_REGISTRY[k] for k in sorted(_REGISTRY)]
