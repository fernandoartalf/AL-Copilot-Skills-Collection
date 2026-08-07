# AL Copilot Skills Collection

> Install a collection of purpose-built AI coding assistant skills for Business Central AL development — with a single command.

[![Version](https://img.shields.io/badge/version-1.6.1-blue)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/fernandoartalf/AL-Copilot-Skills-Collection)](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/issues)
[![GitHub Stars](https://img.shields.io/github/stars/fernandoartalf/AL-Copilot-Skills-Collection)](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/stargazers)

[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-Compatible-000000?style=for-the-badge&logo=githubcopilot&logoColor=white)](https://github.com/features/copilot)
[![Claude](https://img.shields.io/badge/Claude-Compatible-D97757?style=for-the-badge&logo=claude&logoColor=white)](https://claude.ai/)
---

## Quick Start

1. **Install** the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=FernandoArtigasAlfonso.al-copilot-skills-collection).
2. **Open** any AL project in VS Code.
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
4. Run **"AL Copilot Skills Collection: Install Skills (GitHub Copilot)"** or **"AL Copilot Skills Collection: Install Skills (Claude)"**.
5. Skills and instructions are deployed to the selected assistant target in your workspace.
6. **Start using your assistant** — skills are available from the target-specific project folders.

---

## Features

### One-Command Skill Installation

Open the Command Palette (`Ctrl+Shift+P`) and run:

- **AL Copilot Skills Collection: Install Skills (GitHub Copilot)** — Installs all bundled skills and instructions to `.github/`.
- **AL Copilot Skills Collection: Update Skills (GitHub Copilot)** — Updates existing GitHub Copilot skills and instructions to the latest version.
- **AL Copilot Skills Collection: Install Skills (Claude)** — Installs all bundled skills and instructions to `.claude/`.
- **AL Copilot Skills Collection: Update Skills (Claude)** — Updates existing Claude skills and instructions to the latest version.

The extension automatically:
- Creates the selected target folder structure
- Copies all skill packages with their references and examples
- Copies bundled instruction files for the selected target
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
| `bc-approval-workflow-generator` | Generates complete approval workflow implementations for Business Central entities, including approval status enum, event subscribers, workflow templates, and page actions |
| `bc-attachments-generator` | Generates attachment handling patterns |
| `bc-business-events-generator` | Generates Business Event definitions for Power Automate |
| `bc-cds-page-generator` | Generates CDS (Dataverse) integration pages |
| `bc-dataverse-entity-generator` | Generates Dataverse entity integration code and scripts |
| `bc-dataverse-mapping-generator` | Generates Dataverse entity mapping configurations |
| `bc-field-propagation` | Propagates custom fields from source documents and journal lines to posted documents, archived documents, and ledger entries |
| `bc-install-codeunit-generator` | Generates install codeunits for extensions |
| `bc-isolated-storage-generator` | Generates secure isolated storage implementations for secrets (API keys, passwords, tokens) using `IsolatedStorage` with encryption support, DataScope selection, and masked setup pages |
| `bc-job-queue` | Guides AL developers through creating, parameterizing, executing, retrying, and diagnosing Business Central Job Queue workloads, with decision rules for Job Queue versus other async primitives, parameter-contract guidance, recovery patterns, and telemetry-oriented troubleshooting |
| `bc-manifest-handoff-generator` | Generates handoff manifests for cross-framework consumption |
| `bc-number-series-generator` | Generates number series setup patterns |
| `bc-pricing-refactor` | Guides AL developers through refactoring legacy sales pricing customizations from `Sales Price` and `Sales Line Discount` to the modern `Price List Header` and `Price List Line` architecture, including migration workflow, extensibility guidance, and validation scaffolds |
| `bc-report-selection-generator` | Extends the Business Central Report Selection framework with new custom Usage values and wires them into the standard printing workflow, covering enum extensions, setup pages, seeding codeunits, management codeunits, and page actions — never hardcoding Report IDs in business logic |
| `bc-reports` | Standards and guardrails for authoring Business Central reports in AL and RDLC |
| `bc-setup-table-generator` | Generates setup table and page patterns |
| `bc-setup-wizard-generator` | Generates setup wizard (assisted setup) pages |
| `bc-telemetry-generator` | Generates custom telemetry instrumentation and KQL queries |
| `bc-test-codeunit-generator` | Generates test codeunits with Given/When/Then structure |
| `bc-upgrade-codeunit-generator` | Generates upgrade codeunits for extension versioning |
| `documentation-bc-analysis-generator` | Generates Business Central feasibility analysis documents with SWOT analysis, numbered risk register, Optimistic/Expected/Pessimistic time and cost estimates, and GO/NO-GO recommendation as the analyst's artefact backing a Change Control Note |
| `documentation-bc-architecture-generator` | Generates Business Central architecture documents with numbered Architecture Decision Records (ADRs), logical component views, runtime flows, data architecture, and cross-cutting concerns as the long-lived companion to an approved technical spec |
| `documentation-bc-ccn-generator` | Generates Business Central Change Control Notes in any BCP-47 language, consolidating user stories, technical specs, architecture documents, and feasibility analyses into a single stakeholder-facing document with Mermaid diagram markers for Word conversion |
| `documentation-bc-md-to-docx-converter` | Converts Business Central documentation markdown files to professionally formatted Word (.docx) documents using Python and corporate Word templates, with Mermaid diagram rendering via the Mermaid CLI and multi-language placeholder substitution |
| `documentation-bc-phase-plan-generator` | Generates the complete set of per-phase implementation plan files from an approved Business Central technical spec, translating the object inventory and acceptance criteria into actionable checkbox task lists with dependencies and exit criteria |
| `documentation-bc-release-note-generator` | Generates Business Central release notes from an approved spec or CCN with release summary, scope of change, testing steps, known limitations, and approvals table, plus a sibling JSON file for Word template conversion |
| `documentation-bc-technical-spec-generator` | Generates Business Central technical specifications from approved user stories with a full AL object inventory, workspace-derived IDs, field definitions, phased task breakdown, and technical acceptance criteria mapped to user-story ACs |
| `documentation-bc-user-story-generator` | Generates Business Central user stories in the OpenSpec format through a structured interview, producing verifiable acceptance criteria, out-of-scope items, and Microsoft Learn–verified current-situation analysis |
| `onprem-remote-deploy` | Deploys AL `.app` files to remote BC OnPrem servers via WinRM, SSH, SMB, or RDP tsclient-pull when network access is restricted |
| `skill-contribution-assistant` | Guides contributors to design, polish, and submit high-quality skills to the collection |

### Agent-Agnostic Skills

Skills follow the open [Agent Skills](https://agentskills.io/) standard — a portable format adopted by multiple agent products (GitHub Copilot, Claude Code, Cursor, Roo Code, and others). The extension can deploy them to GitHub Copilot's `.github/skills/` structure or Claude Code's `.claude/skills/` structure.

---

## Requirements

- **Visual Studio Code** 1.85.0 or higher
- **AL Language Extension** for Business Central development
- **GitHub Copilot** or **Claude Code** (or any agent supporting the [Agent Skills](https://agentskills.io/) standard)

---

## How It Works

When you run a GitHub Copilot install command, the extension:

1. Detects your workspace root folder.
2. Creates `.github/skills/` and `.github/instructions/` if they don't exist.
3. Copies all bundled skill packages (SKILL.md, references, examples) into your workspace.
4. GitHub Copilot automatically discovers and loads skills when you ask it to perform a matching task.

GitHub Copilot skill folders follow this structure:

```text
.github/skills/
└── bc-api-page-generator/
    ├── SKILL.md              ← Main instructions (loaded by the agent)
    ├── AUTHORS.md            ← Author and co-author information
    ├── CHANGELOG.md          ← Version history
    └── references/           ← Supporting files, examples, templates
```

When you run a Claude install command, the extension:

1. Detects your workspace root folder.
2. Creates `.claude/skills/` and `.claude/instructions/` if they don't exist.
3. Copies all bundled skill packages into `.claude/skills/`.
4. Copies bundled instruction files into `.claude/instructions/`.
5. Leaves existing `.claude/CLAUDE.md`, `.claude/settings.json`, and `.claude/agents/` files untouched.

Claude skill folders follow this structure:

```text
.claude/skills/
└── bc-api-page-generator/
    ├── SKILL.md              ← Main skill instructions
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
