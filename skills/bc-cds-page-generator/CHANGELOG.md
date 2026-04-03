# Changelog

All notable changes to bc-cds-page-generator will be documented in this file.

## [2.1.0] - 2025-03-22

### Changed
- Made author prefix configurable instead of hardcoded "BCS"
- Updated all documentation to clarify that "BCS" is the author's prefix, not a required pattern
- Moved EXAMPLES.md to `references/examples.md` for consistency with skill structure
- Moved README.md to `references/quick-start.md` for better organization
- Updated Quick Reference section to show prefix replacement pattern

### Added
- Author prefix as prerequisite in skill documentation
- Step 1 now includes identifying author prefix
- Clear instructions in examples to replace "BCS" with user's own prefix
- Pattern summary table in examples for quick reference
- `references/quick-start.md` with enhanced workflows and troubleshooting

### Improved
- Skill now adapts to any organization's naming conventions
- Examples include common adaptations section
- Better guidance on field selection based on entity type

## [2.0.0] - 2025-06-16

### Changed
- **BREAKING**: Restructured SKILL.md following GitHub Copilot Skills best practices
- Moved detailed field layout patterns to `references/field-layout.md`
- Moved standard components (actions, triggers, procedures) to `references/standard-components.md`
- Reduced SKILL.md from ~500 lines to ~180 lines using progressive disclosure
- Updated SKILL.md header with YAML frontmatter metadata

### Added
- Created `references/` folder for detailed pattern documentation
- Created `references/field-layout.md` with comprehensive field organization patterns
- Created `references/standard-components.md` with complete component implementations
- Added AUTHORS.md for attribution
- Added this CHANGELOG.md for version tracking
- Enhanced field visibility guidelines with entity-specific patterns
- Added complete working examples for Country, Department, and Legal Entity

### Improved
- Clearer workflow steps with decision points
- Better integration with related skills documentation
- Enhanced troubleshooting section
- More explicit component checklist

## [1.0.0] - 2024-12-15

### Added
- Initial release of bc-cds-page-generator skill
- Complete page structure patterns for CDS list pages
- Field layout and organization guidelines
- Standard components (CreateFromCDS action, OnInit trigger, SetCurrentlyCoupled procedure)
- Working examples from BCS CDS Countries implementation
- ToolTip formatting guidelines
- Integration patterns with CRM Integration Management

---

*This file is for version tracking only and is never loaded into GitHub Copilot's context.*
