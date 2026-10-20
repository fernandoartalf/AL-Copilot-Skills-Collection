# Complete Example: Post-Migration Field Synchronization

## Business Scenario

**Company**: WAU Technologies customer (Business Central implementation)  
**Challenge**: After migrating to Business Central 27.0, 2.5 million records across 10 tables need field synchronization (`_ind` fields populated from standard BC fields)  
**Constraint**: Report times out after 12 hours when processing all records at once  
**Requirement**: Fully automated solution with progress visibility and time estimation  

## Technical Requirements

1. Process 2,500,000 records without timeout
2. Show real-time progress to users
3. Estimate completion time
4. Run automatically (no manual intervention)
5. Complete within 1 week
6. Minimal impact on business hours

## Solution Architecture

### Tables to Process

| Table | Records | Complexity | Est. Time/50K |
|-------|---------|------------|---------------|
| Sales Header | 12,345 | Simple | 5 min |
| Sales Line | 550,000 | Simple | 12 min |
| Sales Shipment Line | 780,000 | Medium | 15 min |
| Sales Invoice Line | 320,000 | Simple | 10 min |
| Cartera Doc | 25,000 | Simple | 3 min |
| Item Analysis View Entry | 450,000 | Simple | 11 min |
| Sales Cr.Memo Line | 85,000 | Simple | 8 min |
| Sales Shipment Header | 140,000 | Simple | 9 min |
| Sales Invoice Header | 95,000 | Simple | 8 min |
| FA Ledger Entry | 43,655 | Medium | 7 min |
| **TOTAL** | **2,500,000** | | **88 min/50K** |

**Batch size selected**: 50,000 records (balances speed vs timeout risk)

### Implementation Steps

#### Step 1: Create Progress Table (Table 50102)

```al
table 50102 "Ind Sync Progress"
{
    // ... (see Pattern 2: Progress Tracking Tables)
}
```

#### Step 2: Create Execution Log (Table 50106)

```al
table 50106 "Ind Sync Execution Log"
{
    // ... (see Pattern 2: Progress Tracking Tables)
}
```

#### Step 3: Create Batch Report (Report 50000)

```al
report 50000 "Procesos Post Migracion"
{
    ProcessingOnly = true;
    UsageCategory = Administration;

    Permissions = tabledata "Sales Header" = RIMD,
                  tabledata "Sales Line" = RIMD,
                  // ... (all 10 tables)
                  tabledata "Ind Sync Progress" = RIMD,
                  tabledata "Ind Sync Execution Log" = RIMD;

    trigger OnPreReport()
    begin
        StartTime := CurrentDateTime;
        BatchSize := 50000;
        TotalProcessed := 0;
        BatchLimitReached := false;

        if GuiAllowed then
            Window.Open('Processing...\' +
                       'Table: #1####################\' +
                       'Records: #2######');

        InitializeProgressTracking();
        
        SyncSalesHeader();
        SyncSalesLine();
        SyncSalesShipmentLine();
        SyncSalesInvoiceLine();
        SyncCarteraDoc();
        SyncItemAnalysisViewEntry();
        SyncSalesCrMemoLine();
        SyncSalesShipmentHeader();
        SyncSalesInvoiceHeader();
        SyncFALedgerEntry();
    end;

    trigger OnPostReport()
    var
        ExecutionLog: Record "Ind Sync Execution Log";
    begin
        ExecutionLog.LogExecution(
            StartTime, CurrentDateTime, TotalProcessed, BatchLimitReached,
            CountSalesHeader, CountSalesLine, CountSalesShipmentLine,
            CountSalesInvoiceLine, CountCarteraDoc, CountItemAnalysisView,
            CountSalesCrMemoLine, CountSalesShipmentHeader, 
            CountSalesInvoiceHeader, CountFALedgerEntry);

        if GuiAllowed then begin
            // ... show summary message
        end;
    end;

    local procedure SyncSalesHeader()
    var
        SalesHeader: Record "Sales Header";
    begin
        SalesHeader.SetLoadFields("No.", "Document Type", "Order Date", 
                                  "Shipping Agent Code", "Shipping Agent Code_ind");
        SalesHeader.SetRange("Shipping Agent Code_ind", '');

        if GuiAllowed then
            Window.Update(1, 'Sales Header');

        if SalesHeader.FindSet(true) then
            repeat
                SalesHeader."Document Type_ind" := SalesHeader."Document Type";
                SalesHeader."Order Date_ind" := SalesHeader."Order Date";
                SalesHeader."Shipping Agent Code_ind" := SalesHeader."Shipping Agent Code";
                SalesHeader.Modify(false);
                CountSalesHeader += 1;
            until SalesHeader.Next() = 0;

        UpdateProgress(Database::"Sales Header", CountSalesHeader);
    end;

    // ... (9 more Sync* procedures)

    local procedure InitializeProgressTracking()
    var
        Progress: Record "Ind Sync Progress";
        SalesHeader: Record "Sales Header";
        // ... (other records)
    begin
        if Progress.FindFirst() then
            exit;

        if not Progress.Get(Database::"Sales Header") then begin
            SalesHeader.SetRange("Shipping Agent Code_ind", '');
            Progress.Initialize(Database::"Sales Header", 'Sales Header', SalesHeader.Count());
            Progress.Insert(true);
        end;

        // ... (9 more table initializations)
    end;

    local procedure UpdateProgress(TableID: Integer; RecordsProcessed: Integer)
    var
        Progress: Record "Ind Sync Progress";
    begin
        if RecordsProcessed = 0 then
            exit;

        if Progress.Get(TableID) then
            Progress.IncrementProcessed(RecordsProcessed);
    end;
}
```

