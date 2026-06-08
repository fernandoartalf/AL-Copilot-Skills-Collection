---
name: documentation-bc-ccn-generator
description: Create well-structured Business Central Change Control Notes (CCN) in the `docs/ccn/` folder (or `docs/<lang>-ccn/` for non-English variants) as the single stakeholder-facing artefact consolidating an approved user story, technical spec, architecture document, and feasibility analysis, following the CCN-001 template structure. Produces a single markdown file with consistent, ordered sections (Header, Business Context, Proposed Solution, Architecture, Feasibility, Time/Cost, Testing Setup, Testing Steps, Recommendation, Approvals) so the output can later be fed into the `md-to-docx-converter` skill with a placeholder template. Drives a short interview to capture (1) whether financial cost data must be included, (2) whether time/effort data must be included, (3) which estimate scenario(s) from the analysis to surface (Optimistic / Expected / Pessimistic / Neutral), and (4) the target content language as a BCP-47 code (`en`, `es`, `fr`, `de`, `it`, `pt`, `nl`, …) into which all prose, table cell values, and bullet content are translated — while section headings, frontmatter keys, §1 Header field labels, and diagram marker names remain in canonical English so the `md-to-docx-converter` JSON extraction keys stay byte-stable across languages. Embeds explicit `<!-- DIAGRAM: mermaid -->` markers on every diagrammable block (component view, ER, runtime flow, status lifecycle) so the docx converter can convert them to Mermaid renderings while leaving prose untouched. Writes the file as `CCN-NNN-<kebab-title>.md` with frontmatter linking back to the source user story, spec, architecture, and analysis documents. Use whenever the user asks to create, draft, generate, or write a CCN, Change Control Note, change request document, consolidated stakeholder document in any language, or asks to "produce the CCN for SPEC-NNN / US-NNN", "draft a Change Control Note in <language>", "generate the CCN markdown from US/SPEC/ARCH/ANALYSIS", "translate the CCN to <language>", "create a stakeholder-facing change note", or "build a CCN for docx conversion".
---

# Documentation: BC CCN Generator

Generate a Business Central **Change Control Note (CCN)** under `docs/ccn/` (English) or `docs/<lang>-ccn/` (any other supported language) as the single stakeholder-facing artefact that consolidates an approved user story, technical spec, architecture document, and feasibility analysis into one consistent markdown file. The file is designed to be fed downstream into the `md-to-docx-converter` skill using a single CCN-specific Word template that works across all languages.

## When to use

The user has at least an approved user story (`US-NNN`) and a draft/approved spec (`SPEC-NNN`); optionally also `ARCH-NNN` and `ANALYSIS-NNN`. They want a single document — in any language — that summarises the change for sign-off and that converts cleanly to Word later.

## Language model (CRITICAL)

The CCN supports any BCP-47 language code (`en`, `es`, `fr`, `de`, `it`, `pt`, `nl`, etc.). To keep the downstream JSON extraction keys used by `md-to-docx-converter` byte-stable across languages, the document is split into two layers:

| Layer | Language | Examples |
|---|---|---|
| **Structural layer** (NEVER translated) | English / canonical | YAML frontmatter keys (`id`, `title`, `customer`, `dsd_ticket`, `user_story`, `spec`, `architecture`, `analysis`, `recommendation`, `related_docs`); all H1/H2/H3 section headings (`## 1. Header`, `## 2. Business context (from US-NNN)`, `### 2.1 Who`, …); §1 Header **field labels** (`CCN ID`, `Customer`, `DSD ticket`, `BC environment`, `Prepared by`, `Date`, `Status`, `Recommendation`, …); table **column headers** in §2.6, §3.2, §3.7, §4.1, §4.3, §4.5, §5.3, §6.1, §6.2, §6.3, §7, §10; diagram marker attributes (`<!-- DIAGRAM: mermaid type="…" name="…" -->`); decision tokens (`GO`, `CONDITIONAL-GO`, `NO-GO`); the verdict heading `### **<VERDICT>**`. |
| **Content layer** (translated to target language) | Target language | All prose paragraphs, blockquote text, numbered/bulleted item content, table **cell values**, SWOT body text, risk descriptions/mitigations, advisory items, the leading blockquote under the H1, the approval checkbox labels (`☐ Approved`, etc., translated as words but keeping the `☐` symbol). |

