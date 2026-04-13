# Change Log

All notable changes to the "AL Copilot Skills Collection" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional AL skills for specific scenarios
- Skill selection UI during installation
- Configuration options for skill customization
- Skills management view in Activity Bar
- Community skill contributions

## [1.1.1] - 2026-04-13

### Added
- **bc-agent-instructions-debugger** — Audits and diagnoses BC agent instruction files to fix misbehaving agents

### Contributors
- **Javier Armesto** ([@javiarmesto](https://github.com/javiarmesto))

## [1.1.0] - 2026-04-11

### Added
- 4 new Business Central skills contributed by Javier Armesto:
  - **bc-al-bug-fix** — Diagnoses and fixes bugs in AL extensions with structured investigation workflow
  - **bc-al-code-reviewer** — Reviews AL code against AppSource, CodeCop, and community convention standards
  - **bc-al-project-context** — Maintains persistent project context via ADRs and session handoff documents
  - **bc-manifest-handoff-generator** — Generates handoff manifests for cross-framework consumption

### Contributors
- **Javier Armesto** ([@javiarmesto](https://github.com/javiarmesto))

## [0.1.0] - 2026-04-01

### Added
- Initial MVP release
- Command: `AL Copilot Skills Collection: Install Skills` — Install all skills to workspace `.github/skills` folder
- Command: `AL Copilot Skills Collection: Update Skills` — Update existing skills with latest versions
- Automatic creation of `.github/skills` and `.github/instructions` folder structure
- 14 bundled Business Central skills:
  - **bc-api-page-generator** — Generates AL API pages following OData/REST patterns
  - **bc-api-query-generator** — Generates AL API query objects
  - **bc-attachments-generator** — Generates attachment handling patterns
  - **bc-business-events-generator** — Generates Business Event definitions
  - **bc-cds-page-generator** — Generates CDS (Dataverse) integration pages
  - **bc-dataverse-entity-generator** — Generates Dataverse entity integration code and scripts
  - **bc-dataverse-mapping-generator** — Generates Dataverse entity mapping configurations
  - **bc-install-codeunit-generator** — Generates install codeunits for extensions
  - **bc-number-series-generator** — Generates number series setup patterns
  - **bc-setup-table-generator** — Generates setup table and page patterns
  - **bc-setup-wizard-generator** — Generates setup wizard (assisted setup) pages
  - **bc-telemetry-generator** — Generates custom telemetry instrumentation and KQL queries
  - **bc-test-codeunit-generator** — Generates test codeunits with Given/When/Then structure
  - **bc-upgrade-codeunit-generator** — Generates upgrade codeunits for extension versioning
- Bundled skill-creation instructions file
- Progress notifications during skill installation
- User-friendly error handling with actionable messages
- Welcome message on first activation
- Option to open skills folder after installation

### Technical
- TypeScript implementation with strict mode
- Cross-platform support (Windows, macOS, Linux)
- Extension activates only when AL language is detected (`onLanguage:al`)
- Zero external runtime dependencies
- Comprehensive test suite with VS Code Test Runner
- Modular architecture with clear separation of concerns
- File system service for robust folder operations
- Skill manager service for installation logic

### Documentation
- Comprehensive README with installation instructions
- MVP requirements document with detailed scope
- Marketplace publishing guide with step-by-step instructions
- Contributing guidelines (planned)
- MIT License

---

## Release Process

1. Update version in `package.json`
2. Update this CHANGELOG with release date and changes
3. Commit changes: `git commit -m "chore: release v0.1.0"`
4. Create tag: `git tag v0.1.0`
5. Push: `git push origin main --tags`
6. Build: `npm run compile`
7. Package: `vsce package`
8. Publish: `vsce publish`
9. Create GitHub release with VSIX attachment

---

**Note:** For detailed publishing instructions, see [MARKETPLACE-PUBLISHING.md](MARKETPLACE-PUBLISHING.md)
