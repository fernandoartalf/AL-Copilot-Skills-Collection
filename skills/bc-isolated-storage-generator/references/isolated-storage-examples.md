# Isolated Storage Examples

## Example 1: Basic Standalone Setup Table with Module Scope

The most common pattern — a singleton setup table that stores a shared API key accessible across all companies and users within the extension.

```al
table 50100 "ABC API Key Setup"
{
    Caption = 'API Key Setup';
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
        SecretKeyTxt: Label 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', Locked = true;

    procedure SetSecret(NewSecret: Text)
    var
        CryptographyManagement: Codeunit "Cryptography Management";
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Module) then
            IsolatedStorage.Delete(GetStorageKey(), DataScope::Module);

        if CryptographyManagement.IsEncryptionEnabled() and CryptographyManagement.IsEncryptionPossible() then
            IsolatedStorage.SetEncrypted(GetStorageKey(), NewSecret, DataScope::Module)
        else
            IsolatedStorage.Set(GetStorageKey(), NewSecret, DataScope::Module);
    end;

    procedure GetSecret(): Text
    var
        SecretValue: Text;
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Module) then
            IsolatedStorage.Get(GetStorageKey(), DataScope::Module, SecretValue);
        exit(SecretValue);
    end;

    procedure DeleteSecret()
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Module) then
            IsolatedStorage.Delete(GetStorageKey(), DataScope::Module);
    end;

    procedure HasSecret(): Boolean
    begin
        exit(IsolatedStorage.Contains(GetStorageKey(), DataScope::Module));
    end;

    local procedure GetStorageKey(): Text
    begin
        exit(SecretKeyTxt);
    end;
}
```

**Key points:**
- `Access = Internal` prevents other extensions from calling secret procedures
- `Locked = true` on the label prevents translation of the GUID key
- `DataScope::Module` shares the secret across all companies and users
- Always check `Contains()` before `Get()` or `Delete()` to avoid runtime errors
- Encryption is preferred via `CryptographyManagement` when available

---

## Example 2: Management Codeunit (Add to Existing Table)

When adding isolated storage to an existing setup table, use a standalone codeunit to encapsulate the logic.

```al
codeunit 50100 "ABC Client Secret Mgt."
{
    Access = Internal;

    var
        SecretKeyTxt: Label 'f7e8d9c0-b1a2-3456-7890-abcdef012345', Locked = true;

    procedure SetSecret(NewSecret: Text)
    var
        CryptographyManagement: Codeunit "Cryptography Management";
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Company) then
            IsolatedStorage.Delete(GetStorageKey(), DataScope::Company);

        if CryptographyManagement.IsEncryptionEnabled() and CryptographyManagement.IsEncryptionPossible() then
            IsolatedStorage.SetEncrypted(GetStorageKey(), NewSecret, DataScope::Company)
        else
            IsolatedStorage.Set(GetStorageKey(), NewSecret, DataScope::Company);
    end;

    procedure GetSecret(): Text
    var
        SecretValue: Text;
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Company) then
            IsolatedStorage.Get(GetStorageKey(), DataScope::Company, SecretValue);
        exit(SecretValue);
    end;

    procedure DeleteSecret()
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::Company) then
            IsolatedStorage.Delete(GetStorageKey(), DataScope::Company);
    end;

    procedure HasSecret(): Boolean
    begin
        exit(IsolatedStorage.Contains(GetStorageKey(), DataScope::Company));
    end;

    local procedure GetStorageKey(): Text
    begin
        exit(SecretKeyTxt);
    end;
}
```

**Key points:**
- Company scope isolates secrets per company — each company must configure its own
- The codeunit can be called from any page or process in the same extension
- `Access = Internal` ensures other extensions cannot invoke secret management

---

## Example 3: Setup Page with Masked Input

A Card page that allows administrators to set and clear the secret with a masked field.

