---
name: bc-api-query-generator
description: Generates API query objects for Business Central that expose data via OData/REST endpoints using the QueryType = API pattern. Creates queries with single or multiple dataitems (table joins), proper API properties, column mappings, aggregation methods (Sum, Count, Average, Min, Max), filters, DataItemLink joins (InnerJoin, LeftOuterJoin, CrossJoin), and DataItemTableFilter. Supports multi-version APIs, date filters, and dimension columns. Use when asked to create an API query, generate a query endpoint, build a read-only API from joined tables, expose aggregated data via API, create reporting queries, or implement OData query endpoints.
---

# Business Central API Query Generator

Generates production-ready AL API query objects following Microsoft's API standards. Handles single-table and multi-table join patterns, aggregation, filtering, and proper OData endpoint configuration.

## Overview

API queries (`QueryType = API`) expose read-only data via OData endpoints. Unlike API pages, queries:
- Support **joining multiple tables** via nested dataitems
- Support **aggregation methods** (Sum, Count, Average, Min, Max)
- Support **filters** exposed as OData query parameters
- Are **read-only** — no INSERT, UPDATE, DELETE
- Cannot be extended

This skill generates:
- API query with proper metadata properties
- Single or multi-dataitem layouts with join configuration
- Column mappings with camelCase naming
- Aggregation and filter elements
- File placed following feature-based folder convention

**Advanced patterns and join examples**: [references/query-examples.md](references/query-examples.md)

## Prerequisites

- AL workspace with established object ID range
- Source table(s) identified with join relationships
- Clear list of columns to expose
- API publisher, group, and version defined

## Quick Start

```al
query [ID] "[Prefix] [Entity] API"
{
    QueryType = API;
    APIPublisher = '[publisher]';
    APIGroup = '[group]';
    APIVersion = 'v2.0';
    Caption = '[entityCaption]', Locked = true;
    EntityName = '[entityName]';         // camelCase, singular
    EntitySetName = '[entityNames]';     // camelCase, plural

    elements
    {
        dataitem([dataItemName]; "[Source Table]")
        {
            column([fieldAlias]; "[Field Name]")
            {
                Caption = '[Caption]', Locked = true;
            }
        }
    }
}
```

**Endpoint URL**: `../[publisher]/[group]/[version]/companies({id})/[entitySetName]`

## API Query Properties

| Property | Guideline |
|----------|-----------|
| `QueryType` | Always `API` for web service queries |
| `APIPublisher` | Company/publisher identifier, lowercase, no spaces |
| `APIGroup` | Logical group: `sales`, `purchasing`, `inventory`, `finance`, `reporting` |
| `APIVersion` | Use `'v2.0'` or list `'v1.0', 'v2.0'` for multi-version support |
| `Caption` | Use camelCase entity name, always `Locked = true` |
| `EntityName` | camelCase, singular (e.g., `customerSale`, `itemLedgerEntry`) |
| `EntitySetName` | camelCase, plural (e.g., `customerSales`, `itemLedgerEntries`) |

## DataItem Pattern — Single Table

Use for simple read-only exposure of a single table:

```al
query [ID] "[Prefix] [Entity] API"
{
    QueryType = API;
    APIPublisher = '[publisher]';
    APIGroup = '[group]';
    APIVersion = 'v2.0';
    Caption = '[entityCaption]', Locked = true;
    EntityName = '[entityName]';
    EntitySetName = '[entityNames]';

    elements
    {
        dataitem([dataItemName]; "[Source Table]")
        {
            // Primary key / identifier columns
            column([alias]; "[Key Field]")
            {
                Caption = '[Caption]', Locked = true;
            }

            // Business data columns
            column([alias]; "[Business Field]")
            {
                Caption = '[Caption]', Locked = true;
            }

            // Date columns
            column([alias]; "[Date Field]")
            {
                Caption = '[Caption]', Locked = true;
            }

            // Amount / numeric columns
            column([alias]; "[Amount Field]")
            {
                Caption = '[Caption]', Locked = true;
            }

            // Dimension columns (if applicable)
            column([alias]; "[Dimension Field]")
            {
                Caption = '[Caption]', Locked = true;
            }
        }
    }
}
```

## DataItem Pattern — Multi-Table Join

Use for joining related tables. Nest dataitems to create SQL JOINs:

