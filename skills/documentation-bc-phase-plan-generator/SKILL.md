---
name: documentation-bc-phase-plan-generator
description: Create the full set of per-phase implementation plan files in the `openspec/plans/` folder from an approved Business Central technical spec, following the PLAN-PHASE template structure. For each phase listed in the spec's §8 Phase Overview, generates one `SPEC-NNN-phase-<N>-<phase-name>.plan.md` file with frontmatter (id, title, version, spec, user_story, ccn, phase, status, estimated_hours, branch, depends_on, related_docs, assignee, created_date, approved_date), and the mandatory body sections (References, Goal, Branch, Tasks as checkbox list each citing the AC it satisfies, Exit criteria, Out of scope for this phase, Notes for the AL Developer, Dependencies linking prerequisite phases and downstream consumers, Testing notes). All phases are generated in a single invocation so the developer has the full execution backlog after spec approval. Use whenever the user asks to create, draft, generate, or write phase plans, implementation plans, phase breakdown, plan files, task plans, or a development backlog for a spec, with trigger phrases such as "create phase plans for SPEC-NNN", "draft plan files", "generate the plans folder for the spec", "break SPEC-NNN into phase plans", "document the phases of [spec]", or "create plan files in openspec/plans".
---

# Documentation: BC Phase Plan Generator

Generate the complete set of per-phase implementation plan files under `openspec/plans/` from an approved (or near-approved) Business Central technical spec. Each phase listed in the spec's §8 Phase Overview becomes one `.plan.md` file. The plan files are the AL Developer's working backlog — they translate the spec's AL object inventory and ACs into a checkbox task list bounded by clear exit criteria.

## When to use

The user has an **approved** technical spec under `openspec/specs/` (`status: approved` in the frontmatter) and wants the per-phase implementation plans materialised as separate files, including phase-to-phase dependencies. Plan files MUST NOT be generated from a draft, in-review, or otherwise non-approved spec — approval is a human gate that signals the AL Architect has frozen the design.

## Default output location

`openspec/plans/<filename>` — always. Do not ask the user where to save the files.

## Workflow

Follow these steps in order. Do not skip the spec validation or the dependency-graph step.

### Step 1 — Identify and validate the source spec

1. If the user did not specify a SPEC ID, list files in `openspec/specs/` and ask which one to plan via `vscode_askQuestions`. Only offer specs whose frontmatter `status` is `approved` — surface draft/in-review specs only as disabled context, never as selectable targets.
2. Read the chosen spec file and verify `status: approved` in the frontmatter.
   - If `status` is anything other than `approved` (e.g. `draft`, `in-review`, `rejected`), **stop immediately**. Do not write any plan file. Report to the user: the spec path, its current status, and the next required action ("Set `status: approved` in the spec frontmatter, then re-run this skill").
   - Treat a missing or malformed `status` field as not-approved.
3. Capture: `id` (SPEC-NNN), `title`, `user_story` (US-NNN), `ccn` (if present), `module`, `prefix`, `id_range`, the full AL object inventory (§3), the technical Acceptance Criteria (§7) with their `AC-*` ids, the §8 Phase Overview (phase number, phase name, scope, ACs satisfied, estimated effort), and any §11 Open Questions.
4. Read the linked user story under `openspec/userstories/` (or `openspec/user-stories/`) and capture US ACs to allow cross-referencing.
5. If the spec is missing a §8 Phase Overview or any phase lacks a name / ACs / effort estimate, stop and report the gap — do NOT invent phases.

### Step 2 — Allocate the PLAN ID and feature branch

1. The PLAN id is derived from the spec id: `PLAN-NNN-P<phase>`, where `NNN` is the SPEC numeric id and `<phase>` is the phase number (1, 2, 3, …). No padding on `<phase>`.
2. The shared feature branch is `feature/spec-NNN-<kebab-title>` and MUST be identical across every phase file for the same spec. Take the kebab title from the spec filename.
3. If the user supplies a different branch convention, honour it but apply it uniformly to all phase files.

### Step 3 — Build the dependency graph

1. By default, each phase depends on the immediately preceding phase: Phase `N` `depends_on: [PLAN-NNN-P<N-1>]`. Phase 1 has `depends_on: []`.
2. If the spec's §8 Phase Overview explicitly states a different dependency (e.g. Phase 4 depends on both Phase 2 and Phase 3), honour it — record it in `depends_on` and reflect it in the §9 Dependencies body section.
3. Compute the **downstream consumers** for each phase (which later phases reference its outputs) and surface them in the Dependencies body section.
4. Detect cycles. If a cycle exists, stop and report — do NOT write any plan file.

