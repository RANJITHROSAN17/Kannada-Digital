# Security Policy

## Supported Versions

| Version | Supported |
| :--- | :---: |
| `0.1.x` (`main`) | ✅ |

## Reporting a Vulnerability

Please **do not** report security vulnerabilities (such as crafted input files causing code execution during static analysis) through public GitHub issues.

Instead, use [**GitHub Private Vulnerability Reporting**](https://github.com/RANJITHROSAN17/mcp-doctor/security/advisories/new) on this repository. Note that `mcp-doctor` analyzes Python source files strictly via `ast.parse` and never imports or executes scanned target code by default.
