// =============================================================================
// Example: AL Test Codeunit Template for Pricing Refactor
// Skill: bc-pricing-refactor
// =============================================================================
// Covers the most important scenarios to validate after refactoring.
// Use it as a scenario template, not as copy-paste-ready test code.
// Before using it, confirm:
// 1. Test libraries available in your app/runtime.
// 2. Enum names and statuses used by your pricing stack.
// 3. The exact setup needed to enable the pricing feature in your environment.
// =============================================================================
/*
codeunit 50110 "Pricing Refactor Tests"
{
    Subtype = Test;
    TestPermissions = Disabled;

    var
        LibrarySales: Codeunit "Library - Sales";
        LibraryInventory: Codeunit "Library - Inventory";
        LibraryERM: Codeunit "Library - ERM";
        Assert: Codeunit Assert;
        IsInitialized: Boolean;

    local procedure Initialize()
    begin
        if IsInitialized then
            exit;

        IsInitialized := true;
    end;

    local procedure CreateActivePriceList(
        PriceType: Enum "Price Type";
        SourceType: Enum "Price Source Type";
        SourceNo: Code[20]): Code[20]
    var
        PriceListHeader: Record "Price List Header";
    begin
        PriceListHeader.Init();
        PriceListHeader.Validate("Price Type", PriceType);
        PriceListHeader.Validate("Source Type", SourceType);
        PriceListHeader.Validate("Source No.", SourceNo);
        PriceListHeader.Validate(Status, Enum::"Price Status"::Active);
        PriceListHeader.Insert(true);
        exit(PriceListHeader.Code);
    end;

    local procedure AddPriceLine(
        PriceListCode: Code[20];
        ItemNo: Code[20];
        UnitPrice: Decimal;
        MinQty: Decimal)
    var
        PriceListLine: Record "Price List Line";
    begin
        PriceListLine.Init();
        PriceListLine.Validate("Price List Code", PriceListCode);
        PriceListLine.Validate("Asset Type", Enum::"Price Asset Type"::Item);
        PriceListLine.Validate("Asset No.", ItemNo);
        PriceListLine.Validate("Amount Type", Enum::"Price Amount Type"::Price);
        PriceListLine.Validate("Minimum Quantity", MinQty);
        PriceListLine.Validate("Unit Price", UnitPrice);
        PriceListLine.Validate(Status, Enum::"Price Status"::Active);
        PriceListLine.Insert(true);
    end;

    local procedure AddDiscountLine(
        PriceListCode: Code[20];
        ItemNo: Code[20];
        DiscountPct: Decimal)
    var
        PriceListLine: Record "Price List Line";
    begin
        PriceListLine.Init();
        PriceListLine.Validate("Price List Code", PriceListCode);
        PriceListLine.Validate("Asset Type", Enum::"Price Asset Type"::Item);
        PriceListLine.Validate("Asset No.", ItemNo);
        PriceListLine.Validate("Amount Type", Enum::"Price Amount Type"::Discount);
        PriceListLine.Validate("Line Discount %", DiscountPct);
        PriceListLine.Validate(Status, Enum::"Price Status"::Active);
        PriceListLine.Insert(true);
    end;

    [Test]
    procedure Test_CustomerSpecificPriceAppliedOnSalesOrder()
    var
        Customer: Record Customer;
        Item: Record Item;
        SalesHeader: Record "Sales Header";
        SalesLine: Record "Sales Line";
        PriceListCode: Code[20];
        ExpectedPrice: Decimal;
    begin
        Initialize();

        LibrarySales.CreateCustomer(Customer);
        LibraryInventory.CreateItem(Item);
        Item.Validate("Unit Price", 100);
        Item.Modify(true);

        ExpectedPrice := 75;
        PriceListCode := CreateActivePriceList(
            Enum::"Price Type"::Sale,
            Enum::"Price Source Type"::Customer,
            Customer."No.");
        AddPriceLine(PriceListCode, Item."No.", ExpectedPrice, 0);

        LibrarySales.CreateSalesHeader(SalesHeader, SalesHeader."Document Type"::Order, Customer."No.");
        LibrarySales.CreateSalesLine(SalesLine, SalesHeader, SalesLine.Type::Item, Item."No.", 1);

        Assert.AreEqual(
            ExpectedPrice,
            SalesLine."Unit Price",
            'Customer-specific price should be applied on sales line.');
    end;
}
*/