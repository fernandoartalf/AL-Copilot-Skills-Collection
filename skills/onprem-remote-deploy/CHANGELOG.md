# Changelog

All notable changes to the `onprem-remote-deploy` skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-21 - @AlexP0lo

### Added

- `scripts/Setup-DeployAgent.Template.ps1` with generic environment names and English output messages
- `references/onprem-remote-deploy-reference.md` with extended examples moved out of SKILL.md

### Changed

- Added `onprem-remote-deploy` entry to `releaseplan/2026/05-may.md` with status **In Development**
- Replaced remaining project-specific SMB share example with generic `BC_DEPLOY`
- Converted admin request templates to English for consistency
- Reduced SKILL.md size by moving long examples to references/scripts

## [1.0.0] - 2026-04-20 - @AlexP0lo

### Added

- Initial SKILL.md with multi-strategy remote deploy for BC OnPrem
- Decision matrix to choose deployment strategy based on network access
- Strategy A: WinRM Direct (port 5985, same domain)
- Strategy B: SSH Direct (port 22, OpenSSH on server)
- Strategy C: SMB Push + Remote Trigger (port 445, named share)
- Strategy D: tsclient-pull via RDP Agent (zero network access required)
  - Server agent script with scheduled task (scans tsclient paths)
  - Trigger-based file protocol (_DEPLOY_TRIGGER.txt / _DEPLOY_RESULT.txt)
  - Auto-discovery of tsclient drives and repo paths
- alc.exe compilation patterns (assembly probing paths, multi-package cache)
- BC admin commands: Publish → Sync → DataUpgrade → Unpublish lifecycle
- Sync mode reference: Normal vs ForceSync with risk documentation
- RDP drive redirection setup for mstsc, Remote Desktop Manager, and other clients
- Admin request templates for WinRM and SSH (copy-paste ready)
- Troubleshooting table: OperationalWithSyncPending, version downgrade, NTLM hang, etc.
- Diagnostic commands for server-side inspection
- Customization checklist for adapting scripts to new projects
- Security notes (ForceSync risks, credential handling, tsclient session scope)
- AUTHORS.md for authorship tracking
- CHANGELOG.md for version history