### Step 4 — Verify standard BC assumptions per phase

For each phase whose tasks rely on a standard BC mechanism (RecordRef / FieldRef, EnqueueBackgroundTask, RapidStart configuration packages, No. Series, Permission Sets, virtual tables `AllObj` / `Field`, Document Attachment, etc.):

1. Call `mcp_microsoftdocs_microsoft_docs_search` to confirm the mechanism exists on the BC `application` version from `app.json`.
2. If unverified, record the verification gap as a bullet in the phase's **Notes for the AL Developer** section.
3. Never assert availability without verification.

### Step 5 — Compose each phase's task list

For every phase:

1. Translate the spec's §3 object inventory and §8 phase scope into concrete numbered checkbox tasks (`- [ ] **N.M** …`).
2. Every task MUST be:
   - Actionable (verb-led, specific object IDs, page properties, field numbers, etc. — pulled from the spec).
   - Bounded (one object or one tight cluster of related objects per task).
   - Traceable — every task that satisfies an AC cites it inline as `*(AC-…-NNN)*`.
3. Number tasks `<phase>.<M>` starting at `<phase>.1`. Do not skip numbers.
4. If a phase contains a smoke test, RapidStart export/import, or manual verification, it MUST be its own numbered task.

### Step 6 — Build the filename

Format: `SPEC-NNN-phase-<N>-<kebab-phase-name>.plan.md`

- `<N>` is the phase number (no padding).
- `<kebab-phase-name>` is the lowercase, hyphen-separated phase name from §8 (diacritics stripped, non-alphanumerics removed, hyphens collapsed).
- Validate every filename against `^SPEC-\d{3}-phase-\d+-[a-z0-9]+(-[a-z0-9]+)*\.plan\.md$` before writing.
- If a target filename already exists, stop and ask the user before overwriting.

### Step 7 — Write all phase plan files

For each phase, create the file at `openspec/plans/<filename>` using the template in `references/phase-plan-template.md`. Each file MUST contain, in this exact order:

1. YAML frontmatter:
   ```yaml
   ---
   id: PLAN-NNN-P<N>
   title: <Spec short title> — Phase <N> — <Phase Name>
   version: 1.0.0
   spec: SPEC-NNN
   user_story: US-NNN
   ccn: <CCN-NNN or empty>
   phase: <N>
   status: not-started
   estimated_hours: <hours from SPEC §8 or PLAN estimate>
   branch: feature/spec-NNN-<kebab-title>
   depends_on:
     - PLAN-NNN-P<N-1>
   assignee: <AL Developer or empty>
   prepared_by: <author name>
   created_date: <YYYY-MM-DD>
   approved_date:
   related_docs:
     - openspec/specs/SPEC-NNN-<kebab-title>.spec.md
     - openspec/userstories/US-NNN-<kebab-title>.userstory.md
     # - docs/ccn/CCN-NNN-<kebab-title>.md  # include only when a CCN exists
   ---
   ```
2. `# Phase <N> — <Phase Name>` H1.
3. `## References` — bullet list with markdown links to the user story (with the specific US-AC numbers this phase satisfies), the relevant spec sections (e.g. `SPEC-NNN §3.2`, `§5 Phase <N>`, `§7.x`), the CCN if any, and a closing bullet listing the technical ACs satisfied by this phase.
4. `## Goal` — 2–4 sentences describing the user-visible / developer-visible outcome at the end of the phase. Must be concrete enough to verify on a demo.
5. `## Branch` — one line stating the shared feature branch, with explicit guidance ("Continue on …" for phases > 1, "Cut from `main`…" for phase 1 unless otherwise stated).
6. `## Tasks` — numbered checkbox list (see Step 5). Mandatory format `- [ ] **N.M** <action> *(AC-…)*`. Tasks that do not satisfy a specific AC may omit the inline AC citation but MUST cite the spec section they implement.
7. `## Exit criteria` — bullet list. Every entry MUST be objectively verifiable. Minimum entries: all tasks ticked, every AC mapped to this phase demonstrably met, `app.json` version bumped (patch), build green, tests green.
8. `## Out of scope for this phase` — bullet list of items intentionally deferred. MUST cite the US Out-of-Scope or the spec phase that does own each item.
9. `## Dependencies` — two-block subsection:
   - **Prerequisites** — every PLAN id listed in `depends_on`, with a one-line summary of what each upstream phase delivers that this phase consumes.
   - **Downstream consumers** — every later PLAN id that lists this phase in its `depends_on`, with a one-line summary of what each consumer needs from this phase.
   - If either block is empty, state explicitly: "None — this is the first phase." / "None — this is the final phase."
