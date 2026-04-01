# API Query Examples

## Example 1: Single Table — Ledger Entry Query

Exposes statistical ledger entries as a read-only API endpoint with all fields.

```al
query 60704 "BCS Stat. Ledger Entry API"
{
    APIGroup = 'statisticAccounts';
    APIPublisher = 'businessCentralScout';
    APIVersion = 'v2.0';
    Caption = 'StatLedgerEntryAPIQuery';
    EntityName = 'statisticalLedgerEntryQuery';
    EntitySetName = 'statisticalLedgerEntriesQuery';
    QueryType = API;

    elements
    {
        dataitem(statisticalLedgerEntry; "Statistical Ledger Entry")
        {
            column(entryNo; "Entry No.")
            {
                Caption = 'Entry No.';
            }
            column(statisticalAccountNo; "Statistical Account No.")
            {
                Caption = 'Statistical Account No.';
            }
            column(postingDate; "Posting Date")
            {
                Caption = 'Posting Date';
            }
            column(documentNo; "Document No.")
            {
                Caption = 'Document No.';
            }
            column(description; Description)
            {
                Caption = 'Description';
            }
            column(amount; Amount)
            {
                Caption = 'Amount';
            }
            column(globalDimension1Code; "Global Dimension 1 Code")
            {
                Caption = 'Global Dimension 1 Code';
            }
            column(globalDimension2Code; "Global Dimension 2 Code")
            {
                Caption = 'Global Dimension 2 Code';
            }
            column(userID; "User ID")
            {
                Caption = 'User ID';
            }
            column(journalBatchName; "Journal Batch Name")
            {
                Caption = 'Journal Batch Name';
            }
            column(transactionNo; "Transaction No.")
            {
                Caption = 'Transaction No.';
            }
            column(reversed; Reversed)
            {
                Caption = 'Reversed';
            }
            column(reversedByEntryNo; "Reversed by Entry No.")
            {
                Caption = 'Reversed by Entry No.';
            }
            column(reversedEntryNo; "Reversed Entry No.")
            {
                Caption = 'Reversed Entry No.';
            }
            column(dimensionSetID; "Dimension Set ID")
            {
                Caption = 'Dimension Set ID';
            }
            column(shortcutDimension3Code; "Shortcut Dimension 3 Code")
            {
                Caption = 'Shortcut Dimension 3 Code';
            }
            column(shortcutDimension4Code; "Shortcut Dimension 4 Code")
            {
                Caption = 'Shortcut Dimension 4 Code';
            }
            column(shortcutDimension5Code; "Shortcut Dimension 5 Code")
            {
                Caption = 'Shortcut Dimension 5 Code';
            }
            column(shortcutDimension6Code; "Shortcut Dimension 6 Code")
            {
                Caption = 'Shortcut Dimension 6 Code';
            }
            column(shortcutDimension7Code; "Shortcut Dimension 7 Code")
            {
                Caption = 'Shortcut Dimension 7 Code';
            }
            column(shortcutDimension8Code; "Shortcut Dimension 8 Code")
            {
                Caption = 'Shortcut Dimension 8 Code';
            }
        }
    }
}
```

**Key points:**
- Single dataitem pattern for flat table exposure
- All columns use camelCase aliases
- No aggregation — exposes raw ledger data
- Endpoint: `../businessCentralScout/statisticAccounts/v2.0/companies({id})/statisticalLedgerEntriesQuery`

---

## Example 2: Multi-Table Join — Customer Sales Aggregation

