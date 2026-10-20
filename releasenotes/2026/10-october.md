# Release Notes — October 2026

> **Business Central 2026 Wave 2 — CU0**  
> Aligned with Business Central cumulative update **v29.0**

---

## Overview

This release includes **1 new skill** contributed by **1 author** for the **October 2026** cycle. All skills follow the [Agent Skills](https://agentskills.io/) standard and are compatible with GitHub Copilot, Claude Code, and other agent platforms.

---

## Release Summary

| Metric | Count |
|---|---|
| **Total Skills Released** | 1 |
| **Contributors** | 1 |
| **Target BC Version(s)** | v29.0 |

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

##### 1. `bc-table-dimensions-generator`

| Field | Value |
|---|---|
| **Skill Name** | `bc-table-dimensions-generator` |
| **Description** | Adds Business Central standard dimension support to custom tables and their pages following DimensionManagement patterns. Generates Shortcut Dimension 1/2 Code and Dimension Set ID fields, validation and Show Dimensions procedures, a card-page Dimensions group with visibility driven by General Ledger Setup, list-page dimension columns, and default-dimension inheritance from master data (standard merge or single source with fallback), including header-to-line cascading. |
| **Target BC Version** | v29.0 |
| **Folder** | [`skills/bc-table-dimensions-generator/`](../../skills/bc-table-dimensions-generator/) |

**What it does**: Custom documents and worksheets that need financial analysis must be dimension-aware, but the standard pattern spans table fields, validation procedures, page visibility rules, and default-dimension inheritance from several master data tables, with two distinct inheritance strategies. This skill consolidates the full pattern so developers can make a custom table dimension-aware consistently and in a single agent invocation.

---

## All Skills in This Release

| # | Skill Name | Author | Target BC Version |
|---|---|---|---|
| 1 | `bc-table-dimensions-generator` | @fernandoartalf | v29.0 |

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

This release corresponds to the [**October 2026** release plan](../../releaseplan/2026/10-october.md).

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

**Release Date**: 2026-10-20  
**Status**: Released ✅
