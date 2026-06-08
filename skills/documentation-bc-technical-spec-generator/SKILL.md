---
name: documentation-bc-technical-spec-generator
description: Create well-structured Business Central technical specifications in the `openspec/specs/` folder from approved user stories, following the SPEC-001 template structure. Decomposes an approved user story into a complete technical design with architecture overview, AL object inventory (tables, enums, pages, page extensions, codeunits, permission sets) with allocated IDs from the workspace `app.json` range and the correct affix, table field definitions, page layout notes, integration points with standard BC, testable technical acceptance criteria mapped back to the user-story ACs, a phased task breakdown, and per-phase implementation plan files under `openspec/plans/`. Verifies standard BC behavior via Microsoft Learn before assuming reuse. Use whenever the user asks to create, draft, generate, or write a technical spec, SPEC, architecture document, implementation plan, or asks to decompose / plan a user story for development, with trigger phrases such as "create a spec for US-NNN", "draft technical spec", "generate SPEC from user story", "decompose this US into a plan", "user story approved, create the spec", or "design the AL objects for [feature]".
---

# Documentation: BC Technical Spec Generator

Generate a Business Central technical specification under `openspec/specs/` and the corresponding per-phase plan files under `openspec/plans/`, starting from an **approved** user story in `openspec/userstories/` (or `openspec/user-stories/`).

## When to use

The user has an approved BC user story (`status: approved`) and wants the AL Architect-style technical breakdown — object inventory, IDs, fields, pages, testable ACs, phase plans — before any code is written.

## Default output locations

- Spec file: `openspec/specs/<kebab-title>.spec.md`
- Per-phase plan files: `openspec/plans/<kebab-title>-phase-<N>-<slug>.plan.md`

Never ask the user where to save the files.

## Workflow

Follow these steps in order. Do not skip the user-story validation or the codebase research step.

### Step 1 — Identify and validate the source user story

1. If the user did not specify a US ID, list files in `openspec/userstories/` (and `openspec/user-stories/` if present) and ask which one to base the spec on via `vscode_askQuestions`.
2. Read the chosen user-story file.
3. Verify `status: approved` in the frontmatter. If status is `draft`, stop and ask the user to approve the story first (do not produce a spec for a draft story).
4. Extract: `id` (US-NNN), `title`, `module`, `ProductOwner`, all Acceptance Criteria, Out of Scope, and Open Questions.

### Step 2 — Allocate the next SPEC ID

1. List files in `openspec/specs/` matching `SPEC-*.spec.md` and any `*.spec.md` with a `SPEC-NNN` id in the frontmatter.
2. Parse the highest existing numeric ID and increment by 1; format as `SPEC-NNN` (zero-padded to 3 digits).
3. If the folder does not exist or is empty, start at `SPEC-001`.

### Step 3 — Research the workspace and existing codebase

This step is **mandatory** — never invent object IDs or affixes. Run these reads in parallel where possible:

1. Read `app.json` and capture:
   - `idRanges` (array of `from` / `to`)
   - `application` (BC version) and `runtime`
   - `name`, `publisher`
   - `dependencies` (used / not used)
2. Read the AL prefix/affix convention used by existing objects in `src/`. Look at any `*.al`, `*.Table.al`, `*.Pageext.al`, `*.Tableext.al` files to detect the established affix (e.g. `PTE`, `BCS`, customer-specific prefix). If multiple are in use, prefer the one matching the relevant module folder.
3. Inventory **already-used object IDs** by `Object Type` across `src/` so the spec allocates only IDs that are still free. Read enough files to be confident, or call the `Explore` subagent with thoroughness `medium` if the codebase is large.
4. Note relevant existing objects the new spec may reuse, extend, or coexist with.

If any required input is unavailable (missing `app.json`, no ID range, no clear affix), stop and ask the user via `vscode_askQuestions` rather than guess.

The `prepared_by` frontmatter field is **mandatory**. If the author name is not evident from context (git user, previous artefacts, or explicit user input), ask the user before writing the file.

### Step 4 — Verify standard BC behavior the spec depends on

For each US Acceptance Criterion that implies reuse of out-of-the-box BC functionality (Resources, Employees, Document Attachments, No. Series, Country/Region, Post Codes, Dimensions, API pages, RapidStart, etc.):

