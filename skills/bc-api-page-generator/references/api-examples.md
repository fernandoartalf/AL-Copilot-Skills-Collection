# API Page Examples

## Actions Pattern for API Operations

```al
actions
{
    area(Processing)
    {
        // Bound action: POST /entityName({id})/Microsoft.NAV.actionName
        action(Post)
        {
            ApplicationArea = All;
            Caption = 'Post';

            trigger OnAction()
            var
                PostingCU: Codeunit "[Posting Codeunit]";
            begin
                PostingCU.Run(Rec);
            end;
        }

        action(Cancel)
        {
            ApplicationArea = All;
            Caption = 'Cancel';

            trigger OnAction()
            begin
                Rec.Status := Rec.Status::Cancelled;
                Rec.Modify(true);
            end;
        }

        // Action with parameters (accepts POST body)
        action(ApplyDiscount)
        {
            ApplicationArea = All;
            Caption = 'Apply Discount';

            trigger OnAction()
            var
                DiscountPct: Decimal;
            begin
                DiscountPct := GetActionParameter('discountPercent');
                ApplyDiscountToDocument(Rec, DiscountPct);
                SetActionResponse(Rec."Amount Including VAT");
            end;
        }
    }
}
```

**Action guidelines:**
- Actions become POST operations: `/entityName({id})/Microsoft.NAV.actionName`
- Use for operations that change state or perform complex logic
- Keep action names clear and verb-based
- Return results via `SetActionResponse` when relevant

## Validation Triggers Pattern

```al
trigger OnInsertRecord(BelowxRec: Boolean): Boolean
begin
    if Rec."[RequiredField]" = '' then
        Error('[FieldName] is required');

    ValidateRecord(Rec);
    exit(true);
end;

trigger OnModifyRecord(): Boolean
begin
    if Rec.Status = Rec.Status::Released then
        Error('Cannot modify released document');

    ValidateRecord(Rec);
    exit(true);
end;

trigger OnDeleteRecord(): Boolean
begin
    if HasRelatedRecords(Rec) then
        Error('Cannot delete record with related data');

    exit(true);
end;

local procedure ValidateRecord(var Record: Record "[SourceTable]")
begin
    // Centralized validation: business rules, credit limits, inventory, etc.
end;
```

**Validation principles:**
- Validate early in Insert/Modify triggers
- Return clear error messages
- Centralize validation in shared procedures
- Enforce referential integrity and business rules

---

## Example 1: Simple API Page (Single Table)

```al
page 50100 "Items API"
{
    APIVersion = 'v2.0';
    APIPublisher = 'mycompany';
    APIGroup = 'inventory';

    EntityCaption = 'Item';
    EntitySetCaption = 'Items';
    EntityName = 'item';
    EntitySetName = 'items';

    PageType = API;
    SourceTable = Item;
    DelayedInsert = true;
    ODataKeyFields = SystemId;

    AboutText = 'API endpoint for managing inventory items. Supports GET, POST, PATCH, DELETE operations.';

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                    Editable = false;
                }

                field(number; Rec."No.")
                {
                    Caption = 'Number';
                    Editable = false;
                }

                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }

                field(type; Rec.Type)
                {
                    Caption = 'Type';
                }

                field(baseUnitOfMeasure; Rec."Base Unit of Measure")
                {
                    Caption = 'Base Unit Of Measure';
                }

                field(unitPrice; Rec."Unit Price")
                {
                    Caption = 'Unit Price';
                }

                field(unitCost; Rec."Unit Cost")
                {
                    Caption = 'Unit Cost';
                }

                field(inventory; Rec.Inventory)
                {
                    Caption = 'Inventory';
                    Editable = false;
                }

                field(blocked; Rec.Blocked)
                {
                    Caption = 'Blocked';
                }

                field(lastModifiedDateTime; Rec.SystemModifiedAt)
                {
                    Caption = 'Last Modified Date Time';
                    Editable = false;
                }
            }
        }
    }

    trigger OnInsertRecord(BelowxRec: Boolean): Boolean
    begin
        if Rec.Description = '' then
            Error('Description is required');

        exit(true);
    end;
}
```

---

## Example 2: Header-Lines API Pages

### Header Page