```al
query [ID] "[Prefix] [Entity] API"
{
    QueryType = API;
    APIPublisher = '[publisher]';
    APIGroup = '[group]';
    APIVersion = 'v2.0';
    Caption = '[entityCaption]', Locked = true;
    EntityName = '[entityName]';
    EntitySetName = '[entityNames]';

    elements
    {
        dataitem([parentDataItem]; "[Parent Table]")
        {
            // Parent table columns
            column([alias]; "[Parent Field]")
            {
                Caption = '[Caption]', Locked = true;
            }

            dataitem([childDataItem]; "[Child Table]")
            {
                DataItemLink = "[Child FK Field]" = [parentDataItem]."[Parent PK Field]";
                SqlJoinType = InnerJoin;

                // Child table columns
                column([alias]; "[Child Field]")
                {
                    Caption = '[Caption]', Locked = true;
                }

                // Aggregation column example
                column([alias]; "[Amount Field]")
                {
                    Caption = '[Caption]', Locked = true;
                    Method = Sum;
                }

                // Filter element example
                filter([filterAlias]; "[Filter Field]")
                {
                    Caption = '[Caption]', Locked = true;
                }
            }
        }
    }
}
```

### SqlJoinType Property

Sets the data item link type between data items to determine the records included in the resulting dataset. Always set on the **lower (nested) data item**. Works together with `DataItemLink` to combine records — except for `CrossJoin`, which requires `DataItemLink` to be **blank**.

```al
SqlJoinType = InnerJoin;
```

| Join Type | Description | When to Use |
|-----------|-------------|-------------|
| `LeftOuterJoin` | Returns **every record from the upper (parent) data item**, even if no matching record exists in the lower data item. Non-matching lower fields return null/default values. | Most common for API queries. Use when you need all parent records regardless of child matches (e.g., all customers even those with no ledger entries). |
| `InnerJoin` | Returns only records where a **match is found** between linked fields in both data items. Records without matches in either table are excluded. | Use when you only want records that exist in both tables (e.g., only items that have been sold). |
| `RightOuterJoin` | Returns **every record from the lower (child) data item**, even if no matching record exists in the upper data item. Non-matching upper fields return null/default values. | Use when the child table is the primary dataset and you want all child records even without parent matches. Less common in API queries. |
| `FullOuterJoin` | Returns **all records from both data items**, including records that have no matching value in either table. Non-matching fields return null/default values on both sides. | Use for complete datasets where no records should be excluded (e.g., reconciliation queries). |
| `CrossJoin` | Produces a **Cartesian product** — every row from the upper data item combined with every row from the lower data item. **DataItemLink must be blank.** | Rarely needed. Use for generating all possible combinations (e.g., item × location matrix). Can produce very large datasets — use with caution. |

**Remarks:**
- The `SqlJoinType` property is always set on the **lower (nested)** data item, never on the root data item.
- For `LeftOuterJoin`, `InnerJoin`, `RightOuterJoin`, and `FullOuterJoin`, the `DataItemLink` property establishes an "equal to" (=) comparison between fields.
- For `CrossJoin`, the `DataItemLink` property **must be left blank** — no field comparisons are made.
- When no `SqlJoinType` is specified, the default is `LeftOuterJoin`.

**Choosing the right join type:**

```
LeftOuterJoin (most common for APIs):
  Parent: [A, B, C]    Child: [A, B]
  Result: [A+A, B+B, C+null]  ← All parents included

InnerJoin:
  Parent: [A, B, C]    Child: [A, B]
  Result: [A+A, B+B]          ← Only matches

RightOuterJoin:
  Parent: [A, B]       Child: [A, B, D]
  Result: [A+A, B+B, null+D]  ← All children included

FullOuterJoin:
  Parent: [A, B, C]    Child: [A, B, D]
  Result: [A+A, B+B, C+null, null+D]  ← All records from both

CrossJoin (no DataItemLink):
  Parent: [A, B]       Child: [X, Y]
  Result: [A+X, A+Y, B+X, B+Y]  ← Every combination
```

### DataItemLink Syntax

```al
DataItemLink = "[ChildField]" = [ParentDataItemName]."[ParentField]";
```

- Links child dataitem to parent using foreign key relationship
- Multiple links separated by commas:
  ```al
  DataItemLink = "Document Type" = [parentItem]."Document Type",
                 "Document No." = [parentItem]."No.";
  ```

