# Custom Skills Creation Guidelines

## Overview

This instruction file provides comprehensive guidelines and best practices for creating custom Skills for Claude. Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools.

Skills follow the open [Agent Skills](https://agentskills.io/) standard — a portable format adopted by multiple agent products (Claude Code, Cursor, Roo Code, GitHub, and others). Skills you create following this guide work across any compatible agent.

## What Are Skills?

Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks. Think of them as "onboarding guides" for specific domains or tasks—they transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge.

### What Skills Provide

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific file formats or APIs
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex and repetitive tasks

### How Skills Load (Three Levels)

Understanding how skills load helps you author them effectively:

| Level | When Loaded | Token Cost | Content |
|-------|------------|------------|---------|
| **1. Metadata** | Always (at startup) | ~100 tokens per Skill | `name` and `description` from YAML frontmatter |
| **2. Instructions** | When Skill is triggered | Under 5k tokens | SKILL.md body with instructions and guidance |
| **3. Resources** | As needed | Effectively unlimited | Bundled files read or executed via bash |

Only metadata is pre-loaded. Claude reads SKILL.md only when the Skill becomes relevant, and reads additional files only as needed. This progressive disclosure ensures only relevant content occupies the context window.

## Core Principles

### 1. Concise is Key

The context window is a shared resource. Your Skill competes with the system prompt, conversation history, other Skills' metadata, and the user's actual request.

**Default assumption: Claude is already very smart.** Only add context Claude doesn't already have. Challenge each piece of information:

- "Does Claude really need this explanation?"
- "Can I assume Claude knows this?"
- "Does this paragraph justify its token cost?"

Good example (~50 tokens):
```markdown
## Extract PDF text
Use pdfplumber for text extraction:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

Bad example (~150 tokens):
```markdown
## Extract PDF text
PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but
pdfplumber is recommended because it's easy to use and handles most cases well.
First, you'll need to install it using pip. Then you can use the code below...
```

The best skills:
- Solve a specific, repeatable task
- Have clear instructions that Claude can follow
- Include examples when helpful
- Define when they should be used
- Focus on one workflow rather than trying to do everything

### 2. Set Appropriate Degrees of Freedom

Match the level of specificity to the task's fragility and variability:

- **High freedom (text-based instructions)**: Use when multiple approaches are valid, decisions depend on context, or heuristics guide the approach
- **Medium freedom (pseudocode or scripts with parameters)**: Use when a preferred pattern exists, some variation is acceptable, or configuration affects behavior
- **Low freedom (specific scripts, few parameters)**: Use when operations are fragile and error-prone, consistency is critical, or a specific sequence must be followed

Think of Claude as a robot exploring a path: a narrow bridge with cliffs on both sides needs specific guardrails (low freedom), while an open field with no hazards allows many routes (high freedom).

### 3. Progressive Disclosure Design Principle

Keep SKILL.md body to the essentials and under 500 lines to minimize context bloat. Split content into separate files when approaching this limit.

**Key principle:** When a skill supports multiple variations, frameworks, or options, keep only the core workflow and selection guidance in SKILL.md. Move variant-specific details (patterns, examples, configuration) into separate reference files.

### 4. Use Consistent Terminology

Choose one term and use it throughout the Skill:

- **Good (consistent):** Always "API endpoint", always "field", always "extract"
- **Bad (inconsistent):** Mix of "API endpoint"/"URL"/"API route"/"path", "field"/"box"/"element", "extract"/"pull"/"get"/"retrieve"

### 5. Avoid Time-Sensitive Information

Don't include information that will become outdated. Use "old patterns" sections for deprecated approaches:

```markdown
## Current method
Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns
<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>
The v1 API used: `api.example.com/v1/messages`
This endpoint is no longer supported.
</details>
```

## Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)        - Main instructions (loaded when triggered)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
├── AUTHORS.md (required)      - Skill authorship info (NEVER loaded into context)
├── CHANGELOG.md (required)    - Version history (NEVER loaded into context)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

### SKILL.md (required)

Every SKILL.md consists of:

- **Frontmatter** (YAML): Contains `name` and `description` fields. These are the only fields that Claude reads to determine when the skill gets used, thus it is very important to be clear and comprehensive in describing what the skill is, and when it should be used.
- **Body** (Markdown): Instructions and guidance for using the skill. Only loaded AFTER the skill triggers (if at all).

**Do not include any other fields in YAML frontmatter.**

#### Naming Conventions

Use consistent naming patterns to make Skills easier to reference and discover:

**Field requirements for `name`:**
- Maximum 64 characters
- Must contain only lowercase letters, numbers, and hyphens
- Cannot contain XML tags
- Cannot contain reserved words: "anthropic", "claude"

**Prefer gerund form** (verb + -ing) as this clearly describes the activity:
- `processing-pdfs`, `analyzing-spreadsheets`, `managing-databases`, `writing-documentation`

**Acceptable alternatives:**
- Noun phrases: `pdf-processing`, `spreadsheet-analysis`
- Action-oriented: `process-pdfs`, `analyze-spreadsheets`

**Avoid:**
- Vague names: `helper`, `utils`, `tools`
- Overly generic: `documents`, `data`, `files`
- Reserved words: `anthropic-helper`, `claude-tools`
- Inconsistent naming patterns within your skill collection

#### Writing Effective Descriptions

The `description` field is the **primary triggering mechanism** — Claude uses it to choose the right Skill from potentially 100+ available Skills.

**Field requirements for `description`:**
- Must be non-empty
- Maximum 1024 characters
- Cannot contain XML tags

**Always write in third person.** The description is injected into the system prompt, and inconsistent point-of-view causes discovery problems.
- Good: "Processes Excel files and generates reports"
- Avoid: "I can help you process Excel files"
- Avoid: "You can use this to process Excel files"

**Be specific and include key terms.** Each Skill has exactly one description. Include both what the Skill does and specific triggers/contexts for when to use it.

**Include ALL "when to use" information in the description — NOT in the body.** The body is only loaded after triggering, so "When to Use This Skill" sections in the body are not helpful to Claude.

**Effective examples:**

```yaml
# PDF Processing skill
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

# Excel Analysis skill
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.

# Git Commit Helper skill
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

**Avoid vague descriptions:**
```yaml
description: Helps with documents        # Too vague
description: Processes data               # Too generic
description: Does stuff with files        # Uninformative
```

### Bundled Resources (optional)

#### Scripts (`scripts/`)

Executable code (Python/Bash/etc.) for tasks that require deterministic reliability or are repeatedly rewritten.

- **When to include**: When the same code is being rewritten repeatedly or deterministic reliability is needed
- **Example**: `scripts/rotate_pdf.py` for PDF rotation tasks
- **Benefits**: Token efficient, deterministic, may be executed without loading into context
- **Note**: Scripts may still need to be read by Claude for patching or environment-specific adjustments

#### References (`references/`)

Documentation and reference material intended to be loaded as needed into context to inform Claude's process and thinking.

- **When to include**: For documentation that Claude should reference while working
- **Examples**: `references/finance.md` for financial schemas, `references/mnda.md` for company NDA template, `references/policies.md` for company policies, `references/api_docs.md` for API specifications
- **Use cases**: Database schemas, API documentation, domain knowledge, company policies, detailed workflow guides
- **Benefits**: Keeps SKILL.md lean, loaded only when Claude determines it's needed
- **Best practice**: If files are large (>10k words), include grep search patterns in SKILL.md
- **Avoid duplication**: Information should live in either SKILL.md or references files, not both. Prefer references files for detailed information unless it's truly core to the skill—this keeps SKILL.md lean while making information discoverable without hogging the context window.

#### Assets (`assets/`)

Files not intended to be loaded into context, but rather used within the output Claude produces.

- **When to include**: When the skill needs files that will be used in the final output
- **Examples**: `assets/logo.png` for brand assets, `assets/slides.pptx` for PowerPoint templates, `assets/frontend-template/` for HTML/React boilerplate, `assets/font.ttf` for typography
- **Use cases**: Templates, images, icons, boilerplate code, fonts, sample documents that get copied or modified
- **Benefits**: Separates output resources from documentation, enables Claude to use files without loading them into context

### AUTHORS.md (required)

Authorship and attribution metadata. This file is **never loaded into context** — it exists purely for human reference, skill discovery, and credit attribution. Do NOT reference this file from SKILL.md.

**Required fields for the primary author:**
- Full name
- GitHub username
- GitHub profile URL
- LinkedIn profile URL

**Optional fields:**
- Email
- Organization / company
- Role / title
- Website / portfolio URL

**Co-authors:** The file supports multiple co-authors, each with the same field structure.

**Template:**

```markdown
# Authors

## Primary Author

- **Full Name**: Jane Doe
- **GitHub**: @janedoe
- **GitHub Profile**: https://github.com/janedoe
- **LinkedIn**: https://linkedin.com/in/janedoe
- **Organization**: Acme Corp
- **Role**: Senior Developer
- **Email**: jane.doe@acme.com
- **Website**: https://janedoe.dev

## Co-Authors

### John Smith

- **Full Name**: John Smith
- **GitHub**: @johnsmith
- **GitHub Profile**: https://github.com/johnsmith
- **LinkedIn**: https://linkedin.com/in/johnsmith
- **Organization**: Acme Corp
- **Role**: AL Developer
```

### CHANGELOG.md (required)

Version history tracking all changes to the skill. This file is **never loaded into context** — it exists purely for human reference and auditing. Do NOT reference this file from SKILL.md.

Each entry must include:
- **Version number** (semantic versioning: MAJOR.MINOR.PATCH)
- **Date** (YYYY-MM-DD format)
- **GitHub username** of the person who made the change
- **Description** of changes

**Template:**

```markdown
# Changelog

All notable changes to this skill are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [1.1.0] - 2026-03-18 - @janedoe

### Added
- New validation script for form fields
- Reference file for advanced PDF features

### Changed
- Updated description to include additional trigger phrases

## [1.0.1] - 2026-02-10 - @johnsmith

### Fixed
- Corrected file path in workflow step 3

## [1.0.0] - 2026-01-15 - @janedoe

### Added
- Initial skill release
- Core workflow for PDF processing
- Utility scripts: extract_text.py, validate_output.py
```

> **Important:** Neither AUTHORS.md nor CHANGELOG.md should ever be referenced from SKILL.md. They sit on the filesystem at zero token cost and serve only as human-readable metadata for attribution and audit purposes.

## Skill Creation Process

Follow these steps in order, skipping only if there is a clear reason why they are not applicable:

### Step 1: Understanding the Skill with Concrete Examples

To create an effective skill, clearly understand concrete examples of how the skill will be used. This understanding can come from either direct user examples or generated examples that are validated with user feedback.

For example, when building an image-editor skill, relevant questions include:
- "What functionality should the image-editor skill support? Editing, rotating, anything else?"
- "Can you give some examples of how this skill would be used?"
- "I can imagine users asking for things like 'Remove the red-eye from this image' or 'Rotate this image'. Are there other ways you imagine this skill being used?"
- "What would a user say that should trigger this skill?"

Conclude this step when there is a clear sense of the functionality the skill should support.

### Step 2: Planning the Reusable Skill Contents

To turn concrete examples into an effective skill, analyze each example by:

1. Considering how to execute on the example from scratch
2. Identifying what scripts, references, and assets would be helpful when executing these workflows repeatedly

**Example 1:** When building a `pdf-editor` skill to handle queries like "Help me rotate this PDF," the analysis shows:
1. Rotating a PDF requires re-writing the same code each time
2. A `scripts/rotate_pdf.py` script would be helpful to store in the skill

**Example 2:** When building a `frontend-webapp-builder` skill for queries like "Build me a todo app," the analysis shows:
1. Writing a frontend webapp requires the same boilerplate HTML/React each time
2. An `assets/hello-world/` template containing the boilerplate HTML/React project files would be helpful to store in the skill

**Example 3:** When building a `big-query` skill to handle queries like "How many users have logged in today?" the analysis shows:
1. Querying BigQuery requires re-discovering the table schemas and relationships each time
2. A `references/schema.md` file documenting the table schemas would be helpful to store in the skill

### Step 3: Initializing the Skill

When creating a new skill from scratch, always use the following structure:

1. Create the skill directory
2. Create SKILL.md with proper YAML frontmatter
3. Create AUTHORS.md with the skill author's information (see [AUTHORS.md template](#authorsmd-required))
4. Create CHANGELOG.md with the initial `[1.0.0]` entry (see [CHANGELOG.md template](#changelogmd-required))
5. Create resource directories as needed: `scripts/`, `references/`, and `assets/`
6. Add example files in each directory that can be customized or deleted

> **Reminder:** Do NOT reference AUTHORS.md or CHANGELOG.md from SKILL.md — they must never be loaded into context.

### Step 4: Edit the Skill

When editing the skill, remember that the skill is being created for another instance of Claude to use. Include information that would be beneficial and non-obvious to Claude.

#### Learn Proven Design Patterns

Consult these helpful guides based on your skill's needs:

- **Multi-step processes**: Use sequential workflows and conditional logic
- **Specific output formats or quality standards**: Use template and example patterns

#### Start with Reusable Skill Contents

Begin implementation with the reusable resources identified above: `scripts/`, `references/`, and `assets/` files.

Added scripts must be tested by actually running them to ensure there are no bugs and that the output matches what is expected.

Any example files and directories not needed for the skill should be deleted.

#### Update SKILL.md

##### Frontmatter

Write the YAML frontmatter with `name` and `description` following the naming conventions and description guidelines in the [SKILL.md section](#skillmd-required) above.

**Do not include any other fields in YAML frontmatter.**

##### Body

The body should contain:
1. Clear instructions for using the skill
2. Workflow guidance
3. Examples when helpful
4. References to scripts, assets, and reference files

**Keep SKILL.md focused and under 500 lines.** When approaching this limit, split content into reference files.

### Step 5: Packaging a Skill

Once development of the skill is complete, it must be packaged into a distributable .skill file:

1. **Ensure the folder name matches your Skill's name**
2. **Create a ZIP file of the folder**
3. **The ZIP should contain the Skill folder as its root (not a subfolder)**

Correct structure:
```
my-skill.zip
  └── my-skill/
      ├── SKILL.md
      └── resources/
```

Incorrect structure:
```
my-skill.zip
  └── (files directly in ZIP root)
```

### Step 6: Iterate

Test and refine the skill based on real usage:

1. Enable the Skill in Settings > Capabilities
2. Try several different prompts that should trigger it
3. Review Claude's thinking to confirm it's loading the Skill
4. Iterate on the description if Claude isn't using it when expected

## Skill Structure Patterns

Choose the structure that best fits your skill's purpose:

### 1. Workflow-Based (best for sequential processes)
- Works well when there are clear step-by-step procedures
- Example: DOCX skill with "Workflow Decision Tree" → "Reading" → "Creating" → "Editing"
- Structure: ## Overview → ## Workflow Decision Tree → ## Step 1 → ## Step 2...

### 2. Task-Based (best for tool collections)
- Works well when the skill offers different operations/capabilities
- Example: PDF skill with "Quick Start" → "Merge PDFs" → "Split PDFs" → "Extract Text"
- Structure: ## Overview → ## Quick Start → ## Task Category 1 → ## Task Category 2...

### 3. Reference/Guidelines (best for standards or specifications)
- Works well for brand guidelines, coding standards, or requirements
- Example: Brand styling with "Brand Guidelines" → "Colors" → "Typography" → "Features"
- Structure: ## Overview → ## Guidelines → ## Specifications → ## Usage...

### 4. Capabilities-Based (best for integrated systems)
- Works well when the skill provides multiple interrelated features
- Example: Product Management with "Core Capabilities" → numbered capability list
- Structure: ## Overview → ## Core Capabilities → ### 1. Feature → ### 2. Feature...

Patterns can be mixed and matched as needed.

## Progressive Disclosure Patterns

### Avoid Deeply Nested References

Claude may partially read files when they're referenced from other referenced files. Keep references **one level deep** from SKILL.md. All reference files should link directly from SKILL.md.

Bad example (too deep):
```markdown
# SKILL.md
See [advanced.md](advanced.md)...

# advanced.md
See [details.md](details.md)...

# details.md
Here's the actual information...
```

Good example (one level deep):
```markdown
# SKILL.md
**Basic usage**: [instructions in SKILL.md]
**Advanced features**: See [advanced.md](advanced.md)
**API reference**: See [reference.md](reference.md)
**Examples**: See [examples.md](examples.md)
```

### Pattern 1: High-level guide with references

```markdown
# PDF Processing

## Quick start

Extract text with pdfplumber:
[code example]

## Advanced features

- **Form filling**: See [FORMS.md](FORMS.md) for complete guide
- **API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
- **Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

Claude loads FORMS.md, REFERENCE.md, or EXAMPLES.md only when needed.

### Pattern 2: Domain-specific organization

For Skills with multiple domains, organize content by domain to avoid loading irrelevant context:

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

When a user asks about sales metrics, Claude only reads sales.md.

### Pattern 3: Conditional details

Show basic content, link to advanced content:

```markdown
# DOCX Processing

## Creating documents
Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents
For simple edits, modify the XML directly.
**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

Claude reads REDLINING.md or OOXML.md only when the user needs those features.

### Pattern 4: Longer reference files

For files longer than 100 lines, include a table of contents at the top so Claude can see the full scope when previewing.

## Output Patterns

### Template Pattern

Provide templates for output format. Match the level of strictness to your needs.

**For strict requirements (like API responses or data formats):**

```markdown
## Report structure

ALWAYS use this exact template structure:

# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```

**For flexible guidance (when adaptation is useful):**

```markdown
## Report structure

Here is a sensible default format, but use your best judgment:

# [Analysis Title]

## Executive summary
[Overview]

## Key findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to the specific context]

Adjust sections as needed for the specific analysis type.
```

### Examples Pattern

For skills where output quality depends on seeing examples, provide input/output pairs:

```markdown
## Commit message format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

Follow this style: type(scope): brief description, then detailed explanation.
```

## Workflow Patterns

### Sequential Workflows with Checklists

For complex tasks, break operations into clear, sequential steps. For particularly complex workflows, provide a checklist that Claude can copy into its response and check off as it progresses:

```markdown
## PDF form filling workflow

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```

**Step 1: Analyze the form**
Run: `python scripts/analyze_form.py input.pdf`
This extracts form fields and their locations, saving to `fields.json`.

**Step 2: Create field mapping**
Edit `fields.json` to add values for each field.

**Step 3: Validate mapping**
Run: `python scripts/validate_fields.py fields.json`
Fix any validation errors before continuing.

**Step 4: Fill the form**
Run: `python scripts/fill_form.py input.pdf fields.json output.pdf`

**Step 5: Verify output**
Run: `python scripts/verify_output.py output.pdf`
If verification fails, return to Step 2.
```

### Conditional Workflows

For tasks with branching logic, guide Claude through decision points:

```markdown
1. Determine the modification type:
   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow: [steps]
3. Editing workflow: [steps]
```

If workflows get large or complicated, push them into separate files and tell Claude to read the appropriate file based on the task.

### Feedback Loops

Implement validate-fix-repeat loops to greatly improve output quality:

```markdown
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python ooxml/scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
6. Test the output document
```

This pattern also works without code — use reference documents (like STYLE_GUIDE.md) as the "validator" where Claude performs the check by reading and comparing.

### Verifiable Intermediate Outputs

For complex, open-ended tasks, use the "plan-validate-execute" pattern to catch errors early:

1. Claude creates a plan in a structured format (e.g., `changes.json`)
2. A validation script checks the plan before execution
3. Only after passing validation does Claude execute the plan

**Why this works:** Catches errors early, provides machine-verifiable checkpoints, keeps planning reversible, and gives clear debugging evidence.

## Best Practices

### Keep it focused
Create separate Skills for different workflows. Multiple focused Skills compose better than one large Skill.

### Write clear descriptions
Claude uses descriptions to decide when to invoke your Skill. Be specific about when it applies. Include all "when to use" information in the description, not the body.

### Start simple
Begin with basic instructions in Markdown before adding complex scripts. You can always expand on the Skill later.

### Use examples
Include example inputs and outputs in your Skill.md file to help Claude understand what success looks like.

### Test incrementally
Test after each significant change rather than building a complex Skill all at once.

### Skills can build on each other
While Skills can't explicitly reference other Skills, Claude can use multiple Skills together automatically. This composability is one of the most powerful parts of the Skills feature.

### Avoid offering too many options
Don't present multiple approaches unless necessary. Provide a default with an escape hatch:

```markdown
# Good: Provide a default with escape hatch
Use pdfplumber for text extraction:
```python
import pdfplumber
```
For scanned PDFs requiring OCR, use pdf2image with pytesseract instead.
```

### Use forward slashes in file paths
Always use forward slashes, even on Windows:
- Good: `scripts/helper.py`, `reference/guide.md`
- Avoid: `scripts\helper.py`, `reference\guide.md`

### Name files descriptively
Use names that indicate content: `form_validation_rules.md`, not `doc2.md`.

### Review the open Agent Skills specification
Follow the guidelines at [agentskills.io](https://agentskills.io/), so skills you create can work across platforms that adopt the standard.

## Advanced: Skills with Executable Code

### Solve, Don't Punt

When writing scripts for Skills, handle error conditions rather than deferring to Claude:

Good example:
```python
def process_file(path):
    """Process a file, creating it if it doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, "w") as f:
            f.write("")
        return ""
    except PermissionError:
        print(f"Cannot access {path}, using default")
        return ""
```

Bad example:
```python
def process_file(path):
    # Just fail and let Claude figure it out
    return open(path).read()
```

### Document Configuration Constants

Avoid "voodoo constants" — justify and document all values:

```python
# Good: Self-documenting
# HTTP requests typically complete within 30 seconds
REQUEST_TIMEOUT = 30
# Three retries balances reliability vs speed
MAX_RETRIES = 3

# Bad: Magic numbers
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

### Provide Utility Scripts

Pre-made scripts are more reliable than generated code, save tokens, save time, and ensure consistency. Make the execution intent clear:
- "Run `analyze_form.py` to extract fields" (execute)
- "See `analyze_form.py` for the extraction algorithm" (read as reference)

### Package Dependencies

List required packages in SKILL.md and verify availability. Don't assume packages are installed:

```markdown
# Bad: Assumes installation
"Use the pdf library to process the file."

# Good: Explicit about dependencies
Install required package: `pip install pypdf`
Then use it:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```
```

### MCP Tool References

If your Skill uses MCP tools, always use fully qualified tool names: `ServerName:tool_name`

```markdown
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to create issues.
```

Without the server prefix, Claude may fail to locate the tool when multiple MCP servers are available.

## Evaluation and Iteration

### Build Evaluations First

Create evaluations BEFORE writing extensive documentation. This ensures your Skill solves real problems rather than documenting imagined ones.

**Evaluation-driven development:**

1. **Identify gaps:** Run Claude on representative tasks without a Skill. Document specific failures
2. **Create evaluations:** Build three scenarios that test these gaps
3. **Establish baseline:** Measure Claude's performance without the Skill
4. **Write minimal instructions:** Create just enough content to address gaps and pass evaluations
5. **Iterate:** Execute evaluations, compare against baseline, and refine

**Evaluation structure example:**
```json
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF file and save it to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "Successfully reads the PDF file using an appropriate library",
    "Extracts text content from all pages without missing any",
    "Saves the extracted text to output.txt in a clear format"
  ]
}
```

### Develop Skills Iteratively with Claude

Work with one instance of Claude ("Claude A") to create a Skill that is used by other instances ("Claude B"):

1. **Complete a task without a Skill**: Work through a problem with Claude A. Notice what information you repeatedly provide.
2. **Identify the reusable pattern**: What context would be useful for similar future tasks?
3. **Ask Claude A to create a Skill**: Claude models understand the Skill format natively.
4. **Review for conciseness**: Check that Claude A hasn't added unnecessary explanations.
5. **Improve information architecture**: Ask Claude A to organize content effectively (e.g., separate reference files).
6. **Test on similar tasks**: Use the Skill with Claude B (a fresh instance) on related use cases.
7. **Iterate based on observation**: If Claude B struggles, return to Claude A with specifics.

### Observe How Claude Navigates Skills

Watch for:
- **Unexpected exploration paths**: Claude reads files in an order you didn't anticipate → structure isn't intuitive
- **Missed connections**: Claude fails to follow references → links need to be more explicit
- **Overreliance on certain sections**: Claude repeatedly reads the same file → that content should be in SKILL.md
- **Ignored content**: Claude never accesses a bundled file → it might be unnecessary or poorly signaled

### Test with All Models You Plan to Use

Skills effectiveness depends on the underlying model:
- **Haiku (fast, economical)**: Does the Skill provide enough guidance?
- **Sonnet (balanced)**: Is the Skill clear and efficient?
- **Opus (powerful reasoning)**: Does the Skill avoid over-explaining?

What works perfectly for Opus might need more detail for Haiku. Aim for instructions that work well with all target models.

## Security Considerations

- Exercise caution when adding scripts to your SKILL.md file
- Don't hardcode sensitive information (API keys, passwords)
- Review any Skills you download before enabling them — treat Skills like installing software
- Use appropriate MCP connections for external service access
- Audit all bundled files for unusual patterns: unexpected network calls, file access patterns, or operations that don't match the Skill's stated purpose
- Skills that fetch data from external URLs pose particular risk, as fetched content may contain malicious instructions

## Checklist for Effective Skills

Before sharing a Skill, verify:

### Core Quality
- [ ] Description is specific and includes key terms
- [ ] Description includes both what the Skill does and when to use it
- [ ] Description is written in third person
- [ ] Name follows naming conventions (lowercase, hyphens, max 64 chars)
- [ ] SKILL.md body is under 500 lines
- [ ] Additional details are in separate files (if needed)
- [ ] No time-sensitive information (or in "old patterns" section)
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references are one level deep (no nested references)
- [ ] Progressive disclosure used appropriately
- [ ] Workflows have clear steps
- [ ] Feedback loops included for quality-critical tasks

### Code and Scripts
- [ ] Scripts solve problems rather than punt to Claude
- [ ] Error handling is explicit and helpful
- [ ] No "voodoo constants" (all values justified)
- [ ] Required packages listed in instructions and verified as available
- [ ] Scripts have clear documentation
- [ ] No Windows-style paths (all forward slashes)
- [ ] Validation/verification steps for critical operations
- [ ] MCP tools use fully qualified names (`ServerName:tool_name`)

### Testing
- [ ] At least three evaluations created
- [ ] Tested with real usage scenarios
- [ ] Tested with all target models (Haiku, Sonnet, Opus as applicable)
- [ ] Team feedback incorporated (if applicable)
- [ ] Claude's thinking reviewed to confirm Skill loads correctly

## Testing Your Skill

### Before Publishing

1. Review your SKILL.md for clarity and conciseness
2. Check that the description accurately reflects when Claude should use the Skill
3. Verify all referenced files exist in the correct locations
4. Test with example prompts to ensure Claude invokes it appropriately
5. Verify no hardcoded secrets or time-sensitive references

### After Publishing

1. Enable the Skill in Settings > Capabilities
2. Try several different prompts that should trigger it
3. Review Claude's thinking to confirm it's loading the Skill
4. Iterate on the description if Claude isn't using it when expected
5. Try prompts that should NOT trigger it to check for false positives

## What NOT to Include in a Skill

Avoid including:
- Overly broad capabilities that should be multiple skills
- Hardcoded sensitive information
- Dependencies that cannot be installed from standard repositories
- Redundant information (between SKILL.md and reference files)
- Excessive content in SKILL.md (keep under 500 lines)
- Explanations Claude already knows (challenge each paragraph's token cost)
- Time-sensitive dates or deadlines
- Multiple competing approaches without a clear default
- Deeply nested file references (keep to one level)
- Windows-style backslash paths

## Template Example

### Complete folder structure

```
processing-documents/
├── SKILL.md
├── AUTHORS.md
├── CHANGELOG.md
├── scripts/
│   ├── extract_text.py
│   └── validate_output.py
└── references/
    ├── forms-guide.md
    └── docx-editing.md
```

### SKILL.md

```markdown
---
name: processing-documents
description: Processes and transforms document files (.docx, .pdf) including text extraction, format conversion, and content analysis. Use when working with document files, converting between formats, or extracting structured content from documents.
---

# Document Processing

## Overview

Extracts, transforms, and analyzes document content across multiple formats.

## Quick Start

Extract text from a PDF:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Core Workflow

1. Determine the input format
2. Select the appropriate processing method
3. Execute extraction/transformation
4. Validate output quality

**For PDF forms**: See [references/forms-guide.md](references/forms-guide.md)
**For DOCX editing**: See [references/docx-editing.md](references/docx-editing.md)

## Utility Scripts

- `scripts/extract_text.py` - Extract text from any supported format
- `scripts/validate_output.py` - Verify output matches expectations
```

### AUTHORS.md

```markdown
# Authors

## Primary Author

- **Full Name**: Jane Doe
- **GitHub**: @janedoe
- **GitHub Profile**: https://github.com/janedoe
- **LinkedIn**: https://linkedin.com/in/janedoe
- **Organization**: Acme Corp
- **Role**: Senior Developer
```

### CHANGELOG.md

```markdown
# Changelog

All notable changes to this skill are documented in this file.

## [1.0.0] - 2026-01-15 - @janedoe

### Added
- Initial skill release
- Core workflow for document processing
- Utility scripts: extract_text.py, validate_output.py
- Reference files for PDF forms and DOCX editing
```

## Additional Resources

- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills Open Standard](https://agentskills.io/)
- [Skills Quickstart Tutorial](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/quickstart)
- [Agent Skills Cookbook](https://platform.claude.com/cookbook/skills-notebooks-01-skills-introduction)
- [What are Skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Using Skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Skills Examples Repository](https://github.com/anthropics/skills)
- [Equipping agents for the real world with Agent Skills](https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Use Skills in Claude Code](https://code.claude.com/docs/en/skills)
- [Use Skills with the API](https://platform.claude.com/docs/en/build-with-claude/skills-guide)

## Disclaimer

These guidelines are provided for demonstration and educational purposes. While these capabilities are available in Claude, implementations and behaviors may vary. Always test skills thoroughly in your own environment before relying on them for critical tasks.