1. Call `mcp_microsoftdocs_microsoft_docs_search` (and `mcp_microsoftdocs_microsoft_docs_fetch` when deeper detail is required) to confirm the standard behavior on BC `application` version from `app.json`.
2. Cite the verified mechanism explicitly in the spec (e.g. "uses standard `Codeunit \"No. Series\"`", "uses standard `Document Attachment` table").
3. If documentation does not confirm a feature, do not assume it exists — instead, add an Open Question to the spec to clarify with the user.

### Step 5 — Plan the AL object inventory and phasing

Before drafting, decide:

1. **Object IDs** — Allocate one contiguous block inside the workspace `app.json` `idRanges` that is large enough for all planned objects, skipping any already-used IDs found in Step 3. Use the same ID number for objects of different types only when consistent with the established codebase pattern.
2. **Affix** — Apply the detected affix to every object name (e.g. `<Affix> Penalty Header`). Keep total object name ≤ 30 chars (≤ 26 for the name itself per `al-naming-conventions.instructions.md`).
3. **Tables / Enums / Pages / PageExts / Codeunits / Permission Sets** — Decide what is needed to satisfy every user-story AC. Justify each object's existence; do not add speculative objects.
4. **Field design** — Define field numbers in groups (1–19 identifiers, 20–29 dates, 30–39 amounts, 40–49 status, 50+ notes) following typical BC patterns.
5. **Phases** — Decompose the work into 2–6 self-contained phases. Each phase must compile and be reviewable on its own. Common patterns:
   - Phase 1 = Master Data / Setup / Catalogues
   - Phase 2 = Core entity + main UI
   - Phase 3 = Integration with standard BC objects (FactBoxes, PageExts)
   - Phase N = Permissions, translations, smoke tests
6. **Open Question reconciliation** — For every Open Question in the user story, decide whether the spec resolves it (and how), or escalates it.

### Step 5b — Blind spot & corner case review

After completing the object inventory and phasing and **before** drafting the spec file, enumerate the blind spots and corner cases you detected in the user story, ACs, and proposed object design. Surface them to the user via `vscode_askQuestions`. For each item, offer three dispositions:
- **Add as Technical AC** — creates a new entry in §7.
- **Add as Open Question** — escalated to the Product Owner in §11.
- **Explicitly out of scope** — recorded in §2 Out-of-Scope Confirmation.

Minimum areas to check (raise at least one question per applicable area):

1. **Negative / failure paths in ACs** — For every AC that describes a success path ("user can create", "amount is shown"), ask: what is the expected behavior when the operation fails, the value is missing, or the precondition is not met? If the AC has no negative path, it is incomplete.
2. **Orphan-record scenarios** — For every `TableRelation` or `CalcFormula` in the planned field design, what happens when the referenced record is deleted? Is a `DeleteAllowed` = No restriction needed, or a cascade, or a check-before-delete codeunit?
3. **Status-transition coverage** — If the spec includes a Status field, are ALL valid transitions modeled (including backward transitions like re-open, and invalid ones like skipping states)? List any transition not explicitly covered by an AC.
4. **Still-open Open Questions from the US** — For every OQ whose status in the user story is "Escalated" or "Functional question" (not yet resolved), surface it here. A spec written over unresolved OQs has implicit assumptions baked in.
5. **Vague AC language** — Flag every US or SPEC AC that contains "should", "might", "typically", "as needed", or "user-friendly". These are not verifiable; rewrite with the user or escalate.
6. **Permission matrix gap** — Does the spec define which Permission Set grants Create / Modify / Delete for each new table? If not, raise it as an AC or an Open Question.
7. **Translation / multi-language** — Are all new captions, tooltips, and option values included in the Translation AC? Are there string-length risks (UI truncation) in translated languages?
8. **Missing non-happy-path in runtime flows** — Review the §2 Architecture flow diagram. Does it show the behavior when no matching records are found, when a batch job is already running, or when a configuration value is missing?

Do not proceed to Step 6 until all raised blind spots have been assigned a disposition.

### Step 6 — Draft and write the spec file

Build the filename: `<kebab-title>.spec.md` (or `SPEC-NNN-<kebab-title>.spec.md` if the user story uses that convention).

- `<kebab-title>` is the lowercase, hyphen-separated title from the user story (diacritics stripped, non-alphanumerics removed, collapsed hyphens).
- Validate against `^([A-Z]+-\d{3}-)?[a-z0-9]+(-[a-z0-9]+)*\.spec\.md$` before writing.

Write the file at `openspec/specs/<filename>` using the template in `references/spec-template.md`. The file MUST contain, in this exact order:

