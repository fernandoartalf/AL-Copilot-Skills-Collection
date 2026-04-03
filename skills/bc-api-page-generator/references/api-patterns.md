# API Patterns & Best Practices

## Common Patterns

### Read-Only API

```al
page 50120 "Customers API"
{
    // ... standard properties ...

    Editable = false;
    InsertAllowed = false;
    ModifyAllowed = false;
    DeleteAllowed = false;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                // All fields automatically non-editable
            }
        }
    }
}
```

### Calculated/Virtual Fields

```al
field(creditLimitExceeded; IsCreditLimitExceeded())
{
    Caption = 'Credit Limit Exceeded';
    Editable = false;
}

local procedure IsCreditLimitExceeded(): Boolean
begin
    exit(Rec."Balance (LCY)" > Rec."Credit Limit (LCY)");
end;
```

### Enum/Option Fields

```al
field(status; Rec.Status)
{
    Caption = 'Status';
}

// API returns: "status": "open" or "status": "released"
// API accepts: { "status": "open" } or { "status": "released" }
```

---

## Performance Considerations

### 1. Support Filtering

Ensure proper keys exist on source table:

```al
table "Your Table"
{
    keys
    {
        key(PK; "No.") { Clustered = true; }
        key(Customer; "Customer No.", "Order Date") { }
        key(Status; Status, "Order Date") { }
    }
}
```

### 2. Use SetLoadFields

```al
trigger OnAfterGetRecord()
begin
    Rec.SetLoadFields("No.", "Description", "Unit Price");
end;
```

### 3. Limit FlowFields in API

- Avoid heavy FlowFields that require calculation
- Mark complex FlowFields as `Visible = false` unless critical
- Consider dedicated summary endpoints for aggregations

---

## Security & Permissions

### Permission Set Templates

```al
permissionset 50100 "API Access - [Group]"
{
    Assignable = true;
    Caption = 'API Access - [Group]';

    Permissions =
        page "[EntityName] API" = X,
        tabledata "[SourceTable]" = RIMD;
}

permissionset 50101 "API Read - [Group]"
{
    Assignable = true;
    Caption = 'API Read Only - [Group]';

    Permissions =
        page "[EntityName] API" = X,
        tabledata "[SourceTable]" = R;
}
```

---

## When to Create API Pages

**Create API pages when:**
- External systems need to integrate with BC
- Mobile apps need data access
- Power Platform needs to consume BC data
- Automation/batch processes need programmatic access
- Third-party applications need REST endpoints

**Don't create API pages when:**
- Only internal BC users need access (use regular pages)
- One-time data migration (use XMLports or DataExchange)
- Complex UI interactions required (use client pages)

---

## Tips & Tricks

1. **Use SystemId for ODataKeyFields** — more stable than business keys
2. **DelayedInsert = true** — better API POST behavior
3. **Test with Postman** — easier than browser for POST/PATCH/DELETE
4. **Version early** — plan for v2.0, v3.0 from the start
5. **Document endpoints** — create OpenAPI/Swagger documentation
6. **Monitor performance** — use telemetry to track API usage
7. **Handle etags properly** — use If-Match header for concurrency
