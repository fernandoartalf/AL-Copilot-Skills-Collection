# Changelog

All notable changes to the BC Business Events Generator skill will be documented in this file.

## [1.0.0] - 2026-03-25

### Added

#### Core Skill Structure
- Initial release of bc-business-events-generator skill
- Progressive disclosure pattern with <500 line SKILL.md and detailed references/code-templates.md
- Comprehensive YAML frontmatter with trigger coverage (845+ chars description)

#### Event Category Implementation
- Enum extension templates for EventCategory
- Support for single and multiple category patterns
- Naming convention guidelines for business-focused categories

#### Business Events Codeunit
- Complete codeunit structure with event subscribers and external business events
- Organizational patterns for multiple events
- Section separation best practices

#### Event Subscriber Patterns
- Table lifecycle event subscription templates
- Standard BC posting event patterns
- Conditional event firing with business logic
- Event discovery guidance using AL Explorer

#### External Business Event Procedures
- ExternalBusinessEvent attribute templates with all parameters
- Parameter design best practices (SystemId-first, business-relevant data)
- Data type considerations and guidelines
- Event naming conventions (camelCase, descriptive)

#### Integration Event Publishers
- Table extension IntegrationEvent templates
- Codeunit IntegrationEvent patterns
- Trigger placement guidance

#### Complete Working Examples
- Statistical Accounts business events (from BC-Scout-Path repo)
- Integration with Power Automate cloud flows
- End-to-end implementation walkthrough

#### Advanced Patterns
- Conditional events with status change detection
- Threshold-based events (inventory, limits)
- Batch process events for multi-record operations
- Error events for failure scenarios
- Multi-entity events for related data

#### Monitoring and Debugging
- Business Event Subscriptions page integration
- Business Event Activity Log usage
- Business Event Notifications tracking
- Transaction rollback behavior documentation
- Power Automate testing patterns

#### Documentation
- 12-step implementation workflow
- Conceptual architecture diagram
- Best practices for event design
- Troubleshooting guide for common issues
- Related skills references

### Technical Details
- SKILL.md: 304 lines (61% under 500-line target)
- Description: 845 characters (under 1024 limit)
- references/code-templates.md: Comprehensive AL code examples
- Agent Skills standard compliant (agentskills.io)

### Related Skills
- bc-api-page-generator: RESTful API integration patterns
- skill-events: Internal AL event patterns
- skill-api: General BC API development

---

**Version Format**: [Major.Minor.Patch]
- **Major**: Breaking changes to skill structure or workflow
- **Minor**: New patterns, examples, or significant enhancements
- **Patch**: Bug fixes, clarifications, minor improvements