Why: the converter slugifies H2/H3 headings into JSON keys (e.g. `1Header`, `2ContextoDeNegocio…` in the legacy bilingual run). Keeping headings canonical-English guarantees a single `field-map.json` and a single Word template work for any language.

## Default output location

- `language = en` → `docs/ccn/<filename>` (default).
- Any other language → `docs/<lang>-ccn/<filename>` where `<lang>` is the lowercase BCP-47 primary subtag (e.g. `docs/es-ccn/`, `docs/fr-ccn/`, `docs/de-ccn/`). Create the folder if it does not exist.

Do not ask the user where to save the file beyond confirming the language.

## Workflow

Follow these steps in order. Do not skip the source validation step (Step 1), the interview step (Step 3), or the diagram marker step (Step 6).

### Step 1 — Identify and validate the source artefacts

1. If the user did not specify a US/SPEC ID, list files in `openspec/userstories/` (or `openspec/user-stories/`) and `openspec/specs/` and ask which feature to consolidate via `vscode_askQuestions`.
2. Read the user story and capture: `id` (US-NNN), `title`, `status`, `module`, `ProductOwner`, `approved_date`, the role / want / so-that triplet, business context, functional scope, acceptance criteria, Out-of-Scope, Future Enhancements, Open Questions.
3. Read the technical spec and capture: `id` (SPEC-NNN), `title`, `module`, `prefix`, `id_range`, design principles, AL object inventory, No. Series setup, API surface, localisation notes, Open-Questions resolutions, phase overview.
4. If `openspec/architecture/ARCH-NNN-<kebab>.architecture.md` exists, read it and capture: `id` (ARCH-NNN), ADR summary table, logical component view (ASCII / mermaid), cross-cutting concerns table, legacy coexistence statement, known constraints (`C-N`).
5. If `openspec/analysis/ANALYSIS-NNN-<kebab>.analysis.md` exists, read it and capture: `id` (ANALYSIS-NNN), change summary, per-phase effort hours (Optimistic / Expected / Pessimistic), contingency line, cost table, SWOT, risk register (`R-NN`), verdict (GO / CONDITIONAL-GO / NO-GO).
6. If any of US / SPEC are missing, abort with a clear error. ARCH and ANALYSIS are optional — when absent, the corresponding sections are produced from the spec only and an explicit `> _Architecture document not yet available — section derived from SPEC only._` blockquote is inserted.

### Step 2 — Allocate the next CCN ID

1. List files in the chosen output folder matching `CCN-*.md`.
2. Parse the highest existing numeric ID and increment by 1; format as `CCN-NNN` (zero-padded to 3 digits).
3. If the folder does not exist or is empty, start at `CCN-001`.
4. If the allocated filename would collide, re-increment until free. Never overwrite.

### Step 3 — Interview the user

Ask the four questions below in **a single `vscode_askQuestions` call** (one block, four entries) before drafting. All four questions are mandatory.

