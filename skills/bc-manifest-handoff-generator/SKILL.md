---
name: bc-manifest-handoff-generator
description: Generates a handoff manifest at the end of the ALDC pipeline so that CIRCE and/or DELFOS can consume the extension's published surface without sharing a workspace. Creates a single markdown manifest containing MCP connection context for CIRCE, published API pages and queries for DELFOS, data structure details, and star schema hints. Use when the conductor pipeline is complete, all tests pass, and a manifest is needed for handoff to CIRCE, DELFOS, or both.
---

# Extension Manifest Generator

> Generates a handoff manifest at the end of the ALDC pipeline, enabling CIRCE and/or DELFOS to consume the extension's published surface without sharing a workspace.

## Trigger

This skill activates **after the Conductor pipeline completes successfully** (all sub-agents finalized, all HITL gates passed). The agent MUST NOT generate the manifest until the extension compiles and all tests pass.

The skill reads from:

1. The `al-spec.md` (or equivalent spec file) for the completed extension
2. The actual `.al` source files in the project directory
3. The `app.json` for publisher, version, and extension metadata

The skill outputs a single `{extension-name}-manifest.md` file in the project root or a designated `output/` directory.

## Interactive Gate (HITL — Required)

Before generating the manifest, the agent MUST ask the user:

    The extension pipeline is complete. I can generate a handoff manifest
    for consumption by other frameworks in the ecosystem.

    Who will consume this manifest?

      (a) CIRCE — to build a Copilot Studio agent against this extension
      (b) DELFOS — to build a Power BI dashboard against this extension's data
      (c) Both CIRCE and DELFOS

    Which option? (a / b / c)

The agent waits for the user's response. No manifest is generated without explicit selection.

If the user selects (c) Both, the agent generates a single unified manifest containing all sections for both targets, clearly labeled.

## Additional Interactive Gate — CIRCE Connection Details

When the target includes CIRCE (options a or c), the agent MUST ask:

    To generate the CIRCE connection section, I need your BC environment details:

      BC Environment name: ___
      Company name: ___
      MCP Configuration Code (from Page 8351): ___

    If you haven't created the MCP configuration yet, I can generate the
    manifest with placeholder values that you'll fill in after configuring
    Page 8351.

## Manifest Structure

Read `references/manifest-structure.md` for the complete manifest section specifications including Header, CIRCE MCP Connection Context, Published API Pages, Published API Queries, Data Structure, Star Schema Hints, and Footer.

**Summary of sections by target:**

| Section | CIRCE | DELFOS |
|---------|:-----:|:------:|
| Header | ✓ | ✓ |
| CIRCE — MCP Connection Context | ✓ | — |
| Published API Pages | — | ✓ |
| Published API Queries | — | ✓ |
| Data Structure | — | ✓ |
| Star Schema Hints | — | ✓ |
| Footer | ✓ | ✓ |

## Agent Behavior Rules

1. Read the completed spec and compiled AL objects before generating any section. Do not hallucinate endpoints, fields, or actions that do not exist in the codebase.

2. Every field, every endpoint, every tool name in the manifest MUST correspond to an actual AL object in the extension. If unsure, flag it and ask the user.

3. Repo source paths must be real relative paths to actual `.al` files. Verify against the project structure.

4. CIRCE sections stay lightweight. The BC MCP server already exposes API structure as tools. The manifest only provides connection coordinates (environment, company, MCP configuration code) and a map of relevant tool names. Do not duplicate what the MCP already provides.

5. Star Schema Hints are suggestions, not prescriptions. DELFOS Architect will validate them. Mark any uncertain mapping with `(review)`.

6. Dimension/Measure candidate follows Power BI conventions: text, code, date, boolean → Dimension; decimal, integer (quantities/amounts) → Measure. When ambiguous, mark as `(review)`.

7. Skills Evidencing block is mandatory. List exactly which sections were generated and confirm the HITL gate was passed.

## Manifest File Naming Convention

Output filename: `{extension-name}-manifest.md`

Examples: `lead-tracking-manifest.md`, `vibeleads-manifest.md`, `frontier-incidents-manifest.md`

## Reference URLs

- [BC MCP Server Configuration](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/ai/configure-mcp-server)
- [Create Agent in Copilot Studio](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/ai/create-agent-in-copilot-studio)
- [BC API Page Documentation](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-api-pagetype)
- [Power BI Star Schema Guidance](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema)
- DELFOS bc-data-source-mapping skill: internal reference within the DELFOS framework