Joins Customer and Cust. Ledger Entry with aggregation and filtering. Based on [Microsoft's API query example](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-api-querytype).

```al
query 50100 "BCS Customer Sales API"
{
    QueryType = API;
    APIPublisher = 'contoso';
    APIGroup = 'app1';
    APIVersion = 'v1.0';
    Caption = 'customerSales', Locked = true;
    EntityName = 'customerSale';
    EntitySetName = 'customerSales';

    elements
    {
        dataitem(customer; Customer)
        {
            column(customerId; Id)
            {
                Caption = 'Id', Locked = true;
            }
            column(customerNumber; "No.")
            {
                Caption = 'No', Locked = true;
            }
            column(name; Name)
            {
                Caption = 'Name', Locked = true;
            }

            dataitem(custLedgerEntry; "Cust. Ledger Entry")
            {
                DataItemLink = "Customer No." = customer."No.";
                SqlJoinType = LeftOuterJoin;
                DataItemTableFilter = "Document Type" = FILTER(Invoice | "Credit Memo");

                column(totalSalesAmount; "Sales (LCY)")
                {
                    Caption = 'TotalSalesAmount', Locked = true;
                    Method = Sum;
                }

                filter(dateFilter; "Posting Date")
                {
                    Caption = 'DateFilter', Locked = true;
                }
            }
        }
    }
}
```

**Key points:**
- Two dataitems joined via `DataItemLink`
- `LeftOuterJoin` ensures all customers appear even with no ledger entries
- `DataItemTableFilter` restricts to invoices and credit memos
- `Method = Sum` aggregates sales amount
- `filter` element exposes posting date as OData query parameter
- `customerNumber` and `name` become implicit GROUP BY columns
- Endpoint: `../contoso/app1/v1.0/companies({id})/customerSales`

---

## Example 3: Multi-Table Join — Item Inventory with Location

Joins Item and Item Ledger Entry to show inventory by item and location.

```al
query 50101 "BCS Item Inventory API"
{
    QueryType = API;
    APIPublisher = 'businessCentralScout';
    APIGroup = 'inventory';
    APIVersion = 'v2.0';
    Caption = 'itemInventory', Locked = true;
    EntityName = 'itemInventory';
    EntitySetName = 'itemInventories';

    elements
    {
        dataitem(item; Item)
        {
            column(itemId; SystemId)
            {
                Caption = 'ItemId', Locked = true;
            }
            column(itemNumber; "No.")
            {
                Caption = 'ItemNumber', Locked = true;
            }
            column(itemDescription; Description)
            {
                Caption = 'ItemDescription', Locked = true;
            }
            column(baseUnitOfMeasure; "Base Unit of Measure")
            {
                Caption = 'BaseUnitOfMeasure', Locked = true;
            }

            dataitem(itemLedgerEntry; "Item Ledger Entry")
            {
                DataItemLink = "Item No." = item."No.";
                SqlJoinType = LeftOuterJoin;

                column(locationCode; "Location Code")
                {
                    Caption = 'LocationCode', Locked = true;
                }
                column(totalQuantity; Quantity)
                {
                    Caption = 'TotalQuantity', Locked = true;
                    Method = Sum;
                }
                column(totalInvoicedQuantity; "Invoiced Quantity")
                {
                    Caption = 'TotalInvoicedQuantity', Locked = true;
                    Method = Sum;
                }

                filter(postingDateFilter; "Posting Date")
                {
                    Caption = 'PostingDateFilter', Locked = true;
                }
                filter(entryTypeFilter; "Entry Type")
                {
                    Caption = 'EntryTypeFilter', Locked = true;
                }
            }
        }
    }
}
```

**Key points:**
- Groups inventory by item and location
- `LeftOuterJoin` includes items with zero inventory
- Two aggregation columns: `totalQuantity` and `totalInvoicedQuantity`
- Two filter elements for flexible OData querying
- `locationCode` is a non-aggregated column, becoming a GROUP BY field

---

## Example 4: Three-Table Join — Sales Document with Customer and Lines

Joins Sales Header, Sales Line, and Customer for a comprehensive sales view.

```al
query 50102 "BCS Sales Summary API"
{
    QueryType = API;
    APIPublisher = 'businessCentralScout';
    APIGroup = 'sales';
    APIVersion = 'v2.0';
    Caption = 'salesSummary', Locked = true;
    EntityName = 'salesSummary';
    EntitySetName = 'salesSummaries';

    elements
    {
        dataitem(salesHeader; "Sales Header")
        {
            DataItemTableFilter = "Document Type" = CONST(Order);

            column(documentNo; "No.")
            {
                Caption = 'DocumentNo', Locked = true;
            }
            column(customerNo; "Sell-to Customer No.")
            {
                Caption = 'CustomerNo', Locked = true;
            }
            column(orderDate; "Order Date")
            {
                Caption = 'OrderDate', Locked = true;
            }
            column(status; Status)
            {
                Caption = 'Status', Locked = true;
            }

            dataitem(customer; Customer)
            {
                DataItemLink = "No." = salesHeader."Sell-to Customer No.";
                SqlJoinType = InnerJoin;

                column(customerName; Name)
                {
                    Caption = 'CustomerName', Locked = true;
                }

                dataitem(salesLine; "Sales Line")
                {
                    DataItemLink = "Document Type" = salesHeader."Document Type",
                                   "Document No." = salesHeader."No.";
                    SqlJoinType = InnerJoin;

                    column(totalLineAmount; "Line Amount")
                    {
                        Caption = 'TotalLineAmount', Locked = true;
                        Method = Sum;
                    }
                    column(totalQuantity; Quantity)
                    {
                        Caption = 'TotalQuantity', Locked = true;
                        Method = Sum;
                    }
                    column(lineCount; "Line No.")
                    {
                        Caption = 'LineCount', Locked = true;
                        Method = Count;
                    }
                }
            }
        }
    }
}
```

**Key points:**
- Three nested dataitems forming a chain of joins
- `DataItemTableFilter` on root dataitem restricts to Sales Orders
- Customer joined via `InnerJoin` (only orders with valid customers)
- Sales Lines joined with composite key (`Document Type` + `Document No.`)
- Multiple aggregation methods: `Sum` and `Count`

---

## Example 5: G/L Entry Analysis Query with Multiple Dimensions

```al
query 50103 "BCS GL Entry Analysis API"
{
    QueryType = API;
    APIPublisher = 'businessCentralScout';
    APIGroup = 'finance';
    APIVersion = 'v2.0';
    Caption = 'glEntryAnalysis', Locked = true;
    EntityName = 'glEntryAnalysis';
    EntitySetName = 'glEntryAnalyses';

    elements
    {
        dataitem(glEntry; "G/L Entry")
        {
            column(glAccountNo; "G/L Account No.")
            {
                Caption = 'GLAccountNo', Locked = true;
            }
            column(globalDimension1Code; "Global Dimension 1 Code")
            {
                Caption = 'GlobalDimension1Code', Locked = true;
            }
            column(globalDimension2Code; "Global Dimension 2 Code")
            {
                Caption = 'GlobalDimension2Code', Locked = true;
            }
            column(sourceType; "Source Type")
            {
                Caption = 'SourceType', Locked = true;
            }
            column(sourceNo; "Source No.")
            {
                Caption = 'SourceNo', Locked = true;
            }
            column(totalDebitAmount; "Debit Amount")
            {
                Caption = 'TotalDebitAmount', Locked = true;
                Method = Sum;
            }
            column(totalCreditAmount; "Credit Amount")
            {
                Caption = 'TotalCreditAmount', Locked = true;
                Method = Sum;
            }
            column(totalAmount; Amount)
            {
                Caption = 'TotalAmount', Locked = true;
                Method = Sum;
            }
            column(entryCount; "Entry No.")
            {
                Caption = 'EntryCount', Locked = true;
                Method = Count;
            }

            filter(postingDateFilter; "Posting Date")
            {
                Caption = 'PostingDateFilter', Locked = true;
            }
            filter(documentTypeFilter; "Document Type")
            {
                Caption = 'DocumentTypeFilter', Locked = true;
            }
        }
    }
}
```

**Key points:**
- Single table with heavy aggregation for financial analysis
- Grouped by account, dimensions, source type, and source no.
- Multiple `Sum` aggregations for debit, credit, and net amount
- `Count` on entry no. for volume metrics
- Date and document type filters for flexible querying

---

## Common Patterns

### Pattern: Locked Captions for API Queries

Always use `Locked = true` on captions in API queries to prevent translation from changing OData property names:

```al
column(customerName; Name)
{
    Caption = 'CustomerName', Locked = true;
}
```

### Pattern: Multi-Version API Support

Expose the same query across multiple API versions:

```al
query 50100 "BCS Customer Sales API"
{
    APIVersion = 'v1.0', 'v2.0';
    // ... rest of query
}
```

### Pattern: Composite DataItemLink

Join on multiple fields (common for document line tables):

```al
dataitem(salesLine; "Sales Line")
{
    DataItemLink = "Document Type" = salesHeader."Document Type",
                   "Document No." = salesHeader."No.";
    SqlJoinType = InnerJoin;
}
```

### Pattern: Fixed Filter with DataItemTableFilter

Restrict a dataitem to specific record types:

```al
dataitem(custLedgerEntry; "Cust. Ledger Entry")
{
    DataItemTableFilter = "Document Type" = FILTER(Invoice | "Credit Memo");
    // or for a single value:
    DataItemTableFilter = "Document Type" = CONST(Invoice);
}
```

### Pattern: Exposing Dimension Columns

Include shortcut dimension codes for analytical queries:

```al
column(globalDimension1Code; "Global Dimension 1 Code")
{
    Caption = 'GlobalDimension1Code', Locked = true;
}
column(globalDimension2Code; "Global Dimension 2 Code")
{
    Caption = 'GlobalDimension2Code', Locked = true;
}
column(shortcutDimension3Code; "Shortcut Dimension 3 Code")
{
    Caption = 'ShortcutDimension3Code', Locked = true;
}
```