### DataItemTableFilter

Apply fixed filters to restrict data at the dataitem level:

```al
dataitem([name]; "[Table]")
{
    DataItemTableFilter = "Document Type" = FILTER(Invoice | "Credit Memo");
    DataItemTableFilter = "Posting Date" = FILTER(<> 0D);
}
```

## Aggregation Methods

Use the `Method` property on columns for aggregation:

| Method | Description |
|--------|-------------|
| `Sum` | Total of numeric values |
| `Count` | Number of records |
| `Average` | Average of numeric values |
| `Min` | Minimum value |
| `Max` | Maximum value |

```al
column(totalAmount; "Amount (LCY)")
{
    Caption = 'TotalAmount', Locked = true;
    Method = Sum;
}
```

**Rule**: When using aggregation methods, non-aggregated columns become implicit GROUP BY fields.

## Filter Elements

Expose filters as OData query parameters:

```al
filter(dateFilter; "Posting Date")
{
    Caption = 'DateFilter', Locked = true;
}
```

- Filters appear as query parameters in the OData URL
- Use for date ranges, document type filtering, and status filtering
- Filter elements do not produce output columns

## Column Naming Conventions

| AL Field | Column Alias | Caption | Pattern |
|----------|-------------|---------|---------|
| `"Entry No."` | `entryNo` | `'Entry No.'` or `Locked = true` | camelCase alias |
| `"Customer No."` | `customerNumber` | `'CustomerNumber'`, Locked | Descriptive names |
| `"Posting Date"` | `postingDate` | `'PostingDate'`, Locked | Remove spaces |
| `"Amount (LCY)"` | `amountLCY` | `'AmountLCY'`, Locked | Include qualifier |
| `"Sales (LCY)"` | `totalSalesAmount` | `'TotalSalesAmount'`, Locked | Descriptive for aggregation |
| `"Global Dimension 1 Code"` | `globalDimension1Code` | | Standard dimension naming |

**Rules:**
- Use camelCase for all column aliases
- Set `Caption` with `Locked = true` for API queries to prevent translation issues
- Use descriptive aliases for aggregated columns (e.g., `totalSalesAmount` instead of `salesLCY`)

## API Query Design Workflow

1. **Define purpose** — What data needs exposure? Who consumes it? What aggregations?
2. **Identify tables** — Primary table and related tables for joins
3. **Plan joins** — Define DataItemLink relationships and SqlJoinType
4. **Select columns** — Pick fields to expose, decide on aggregations
5. **Add filters** — Expose date ranges and key filtering parameters
6. **Allocate object ID** — Query objects typically in dedicated range
7. **Implement query** — Create `.Query.al` file following naming convention
8. **Test endpoint** — Verify OData response structure and data

## File Naming Convention

Follow the pattern: `[Prefix][EntityName]API.Query.al`

Examples:
- `BCSStatLedgerEntryAPI.Query.al`
- `BCSCustomerSalesAPI.Query.al`
- `BCSItemInventoryAPI.Query.al`

Place in feature folder: `src/[Feature]/Query/` or alongside related feature files.

## Checklist

Before completing API query generation:

- [ ] QueryType = API set
- [ ] API properties defined (publisher, group, version, entity names)
- [ ] Caption set with `Locked = true`
- [ ] All dataitems have meaningful names
- [ ] DataItemLink defined for multi-table joins
- [ ] SqlJoinType specified for each nested dataitem
- [ ] DataItemTableFilter applied where needed
- [ ] Column aliases use camelCase
- [ ] Column Captions with `Locked = true`
- [ ] Aggregation Methods applied where needed
- [ ] Filter elements added for date ranges and key parameters
- [ ] File follows naming convention: `[Prefix][Entity]API.Query.al`

## References

For complete examples:

- [references/query-examples.md](references/query-examples.md) — Full working examples (single table, multi-table joins, aggregation patterns, dimension queries)

### External Resources

- [API Query Type](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-api-querytype) — Microsoft Docs
- [SqlJoinType Property](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/properties/devenv-sqljointype-property) — Join type reference
- [Linking and Joining Data Items](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-query-links-joins) — Join patterns
- [Query Object](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-query-object) — Query fundamentals
- [Query Properties](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/properties/devenv-properties) — Full property reference