```al
page 50100 "ABC API Key Setup"
{
    PageType = Card;
    ApplicationArea = All;
    UsageCategory = Administration;
    SourceTable = "ABC API Key Setup";
    Caption = 'API Key Setup';

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
                    Caption = 'API Key';
                    ExtendedDatatype = Masked;
                    ToolTip = 'Specifies the API key stored securely in isolated storage.';

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
                Caption = 'Clear API Key';
                ToolTip = 'Removes the API key from isolated storage.';
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

**Key points:**
- `ExtendedDatatype = Masked` hides the secret value from the UI
- The placeholder `***` is shown when a secret exists — never the actual value
- `OnOpenPage` ensures the singleton record exists before any interaction
- Clearing the field on validate also deletes from isolated storage

---

## Example 4: Multiple Secrets in a Single Table

When an integration requires multiple credentials (e.g. Client ID + Client Secret), use separate GUID keys for each.

```al
table 50101 "ABC OAuth Setup"
{
    Caption = 'OAuth Setup';
    DataClassification = CustomerContent;
    Access = Internal;

    fields
    {
        field(1; "Primary Key"; Code[10])
        {
            Caption = 'Primary Key';
            DataClassification = CustomerContent;
        }
        field(10; "Client ID"; Text[250])
        {
            Caption = 'Client ID';
            DataClassification = EndUserIdentifiableInformation;
        }
        field(20; "Token Endpoint"; Text[250])
        {
            Caption = 'Token Endpoint';
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
        ClientSecretKeyTxt: Label 'c1d2e3f4-a5b6-7890-1234-567890abcdef', Locked = true;
        RefreshTokenKeyTxt: Label 'd4e5f6a7-b8c9-0123-4567-890abcdef012', Locked = true;

    // --- Client Secret ---

    procedure SetClientSecret(NewSecret: Text)
    begin
        SetIsolatedValue(ClientSecretKeyTxt, NewSecret);
    end;

    procedure GetClientSecret(): Text
    begin
        exit(GetIsolatedValue(ClientSecretKeyTxt));
    end;

    procedure DeleteClientSecret()
    begin
        DeleteIsolatedValue(ClientSecretKeyTxt);
    end;

    procedure HasClientSecret(): Boolean
    begin
        exit(IsolatedStorage.Contains(ClientSecretKeyTxt, DataScope::Module));
    end;

    // --- Refresh Token ---

    procedure SetRefreshToken(NewToken: Text)
    begin
        SetIsolatedValue(RefreshTokenKeyTxt, NewToken);
    end;

    procedure GetRefreshToken(): Text
    begin
        exit(GetIsolatedValue(RefreshTokenKeyTxt));
    end;

    procedure DeleteRefreshToken()
    begin
        DeleteIsolatedValue(RefreshTokenKeyTxt);
    end;

    procedure HasRefreshToken(): Boolean
    begin
        exit(IsolatedStorage.Contains(RefreshTokenKeyTxt, DataScope::Module));
    end;

    // --- Internal helpers ---

    local procedure SetIsolatedValue(StorageKey: Text; NewValue: Text)
    var
        CryptographyManagement: Codeunit "Cryptography Management";
    begin
        if IsolatedStorage.Contains(StorageKey, DataScope::Module) then
            IsolatedStorage.Delete(StorageKey, DataScope::Module);

        if CryptographyManagement.IsEncryptionEnabled() and CryptographyManagement.IsEncryptionPossible() then
            IsolatedStorage.SetEncrypted(StorageKey, NewValue, DataScope::Module)
        else
            IsolatedStorage.Set(StorageKey, NewValue, DataScope::Module);
    end;

    local procedure GetIsolatedValue(StorageKey: Text): Text
    var
        SecretValue: Text;
    begin
        if IsolatedStorage.Contains(StorageKey, DataScope::Module) then
            IsolatedStorage.Get(StorageKey, DataScope::Module, SecretValue);
        exit(SecretValue);
    end;

    local procedure DeleteIsolatedValue(StorageKey: Text)
    begin
        if IsolatedStorage.Contains(StorageKey, DataScope::Module) then
            IsolatedStorage.Delete(StorageKey, DataScope::Module);
    end;
}
```

**Key points:**
- Each secret gets its own GUID key — never reuse keys across secrets
- Internal helper procedures reduce code duplication when managing multiple secrets
- Non-secret fields (like Client ID, Token Endpoint) can be stored as regular table fields
- Only truly sensitive values go into isolated storage

---

## Example 5: User-Scoped Token Storage

Per-user isolated storage for personal access tokens. Each user manages their own credential independently.

```al
codeunit 50102 "ABC Personal Token Mgt."
{
    Access = Internal;

    var
        PersonalTokenKeyTxt: Label 'e5f6a7b8-c9d0-1234-5678-90abcdef0123', Locked = true;

    procedure SetToken(NewToken: Text)
    var
        CryptographyManagement: Codeunit "Cryptography Management";
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::User) then
            IsolatedStorage.Delete(GetStorageKey(), DataScope::User);

        if CryptographyManagement.IsEncryptionEnabled() and CryptographyManagement.IsEncryptionPossible() then
            IsolatedStorage.SetEncrypted(GetStorageKey(), NewToken, DataScope::User)
        else
            IsolatedStorage.Set(GetStorageKey(), NewToken, DataScope::User);
    end;

    procedure GetToken(): Text
    var
        TokenValue: Text;
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::User) then
            IsolatedStorage.Get(GetStorageKey(), DataScope::User, TokenValue);
        exit(TokenValue);
    end;

    procedure DeleteToken()
    begin
        if IsolatedStorage.Contains(GetStorageKey(), DataScope::User) then
            IsolatedStorage.Delete(GetStorageKey(), DataScope::User);
    end;

    procedure HasToken(): Boolean
    begin
        exit(IsolatedStorage.Contains(GetStorageKey(), DataScope::User));
    end;

    local procedure GetStorageKey(): Text
    begin
        exit(PersonalTokenKeyTxt);
    end;
}
```

**Key points:**
- `DataScope::User` means each user has their own isolated value
- An administrator cannot read another user's token
- Useful for personal API tokens, OAuth refresh tokens per user, or personal auth headers

---

## Example 6: Integration with HttpClient Using Isolated Storage

Shows how a consumer codeunit retrieves the secret from isolated storage and uses it in an HTTP call.

```al
codeunit 50103 "ABC Integration Mgt."
{
    Access = Internal;

    var
        APIKeySetup: Record "ABC API Key Setup";

    procedure CallExternalAPI(): Text
    var
        Client: HttpClient;
        Request: HttpRequestMessage;
        Response: HttpResponseMessage;
        Headers: HttpHeaders;
        ResponseText: Text;
        APIKey: Text;
    begin
        APIKey := GetAPIKey();
        if APIKey = '' then
            Error(APIKeyMissingErr);

        Request.SetRequestUri('https://api.example.com/data');
        Request.Method := 'GET';
        Request.GetHeaders(Headers);
        Headers.Add('Authorization', StrSubstNo('Bearer %1', APIKey));

        Client.Send(Request, Response);

        if not Response.IsSuccessStatusCode() then
            Error(APICallFailedErr, Response.HttpStatusCode(), Response.ReasonPhrase());

        Response.Content.ReadAs(ResponseText);
        exit(ResponseText);
    end;

    local procedure GetAPIKey(): Text
    begin
        if not APIKeySetup.Get() then
            exit('');
        exit(APIKeySetup.GetSecret());
    end;

    var
        APIKeyMissingErr: Label 'The API key has not been configured. Go to API Key Setup to enter your key.';
        APICallFailedErr: Label 'API call failed with status %1: %2', Comment = '%1 = HTTP status code, %2 = reason phrase';
}
```

**Key points:**
- The actual secret is retrieved at runtime from isolated storage — never hardcoded
- Error handling alerts the user when the key is missing
- The integration codeunit calls `GetSecret()` on the setup table without knowing the GUID key
- The secret is only held in a local variable for the duration of the HTTP call

---

## Common Anti-Patterns

### Anti-Pattern 1: Storing the secret in a table field

```al
// ❌ WRONG — secret visible in the database
field(10; "API Key"; Text[250])
{
    Caption = 'API Key';
    DataClassification = CustomerContent;
}
```

**Why it's wrong:** Table field values are stored in the SQL database and can be read by anyone with database access, exported in configuration packages, or seen in page inspectors.

**Fix:** Use `IsolatedStorage` to store the secret; only store a non-sensitive identifier or status flag in table fields.

---

### Anti-Pattern 2: Missing Contains() check before Get/Delete

```al
// ❌ WRONG — runtime error if key doesn't exist
procedure GetSecret(): Text
var
    SecretValue: Text;