10. `## Testing notes` — bullet list describing the test strategy for this phase only: which test codeunits are added/extended, whether tests are mocked or live, what is deferred (e.g. live SharePoint tenant smoke test in a later phase), and any manual smoke-test scripts to run.
11. `## Notes for the AL Developer` — free-form bullet list of hard-won implementation hints derived from the spec: caption / tooltip rules, lookup filters, fields that must be read-only, translation deferrals, performance caveats, verification gaps from Step 4, and anything the developer would have to dig out of the spec otherwise.

### Step 8 — Optional spec back-link

If the source spec's §12 Phase Plans section is empty or contains placeholders, you MAY populate it with markdown links to the newly created plan files. Do not change the spec's `status`, frontmatter, or other content.

### Step 9 — Confirm and report

After writing, report to the user:

- A markdown bullet list of every created plan file (each as a markdown link), in phase order.
- A small dependency table: `Phase | depends_on | downstream consumers | estimated_hours`.
- Total estimated hours across all phases (sum of the `estimated_hours` frontmatter values).
- Any verification gaps logged in **Notes for the AL Developer** sections.
- Any phases skipped or any naming collisions encountered.
- The next recommended action (typically: review plan files, set status to `approved`, then start Phase 1).

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

- **Source spec MUST have `status: approved`** in its frontmatter. Any other status (including `draft`) MUST abort the workflow before any plan file is written. Approval is a human gate — never edit the spec's status to satisfy this rule.
- **status MUST always be `not-started`** on initial creation of every plan file. **version MUST be `1.0.0`**.
- **Default folder is `openspec/plans/`** — never ask, never write elsewhere.
- **File extension MUST be `.plan.md`** and the filename MUST match the regex in Step 6.
- **Branch name MUST be identical across every phase file for the same spec.**
- **Never** create plan files without a referenced spec — `spec:` frontmatter is mandatory.
- **The `prepared_by` frontmatter field is mandatory.** If the author name is not evident from context (git user, previous artefacts, or explicit user input), ask the user before writing the file.
- **Never** invent phases or ACs — every phase MUST appear in SPEC §8; every AC citation MUST resolve to an AC in SPEC §7 or the US.
- **Never** assert standard BC mechanism availability without Microsoft Learn verification (Step 4). Unverified mechanisms become Notes-for-the-Developer bullets.
- **Never** overwrite an existing plan file. On collision, stop and ask.
- The `depends_on` frontmatter list MUST match the prerequisite bullets in §9 exactly.
- Every task in §6 MUST be actionable, bounded, and where applicable cite the AC it satisfies inline as `*(AC-…)*`.
- Every Exit criteria bullet MUST be objectively verifiable (no "feature works well" type statements).
- Plan files MUST NOT contain AL source code. Task lists, links, and prose only.

## References

- `references/phase-plan-template.md` — full markdown skeleton with frontmatter, every mandatory section, example task rows, dependency block, and placeholder tokens.
- `references/phase-plan-fields.json` — canonical, language-neutral static field/section keys used to drive the mandatory JSON output (below) and any downstream `md-to-docx-converter` template.

## Mandatory JSON output

On **every** invocation, in addition to writing each `.plan.md` file the skill MUST also write a sibling JSON file **per phase**:

- Path: same folder as the markdown, filename pattern `SPEC-NNN-phase-N-<slug>.plan.json` (see `outputJson.filePattern` in `references/phase-plan-fields.json`).
- Encoding: UTF-8, pretty-printed (2-space indent).
- Shape:
  ```json
  {
    "artifactType": "PLAN",
    "id": "PLAN-NNN-P<N>",
    "spec": "SPEC-NNN",
    "phase": <integer>,
    "language": "<bcp47-primary-subtag>",
    "frontmatter": { "<yamlKey>": "<value>", ... },
    "sections":    { "<CanonicalKey>": "<markdown body of the section, translated>", ... }
  }
  ```
- **Keys** (both in `frontmatter` and in `sections`) MUST come **verbatim** from `references/phase-plan-fields.json` (`frontmatterFields[].key` and `sections[].key`). They are byte-stable across runs and languages so they can bind 1:1 to placeholder tokens in any Word template.
- **Values** carry the content in the chosen target language.
- Every H2 in the generated markdown MUST be immediately followed by `<!-- section-key: <CanonicalKey> -->` on its own line so the same map can be reconstructed by parsing the `.md` after the fact.
- Failure to emit the JSON file for **any** phase is a hard failure of the skill — abort and report rather than producing only the markdown set.

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