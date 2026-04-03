# Changelog

All notable changes to the BC Attachments Generator skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-22

### Added
- Initial skill creation for adding attachments, links, and notes to custom BC tables
- 10-step workflow for complete implementation
- Setup table fields for visibility control (Enable Attachments, Enable Links, Enable Notes)
- Enum extension for custom "Attachment Document Type" values
- Attachment management codeunit with 3 event subscribers:
  - OnBeforeDrillDown (for obsolete factbox)
  - OnAfterOpenForRecRef (Document Attachment Details)
  - OnAfterInitFieldsFromRecRef (initialization from RecordRef)
- Visibility control procedures (EntityEnabledAttachments, EntityEnabledLinks, EntityEnabledNotes)
- Lifecycle management procedures (DeleteRelatedDocumentAttachments, CopyRelatedDocumentAttachments)
- Table extension triggers for orphan prevention (OnBeforeDelete, OnBeforeRename)
- Page extension patterns for Card and List pages with factboxes
- Support for both legacy and modern factboxes (BC 25.0 compatibility)
- Comprehensive troubleshooting section with 5 common issues
- 3 implementation patterns (single entity, existing entity, multi-entity)
- Examples for custom workflows, attachment count display, and Power Automate integration
- Complete testing checklist with 11 verification points
- Storage best practices and SharePoint integration recommendations

### Prerequisites
- Microsoft Dynamics 365 Business Central
- AL Language Extension
- Business Central wave 1 2024 (BC 24.0) or higher recommended
- Existing custom table to enhance

### Documentation
- Added AUTHORS.md with attribution to Fernando Artigas
- Added CHANGELOG.md for version tracking
- Based on real-world implementation in BC Scout Statistical Accounts extension
- Referenced blog article and sample code repository

### Known Limitations
- Control IDs for Links/Notes factboxes (1900383207, 1905767507) may vary between BC versions
- Legacy "Document Attachment Factbox" is obsolete in BC 25.0 but included for backward compatibility
- Requires manual inspection of base pages to find correct control IDs

## [Unreleased]

### Planned
- Add support for document categories and types
- Include examples for custom attachment validation rules
- Add integration patterns for SharePoint document libraries
- Create sample test codeunit for attachment functionality
- Add performance optimization tips for large attachment volumes

---

## Version History Notes

### Version Format
- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Breaking changes or significant reorganization
- **Minor**: New features or enhancements
- **Patch**: Bug fixes and documentation improvements

### Change Categories
- **Added**: New features or capabilities
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
- **Documentation**: Documentation improvements
