---
name: documentation-bc-architecture-generator
description: Create well-structured Business Central architecture documents in the `openspec/architecture/` folder as the long-lived companion to an existing approved technical spec, following the ARCH-001 template structure. Captures business and technical context, architectural drivers traced back to user-story ACs, numbered Architecture Decision Records (ADR-N) with Context/Decision/Consequence/Alternatives-rejected, a logical component view (ASCII or mermaid), key runtime flows, data architecture (entity-relationship + storage/ownership/key-derivation tables), cross-cutting concerns (security, reliability, performance, observability, localisation, RapidStart/portability, upgrade/migration), coexistence with legacy code, and known constraints/limitations. Writes the file as `ARCH-NNN-<kebab-title>.architecture.md` with frontmatter linking back to its spec, user story, and CCN. Use whenever the user asks to create, draft, generate, or write an architecture document, ARCH document, ADR, design rationale, or technical companion document for a spec, with trigger phrases such as "create architecture doc for SPEC-NNN", "draft ARCH document", "write ADRs for [feature]", "generate architecture companion to the spec", "document the why behind SPEC-NNN", or "create an ARCH file in openspec/architecture".
---

# Documentation: BC Architecture Generator

Generate a Business Central architecture document under `openspec/architecture/` as the long-lived companion to an existing technical spec in `openspec/specs/`. The spec describes **what** to build; this document explains **why** it is built that way.

## When to use

The user has an approved (or near-approved) technical spec and wants the architectural rationale captured in a dedicated document — design drivers, ADRs, component view, cross-cutting concerns, and known limitations — without modifying the spec itself.

## Default output location

`openspec/architecture/<filename>` — always. Do not ask the user where to save the file.

## Workflow

Follow these steps in order. Do not skip the spec validation or the driver-tracing step.

### Step 1 — Identify and validate the source spec

1. If the user did not specify a SPEC ID, list files in `openspec/specs/` and ask which one to base the architecture document on via `vscode_askQuestions`.
2. Read the chosen spec file and capture: `id` (SPEC-NNN), `title`, `user_story` (US-NNN), `module`, `prefix`, all object IDs, all technical Acceptance Criteria, and any Open Questions.
3. Read the linked user story (`openspec/userstories/` or `openspec/user-stories/`) and capture: ACs, Out-of-Scope items, Open Questions, business background.
4. If a CCN/change-request document exists for the feature, read it too — its effort envelope is a recognised architectural driver.
5. If `status` of the spec is not at least `draft` and reviewed, warn the user but allow them to proceed (architecture work often runs in parallel with spec refinement).

### Step 2 — Allocate the next ARCH ID

1. List files in `openspec/architecture/` matching `ARCH-*.architecture.md`.
2. Parse the highest existing numeric ID and increment by 1; format as `ARCH-NNN` (zero-padded to 3 digits).
3. If the folder does not exist or is empty, start at `ARCH-001`.
4. If the allocated filename would collide, re-increment until free. Never overwrite.

### Step 3 — Research the workspace and existing codebase

Mandatory before drafting the component view and coexistence section:

1. Re-read `app.json` for `application` version, `runtime`, `name`, `publisher`, `dependencies`, `idRanges`.
2. Inventory the AL objects under `src/` (and any legacy / vendor code) that the spec's new objects will **interact with, reuse, or coexist alongside**. Use the `Explore` subagent with thoroughness `medium` for large codebases.
3. For each reused legacy/standard codeunit, table, or page noted in the spec, confirm it actually exists at the stated object ID. Flag any mismatch as an Open Question.

### Step 4 — Verify standard BC behavior the architecture depends on

For every architectural decision that relies on a standard BC mechanism (RecordRef / FieldRef, FieldRef.SetFilter, EnqueueBackgroundTask, RapidStart configuration packages, Document Attachment, No. Series, Permission Sets, etc.):

1. Call `mcp_microsoftdocs_microsoft_docs_search` (and `mcp_microsoftdocs_microsoft_docs_fetch` when needed) to confirm the mechanism exists on the BC `application` version from `app.json`.
2. Cite the verified mechanism in the relevant ADR's *Decision* or *Consequence* bullet.
3. If documentation does not confirm a mechanism, do NOT assert it — record a constraint in §9 or escalate as an Open Question.

### Step 5 — Derive architectural drivers and ADRs

Before drafting:

