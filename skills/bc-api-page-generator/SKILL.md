---
name: bc-api-page-generator
description: Generates RESTful API page objects for Business Central following API v2.0 and OData best practices. Creates API pages with proper field mappings, navigation properties, custom actions, validation, and permission sets. Generates both simple single-table pages and header-lines patterns. Use when asked to create an API page, generate an API endpoint, build a REST API, expose a table via API, or implement web service integrations.
---

# Business Central API Page Generator

Generates production-ready AL API page objects following Microsoft's API v2.0 standards. Handles field mappings, navigation properties, custom actions, and permission sets.

## Quick Start

```al
page [ID] "[EntityName] API"
{
    APIVersion = 'v2.0';
    APIPublisher = '[publisher]';
    APIGroup = '[group]';

    EntityCaption = '[Entity Name]';
    EntitySetCaption = '[Entity Names]';
    EntityName = '[entityName]';       // camelCase, singular
    EntitySetName = '[entityNames]';   // camelCase, plural

    PageType = API;
    SourceTable = "[Source Table]";
    DelayedInsert = true;
    ODataKeyFields = SystemId;

    AboutText = 'API endpoint for [description]. Supports GET, POST, PATCH, DELETE operations.';
    Extensible = false;
}
```

**Endpoint URL**: `/api/v2.0/companies({companyId})/[entityNames]`

## Prerequisites

- Source table with proper primary key
- Available page ID (Object ID Ninja or manual allocation)
- Clear list of fields to expose
- Permission requirements defined

## API Page Properties

| Property | Guideline |
|----------|-----------|
| `APIVersion` | Use `'v2.0'` for modern APIs |
| `APIPublisher` | Company identifier, lowercase, no spaces |
| `APIGroup` | Logical group: sales, purchasing, inventory, finance |
| `EntityName` / `EntitySetName` | camelCase, singular / plural |
| `ODataKeyFields` | Prefer `SystemId` over business keys for stability |
| `DelayedInsert` | Always `true` for proper API POST behavior |
| `AboutText` | Required. Clear description of purpose and operations |
| `Extensible` | Set `false` to prevent breaking API contract |

## Layout Pattern

Fields follow this ordering in the `repeater(Group)`:

```al
layout
{
    area(Content)
    {
        repeater(Group)
        {
            // 1. System ID (always first, read-only)
            field(id; Rec.SystemId)
            {
                Caption = 'Id';
                Editable = false;
            }

            // 2. Business key fields (often read-only after creation)
            field(number; Rec."No.")
            {
                Caption = 'Number';
                Editable = false;
            }

            // 3. Required business fields
            field(customerNumber; Rec."Sell-to Customer No.")
            {
                Caption = 'Customer Number';
            }

            // 4. Optional business fields
            field(customerName; Rec."Sell-to Customer Name")
            {
                Caption = 'Customer Name';
                Editable = false;  // Calculated/FlowField
            }

            // 5. Calculated/summary fields (Editable = false)

            // 6. Status fields (Editable = false)

            // 7. Timestamp fields (always last)
            field(lastModifiedDateTime; Rec.SystemModifiedAt)
            {
                Caption = 'Last Modified Date Time';
                Editable = false;
            }

            // 8. Navigation properties (part/lines)
            part(salesOrderLines; "[EntityName] Lines API")
            {
                Caption = 'Lines';
                EntityName = '[entityName]Line';
                EntitySetName = '[entityName]Lines';
                SubPageLink = "Document Type" = field("Document Type"),
                              "Document No." = field("No.");
            }
        }
    }
}
```

**Field rules:**
- camelCase identifiers, clear descriptive captions
- Mark calculated/FlowFields and system fields as `Editable = false`
- Group related fields logically

## Field Naming Conventions

| AL Field | JSON Field | Pattern |
|----------|------------|---------|
| `"No."` | `number` | Descriptive names |
| `"Sell-to Customer No."` | `customerNumber` | camelCase compound words |
| `"Order Date"` | `orderDate` | Remove spaces |
| `"Amount Including VAT"` | `totalAmount` | Simplify when clear |
| `Status` | `status` | Lowercase single words |
| `SystemId` | `id` | Standard system fields |
| `SystemModifiedAt` | `lastModifiedDateTime` | Descriptive timestamps |

**Rules:** camelCase consistently, remove spaces/special characters, follow REST/JSON conventions, use standard names for common concepts (id, number, description, status).

## API Design Workflow

1. **Define purpose** — Who consumes this API? What operations? What data? Performance requirements?
2. **Plan resource model** — Identify entities, relationships, navigation properties, filtering needs
3. **Allocate object IDs** — API pages typically in 50100-50199; keep header/lines close (e.g., 50110, 50111)
4. **Implement API page(s)** — Start with header, add lines page if header-lines pattern, add validation triggers and actions
5. **Create permission sets** — Full access and read-only variants
6. **Test API** — Verify CRUD operations, actions, navigation properties, error responses

## Checklist

Before completing API page generation:

- [ ] API properties defined (version, publisher, group, entity names)
- [ ] `AboutText` property added with clear description
- [ ] Source table has proper primary key
- [ ] Fields use camelCase naming
- [ ] System fields included (`id`, `lastModifiedDateTime`)
- [ ] Calculated fields marked `Editable = false`
- [ ] Navigation properties defined for related tables
- [ ] Validation triggers implemented
- [ ] Custom actions added if needed
- [ ] Permission sets created
- [ ] API tested with CRUD operations

## References

For complete examples, patterns, and additional guidance:

- [references/api-examples.md](references/api-examples.md) — Full working examples (simple page, header-lines pattern), action patterns, validation triggers, HTTP test templates
- [references/api-patterns.md](references/api-patterns.md) — Common patterns (read-only, calculated fields, enums), performance considerations, security/permissions templates, tips

### External Resources

- [Developing a Custom API](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-develop-custom-api) — Microsoft Docs
- [OData v4.0 Protocol](https://www.odata.org/documentation/) — API standards
- [OAuth 2.0 for Business Central](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-develop-connect-apps) — Authentication
