# Pattern A — TransferFields Table Map

Use this map when the source table is one of the tables below. BC standard posting codeunits call `TransferFields` internally, so adding the custom field with the **same Field ID** to every target table extension is sufficient — no event subscriber code is needed.

## How to confirm Pattern A applies

Open the BC source codeunit responsible for posting the document (e.g., "Sales-Post", "Purch.-Post", "TransferOrder-Post"). Look for a `TransferFields` call between the source record and the posted record. If it exists, you are in Pattern A.

---

## Sales Header (Table 36)

| Target Table ID | Target Table Name | Posting Codeunit |
|-----------------|-------------------|-----------------|
| 110 | Sales Shipment Header | Sales-Post (80) |
| 112 | Sales Invoice Header | Sales-Post (80) |
| 114 | Sales Cr.Memo Header | Sales-Post (80) |
| 6660 | Return Receipt Header | Sales-Post (80) |
| 5107 | Sales Header Archive | ArchiveManagement (5063) |

## Sales Line (Table 37)

| Target Table ID | Target Table Name | Posting Codeunit |
|-----------------|-------------------|-----------------|
| 111 | Sales Shipment Line | Sales-Post (80) |
| 113 | Sales Invoice Line | Sales-Post (80) |
| 115 | Sales Cr.Memo Line | Sales-Post (80) |
| 6661 | Return Receipt Line | Sales-Post (80) |
| 5108 | Sales Line Archive | ArchiveManagement (5063) |

## Purchase Header (Table 38)

| Target Table ID | Target Table Name | Posting Codeunit |
|-----------------|-------------------|-----------------|
| 120 | Purch. Rcpt. Header | Purch.-Post (90) |
| 122 | Purch. Inv. Header | Purch.-Post (90) |
| 124 | Purch. Cr. Memo Hdr. | Purch.-Post (90) |
| 6650 | Return Shipment Header | Purch.-Post (90) |
| 5109 | Purchase Header Archive | ArchiveManagement (5063) |

## Purchase Line (Table 39)

| Target Table ID | Target Table Name | Posting Codeunit |
|-----------------|-------------------|-----------------|
| 121 | Purch. Rcpt. Line | Purch.-Post (90) |
| 123 | Purch. Inv. Line | Purch.-Post (90) |
| 125 | Purch. Cr. Memo Line | Purch.-Post (90) |
| 6651 | Return Shipment Line | Purch.-Post (90) |
| 5110 | Purchase Line Archive | ArchiveManagement (5063) |

## Transfer Header (Table 5740)

| Target Table ID | Target Table Name | Posting Codeunit |
|-----------------|-------------------|-----------------|
| 5744 | Transfer Shipment Header | TransferOrder-Post (5704) |
| 5746 | Transfer Receipt Header | TransferOrder-Post (5704) |

## Transfer Line (Table 5741)

| Target Table ID | Target Table Name | Posting Codeunit |
|-----------------|-------------------|-----------------|
| 5745 | Transfer Shipment Line | TransferOrder-Post (5704) |
| 5747 | Transfer Receipt Line | TransferOrder-Post (5704) |

---

## Anti-Pattern Warning

If the source and all target table extensions share the **same Field ID**, and you also have an EventSubscriber that manually copies that field, the subscriber is redundant. Delete the subscriber — `TransferFields` already copies the value. Having both causes double-assignment and makes the code harder to maintain.

```al
// ❌ Redundant — TransferFields already copies field 50100 automatically
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", 'OnAfterSalesInvLineInsert', '', false, false)]
local procedure CopyCustomField(var SalesInvoiceLine: Record "Sales Invoice Line"; SalesLine: Record "Sales Line")
begin
    SalesInvoiceLine.MyCustomField := SalesLine.MyCustomField; // unnecessary
end;
```
