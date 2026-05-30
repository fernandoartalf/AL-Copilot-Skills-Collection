---
name: bc-isolated-storage-generator
description: >-
  Generate Isolated Storage implementations for Business Central with security
  best practices. Creates a setup table (Access = Internal), a management
  codeunit (Access = Internal), and optionally a setup page — wired to
  IsolatedStorage.Set/Get/Delete with user-chosen DataScope and a GUID secret
  key in a locked Label. Supports encryption via CryptographyManagement.
  Use when: create isolated storage, generate secret storage, store password
  securely, store API key, store client secret, store token, store credential,
  replace Service Password table, encrypted storage, DataScope, secure storage,
  credential vault, OAuth secret, bearer token storage, personal access token.
---

# Business Central Isolated Storage Generator

## Overview

Generates AL objects that securely store secrets (passwords, API keys, tokens)
using the `IsolatedStorage` data type introduced in Business Central 15.0 as the
replacement for the deprecated **Service Password** table.

The generated code follows the pattern documented in:

- <https://vld-bc.com/blog/how-to-use-isolated-storage>
- <https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-isolated-storage>
- <https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/methods-auto/datascope/datascope-option>

## Quick Start

**Example requests:**

- "Create isolated storage for an API key"
- "Generate secure password storage for an integration setup"
- "Store a secret token using IsolatedStorage with Company scope"
- "Add isolated storage to my existing setup table"
- "Create OAuth client secret storage"
- "Store a bearer token securely per user"

> **See also:** `references/isolated-storage-examples.md` for 6 full working
> examples covering single/multi-secret tables, codeunit-only patterns,
> user-scoped storage, and HttpClient integration.

## Prerequisites

- Available table and codeunit object IDs (from `app.json` `idRanges`)
- Project affix (from `app.json` `affixes`)
- The user must provide a secret key in **GUID format** to identify the stored value

## Interview — Mandatory Questions

Before generating any code the skill MUST ask the user the following questions
using `vscode/askQuestions`. Do NOT proceed until every answer is collected.

### Question 1 — Secret purpose

> What secret will be stored? (e.g. "API Key", "Password", "Bearer Token",
> "Client Secret")

Used to derive object names, captions, and variable names.

### Question 2 — DataScope

> Which DataScope should the isolated storage use?

Present the four options with descriptions:

| Option | Description |
|---|---|
| **Module** | Available across the entire extension (all companies, all users). Recommended for shared integration credentials. |
| **Company** | Available within the current company context inside the extension. Use when each company has its own credential. |
| **User** | Available per user within the extension. Use for per-user tokens or personal API keys. |
| **CompanyAndUser** | Available per user within a specific company. Most restrictive scope. |

Default recommendation: **Module** (most common for integration secrets).

### Question 3 — Secret key (GUID)

> Provide a secret key in GUID format to identify this secret in isolated
> storage. You can generate one at
> <https://www.guidgenerator.com/online-guid-generator.aspx>

Validate the input matches GUID format:
`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`

If the input does not match, ask again.

### Question 4 — Existing setup table

> Do you want to add the isolated storage procedures to an existing setup table,
> or create a new standalone setup table?

If adding to an existing table, ask for the table name / file path and skip new
table creation.

### Question 5 — Setup page

> Do you want a setup page (Card page) to be generated where users can enter
> and clear the secret?

Default: **Yes**.

## Code Generation Steps

### Step 1 — Read project metadata

1. Read `app.json` to obtain `idRanges`, `affixes`, `name`, and `publisher`.
2. Determine the affix to use (e.g. `ABC`).
3. Allocate object IDs for the new table, codeunit, and page from the available
   range.

### Step 2 — Determine naming

Derive names from the secret purpose (Question 1) and the project affix:

| Artefact | Naming pattern | Example (`purpose = "API Key"`, `affix = ABC`) |
|---|---|---|
| Setup Table | `<Purpose> Setup` | `"API Key Setup"` |
| Management Codeunit | `<Purpose> Mgt.` | `"API Key Mgt."` |
| Setup Page | `<Purpose> Setup` | `"API Key Setup"` |
| File — Table | `<PurposePascal>Setup.Table.al` | `APIKeySetup.Table.al` |
| File — Codeunit | `<PurposePascal>Mgt.Codeunit.al` | `APIKeyMgt.Codeunit.al` |
| File — Page | `<PurposePascal>Setup.Page.al` | `APIKeySetup.Page.al` |

Apply the project affix following the naming conventions instruction file.

### Step 3 — Determine folder

Place files under `src/<Feature>/` following the feature-based folder
organisation from the AL code style instruction file. If the feature folder is
not obvious, ask the user.

### Step 4 — Generate the Setup Table

Generate the table **only** if the user chose to create a new table (Question 4).

**Mandatory properties:**

- `Access = Internal;` — **always**. This prevents other extensions from
  accessing the secret procedures.