#### Step 4: Create Progress Monitoring Page (Page 50246)

```al
page 50246 "Ind Sync Progress List"
{
    PageType = List;
    SourceTable = "Ind Sync Progress";
    UsageCategory = Lists;
    Editable = false;

    layout
    {
        area(Content)
        {
            repeater(General)
            {
                field("Table Name"; Rec."Table Name") { }
                field("Progress %"; Rec."Progress %")
                {
                    StyleExpr = ProgressStyle;  // Color coding
                }
                field("Processed Records"; Rec."Processed Records") { }
                field("Remaining Records"; Rec."Remaining Records") { }
                field("Estimated Completion Time"; Rec."Estimated Completion Time") { }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(Refresh)
            {
                trigger OnAction()
                begin
                    CurrPage.Update(false);
                end;
            }
        }
    }
}
```

#### Step 5: Configure Job Queue

| Setting | Value |
|---------|-------|
| Object Type | Report |
| Object ID | 50000 |
| Recurring Job | Yes |
| Minutes Between Runs | 30 |
| Max Attempts | 100 |
| Starting Time | 22:00:00 (nights only) |
| Ending Time | 08:00:00 |

## Execution Timeline

### Night 1 (May 26, 22:00 - May 27, 08:00)

```
22:00 → Exec 1: Sales Header (12,345) + Sales Line (37,655) = 50,000 | 12 min
22:30 → Exec 2: Sales Line (50,000) = 50,000 | 13 min
23:00 → Exec 3: Sales Line (50,000) = 50,000 | 12 min
...
07:30 → Exec 20: Sales Shipment Line (50,000) = 50,000 | 14 min

Total Night 1: 1,000,000 records (40% complete)
```

**Progress check at 08:00**:
```
Sales Header: 100% ✅
Sales Line: 100% ✅
Sales Shipment Line: 25% (195,000 remaining)
Sales Invoice Line: 0%
... (other tables: 0%)

Overall: 40% complete
ETA: Thursday May 29, 02:00
```

### Night 2 (May 27, 22:00 - May 28, 08:00)

```
22:00 → Exec 21: Sales Shipment Line (50,000) | 15 min
22:30 → Exec 22: Sales Shipment Line (50,000) | 14 min
...
07:30 → Exec 40: Item Analysis View Entry (50,000) | 11 min

Total Night 2: 1,000,000 records (80% complete)
```

**Progress check at 08:00**:
```
Sales Shipment Line: 100% ✅
Sales Invoice Line: 100% ✅
Cartera Doc: 100% ✅
Item Analysis View Entry: 56% (200,000 remaining)
... (remaining tables: 0%)

Overall: 80% complete
ETA: Thursday May 29, 00:30
```

### Night 3 (May 28, 22:00 - May 29, 01:00)

```
22:00 → Exec 41: Item Analysis View Entry (50,000) | 11 min
22:30 → Exec 42: Item Analysis View Entry (50,000) | 10 min
23:00 → Exec 43: Item Analysis View Entry (50,000) | 11 min
23:30 → Exec 44: Item Analysis View Entry (50,000) | 10 min
00:00 → Exec 45: Sales Cr.Memo Line (85,000) + Sales Shipment Header (50,000) + ... | 12 min
00:30 → Exec 46: FA Ledger Entry (43,655) = 43,655 | 9 min
01:00 → Exec 47: 0 records processed, BatchLimitReached = false ✅

Job Queue stops automatically
```

