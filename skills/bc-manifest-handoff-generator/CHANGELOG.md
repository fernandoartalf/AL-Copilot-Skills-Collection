# Changelog

All notable changes to the `bc-manifest-handoff-generator` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-11

### Added

- Initial skill creation for generating handoff manifests at the end of the
  ALDC Conductor pipeline, enabling CIRCE and/or DELFOS consumption
- Two HITL interactive gates:
  - Target consumer selection (CIRCE / DELFOS / Both)
  - CIRCE BC environment connection details (environment, company, MCP config code)
- Manifest sections by target:
  - Header (always): extension metadata, repo coordinates, pipeline complexity
  - CIRCE — MCP Connection Context: lightweight connection coordinates and
    relevant MCP tool name map (static and dynamic mode patterns)
  - Published API Pages (DELFOS): OData v4 routes, field tables, filters
  - Published API Queries (DELFOS): query routes, columns, source tables
  - Data Structure (DELFOS): table fields with Dimension/Measure classification,
    relations, volume estimates
  - Star Schema Hints (DELFOS): suggested fact/dimension tables, relationships,
    known gaps, bc-data-source-mapping compatibility flag
  - Footer (always): consuming instructions for CIRCE and DELFOS workspaces,
    Skills Evidencing block
- Seven agent behaviour rules enforcing: no hallucinated endpoints, verified
  repo paths, lightweight CIRCE sections, `(review)` markers for uncertain
  mappings, mandatory Skills Evidencing block
- File naming convention: `{extension-name}-manifest.md`
- `references/manifest-structure.md`: complete section specifications with
  field tables, Dimension/Measure classification rules, and MCP tool naming
  patterns (static vs dynamic mode)