- `DataClassification = CustomerContent;`

**Template:**

```al
table <ID> "<Affix> <Purpose> Setup"
{
  Caption = '<Purpose> Setup';
  DataClassification = CustomerContent;
  Access = Internal;

  fields
  {
    field(1; "Primary Key"; Code[10])
    {
      Caption = 'Primary Key';
      DataClassification = CustomerContent;
    }
  }

  keys
  {
    key(PK; "Primary Key")
    {
      Clustered = true;
    }
  }

  var
    SecretKeyTxt: Label '<GUID>', Locked = true;

  procedure SetSecret(NewSecret: Text)
  var
    CryptographyManagement: Codeunit "Cryptography Management";
  begin
    if IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>) then
      IsolatedStorage.Delete(GetStorageKey(), DataScope::<Scope>);

    if CryptographyManagement.IsEncryptionEnabled() and CryptographyManagement.IsEncryptionPossible() then
      IsolatedStorage.SetEncrypted(GetStorageKey(), NewSecret, DataScope::<Scope>)
    else
      IsolatedStorage.Set(GetStorageKey(), NewSecret, DataScope::<Scope>);
  end;

  procedure GetSecret(): Text
  var
    SecretValue: Text;
  begin
    if IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>) then
      IsolatedStorage.Get(GetStorageKey(), DataScope::<Scope>, SecretValue);
    exit(SecretValue);
  end;

  procedure DeleteSecret()
  begin
    if IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>) then
      IsolatedStorage.Delete(GetStorageKey(), DataScope::<Scope>);
  end;

  procedure HasSecret(): Boolean
  begin
    exit(IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>));
  end;

  local procedure GetStorageKey(): Text
  begin
    exit(SecretKeyTxt);
  end;
}
```

**Substitution rules:**

| Placeholder | Value |
|---|---|
| `<ID>` | Allocated table ID |
| `<Affix>` | Project affix from `app.json` |
| `<Purpose>` | Secret purpose from Question 1 |
| `<GUID>` | GUID from Question 3 (lowercase) |
| `<Scope>` | DataScope from Question 2 (`Module`, `Company`, `User`, or `CompanyAndUser`) |

### Step 5 — Generate the Management Codeunit

If the user chose to add procedures to an existing table (Question 4), generate
a **standalone codeunit** that encapsulates the isolated storage logic instead.

**Mandatory properties:**

- `Access = Internal;` — **always**.

**Template:**

```al
codeunit <ID> "<Affix> <Purpose> Mgt."
{
  Access = Internal;

  var
    SecretKeyTxt: Label '<GUID>', Locked = true;

  procedure SetSecret(NewSecret: Text)
  var
    CryptographyManagement: Codeunit "Cryptography Management";
  begin
    if IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>) then
      IsolatedStorage.Delete(GetStorageKey(), DataScope::<Scope>);

    if CryptographyManagement.IsEncryptionEnabled() and CryptographyManagement.IsEncryptionPossible() then
      IsolatedStorage.SetEncrypted(GetStorageKey(), NewSecret, DataScope::<Scope>)
    else
      IsolatedStorage.Set(GetStorageKey(), NewSecret, DataScope::<Scope>);
  end;

  procedure GetSecret(): Text
  var
    SecretValue: Text;
  begin
    if IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>) then
      IsolatedStorage.Get(GetStorageKey(), DataScope::<Scope>, SecretValue);
    exit(SecretValue);
  end;

  procedure DeleteSecret()
  begin
    if IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>) then
      IsolatedStorage.Delete(GetStorageKey(), DataScope::<Scope>);
  end;

  procedure HasSecret(): Boolean
  begin
    exit(IsolatedStorage.Contains(GetStorageKey(), DataScope::<Scope>));
  end;

  local procedure GetStorageKey(): Text
  begin
    exit(SecretKeyTxt);
  end;
}
```

### Step 6 — Generate the Setup Page (optional)

Generate only if the user answered **Yes** to Question 5.

**Template:**

```al
page <ID> "<Affix> <Purpose> Setup"
{
  PageType = Card;
  ApplicationArea = All;
  UsageCategory = Administration;
  SourceTable = "<Affix> <Purpose> Setup";
  Caption = '<Purpose> Setup';

  layout
  {
    area(Content)
    {
      group(General)
      {
        Caption = 'General';

        field(SecretField; SecretText)
        {
          ApplicationArea = All;
          Caption = '<Purpose>';
          ExtendedDatatype = Masked;
          ToolTip = 'Specifies the <purpose (lowercase)> stored securely in isolated storage.';

          trigger OnValidate()
          begin
            if SecretText = '' then
              Rec.DeleteSecret()
            else
              Rec.SetSecret(SecretText);
          end;
        }
      }
    }
  }

  actions
  {
    area(Processing)
    {
      action(ClearSecret)
      {
        ApplicationArea = All;
        Caption = 'Clear <Purpose>';
        ToolTip = 'Removes the <purpose (lowercase)> from isolated storage.';
        Image = Delete;

        trigger OnAction()
        begin
          Rec.DeleteSecret();
          SecretText := '';
          CurrPage.Update(false);
        end;
      }
    }
  }

  trigger OnOpenPage()
  begin
    Rec.Reset();
    if not Rec.Get() then begin
      Rec.Init();
      Rec.Insert();
    end;
    if Rec.HasSecret() then
      SecretText := '***';
  end;

  var
    SecretText: Text;
}
```