1. **Drivers** — Read every US Acceptance Criterion and every SPEC §2.x design principle. Distill them into a numbered driver table (`D-1`, `D-2`, …). Each driver MUST cite its source (US-AC, SPEC §, CCN §). Drivers are *requirements imposed on the architecture*, not solutions.
2. **ADRs** — For each non-trivial design choice (entry-point type, data model shape, caching strategy, tie-breaking rule, error/silent-disable strategy, legacy-coexistence strategy, packaging strategy), draft a numbered ADR (`ADR-1`, `ADR-2`, …). Every ADR MUST have all four bullets: *Context*, *Decision*, *Consequence*, *Alternatives rejected*. Trivial choices (naming, file layout) do NOT need an ADR.
3. **Trace** — Every driver MUST be satisfied by at least one ADR; every ADR MUST cite at least one driver in its *Context*.

### Step 5b — Blind spot & corner case review

After deriving the initial driver / ADR set and **before** building the filename, enumerate the corner cases and architectural blind spots you detected in the spec, user story, and codebase research. Surface them to the user via `vscode_askQuestions`. For each issue, offer three dispositions:
- **Cover in an existing ADR** — extend its *Consequence* or *Alternatives rejected* bullet.
- **Create a new ADR** — added to the set before writing.
- **Record as constraint in §9** — noted as a known limitation with source and mitigation.

Minimum areas to check (raise at least one question per applicable area):

1. **Error / exception paths** — Does every runtime flow have an explicit failure branch? (e.g. "What happens if RecordRef.Open fails?" "What if EnqueueBackgroundTask quota is exhausted?")
2. **Concurrent modification** — Can two sessions edit the same record simultaneously? Is the intent optimistic locking (last-write-wins), pessimistic locking (explicit `LockTable`), or a version-stamp guard?
3. **Large-dataset / bulk-processing cliff** — Is there a realistic record count above which the design degrades? (e.g. RecordRef field iteration over thousands of rows, in-memory accumulation.) State the threshold or record it as an Open Question.
4. **Partial-permission scenarios** — What happens when the executing user has read but not write access to a table the code modifies? Is there a permission check before the write, or does the AL runtime handle it?
5. **Null / empty / missing reference** — For every `TableRelation` or cross-table lookup in the design, what is the behavior when the referenced record is missing or filtered out?
6. **Upgrade & migration safety** — If a new table or field is added, does the install/upgrade codeunit handle the case where the extension is re-installed on a tenant with existing data?
7. **Uncovered Open Questions** — List any Open Questions from the spec or user story that are still in status "Escalated" or "Functional question" and have NOT been resolved by any ADR or §9 constraint. Each one is a blind spot.
8. **Single-ADR drivers** — If a driver is covered by exactly one ADR, is that ADR's *Alternatives rejected* section thorough enough? Thin alternatives coverage is a blind spot in the reasoning.

Do not proceed to Step 6 until all raised blind spots have been assigned a disposition.

### Step 6 — Build the filename

Format: `ARCH-NNN-<kebab-title>.architecture.md`

- `<kebab-title>` is the lowercase, hyphen-separated title (diacritics stripped, non-alphanumerics removed, hyphens collapsed). Typically equal to the spec's kebab title.
- Validate against `^ARCH-\d{3}-[a-z0-9]+(-[a-z0-9]+)*\.architecture\.md$` before writing.

### Step 7 — Write the architecture document

Create the file at `openspec/architecture/<filename>` using the template in `references/architecture-template.md`. The file MUST contain, in this exact order:

1. YAML frontmatter:
   ```yaml
   ---
   id: ARCH-NNN
   title: Architecture — <Title>
   version: <Version>
   spec: SPEC-NNN
   user_story: US-NNN
   ccn: <CCN-NNN or empty>
   status: draft
   version: 1.0
   created_date: <YYYY-MM-DD>
   author: AL Architect
   prepared_by: <author name>
   related_docs:
     - openspec/specs/SPEC-NNN-<kebab-title>.spec.md
     - openspec/userstories/US-NNN-<kebab-title>.userstory.md
     # add CCN / analysis docs only if they exist
   ---
   ```
