# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within the AL-Copilot-Skills-Collection, please follow these steps:

### 1. Do Not Publicly Disclose

Please **do not** create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send a detailed report via [GitHub Security Advisory](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/security/advisories/new).

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if available)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 30 days
  - Medium/Low: Next scheduled release

### 4. Disclosure Process

1. We will confirm receipt of your report
2. We will investigate and validate the issue
3. We will develop and test a fix
4. We will release a security patch
5. We will publicly acknowledge your contribution (if desired)

## Security Best Practices

When using this collection:

1. **Review Skills**: Always review skill instructions before accepting generated code
2. **Validate Output**: Verify that generated AL code matches your security requirements
3. **Sensitive Data**: Never include credentials, tokens, or sensitive data in skill files or references
4. **Access Control**: Use GitHub's access controls for private forks
5. **Dependencies**: Review any scripts included in skill `references/` folders before execution

## Scope

This security policy applies to:
- All skill files (`SKILL.md`)
- All reference files and code templates
- Skill creation instructions
- Release plan files
- Scripts included in skill folders

## Out of Scope

- Issues with GitHub Copilot itself (report to GitHub)
- Issues with VS Code (report to Microsoft)
- Issues with Claude Code or other AI agents (report to the respective vendor)
- Microsoft Dynamics 365 Business Central vulnerabilities (report to Microsoft)
- General AL development questions (use [Discussions](https://github.com/fernandoartalf/AL-Copilot-Skills-Collection/discussions) instead)

## Attribution

We appreciate responsible disclosure and will acknowledge security researchers who help improve the security of this project.

Thank you for helping keep the AL-Copilot-Skills-Collection and our users safe!