When the management codeunit variant is used (existing table), the page calls
the codeunit procedures instead of `Rec.SetSecret()` / `Rec.DeleteSecret()` /
`Rec.HasSecret()`.

### Step 7 — Validate generated code

After generating all files, verify:

1. **`Access = Internal`** is set on **every** table and codeunit.
2. The GUID label has `Locked = true`.
3. The `DataScope` matches the user's choice consistently in every call.
4. `IsolatedStorage.Contains()` is called before every `Get` or `Delete`.
5. Encryption is attempted via `Cryptography Management` when available, falling
   back to `IsolatedStorage.SetEncrypted` (preferred) or plain `Set`.
6. File names follow `<ObjectName>.<ObjectType>.al` convention.
7. Files are placed in the correct feature folder under `src/`.
8. Object IDs are within the project's `idRanges`.
9. The project affix is correctly applied to object names.
10. No secret value is hardcoded — only the GUID key is stored in the label.

## Hard rules

- **`Access = Internal` is mandatory** on every generated table and codeunit.
  This prevents other extensions from accessing secret management procedures.
- **The GUID secret key MUST be stored in a `Label` with `Locked = true`** —
  never in a plain text constant or variable.
- **Never** store actual secret values in AL source code, table fields, or
  labels. Only the GUID key identifier is in code; the secret value lives
  exclusively in isolated storage at runtime.
- **Always** check `IsolatedStorage.Contains()` before calling `Get` or
  `Delete` to avoid runtime errors.
- **Always** attempt encryption via `Cryptography Management` or use
  `IsolatedStorage.SetEncrypted()` when possible. Fall back to plain `Set` only
  when encryption is not available.
- **Never** skip the GUID format validation. If the user provides an invalid
  GUID, re-prompt — do not invent one.
- **Never** generate code without asking all five interview questions first.
- **DataScope must be consistent** across all `Set`, `Get`, `Delete`, and
  `Contains` calls within the same object. Mixing scopes causes data loss.
- **Object names MUST NOT exceed 30 characters** (26 for the name + up to 4 for
  the affix). If the derived name is too long, abbreviate and confirm with the
  user.
- File names follow `<ObjectName>.<ObjectType>.al` — no exceptions.
- Feature-based folder organisation under `src/` — no object-type folders.

## DataScope Reference

| Scope | Isolation level | Typical use case |
|---|---|---|
| `Module` | Shared across all companies and users within the extension | Integration API keys shared by the whole tenant |
| `Company` | Per-company within the extension | Company-specific service credentials |
| `User` | Per-user within the extension | Personal access tokens |
| `CompanyAndUser` | Per-user per-company within the extension | User-specific credentials scoped to one company |

## IsolatedStorage Methods Reference

| Method | Description |
|---|---|
| `IsolatedStorage.Set(Key, Value, [DataScope])` | Stores a value associated with the key |
| `IsolatedStorage.SetEncrypted(Key, Value, [DataScope])` | Encrypts and stores the value (max 215 plain chars) |
| `IsolatedStorage.Get(Key, [DataScope], var Text)` | Retrieves the value for the key |
| `IsolatedStorage.Contains(Key, [DataScope])` | Returns true if the key exists |
| `IsolatedStorage.Delete(Key, [DataScope])` | Removes the key-value pair |

## Security Considerations

- Set `ShowMyCode = false` in `app.json` to prevent decompilation of the
  extension and exposure of the GUID key.
- The GUID key is an identifier, not a cryptographic secret — security relies on
  the isolation between extensions and the optional encryption layer.
- `SetEncrypted` has a 215 plain-character limit; special characters consume
  more space. Warn the user if the secret type may exceed this.
- When `DataScope::User` or `DataScope::CompanyAndUser` is selected, remind the
  user that each user must configure their own secret independently.

## References

- [Isolated Storage — Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-isolated-storage)
- [DataScope Option Type — Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/methods-auto/datascope/datascope-option)
- [IsolatedStorage Data Type — Microsoft Learn](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/methods-auto/isolatedstorage/isolatedstorage-data-type)
- [How to use Isolated Storage — VLD-BC Blog](https://vld-bc.com/blog/how-to-use-isolated-storage)
- [Online GUID Generator](https://www.guidgenerator.com/online-guid-generator.aspx) — for generating secret keys
- `references/isolated-storage-examples.md` — Full code examples and anti-patterns
