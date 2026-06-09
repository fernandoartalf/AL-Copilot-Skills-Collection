# Changelog

All notable changes to the `documentation-bc-md-to-docx-converter` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-09

### Added

- Initial skill creation
- Three-stage conversion pipeline: parse markdown into named sections → generate JSON field map → substitute `{{Placeholder}}` tokens in Word template
- Mermaid diagram rendering: DIAGRAM-mermaid marker blocks converted to PNG via Mermaid CLI (`mmdc`) and inserted inline in the docx
- `scripts/convert_md_to_docx.py`: main conversion script using python-docx
- `scripts/build_raw_templates.py`: utility to build raw template variants from ALCSC-branded templates
- `scripts/verify_docx_placeholders.py`: utility to verify placeholder substitution completeness
- `scripts/requirements.txt`: Python dependency manifest
- Six ALCSC-branded Word templates (`.docx`):
  - `1_UserStory_Template_ALCSC.docx`
  - `2_Spec_Template_ALCSC.docx`
  - `3_Analysis_Template_ALCSC.docx`
  - `4_Architecture_Template_ALCSC.docx`
  - `5_CCN_Template_ALCSC.docx`
  - `6_ReleaseNote_Template_ALCSC.docx`
- Six raw template variants (`* - Raw.docx`) for custom branding
- `tests/test_section_key_binding.py`: test suite for section-to-placeholder key binding