1. **`language`** — BCP-47 primary subtag. Default `en`. Accept any of `en`, `es`, `fr`, `de`, `it`, `pt`, `nl`, `ca`, `eu`, `gl`, `pl`, `da`, `sv`, `no`, `fi`, `cs`, `el`, `ja`, `zh`. If the user provides a non-listed code, accept it but warn that terminology has not been pre-validated. Drives ONLY (a) the output folder (`docs/ccn/` for `en`, `docs/<lang>-ccn/` otherwise) and (b) the natural-language content of paragraphs, list items, and table cell values. It MUST NOT change any section heading, frontmatter key, §1 field label, table column header, diagram marker, or verdict token — those remain canonical English per the §Language model table above.
2. **`include_costs`** — `yes` / `no`. If `no`, all monetary figures, EUR/h rates, and the §5 Cost table from ANALYSIS are omitted. The §6 Time table is preserved (hours only) unless `include_hours` is also `no`. If `yes`, the §5 Cost table is included using the rate recorded in ANALYSIS.
3. **`include_hours`** — `yes` / `no`. If `no`, all hour figures and calendar-duration tables are omitted; §6 is replaced by a one-line "Effort and duration intentionally omitted from this version." statement. If `yes`, include the §6 Time table.
4. **`scenarios`** — multi-select from `Optimistic`, `Expected`, `Pessimistic`, `Neutral`. Pre-validate that the chosen scenarios exist in ANALYSIS. If ANALYSIS only reports a single neutral estimate (as in CCN-001), accept only `Neutral` and warn the user that the other scenarios are not available. Default selection: `Expected` + `Neutral` (when both exist), otherwise whatever ANALYSIS provides.

If `include_costs = yes` and `include_hours = no`, abort with an explanatory error — costs cannot be reported without their underlying hour basis.

If ANALYSIS is missing entirely, force `include_costs = no` and `include_hours = no` and inform the user that §5 and §6 will be omitted because the analysis source is unavailable.

### Step 4 — Resolve cross-document references

1. Compute `<kebab-title>` from the user-story title: lowercase, ASCII-fold (diacritics stripped), non-alphanumerics replaced by hyphens, hyphens collapsed.
2. Build the relative-path links that will appear in the document body and frontmatter `related_docs`:
   - `../../openspec/userstories/US-NNN-<kebab>.story.md`
   - `../../openspec/specs/SPEC-NNN-<kebab>.spec.md`
   - `../../openspec/architecture/ARCH-NNN-<kebab>.architecture.md` (omit if missing)
   - `../../openspec/analysis/ANALYSIS-NNN-<kebab>.analysis.md` (omit if missing)
3. Verify each path exists on disk. A missing link is a hard error unless the artefact was already marked optional (ARCH / ANALYSIS).

### Step 5 — Build the section content

Follow the section order and rules below. **Section headings, IDs, and ordering MUST be byte-stable** so the same Word template placeholder set keeps working release after release. Source citations are mandatory.

Section headings are **always** in canonical English regardless of `language`. Translate only the body content (prose, list items, table cell values).

| §  | Canonical heading (always English)             | Source            |
|----|------------------------------------------------|-------------------|
| 1  | Header                                          | SPEC + USER + ANALYSIS frontmatter |
| 2  | Business context (from US-NNN)                  | USER §Business Context, §Functional Scope, §AC, §Out-of-Scope, §Future Enhancements |
| 3  | Proposed solution (from SPEC-NNN)               | SPEC §Design Principles, §Object Inventory, §No. Series, §API, §Localisation, §Phase Overview |
| 4  | Architecture solution (from ARCH-NNN)           | ARCH §ADRs, §Component View, §Cross-cutting, §Coexistence, §Constraints |
| 5  | Feasibility analysis (from ANALYSIS-NNN)        | ANALYSIS §Change Summary, §SWOT, §Risk Register, §OQ Status |
| 6  | Time estimate                                   | ANALYSIS §Effort (filtered by `scenarios`) |
| 7  | Testing setup (planned)                         | SPEC §Phase Overview + ANALYSIS §Test Strategy |
| 8  | Testing steps (acceptance, executed by Customer)  | USER §AC translated into manual steps |
| 9  | Recommendation                                  | ANALYSIS §Verdict + §Non-blocking advisories |
| 10 | Approvals                                        | Empty 3-row table (PO, Tech Lead, PM) |

Rules:

