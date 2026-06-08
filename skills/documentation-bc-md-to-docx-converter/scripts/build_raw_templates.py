"""Regenerate the six "- Raw" placeholder-only Word templates.

For each documentation skill (UserStory, Spec, Analysis, Architecture, CCN, ReleaseNote) we read the
canonical key map in `<skill>/references/<artifact>-fields.json` and produce a
.docx whose content is exclusively `{{Key}}` placeholders (one per paragraph),
in this order:

  1. Every `frontmatterFields[].key` (PascalCase canonical key).
  2. Every `sections[].key` (PascalCase canonical key).

No labels, headings, instructional text, or styling — only placeholders.
"""

from __future__ import annotations

import json
from pathlib import Path

from docx import Document

REPO_ROOT = Path(__file__).resolve().parents[3].parent  # → al-mat-custom-ops
SKILLS_ROOT = REPO_ROOT / ".github" / "skills"
TEMPLATES_DIR = SKILLS_ROOT / "documentation-bc-md-to-docx-converter" / "templates"

TARGETS = [
    ("documentation-bc-user-story-generator",     "user-story-fields.json",   "1_UserStory_Template - Raw.docx"),
    ("documentation-bc-technical-spec-generator", "spec-fields.json",         "2_Spec_Template - Raw.docx"),
    ("documentation-bc-analysis-generator",       "analysis-fields.json",     "3_Analysis_Template - Raw.docx"),
    ("documentation-bc-architecture-generator",   "architecture-fields.json", "4_Architecture_Template - Raw.docx"),
    ("documentation-bc-ccn-generator",            "ccn-fields.json",          "5_CCN_Template - Raw.docx"),
    ("documentation-bc-release-note-generator",   "release-note-fields.json", "6_ReleaseNote_Template - Raw.docx"),
]


def build_template(field_map_path: Path, output_path: Path) -> int:
    data = json.loads(field_map_path.read_text(encoding="utf-8"))
    keys: list[str] = []
    seen: set[str] = set()

    def _add(k: str) -> None:
        if k and k not in seen:
            keys.append(k)
            seen.add(k)

    # 1. frontmatterFields — camelCase keys that become {{key}} placeholders
    for f in data.get("frontmatterFields", []):
        _add(f["key"])

    # 2. Any extra *Fields groups (e.g. ccnMetadataFields) — PascalCase keys
    for group_name, group_value in data.items():
        if (
            group_name.endswith("Fields")
            and group_name != "frontmatterFields"
            and isinstance(group_value, list)
        ):
            for f in group_value:
                _add(f.get("key", ""))

    # 3. sections — PascalCase keys
    for s in data.get("sections", []):
        _add(s["key"])

    doc = Document()
    for k in keys:
        doc.add_paragraph("{{" + k + "}}")
    doc.save(output_path)
    return len(keys)


def main() -> None:
    for skill_folder, fields_filename, docx_name in TARGETS:
        field_map = SKILLS_ROOT / skill_folder / "references" / fields_filename
        out = TEMPLATES_DIR / docx_name
        count = build_template(field_map, out)
        print(f"OK {out.name} — {count} placeholders ({skill_folder})")


if __name__ == "__main__":
    main()