begin
    IsolatedStorage.Get(GetStorageKey(), DataScope::Module, SecretValue);
    exit(SecretValue);
end;
```

**Why it's wrong:** `IsolatedStorage.Get()` raises a runtime error if the key does not exist. This crashes the page or process.

**Fix:** Always wrap with `IsolatedStorage.Contains()` first.

---

### Anti-Pattern 3: Mixing DataScopes

```al
// ❌ WRONG — writing to Module, reading from Company
procedure SetSecret(NewSecret: Text)
begin
    IsolatedStorage.Set(GetStorageKey(), NewSecret, DataScope::Module);
end;

procedure GetSecret(): Text
var
    SecretValue: Text;
begin
    IsolatedStorage.Get(GetStorageKey(), DataScope::Company, SecretValue);
    exit(SecretValue);
end;
```

**Why it's wrong:** Data stored in one scope is invisible to another. This causes silent failures — `Get` returns empty without error.

**Fix:** Use the same `DataScope` consistently across all Set/Get/Delete/Contains calls for the same key.

---

### Anti-Pattern 4: Using Access = Public on secret management objects

```al
// ❌ WRONG — exposes secret procedures to other extensions
codeunit 50100 "ABC Secret Mgt."
{
    Access = Public;  // Other extensions can call GetSecret()!
    ...
}
```

**Why it's wrong:** Any dependent extension can call your `GetSecret()` procedure and retrieve the credential.

**Fix:** Always set `Access = Internal` on tables and codeunits that manage secrets.

---

### Anti-Pattern 5: Hardcoding the GUID in a Text constant

```al
// ❌ WRONG — not locked, subject to accidental translation
var
    SecretKey: Text;
