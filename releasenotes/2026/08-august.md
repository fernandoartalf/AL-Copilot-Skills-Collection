# Release Notes — August 2026

> **Business Central 2026 Wave 1 — CU4**  
> Aligned with Business Central cumulative update **v28.4**

---

## Overview

This release includes **1 new skill** contributed by **1 author** for the **August 2026** cycle. All skills follow the [Agent Skills](https://agentskills.io/) standard and are compatible with GitHub Copilot, Claude Code, and other agent platforms.

---

## Release Summary

| Metric | Count |
|---|---|
| **Total Skills Released** | 1 |
| **Contributors** | 1 |
| **Target BC Version(s)** | v28.4 |

---

## Skills by Author

### Fernando Artigas Alfonso

**Delivered**: 1 skill

**Author Information**:
- **Full Name**: Fernando Artigas Alfonso
- **GitHub User**: fernandoartalf
- **GitHub Profile**: https://github.com/fernandoartalf
- **LinkedIn Profile**: https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b

#### Skills Contributed

##### 1. `bc-report-selection-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-report-selection-generator` |
| **Description** | Extends the Business Central Report Selection framework with new custom Usage values and wires them into the standard printing workflow. Creates enum extensions, a dedicated setup page, an initialisation/install/upgrade codeunit that seeds a default Report ID without overwriting customer configuration, a Report Selection Management codeunit, and page or page-extension actions that trigger the configured report. |
| **Target BC Version** | v28.4 |
| **Folder** | [`skills/bc-report-selection-generator/`](../../skills/bc-report-selection-generator/) |

**What it does**: AL teams extending BC with custom document types repeatedly need to integrate their reports into the standard Report Selection framework, but the pattern spans multiple objects and the correct runtime approach is non-obvious. This skill consolidates the full pattern, ensures Report IDs are never hardcoded, and covers the global and area-specific enum variants so developers can deliver a complete, upgrade-safe printing integration in a single agent invocation.

---

## All Skills in This Release

| # | Skill Name | Author | Target BC Version |
|---|---|---|---|
| 1 | `bc-report-selection-generator` | @fernandoartalf | v28.4 |

---

## How to Use These Skills

1. **Copy the skill folder** from [`skills/`](../../skills/) to your project's skill directory:
   - GitHub Copilot: `.github/skills/`
   - Claude Code: `.claude/skills/`
   - Other agents: Check your agent's documentation

2. **Invoke your agent** — the skill will be loaded automatically when the task matches the skill's domain.

See the [main README](../../README.md) for detailed installation instructions.

---

## Related Release Plan

This release corresponds to the [**August 2026** release plan](../../releaseplan/2026/08-august.md).

---

## Contributors

Special thanks to all contributors who helped make this release possible:

- **Fernando Artigas Alfonso** ([@fernandoartalf](https://github.com/fernandoartalf)) — 1 skill

---

## Feedback & Support

- Report issues: [GitHub Issues](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
- Ask questions: [GitHub Discussions](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions)
- Contribute: See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Release Date**: 2026-08-07  
**Status**: Released ✅