```al
page 50110 "Sales Orders API"
{
    APIVersion = 'v2.0';
    APIPublisher = 'mycompany';
    APIGroup = 'sales';

    EntityCaption = 'Sales Order';
    EntitySetCaption = 'Sales Orders';
    EntityName = 'salesOrder';
    EntitySetName = 'salesOrders';

    PageType = API;
    SourceTable = "Sales Header";
    DelayedInsert = true;
    ODataKeyFields = SystemId;

    AboutText = 'API endpoint for managing sales orders. Supports GET, POST, PATCH, DELETE operations with order lines navigation.';

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                    Editable = false;
                }

                field(number; Rec."No.")
                {
                    Caption = 'Number';
                    Editable = false;
                }

                field(customerNumber; Rec."Sell-to Customer No.")
                {
                    Caption = 'Customer Number';
                }

                field(customerName; Rec."Sell-to Customer Name")
                {
                    Caption = 'Customer Name';
                    Editable = false;
                }

                field(orderDate; Rec."Order Date")
                {
                    Caption = 'Order Date';
                }

                field(shipmentDate; Rec."Shipment Date")
                {
                    Caption = 'Shipment Date';
                }

                field(totalAmount; Rec."Amount Including VAT")
                {
                    Caption = 'Total Amount';
                    Editable = false;
                }

                field(status; Rec.Status)
                {
                    Caption = 'Status';
                    Editable = false;
                }

                field(lastModifiedDateTime; Rec.SystemModifiedAt)
                {
                    Caption = 'Last Modified Date Time';
                    Editable = false;
                }

                // Navigation to lines
                part(salesOrderLines; "Sales Order Lines API")
                {
                    Caption = 'Lines';
                    EntityName = 'salesOrderLine';
                    EntitySetName = 'salesOrderLines';
                    SubPageLink = "Document Type" = field("Document Type"),
                                  "Document No." = field("No.");
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(Post)
            {
                ApplicationArea = All;
                Caption = 'Post';

                trigger OnAction()
                var
                    SalesPost: Codeunit "Sales-Post";
                begin
                    SalesPost.Run(Rec);
                end;
            }
        }
    }

    trigger OnInsertRecord(BelowxRec: Boolean): Boolean
    begin
        Rec."Document Type" := Rec."Document Type"::Order;

        if Rec."Sell-to Customer No." = '' then
            Error('Customer Number is required');

        exit(true);
    end;

    trigger OnModifyRecord(): Boolean
    begin
        if Rec.Status = Rec.Status::Released then
            Error('Cannot modify released sales order');

        exit(true);
    end;
}
```

### Lines Page

```al
page 50111 "Sales Order Lines API"
{
    APIVersion = 'v2.0';
    APIPublisher = 'mycompany';
    APIGroup = 'sales';

    EntityCaption = 'Sales Order Line';
    EntitySetCaption = 'Sales Order Lines';
    EntityName = 'salesOrderLine';
    EntitySetName = 'salesOrderLines';

    PageType = API;
    SourceTable = "Sales Line";
    DelayedInsert = true;
    ODataKeyFields = SystemId;

    AboutText = 'API endpoint for managing sales order line items. Supports GET, POST, PATCH, DELETE operations.';

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                    Editable = false;
                }

                field(documentId; Rec."Document SystemId")
                {
                    Caption = 'Document Id';
                }

                field(lineNumber; Rec."Line No.")
                {
                    Caption = 'Line Number';
                }

                field(type; Rec.Type)
                {
                    Caption = 'Type';
                }

                field(itemNumber; Rec."No.")
                {
                    Caption = 'Item Number';
                }

                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }

                field(quantity; Rec.Quantity)
                {
                    Caption = 'Quantity';
                }

                field(unitOfMeasure; Rec."Unit of Measure Code")
                {
                    Caption = 'Unit Of Measure';
                }

                field(unitPrice; Rec."Unit Price")
                {
                    Caption = 'Unit Price';
                }

                field(lineAmount; Rec."Line Amount")
                {
                    Caption = 'Line Amount';
                    Editable = false;
                }

                field(lineDiscount; Rec."Line Discount %")
                {
                    Caption = 'Line Discount %';
                }
            }
        }
    }

    trigger OnInsertRecord(BelowxRec: Boolean): Boolean
    begin
        if Rec."Document SystemId" = EmptyGuid() then
            Error('Document Id is required');

        if Rec."No." = '' then
            Error('Item Number is required');

        exit(true);
    end;
}
```

---

## HTTP Test Templates

```http
### Get all records
GET {{baseUrl}}/api/v2.0/companies({{companyId}})/[entityNames]
Authorization: Bearer {{token}}

### Get specific record
GET {{baseUrl}}/api/v2.0/companies({{companyId}})/[entityNames]({{id}})
Authorization: Bearer {{token}}

### Create record
POST {{baseUrl}}/api/v2.0/companies({{companyId}})/[entityNames]
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "fieldName": "value"
}

### Update record
PATCH {{baseUrl}}/api/v2.0/companies({{companyId}})/[entityNames]({{id}})
Authorization: Bearer {{token}}
Content-Type: application/json
If-Match: {{etag}}

{
    "fieldName": "newValue"
}
```