1. YAML frontmatter:
   ```yaml
   ---
   id: SPEC-NNN
   title: <Title>
   version: <Version>
   type: features
   status: draft
   user_story: US-NNN
   priority: <from US>
   complexity: <Low | Medium | Medium-High | High>
   estimated_effort: <N-M dev days>
   module: <module from US>
   prefix: <Affix>
   id_range: <from>-<to>
   prepared_by: <author name>
   created_date: <YYYY-MM-DD>
   approved_date: ""
   ---
   ```
2. `# SPEC-NNN – <Title>` H1
3. `## 1. User Story Reference` — markdown link to the US, quote of the As/Want/So-that block, statement that all US ACs are addressed in §7.
4. `## 2. Technical Design Overview` — Design Principles table (rationale per choice), Architecture (Mermaid `erDiagram` for data; or `flowchart` for runtime flow), Out-of-Scope Confirmation echoing the US.
5. `## 3. AL Object Inventory` — Tables / Enums / Pages / Page Extensions / Codeunits / Permission Sets / Number Series subsections, each as a table with columns: `ID | Object Name | (Type if mixed) | Purpose`.
6. `## 4. Table Field Definitions` — One table per new table: `Field No. | Field Name | Data Type | Length / Properties | Notes`. List `Keys:` and `Triggers:` as bullets per table.
7. `## 5. Page Design Notes` — One subsection per non-trivial page: field groups, FactBox parts, actions, visibility logic.
8. `## 6. Integration with Standard BC Objects` — Table: `Standard Object | Interaction`. Explicitly call out any `TableRelation`, FlowFields, and standard codeunits used.
9. `## 7. Technical Acceptance Criteria` — Table: `ID | Description | Maps to US-AC`. Use IDs like `AC-TBL-001`, `AC-ENUM-001`, `AC-FLD-001`, `AC-PAGE-001`, `AC-CU-001`, `AC-PERM-001`, `AC-LANG-001`. Every US AC must be covered by at least one technical AC.
10. `## 8. Phase Overview` — Table: `Phase | Slug | Name | Effort (dev days) | Description` and a total effort estimate.
11. `## 9. Testing Strategy` — Unit-test plan per phase (test codeunit names + locations under `test/`).
12. `## 10. Dependencies` — Table: `Dependency | Source | Resolution`.
13. `## 11. Open Questions Tracking` — Table: `# | From | Status | Resolution proposed in this spec`. Echo every US Open Question and note its status (Resolved / Not blocking / Functional question / Escalated).
14. `## 12. Phase Plans` — Numbered list of links to each per-phase plan file (use the filenames generated in Step 7).

### Step 7 — Delegate per-phase plan file creation (gated by approval)

Per-phase plan files are produced by the dedicated **`documentation-bc-phase-plan-generator`** skill, which owns the canonical phase-plan template, dependency graph, and filename convention (`SPEC-NNN-phase-<N>-<kebab-phase-name>.plan.md` under `openspec/plans/`).

This step is **gated** — the spec must be approved AND the user must explicitly confirm before any plan file is created.

1. After Step 6 has written the spec file, re-read its frontmatter and verify `status: approved`.
   - If `status` is `draft` (the default on initial creation), **stop** and report to the user that plan generation requires the spec to be approved first. Provide the spec file path and the next recommended action ("Review the spec, set `status: approved` in the frontmatter, then re-run plan generation").
   - Do **not** silently flip the spec to `approved` — approval is a human gate.
2. If `status: approved`, ask the user via `vscode_askQuestions` whether to proceed with phase-plan generation now. Present at least two options:
   - **Yes — generate plan files now** (recommended default).
   - **No — stop after the spec** (the user will invoke the phase-plan generator later).
   - Only invoke the delegated skill on an explicit "Yes". Never auto-invoke.
3. On confirmation, invoke the `documentation-bc-phase-plan-generator` skill with the new `SPEC-NNN` id as input. That skill re-validates `status: approved` independently before writing any file.
4. The delegated skill reads SPEC §8 Phase Overview, computes `depends_on`, runs any required Microsoft Learn verifications, and emits one `.plan.md` file per phase in a single pass.
5. Do **not** generate phase plan files directly from this skill — the legacy `references/plan-template.md` is retained only as a fallback reference for the template shape, not for direct authoring.
6. Collect the list of created plan-file paths returned by the delegated skill and use them to populate `## 12. Phase Plans` in the spec file (Step 6 §12). If the user declined plan generation in step 2, leave §12 with a placeholder note: "Plan files not yet generated — run the `documentation-bc-phase-plan-generator` skill once the spec is approved."