2. `# ARCH-NNN — <Title>` H1
3. A leading blockquote linking back to the spec, summarising the document's purpose, and stating the spec/architecture split ("spec = what; this doc = why").
4. `## 1. Context` — `### 1.1 Business context`, `### 1.2 Technical context`, `### 1.3 Scope of this architecture` (with explicit *In scope* and *Out of scope* bullets echoing the US).
5. `## 2. Architectural drivers` — single table: `# | Driver | Source | Implication`. Minimum 3 drivers.
6. `## 3. Architectural style and key decisions` — one short paragraph naming the architectural style, then one `### ADR-N — <short title>` subsection per decision with the four-bullet structure. Minimum 3 ADRs.
7. `## 4. Logical component view` — ASCII (or mermaid `flowchart`) diagram, followed by `### 4.1 Component responsibilities` table: `Component | Responsibility | Does NOT do`. Explicitly mark unchanged legacy components.
8. `## 5. Key runtime flows` — one `### 5.x <flow name>` subsection per important scenario. Use ASCII flow blocks with `│` `▼` `└─►` markers. Cover at minimum: happy path, cache/optimised path (if any), configuration-change path (if any), no-match / silent-disable path (if any).
9. `## 6. Data architecture` — `### 6.1 Entity-relationship overview` (ASCII or mermaid `erDiagram`), `### 6.2 Storage and ownership` table (`Object | Storage class | Owner | Lifecycle`), `### 6.3 Key derivation` (bullets explaining each PK choice).
10. `## 7. Cross-cutting concerns` — exactly these subsections, in this order: `### 7.1 Security`, `### 7.2 Reliability and error handling`, `### 7.3 Performance`, `### 7.4 Observability`, `### 7.5 Localisation and translations`, `### 7.6 RapidStart and portability`, `### 7.7 Upgrade and migration`. A subsection MAY say "Out of scope for this story" — but it MUST be present.
11. `## 8. Coexistence with legacy <area>` — only when legacy code exists in the area. Explicitly list which legacy objects remain unchanged and which (if any) are touched, with the nature of each touch (e.g. "single navigation action added; no field changes").
12. `## 9. Constraints and known limitations` — table: `# | Constraint / limitation | Source | Mitigation`. Use IDs `C-1`, `C-2`, … Every limitation MUST cite its source (ADR-N, driver D-N, or external constraint).

### Step 8 — Cross-link the spec (optional)

If, and only if, the source spec does not yet reference an architecture document, you MAY append the ARCH file to the spec's frontmatter `related_docs` list (if present) or add a one-line "Architecture: [ARCH-NNN](...)" pointer near §1. Do not change the spec's `status` or any other field.

### Step 9 — Confirm and report

After writing, report to the user:

- Path of the created architecture file (as a markdown link).
- The allocated `ARCH-NNN` id.
- A 1-line summary per ADR (`ADR-1 — <title>`, `ADR-2 — <title>`, …).
- Any drivers that were left unsatisfied (should be zero — flag loudly if not).
- Any Open Questions still escalated to the spec / Product Owner.
- The next recommended action (typically: review & approve the architecture, then proceed with the phase plans).

## Heading & full-content translation rules

Every artefact produced by this skill MUST follow these rules. They exist so
the downstream `documentation-bc-md-to-docx-converter` pipeline (AXZ Word
templates) renders correctly in every supported language and so headings
never leak design-time tokens.

1. **No manual H2 numeric prefix.** Write `## Business context`, never
   `## 2. Business context`. The Word template's multilevel-list style
   numbers the H2s automatically; a manual `N. ` prefix produces double
   numbering (e.g. `2. 2. Business context`) in the rendered docx.
2. **No source-ID suffix in any heading.** Drop trailing parentheticals
   such as `(from US-NNN)`, `(from US-<NNN>)`, `(procedente de SPEC-001)`,
   `(aus ARCH-NNN)`, etc. Trace links to source artefacts belong in the
   frontmatter or section body, not in the visible heading text.
3. **Translate H3 subsection labels.** Subsections keep their `N.M ` prefix
   shape (e.g. `### 3.1 …`) but the label text MUST be translated into the
   target language declared in the frontmatter `language` / `locale` field.
4. **Translate the ENTIRE table.** When a target language is set, every
   column header AND every cell value in every table MUST be in that
   language. No English fallbacks for cells, no mixed-language rows. Code
   identifiers (object names, field names, AL keywords) stay verbatim;
   surrounding prose translates.
5. **Regression guard.** Before saving, scan the artefact for these
   anti-patterns and fix them:
   - `^## \d+(?:\.\d+)*\.\s` (numeric-prefixed H2)
   - `\((?:from|procedente de|issu[e]? de|aus|da|de|uit)\s+[A-Z]+-\S+\)\s*$`
     on any heading line (source-ID suffix)
   - English column headers when the document is non-English.

> Origin: defects discovered while producing `CCN-001-driver-penalty-management`.
> Tracked in `docs/plans/PLAN-documentation-bc-heading-translation-fix.md` (PLAN-DOC-BC-003).

## Hard rules