- **§1 Header table MUST have one row per field with bold labels in canonical English** (`| **Field** | Value |`), so the downstream `md-to-docx-converter` skill's metadata extraction works. The label set is fixed: `CCN ID`, `Title`, `Customer`, `DSD ticket`, `BC environment`, `BC version baseline`, `Extension affected`, `Source user story`, `Source spec`, `Architecture`, `Analysis`, `Prepared by`, `Date`, `Status`, `Recommendation`. Field labels are NEVER translated — even when `language ≠ en` — because the converter keys off them.
- **§1 values MUST be plain text** (and MAY be in the target language for human-readable fields such as `Customer` notes; identifiers like `CCN-001`, `US-001`, `SPEC-001`, dates, version numbers, and the `GO`/`CONDITIONAL-GO`/`NO-GO` token MUST stay verbatim). No markdown links, no backticks, no em-dashes. This guarantees clean substitution into the Word template.
- **§2 §3 §4 §5** are derived sections — copy the *prose and tables*, never the AL source code. Strip any ```al blocks from the source documents.
- **§4 §6 §7** MUST cite their source document at the top of the section as a leading sentence (e.g. _"Drawn from [ARCH-001](...)."_).
- **§6 Time estimate** content is shaped by the interview:
  - `include_hours = no` → render only the line: `_Effort and duration intentionally omitted from this version of the document._`
  - `include_hours = yes` and `include_costs = no` → render the effort-per-phase table and calendar duration table, but strip any EUR / cost columns.
  - `include_hours = yes` and `include_costs = yes` → render the effort table, calendar table, **and** a cost-per-scenario table at the chosen `scenarios`. State the EUR/h rate from ANALYSIS verbatim.
  - When more than one scenario is selected, render side-by-side columns (one column per scenario) on the effort and cost tables. When only one scenario is selected, use a single value column.
- **§9 Recommendation** verdict heading MUST match the ANALYSIS verdict verbatim (`**GO**`, `**CONDITIONAL-GO**`, or `**NO-GO**`).
- **§10 Approvals** table is always rendered as an empty 3-row table. The closing blockquote MUST reference `openspec/plans/` as the place where phase plans are flipped from `not-started` to `approved`.

### Step 6 — Mark diagrams for downstream conversion

Every block that the docx converter will render as a Mermaid diagram MUST be surrounded by an explicit HTML comment marker pair so the converter recognises it. Use exactly these markers and nothing else:

```
<!-- DIAGRAM: mermaid type="<flowchart|erDiagram|stateDiagram|sequenceDiagram>" name="<short-kebab-id>" -->
... optional ASCII fallback kept verbatim for the markdown reader ...
```mermaid
<actual Mermaid source — valid for the declared `type`>
```
<!-- /DIAGRAM -->
```

Mandatory rules for every marker block:

1. **A ```mermaid fenced block is REQUIRED inside the markers.** It is the only source the `md-to-docx-converter` can render into a PNG; without it the converter will fall back to plain text. Author the Mermaid syntax yourself — do NOT rely on the converter to regenerate Mermaid from ASCII art.
2. The Mermaid source must be **valid for the declared `type`** (e.g. `type="flowchart"` requires a `flowchart` / `graph` diagram; `type="erDiagram"` requires an `erDiagram` diagram).
3. The optional ASCII art kept above the ```mermaid fence is for human readability of the raw markdown only. The converter ignores it.
4. `name` must be **unique within the CCN** and kebab-cased.
5. Do NOT nest a marker block inside another fenced code block (` ```text `, ` ```` ` ``` ` ```` `, …). The converter only matches markers at body level.

Apply markers to **at least** these diagrams when their source document supplies them:

| Source | Block | Suggested `type` | Suggested `name` |
|---|---|---|---|
| ARCH §4.2 (logical component view) | ASCII / fenced block in §4 of the CCN | `flowchart` | `component-view` |
| ARCH §6.1 (entity-relationship overview) | If present, inserted into §4 of the CCN | `erDiagram` | `entity-relationship` |
| SPEC / ARCH (status lifecycle) | Forward-only Status transition, inserted into §3 or §4 | `stateDiagram` | `status-lifecycle` |
| ARCH §5 (key runtime flow) | Each flow inserted into §4 of the CCN | `sequenceDiagram` | `flow-<short-name>` |

Do not auto-convert pre-existing ASCII art into Mermaid blindly — understand the source diagram first, then write a hand-crafted Mermaid block that reflects it. Keep the ASCII above the ```mermaid fence so the raw markdown remains readable for reviewers. If a diagrammable block is not present in any source document, do not invent it.

