# Windows Development Setup

## PowerShell Execution Policy Issue

If you encounter this error when running npm commands:

```
File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

### Solution 1: Bypass for Current Session (Recommended)

Run this before each npm command:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; npm start
```

Or create PowerShell aliases in your profile.

### Solution 2: Use Command Prompt

Run commands in `cmd.exe` instead of PowerShell:

```cmd
npm start
npm run build:prod
```

### Solution 3: Change PowerShell Policy (Permanent)

⚠️ **Admin required** - Run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then close and reopen your terminal.

## Quick Reference Scripts

Copy these to use in PowerShell:

```powershell
# Start development server
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; npm start

# Build for production
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; npm run build:prod

# Test production locally
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; npm run serve:prod
```

## VS Code Integrated Terminal

If using VS Code's integrated terminal:

1. Open VS Code settings (Ctrl+,)
2. Search for "terminal.integrated.defaultProfile.windows"
3. Change from "PowerShell" to "Command Prompt"
4. Restart VS Code

Or use the terminal selector in VS Code to switch to cmd.exe.

## Alternative: Use Git Bash

If you have Git for Windows installed:

1. Open Git Bash terminal
2. Run npm commands normally (no execution policy issues):
   ```bash
   npm start
   npm run build:prod
   ```
