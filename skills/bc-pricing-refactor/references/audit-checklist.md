# Audit Checklist - Legacy Pricing Customizations

Use this checklist before starting the refactoring process.
Complete one row per customization found.

## 1. AL Object Scan

Search for the following strings in your AL codebase and document each hit:

| Search term | Found? | Objects affected |
|---|---|---|
| `"Sales Price"` (table reference) | ☐ | |
| `"Sales Line Discount"` (table reference) | ☐ | |
| `"Sales Price Calc. Mgt."` | ☐ | |
| `"Sales Prices"` (page reference) | ☐ | |
| `"Sales Line Discounts"` (page reference) | ☐ | |
| `Table 7002` (numeric reference) | ☐ | |
| `Table 7004` (numeric reference) | ☐ | |
| `Codeunit 7000` (numeric reference) | ☐ | |
| `OnAfterFindSalesLineDisc` | ☐ | |
| `OnAfterFindSalesPrice` | ☐ | |
| `OnBeforeFindSalesLineDisc` | ☐ | |
| `OnBeforeFindSalesPrice` | ☐ | |

## 2. Customization Inventory

For each customization found, fill one row:

| # | Extension/Object name | Object type | Legacy object touched | Purpose | Classification |
|---|---|---|---|---|---|
| 1 | | | | | Read / Write / UI / Logic |
| 2 | | | | | |
| 3 | | | | | |

Classification guide:
- Read - queries legacy table data for reporting or display
- Write - inserts or modifies records in legacy tables
- UI - page extension targeting legacy price/discount pages
- Logic - subscribes to events on legacy price calculation codeunits

## 3. Environment Check

- [ ] Feature Update "New Sales Pricing Experience" is NOT yet enabled in production
- [ ] A sandbox environment is available for safe testing
- [ ] Sandbox has representative pricing data (customers, price groups, campaigns)
- [ ] All dependent ISV extensions have been checked for legacy pricing references

## 4. Risk Assessment

| Risk | Low | Medium | High |
|---|---|---|---|
| Number of customizations found | <= 3 | 4-10 | > 10 |
| Custom fields on table 7002 / 7004 | None | 1-3 | > 3 |
| Custom price calculation logic | None | Events only | Full codeunit |
| ISV extensions with pricing dependencies | None | 1-2 | > 2 |

Overall risk: ☐ Low  ☐ Medium  ☐ High

## 5. Sign-off Before Enabling Feature Update

- [ ] All customizations inventoried and classified
- [ ] New AL objects created and tested in sandbox
- [ ] Data migration validated in sandbox
- [ ] UAT completed with business users
- [ ] Rollback plan documented (note: Feature Update cannot be reversed - rollback = restore DB backup)

Signed off by: ______________________  Date: __________