**Final status**:
```
All tables: 100% ✅

Total executions: 47
Total duration: ~72 hours (3 nights)
Total active time: ~9.5 hours (avg 12 min/exec × 47 execs)
Manual interventions: 0
Timeouts: 0
Errors: 0
```

## Monitoring During Execution

### Day 1 (May 26, 16:00 - Pre-execution check)

User opens "Ind Sync Progress List":
```
All tables: Not Started
Progress initialized, ready for tonight's run
```

### Day 2 (May 27, 09:00 - Morning check)

User opens page:
```
Progress Overview:
  Sales Header: 100% (12,345 / 12,345) ✅
  Sales Line: 100% (550,000 / 550,000) ✅
  Sales Shipment Line: 25% (195,000 / 780,000) ⏳
  ... (others: 0%)

Estimated Completion: Thu May 29, 02:00
Avg Speed: 1,667 records/minute

Last Night's Stats:
  20 executions
  1,000,000 records processed
  ~240 minutes total (12 min avg/exec)
  Zero errors
```

### Day 3 (May 28, 09:00 - Progress check)

```
Progress: 80% overall
Remaining: 500,000 records
ETA: Tonight at 00:30

All tables except:
  Item Analysis View Entry: 56% (processing now)
  Sales Cr.Memo Line: 0% (pending)
  Sales Shipment Header: 0% (pending)
  Sales Invoice Header: 0% (pending)
  FA Ledger Entry: 0% (pending)
```

### Day 4 (May 29, 09:00 - Completion confirmed)

```
🎉 ALL TABLES COMPLETED

Execution Summary:
  Total records: 2,500,000
  Total time: 72 hours (3 nights)
  Active processing: 9.5 hours
  Executions: 47
  Errors: 0
  Timeouts: 0

Job Queue Status: On Hold (auto-stopped)
Next action: Review and clean up
```

## Performance Metrics

### Actual Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total duration | < 1 week | 3 nights | ✅ |
| Timeout errors | 0 | 0 | ✅ |
| Manual intervention | 0 | 0 | ✅ |
| Progress visibility | Real-time | Real-time | ✅ |
| Business hours impact | None | None | ✅ |
| Avg time per batch | 10-15 min | 12 min | ✅ |
| Error rate | < 0.1% | 0% | ✅ |

### Speed Analysis

```
Average processing speed: 1,667 records/minute (~100,000/hour)
Peak speed: 2,000 records/minute (simple tables)
Slowest: 1,200 records/minute (complex tables with lookups)

Batch size validation: 50,000 records → 12 min avg → ✅ Optimal
```

## Lessons Learned

### What Worked Well

1. **Batch limiting**: No timeouts, predictable execution time
2. **Progress tracking**: Users had full visibility, no complaints
3. **Job Queue automation**: Zero manual intervention over 3 nights
4. **Night-only schedule**: No business impact
5. **SetLoadFields optimization**: Reduced time by 40%
6. **Modify(false)**: Reduced time by 30%

### Optimizations Applied

| Optimization | Time Saved | Implementation |
|--------------|------------|----------------|
| SetLoadFields | ~40% | Load only 3-5 fields vs all 50 |
| Modify(false) | ~30% | Skip validation on bulk updates |
| Filter unprocessed | ~60% | SetRange before FindSet |
| Batch limiting | Prevented timeout | 50K limit with auto-resume |
| UI throttling | ~10% | Update every 100 vs every record |

**Without optimizations**: Would have timed out after 12 hours  
**With optimizations**: Completed in 9.5 hours active time over 3 nights

### Post-Completion Cleanup

1. Set Job Queue Status = "On Hold"
2. Archive execution log (47 entries)
3. Delete progress tracking tables (optional)
4. Document completion in change log

## Reusability

This implementation is generic enough to adapt for:
- Other post-migration field syncs
- Bulk data updates (price lists, customer groups)
- Data quality fixes (standardize formats, fill missing fields)
- Archival operations (move old records to history tables)
- Integration syncs (ERP → CRM data synchronization)

**Template available**: All code patterns documented in skill-batch-processing references.
