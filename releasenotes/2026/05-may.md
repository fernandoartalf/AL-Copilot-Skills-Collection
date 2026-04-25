# Release Notes — May 2026

> **Business Central 2026 Wave 1 — CU1**  
> Aligned with Business Central cumulative update **v28.1**

---

## Overview

This release includes **2 new skills** contributed by **1 author** for the **May 2026** cycle. All skills follow the [Agent Skills](https://agentskills.io/) standard and are compatible with GitHub Copilot, Claude Code, and other agent platforms.

---

## Release Summary

| Metric | Count |
|---|---|
| **Total Skills Released** | 2 |
| **Contributors** | 1 |
| **Target BC Version(s)** | v28.1 |

---

## Skills by Author

### Alex Polo

**Delivered**: 2 skills

**Author Information**:
- **Full Name**: Alex Polo
- **GitHub User**: AlexP0lo
- **GitHub Profile**: https://github.com/AlexP0lo
- **LinkedIn Profile**: https://www.linkedin.com/in/álex-polo-garrido-49343b140

#### Skills Contributed

##### 1. `onprem-remote-deploy`

| Field | Value |
|---|---|
| **Skill Name** | `onprem-remote-deploy` |
| **Description** | Deploys AL `.app` files to remote Business Central OnPrem servers from VS Code using WinRM, SSH, SMB, or RDP tsclient-pull strategies with fallback guidance for restricted networks. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/onprem-remote-deploy/`](../../skills/onprem-remote-deploy/) |

**What it does**: Covers multiple deployment strategies ranked by network access level — from fully blocked (tsclient-pull via RDP) to fully open (WinRM/SSH) — and automates script creation and scheduling for unattended deploys on remote BC OnPrem servers.

---

##### 2. `skill-contribution-assistant`

| Field | Value |
|---|---|
| **Skill Name** | `skill-contribution-assistant` |
| **Description** | Guides contributors to design, polish, and submit high-quality skills for the AL Copilot Skills Collection, including onboarding questions, non-intrusive opportunity detection, quality gates, and PR-readiness checks. |
| **Target BC Version** | v28.1 |
| **Folder** | [`skills/skill-contribution-assistant/`](../../skills/skill-contribution-assistant/) |

**What it does**: Moves contributors from idea to PR-ready skill with consistent quality standards — defining focused and reusable skill scopes, applying repository conventions, and producing a complete PR package of skill files plus release plan entry.

---

## All Skills in This Release

| # | Skill Name | Author | Target BC Version |
|---|---|---|---|
| 1 | `onprem-remote-deploy` | @AlexP0lo | v28.1 |
| 2 | `skill-contribution-assistant` | @AlexP0lo | v28.1 |

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

This release corresponds to the [**May 2026** release plan](../../releaseplan/2026/05-may.md).

---

## Contributors

Special thanks to all contributors who helped make this release possible:

- **Alex Polo** ([@AlexP0lo](https://github.com/AlexP0lo)) — 2 skills

---

## Feedback & Support

- Report issues: [GitHub Issues](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
- Ask questions: [GitHub Discussions](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions)
- Contribute: See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Release Date**: 2026-05-01  
**Status**: Released ✅