When the CCN is later passed through the `md-to-docx-converter` skill, each marker block is replaced in the JSON body by a `{{DIAGRAM:<name>}}` token, the captured Mermaid source is stored under the JSON `_diagrams` key, and the token is rendered as an inline PNG image (via the Mermaid CLI `mmdc`) in the generated `.docx`. A missing or invalid Mermaid block degrades to a labelled text block in the docx but does not abort the conversion.

### Step 7 — Build the filename

Format: `CCN-NNN-<kebab-title>.md`

- `<kebab-title>` is the lowercase ASCII-folded title from Step 4.
- Validate against `^CCN-\d{3}-[a-z0-9]+(-[a-z0-9]+)*\.md$` before writing.

### Step 8 — Write the CCN document

Create the file at `<docs-folder>/<filename>` using the template in `references/ccn-template.md`. The file MUST contain, in this exact order:

1. YAML frontmatter — **keys are ALWAYS in canonical English regardless of `language`**; only free-text values (e.g. `title`, `prepared_by`) may be in the target language. Identifier values (`id`, `user_story`, `spec`, `architecture`, `analysis`, `recommendation`), enum values (`status: Pending Approval`), and the `version` number MUST stay verbatim:
   ```yaml
   ---
   id: CCN-NNN
   title: Change Control Note — <Title>
   version: 1.0
   status: Pending Approval
   customer: <Customer name from SPEC / USER>
   dsd_ticket: TBD
   user_story: US-NNN
   spec: SPEC-NNN
   architecture: ARCH-NNN  # omit key entirely if ARCH not present
   analysis: ANALYSIS-NNN  # omit key entirely if ANALYSIS not present
   prepared_by: <author>
   date: <YYYY-MM-DD>
   recommendation: <GO | CONDITIONAL-GO | NO-GO>
   related_docs:
     - openspec/userstories/US-NNN-<kebab>.story.md
     - openspec/specs/SPEC-NNN-<kebab>.spec.md
     # add architecture / analysis lines only if those files exist
   ---
   ```
2. `# CCN-NNN — <Title>` H1.
3. A leading blockquote summarising the CCN purpose and linking to US / SPEC / ARCH / ANALYSIS, plus an explicit one-line statement of which monetary / hour data is included or excluded (echoes the Step 3 interview answer).
4. Sections §1–§10 in the exact order from the table in Step 5. **All H2/H3 section headings remain in canonical English regardless of `language`.** Only the prose paragraphs, list item text, and table-cell values inside each section are translated to the target language.

### Step 9 — Confirm and report

After writing, report to the user:

- Path of the created CCN file (as a markdown link).
- The allocated `CCN-NNN` id and language (`en` / `es`).
- A 1-line summary of the interview answers (`include_costs`, `include_hours`, `scenarios`).
- The verdict pulled from ANALYSIS (or "no analysis available" if absent).
- The list of `<!-- DIAGRAM: mermaid ... -->` markers inserted, with their `name` attributes.
- The next recommended action: feed the CCN through the `md-to-docx-converter` skill with the CCN-specific Word template once the sign-off table in §10 has been countersigned.

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