- **status MUST always be `draft`** on initial creation. **version MUST be `1.0`**.
- **Default folder is `openspec/architecture/`** — never ask, never write elsewhere.
- **File extension MUST be `.architecture.md`**.
- **Never** create an architecture file without a referenced spec — the `spec:` frontmatter field is mandatory.
- **The `prepared_by` frontmatter field is mandatory.** If the author name is not evident from context (git user, previous artefacts, or explicit user input), ask the user before writing the file.
- **Never** invent architectural drivers — every D-N MUST cite a US-AC, SPEC §, or CCN §.
- **Never** invent ADR consequences — each *Consequence* bullet must be derivable from the chosen mechanism, not aspirational.
- **Never** assert standard BC behavior without Microsoft Learn verification (Step 4). If unverifiable, log it as a constraint in §9.
- **Never** overwrite an existing architecture file. On collision, re-allocate the ARCH ID.
- Every driver in §2 MUST be addressed by at least one ADR in §3.
- Every ADR MUST have *Context*, *Decision*, *Consequence*, *Alternatives rejected* — all four, never empty.
- Architecture document MUST NOT contain AL source code (no ```al blocks of real implementations). Component names, object IDs, signatures, and pseudocode flows only.
- All cross-cutting subsections (§7.1–§7.7) MUST be present, even if the content is "Out of scope for this story".
- **Never** skip Step 5b — the blind spot & corner case review is mandatory. Every identified corner case MUST have a recorded disposition (extend ADR / new ADR / §9 constraint) before the file is written.
- **Never** assert "not applicable" for a corner case category in Step 5b without tracing it back to a specific spec AC or Out-of-Scope item that explicitly rules it out.

## References

- `references/architecture-template.md` — full markdown skeleton with section headings, ADR shell, and placeholder tokens.
- `references/architecture-fields.json` — canonical, language-neutral static field/section keys used to drive the mandatory JSON output (below) and any downstream `md-to-docx-converter` template.

## Mandatory JSON output

On **every** invocation, in addition to writing the `.architecture.md` file the skill MUST also write a sibling JSON file:

- Path: same folder as the markdown, filename pattern `ARCH-NNN-<kebab-title>.architecture.json` (see `outputJson.filePattern` in `references/architecture-fields.json`).
- Encoding: UTF-8, pretty-printed (2-space indent).
- Shape:
  ```json
  {
    "artifactType": "ARCH",
    "id": "ARCH-NNN",
    "language": "<bcp47-primary-subtag>",
    "frontmatter": { "<yamlKey>": "<value>", ... },
    "sections":    { "<CanonicalKey>": "<markdown body of the section, translated>", ... }
  }
  ```
- **Keys** (both in `frontmatter` and in `sections`) MUST come **verbatim** from `references/architecture-fields.json` (`frontmatterFields[].key` and `sections[].key`). They are byte-stable across runs and languages so they can bind 1:1 to placeholder tokens in any Word template.
- **Values** carry the content in the chosen target language.
- Every H2 in the generated markdown MUST be immediately followed by `<!-- section-key: <CanonicalKey> -->` on its own line so the same map can be reconstructed by parsing the `.md` after the fact.
- Failure to emit the JSON file is a hard failure of the skill — abort and report rather than producing only the markdown.

## Downstream rendering dependency (mmdc)

The markdown produced by this skill is intended to be converted to `.docx` by the `documentation-bc-md-to-docx-converter` skill. Any Mermaid block in the output — whether emitted as an explicit `<!-- DIAGRAM: mermaid ... -->` marker or as a bare triple-backtick `` ```mermaid `` fence — is rendered to PNG by the Mermaid CLI (`mmdc`). When `mmdc` is unavailable the converter falls back to the diagram's plain-text content, so generated documents stay readable but lose their visual diagrams.

Install once per machine (Node.js required):

```pwsh
npm install -g @mermaid-js/mermaid-cli
mmdc --version
```

Inline `![alt](path)` images in the generated markdown are also embedded into the docx body by the converter (resolved relative to the markdown file, then to repo root). Missing image files are left as literal text and produce a warning.

## Pre-completion self-check — section-key anchors (MUST)

> **This step is mandatory before reporting the artefact as done. It enforces the language-neutral binding contract used by the documentation-bc-md-to-docx-converter.**

After writing the markdown file, the skill MUST re-read it and verify the anchor contract:

1. For every line beginning with `## ` in the body (not inside fenced code blocks, not in YAML frontmatter), the **next non-blank line** MUST be:
   `
   <!-- section-key: <CanonicalKey> -->
   `
2. `<CanonicalKey>` MUST be one of the `sections[].key` values declared in the matching `references/*-fields.json` schema (PascalCase, English, byte-stable across languages).
3. If any H2 is missing its anchor, or its anchor uses a key not present in the schema, the skill MUST fix the file and re-save before returning control to the user.
4. The same canonical key MUST appear as a top-level key in the sibling `*.json` output emitted by this skill — NEVER a translated derivative.

Recommended automation: run python .github/skills/shared/scripts/sync-section-keys.py --dry-run against the just-written file; if it reports any missing/mismatched anchor, fix the file in place, then re-run without `--dry-run` to apply.

Failure of this self-check is a hard failure of the skill — do not deliver the artefact until every H2 carries a valid schema-backed anchor.