# AL-Copilot-Skills-Collection

> Purpose-built AL Copilot Skills that help agents implement consistent Business Central patterns and development best practices.
>
> Boost agentic AL development with composable, community-driven skills.

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/fernandoartalf/AL-Copilot-Skills-Collection)](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
[![GitHub Stars](https://img.shields.io/github/stars/fernandoartalf/AL-Copilot-Skills-Collection)](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/stargazers)

---

## What Is This?

AL-Copilot-Skills-Collection is an open-source repository of **composable Copilot Skills** for Microsoft Dynamics 365 Business Central AL development. Each skill is a self-contained package of instructions, references, and templates that turns a general-purpose AI agent into a **specialized AL development assistant**.

Skills follow the open [Agent Skills](https://agentskills.io/) standard — a portable format adopted by multiple agent products (Claude Code, Cursor, Roo Code, GitHub Copilot, and others).

---

## Key Features

- **Composable skills** — Each skill focuses on a single AL pattern or concern and can be loaded independently or combined with others.
- **Community-driven** — Contributors propose new skills via monthly release plans, get them approved, and submit implementations through Pull Requests.
- **BC cumulative update alignment** — Release plans follow the Business Central wave and cumulative update cadence so skills can target specific platform versions.
- **Agent-agnostic** — Skills work with any agent that supports the Agent Skills standard.

---

## Available Skills

| Skill | Description |
|---|---|
| `bc-api-page-generator` | Generates AL API pages following OData/REST patterns |
| `bc-api-query-generator` | Generates AL API query objects |
| `bc-attachments-generator` | Generates attachment handling patterns |
| `bc-business-events-generator` | Generates Business Event definitions |
| `bc-cds-page-generator` | Generates CDS (Dataverse) integration pages |
| `bc-dataverse-entity-generator` | Generates Dataverse entity integration code and scripts |
| `bc-dataverse-mapping-generator` | Generates Dataverse entity mapping configurations |
| `bc-install-codeunit-generator` | Generates install codeunits for extensions |
| `bc-number-series-generator` | Generates number series setup patterns |
| `bc-setup-table-generator` | Generates setup table and page patterns |
| `bc-setup-wizard-generator` | Generates setup wizard (assisted setup) pages |
| `bc-telemetry-generator` | Generates custom telemetry instrumentation and KQL queries |
| `bc-test-codeunit-generator` | Generates test codeunits with Given/When/Then structure |
| `bc-upgrade-codeunit-generator` | Generates upgrade codeunits for extension versioning |

---

## Skill Structure

Each skill lives in its own folder under `skills/` and follows a consistent layout:

```text
skills/
└── {skill-name}/
    ├── SKILL.md              ← Main instructions (loaded by the agent)
    ├── AUTHORS.md            ← Author and co-author information
    ├── CHANGELOG.md          ← Version history
    └── references/           ← Supporting files, examples, templates
        ├── examples.md
        └── patterns.md
```

---

## Repository Structure

```text
AL-Copilot-Skills-Collection/
├── instructions/
│   └── skills-creation.instructions.md   ← Guidelines for creating skills
├── releaseplan/
│   ├── RELEASE-PLAN-GUIDE.md             ← How release plans work
│   ├── TEMPLATE.md                       ← Blank template for reference
│   ├── 2026/                             ← Monthly plans for 2026
│   │   ├── 04-april.md
│   │   └── ...
│   └── 2027/                             ← Monthly plans for 2027
│       ├── 01-january.md
│       └── ...
├── skills/                               ← All published skills
│   ├── bc-api-page-generator/
│   ├── bc-test-codeunit-generator/
│   └── ...
├── CONTRIBUTING.md                       ← Contribution guidelines
├── SECURITY.md                           ← Security policy
├── LICENSE                               ← MIT License
└── README.md                             ← This file
```

---

## Quick Start

1. **Browse available skills** in the [`skills/`](skills/) directory.
2. **Copy a skill folder** into your project's skill directory (e.g. `.github/skills/` for GitHub Copilot or `.claude/skills/` for Claude Code).
3. **Invoke your agent** — the skill will be loaded automatically when the task matches the skill's domain.

---

## Contributing

We welcome contributions from the Business Central community. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

**Quick summary:**

1. Pick a month in the [release plan](releaseplan/) and add your skill proposal.
2. Open a Pull Request for approval.
3. Once approved, develop the skill following the [skill creation guidelines](instructions/skills-creation.instructions.md).
4. Submit the completed skill via Pull Request.

---

## Release Plan

Skills are planned and tracked through monthly release plan files aligned with Business Central cumulative updates. See the [Release Plan Guide](releaseplan/RELEASE-PLAN-GUIDE.md) for details.

---

## Requirements

- **Visual Studio Code** 1.85.0 or higher
- **GitHub Copilot** or any agent supporting the [Agent Skills](https://agentskills.io/) standard
- **AL Language Extension** for Business Central development

---

## Author

**Fernando Artigas Alfonso**
[GitHub](https://github.com/fernandoartalf) · [LinkedIn](https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b)

---

## Support

- Report issues: [GitHub Issues](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
- Ask questions: [GitHub Discussions](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions)
- Security concerns: See [SECURITY.md](SECURITY.md)

---

## License

MIT — See [LICENSE](LICENSE) for details.

---

**Last Updated**: 2026-04-01
