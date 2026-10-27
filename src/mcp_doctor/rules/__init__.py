"""Built-in rule registration and discovery."""

from mcp_doctor.rules import (  # noqa: F401
    contract_rules,
    schema_rules,
    security_rules,
    token_rules,
)
from mcp_doctor.rules.base import RuleDefinition, get_all_rules, register_rule

__all__ = ["RuleDefinition", "get_all_rules", "register_rule"]