### Step 8 — Mark the source user story (optional)

If, and only if, the user story file does not yet reference an active spec, you MAY append a one-line link in the user story under a new `## Linked Spec` section pointing to the new spec file. Do not change the user-story `status` or any other field.

### Step 9 — Confirm and report

After writing, report to the user:

- Path of the created spec file (as a markdown link).
- Paths of every created plan file (as markdown links).
- The allocated `SPEC-NNN` id and the `id_range` assigned.
- The detected affix and `app.json` BC version used.
- A 1-line summary of each phase.
- Any Open Questions still escalated to the Product Owner.
- The next recommended action (typically: review & approve the spec, then hand off to the AL Architect / AL Developer agent).

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

- **status MUST always be `draft`** on initial creation of both the spec and every phase plan.
- **approved_date MUST be empty** on initial creation.
- **Never** create a spec for a user story whose `status` is not `approved`.
- **Never** auto-invoke the `documentation-bc-phase-plan-generator` skill. Plan generation is gated on (a) `spec.status: approved` and (b) explicit user confirmation in Step 7.
- **Never** invent object IDs — they MUST come from the `app.json` `idRanges` and not collide with existing objects detected in Step 3.
- **Never** invent the affix — detect it from existing AL code.
- **Never** assume standard BC behavior without Microsoft Learn verification (Step 4). If unverifiable, add an Open Question.
- **Never** overwrite an existing spec or plan file. On collision, re-allocate the SPEC ID or pick a non-colliding slug.
- Every US Acceptance Criterion MUST map to at least one technical AC in §7.
- Every Open Question from the US MUST appear in §11 with a status.
- At least one phase MUST exist; if work is genuinely single-step, still produce one phase plan file.
- Spec and plan files MUST NOT contain AL source code (no ```al code blocks of actual implementations). Object names, IDs, field tables, and pseudocode descriptions only.
- Total spec body SHOULD stay under ~1,500 lines; if larger, split optional deep-dive sections into companion files under `openspec/architecture/`.
- **Never** skip Step 5b — the blind spot & corner case review is mandatory. Every identified blind spot MUST have a recorded disposition before the spec file is written.
- **Never** accept an AC with vague or unverifiable language — any AC containing "should", "might", "typically", "as needed", or "user-friendly" MUST be rewritten with the user or escalated to an Open Question.

## References

- `references/spec-template.md` — full markdown skeleton with section headings and placeholder tokens.
- `references/plan-template.md` — legacy per-phase plan skeleton (fallback only; primary plan generation is delegated to the `documentation-bc-phase-plan-generator` skill).
- `references/example-spec.md` — a complete worked example (the SharePoint Files factbox spec) to use as a style and structure guide.
- `references/spec-fields.json` — canonical, language-neutral static field/section keys used to drive the mandatory JSON output (below) and any downstream `md-to-docx-converter` template.

## Mandatory JSON output

On **every** invocation, in addition to writing the `.spec.md` file the skill MUST also write a sibling JSON file:

- Path: same folder as the markdown, filename pattern `SPEC-NNN-<kebab-title>.spec.json` (see `outputJson.filePattern` in `references/spec-fields.json`).
- Encoding: UTF-8, pretty-printed (2-space indent).
- Shape:
  ```json
  {
    "artifactType": "SPEC",
    "id": "SPEC-NNN",
    "language": "<bcp47-primary-subtag>",
    "frontmatter": { "<yamlKey>": "<value>", ... },
    "sections":    { "<CanonicalKey>": "<markdown body of the section, translated>", ... }
  }
  ```
- **Keys** (both in `frontmatter` and in `sections`) MUST come **verbatim** from `references/spec-fields.json` (`frontmatterFields[].key` and `sections[].key`). They are byte-stable across runs and languages so they can bind 1:1 to placeholder tokens in any Word template.
- **Values** carry the content in the chosen target language.
- Every H2 in the generated markdown MUST be immediately followed by `<!-- section-key: <CanonicalKey> -->` on its own line so the same map can be reconstructed by parsing the `.md` after the fact.
- Phase plan files generated by the companion `documentation-bc-phase-plan-generator` skill follow the same rule using their own `references/phase-plan-fields.json`.
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