begin
    SecretKey := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    ...
```

**Why it's wrong:** A plain text variable can be accidentally overwritten, is not locked against translation, and doesn't benefit from the compiler's static analysis.

**Fix:** Use a `Label` with `Locked = true` to store the GUID key identifier.

---

### Anti-Pattern 6: Skipping encryption when available

```al
// ❌ WRONG — always uses plain Set, ignores available encryption
procedure SetSecret(NewSecret: Text)
begin
    IsolatedStorage.Set(GetStorageKey(), NewSecret, DataScope::Module);
end;
```

**Why it's wrong:** When the tenant has encryption enabled, storing in plain text misses a defense-in-depth layer.

**Fix:** Check `CryptographyManagement.IsEncryptionEnabled()` and use `SetEncrypted()` when possible, falling back to plain `Set` only when encryption is unavailable.

---

## Best Practices Checklist

| # | Practice | Rationale |
|---|---|---|
| 1 | Set `Access = Internal` on all secret objects | Prevents cross-extension access |
| 2 | Use `Label` with `Locked = true` for GUID keys | Prevents translation and enforces immutability |
| 3 | Always call `Contains()` before `Get()` or `Delete()` | Prevents runtime errors |
| 4 | Use `SetEncrypted()` when encryption is available | Defense-in-depth |
| 5 | Keep `DataScope` consistent within an object | Prevents silent data loss |
| 6 | Set `ShowMyCode = false` in `app.json` | Prevents decompilation exposure of the GUID |
| 7 | Never store actual secrets in AL source code | Only the GUID identifier belongs in code |
| 8 | Use `ExtendedDatatype = Masked` on page fields | Hides secret from UI |
| 9 | Show `***` placeholder when secret exists | Confirms presence without revealing value |
| 10 | One GUID key per secret — never reuse | Ensures isolation between credentials |
| 11 | Handle `SetEncrypted` 215-char limit | Warn user for potentially long secrets |
| 12 | Test with encryption both enabled and disabled | Ensures both code paths work |
