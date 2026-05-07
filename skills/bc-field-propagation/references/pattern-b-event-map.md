# Pattern B — EventSubscriber Event Map

Use this map when the posting codeunit does **NOT** call `TransferFields` from the source to the target. You must:
1. Extend the source table with a TableExt (same Field ID as on target).
2. Extend the target table with a TableExt (same Field ID).
3. Create a dedicated EventSubscriber codeunit for the module — one codeunit per posting chain, not one per field.

---

## How to confirm Pattern B applies

Open the BC posting codeunit. Search for `TransferFields` between the source record variable and the target insert variable. If `TransferFields` is absent, you need a subscriber using one of the events below.

---

## Event Map

| Source Table | Source ID | Target Table | Target ID | Posting Codeunit | Codeunit ID | Event Name |
|---|---|---|---|---|---|---|
| Item Journal Line | 83 | Item Ledger Entry | 32 | Item Jnl.-Post Line | 22 | `OnBeforeInsertItemLedgEntry` |
| Item Journal Line | 83 | Capacity Ledger Entry | 5832 | Item Jnl.-Post Line | 22 | `OnBeforeInsertCapLedgEntry` |
| Item Journal Line | 83 | Value Entry | 5802 | Item Jnl.-Post Line | 22 | `OnBeforeInsertValueEntry` |
| Gen. Journal Line | 81 | Cust. Ledger Entry | 21 | (Table event) | Table 21 | `OnAfterCopyCustLedgerEntryFromGenJnlLine` |
| Gen. Journal Line | 81 | Vendor Ledger Entry | 25 | (Table event) | Table 25 | `OnAfterCopyVendLedgerEntryFromGenJnlLine` |
| Gen. Journal Line | 81 | G/L Entry | 17 | Gen. Jnl.-Post Line | 12 | `OnAfterInsertGLEntry` |
| Resource Journal Line | 207 | Res. Ledger Entry | 203 | Res. Jnl.-Post Line | 212 | `OnAfterInsertResLedgEntry` |
| Cash Flow Worksheet Line | 841 | Cash Flow Forecast Entry | 840 | Cash Flow Wksh.-Register Line | 843 | `OnAfterCreateForecastEntry` |
| Routing Line | 99000758 | Prod. Order Routing Line | 5409 | Calculate Prod. Order | 99000773 | `OnAfterTransferRoutingLine` |
| Assembly Header | 900 | Posted Assembly Header | 910 | Assembly-Post | 900 | `OnAfterPostAssemblyHeader` |
| Assembly Line | 901 | Posted Assembly Line | 911 | Assembly-Post | 900 | `OnAfterPostAssemblyLine` |
| Warehouse Receipt Line | 7317 | Posted Whse. Receipt Line | 7319 | Whse.-Post Receipt | 5760 | `OnAfterPostWhseRcptLine` |
| Warehouse Shipment Line | 7321 | Posted Whse. Shipment Line | 7323 | Whse.-Post Shipment | 5763 | `OnAfterPostWhseShptLine` |
| Payment Order (ES) | 7000006 | Cartera Doc. | 7000001 | Bill Groups-Post (ES) | 7000000 | `OnAfterInsertPayableDocs` |

> **Note**: The `Payment Order → Cartera Doc.` entry applies only to Spanish Cartera localization. Omit it if the extension targets a non-ES market.

> **Note**: `Res. Ledger Entry` — the `OnAfterInsertResLedgEntry` event is raised inside Codeunit 212 ("Res. Jnl.-Post Line"). If that event is not accessible in your BC version, use `OnBeforeInsertResLedgEntry` or a local procedure integration event exposed by the posting codeunit.

---

## Subscriber Codeunit Structure (per module)

One dedicated codeunit per module/posting chain. Do not mix subscribers from different posting chains in the same codeunit.

```al
codeunit 50XXX "Ev[PostingChain][ModuleName]"
{
    // Subscribes to ONE posting chain (e.g., Item Journal Line posting)
    // All fields for this module from that chain go here.

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Item Jnl.-Post Line",
        'OnBeforeInsertItemLedgEntry', '', false, false)]
    local procedure OnBeforeInsertItemLedgEntry(var ItemLedgerEntry: Record "Item Ledger Entry";
        ItemJournalLine: Record "Item Journal Line")
    begin
        ItemLedgerEntry.MyCustomField := ItemJournalLine.MyCustomField;
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Item Jnl.-Post Line",
        'OnBeforeInsertCapLedgEntry', '', false, false)]
    local procedure OnBeforeInsertCapLedgEntry(var CapacityLedgerEntry: Record "Capacity Ledger Entry";
        ItemJournalLine: Record "Item Journal Line")
    begin
        CapacityLedgerEntry.MyCustomField := ItemJournalLine.MyCustomField;
    end;
}
```

---

## Field ID Alignment Rule

Always use the **same Field ID** on both the source TableExt and the target TableExt. This makes future migration to Pattern A trivial if BC later exposes a `TransferFields` path, and keeps IDs auditable across the extension.

```al
// Source: Item Journal Line TableExt
field(50100; MyCustomField; Text[50]) { ... }

// Target: Item Ledger Entry TableExt — same ID
field(50100; MyCustomField; Text[50]) { ... }

// Target: Capacity Ledger Entry TableExt — same ID
field(50100; MyCustomField; Text[50]) { ... }
```
