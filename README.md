# AL Copilot Skills Collection

> Install a collection of purpose-built GitHub Copilot skills for Business Central AL development — with a single command.

[![Version](https://img.shields.io/badge/version-1.1.1-blue)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/fernandoartalf/AL-Copilot-Skills-Collection)](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
[![GitHub Stars](https://img.shields.io/github/stars/fernandoartalf/AL-Copilot-Skills-Collection)](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/stargazers)

---

## Quick Start

1. **Install** the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=FernandoArtigasAlfonso.al-copilot-skills-collection).
2. **Open** any AL project in VS Code.
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and run **"AL Copilot Skills Collection: Install Skills"**.
4. Skills are deployed to `.github/skills/` and instructions to `.github/instructions/` in your workspace.
5. **Start using Copilot** — skills are automatically picked up when the task matches.

---

## Features

### One-Command Skill Installation

Open the Command Palette (`Ctrl+Shift+P`) and run:

- **AL Copilot Skills Collection: Install Skills** — Installs all bundled skills and instructions to your workspace.
- **AL Copilot Skills Collection: Update Skills** — Updates existing skills to the latest version (with confirmation prompt).

The extension automatically:
- Creates the `.github/skills/` and `.github/instructions/` folder structure
- Copies all skill packages with their references and examples
- Shows progress notifications during installation
- Reports exactly how many skills and instruction files were deployed

### Bundled Skills

Each skill is a self-contained package of instructions, references, and templates that turns GitHub Copilot into a **specialized AL development assistant**.

| Skill | What It Does |
|-------|-------------|
| `bc-agent-instructions-debugger` | Audits and diagnoses BC agent instruction files to fix misbehaving agents |
| `bc-al-bug-fix` | Diagnoses and fixes bugs in AL extensions with structured investigation workflow |
| `bc-al-code-reviewer` | Reviews AL code against AppSource, CodeCop, and community convention standards |
| `bc-al-project-context` | Maintains persistent project context via ADRs and session handoff documents |
| `bc-api-page-generator` | Generates AL API pages following OData/REST patterns |
| `bc-api-query-generator` | Generates AL API query objects |
| `bc-attachments-generator` | Generates attachment handling patterns |
| `bc-business-events-generator` | Generates Business Event definitions for Power Automate |
| `bc-cds-page-generator` | Generates CDS (Dataverse) integration pages |
| `bc-dataverse-entity-generator` | Generates Dataverse entity integration code and scripts |
| `bc-dataverse-mapping-generator` | Generates Dataverse entity mapping configurations |
| `bc-install-codeunit-generator` | Generates install codeunits for extensions |
| `bc-manifest-handoff-generator` | Generates handoff manifests for cross-framework consumption |
| `bc-number-series-generator` | Generates number series setup patterns |
| `bc-setup-table-generator` | Generates setup table and page patterns |
| `bc-setup-wizard-generator` | Generates setup wizard (assisted setup) pages |
| `bc-telemetry-generator` | Generates custom telemetry instrumentation and KQL queries |
| `bc-test-codeunit-generator` | Generates test codeunits with Given/When/Then structure |
| `bc-upgrade-codeunit-generator` | Generates upgrade codeunits for extension versioning |

### Agent-Agnostic Skills

Skills follow the open [Agent Skills](https://agentskills.io/) standard — a portable format adopted by multiple agent products (GitHub Copilot, Claude Code, Cursor, Roo Code, and others). The extension deploys them to `.github/skills/` by default, but you can copy them to your agent's preferred location.

---

## Requirements

- **Visual Studio Code** 1.85.0 or higher
- **AL Language Extension** for Business Central development
- **GitHub Copilot** (or any agent supporting the [Agent Skills](https://agentskills.io/) standard)

---

## How It Works

When you run **"AL Copilot Skills Collection: Install Skills"**, the extension:

1. Detects your workspace root folder.
2. Creates `.github/skills/` and `.github/instructions/` if they don't exist.
3. Copies all bundled skill packages (SKILL.md, references, examples) into your workspace.
4. GitHub Copilot automatically discovers and loads skills when you ask it to perform a matching task.

Each skill folder follows this structure:

```text
.github/skills/
└── bc-api-page-generator/
    ├── SKILL.md              ← Main instructions (loaded by the agent)
    ├── AUTHORS.md            ← Author and co-author information
    ├── CHANGELOG.md          ← Version history
    └── references/           ← Supporting files, examples, templates
```

---

## Extension Settings

This extension does not add any VS Code settings. It activates automatically when an AL file is detected in the workspace.

---

## Contributing

We welcome contributions from the Business Central community. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

**Quick summary:**

1. Pick a month in the [release plan](releaseplan/) and add your skill proposal.
2. Open a Pull Request for approval.
3. Once approved, develop the skill following the [skill creation guidelines](instructions/skills-creation.instructions.md).
4. Submit the completed skill via Pull Request.

---

## Support

- Report issues: [GitHub Issues](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
- Ask questions: [GitHub Discussions](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions)
- Security concerns: See [SECURITY.md](SECURITY.md)

---

## License

MIT — See [LICENSE](LICENSE) for details.

---

## Author

**Fernando Artigas Alfonso**
[GitHub](https://github.com/fernandoartalf) · [LinkedIn](https://www.linkedin.com/in/fernando-artigas-alfonso-4ab62510b)