- **status MUST always be `Pending Approval`** on initial creation. **version MUST be `1.0`**.
- **The `prepared_by` frontmatter field is mandatory.** It must contain the full name of the human user — never an agent role or agent name. If the author name is not evident from context (git user, previous artefacts, or explicit user input), ask the user before writing the file.
- **Default folder is `docs/ccn/`** for `language = en`; switch to `docs/<lang>-ccn/` for any other language (lowercase BCP-47 primary subtag). Never ask, never write elsewhere.
- **File extension MUST be `.md`** (no `.ccn.md` suffix — the CCN convention uses plain `.md`).
- **Never** create a CCN file without at least US and SPEC frontmatter resolved.
- **Never** include cost figures when `include_costs = no` — strip both the cost table and any EUR symbols from the rest of the document.
- **Never** include hours when `include_hours = no` — replace §6 with the one-line omission statement.
- **Never** invent scenarios that are not present in ANALYSIS.
- **Never** include AL source code. Object names, IDs, table relations, and prose only.
- **Never** overwrite an existing CCN file. On collision, re-allocate the CCN ID.
- **Section headings, frontmatter keys, §1 Header field labels, table column headers, diagram marker attributes, and verdict tokens MUST be in canonical English and byte-stable across runs and across every supported language** — the downstream Word template and the `md-to-docx-converter` JSON extraction depend on them. Translation only ever applies to the content layer (prose, list items, table cell values).
- **Every diagrammable block MUST be wrapped with `<!-- DIAGRAM: mermaid type=… name=… -->` / `<!-- /DIAGRAM -->` markers AND MUST contain a ```mermaid fenced block with valid Mermaid source matching the declared `type`** — no exceptions. The optional ASCII art above the ```mermaid fence is for human readability of the markdown only; the docx converter only renders the `mermaid` source.
- The `recommendation:` frontmatter field MUST match the verdict heading in §9 exactly.
- §1 Header field labels MUST be **bold-wrapped** (`| **Label** | Value |`) so the converter's metadata extractor recognises them.

## References

- `references/ccn-template.md` — full markdown skeleton with frontmatter, §1 Header table layout, all 10 section headings, diagram-marker placement examples, and placeholder tokens for both languages.
- `references/ccn-fields.json` — canonical, language-neutral static field/section keys (skill-local copy, kept in sync with `.github/skills/shared/field-map.json`) used to drive the mandatory JSON output (below) and the CCN Word template consumed by `md-to-docx-converter`.

## Mandatory JSON output

On **every** invocation, in addition to writing the CCN `.md` file the skill MUST also write a sibling JSON file:

- Path: same folder as the markdown (`docs/ccn/` for `language = en`, `docs/<lang>-ccn/` otherwise), filename pattern `CCN-NNN-<kebab-title>.json` (see `outputJson.filePattern` in `references/ccn-fields.json`).
- Encoding: UTF-8, pretty-printed (2-space indent).
- Shape:
  ```json
  {
    "artifactType": "CCN",
    "id": "CCN-NNN",
    "language": "<bcp47-primary-subtag>",
    "frontmatter":   { "<yamlKey>": "<value>", ... },
    "headerFields":  { "<CcnMetadataKey>": "<value, translated where translateValue=true>", ... },
    "sections":      { "<CanonicalKey>": "<markdown body of the section, translated>", ... }
  }
  ```
- **Keys** MUST come **verbatim** from `references/ccn-fields.json`: `frontmatterFields[].key` → `frontmatter`, `ccnMetadataFields[].key` → `headerFields` (these populate the §1 Header table), and `sections[].key` → `sections` (the ten CCN §1–§10 bodies). They are byte-stable across runs and languages so they can bind 1:1 to placeholder tokens in the CCN Word template.
- **Values** carry the content in the chosen target language. Anything where `translateValue: false` in the map (IDs, dates, enum tokens like `GO`/`CONDITIONAL-GO`/`NO-GO`) MUST remain in its canonical form regardless of `language`.
- The H2 anchor rule already mandated by the CCN hard rules (`<!-- section-key: <CanonicalKey> -->` immediately after every H2) is what allows the same map to be reconstructed by parsing the `.md` after the fact.
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