// =============================================================================
// Example: Custom Price Calculation Method Template for Business Central
// Skill: bc-pricing-refactor
// Scenario: Replace the sample business rule with your own pricing dimension
// =============================================================================
// This file is a version-agnostic scaffold for a custom price calculation flow.
// It is intentionally kept as a commented template because interface contracts,
// event publishers, and page/control names can vary by runtime.
//
// Before using this file:
// 1. Inspect "Price Calculation" and "Price Source" interfaces in your symbols.
// 2. Confirm the registration event on Codeunit "Price Calculation Mgt.".
// 3. Confirm the target page that hosts price list lines in your runtime.
// 4. Only then adapt the snippets below into compilable AL.
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Custom price calculation codeunit template
// -----------------------------------------------------------------------------
/*
codeunit 50100 "My Price Calculation"
{
    var
        CurrPriceCalculationSetup: Record "Price Calculation Setup";
        PriceFound: Boolean;
        FoundUnitPrice: Decimal;
        FoundDiscountPct: Decimal;

    /// <summary>
    /// Initialize the engine with the document line and setup record.
    /// Called once per document line before any price lookups.
    /// </summary>
    // Replace this signature with the exact one from your runtime.
    procedure Init(NewSalesHeader: Variant; var PriceCalculationSetup: Record "Price Calculation Setup")
    begin
        CurrPriceCalculationSetup := PriceCalculationSetup;
    end;

    /// <summary>
    /// Look up whether a price exists for the given line and amount type.
    /// Return TRUE if a price was found, FALSE otherwise.
    /// </summary>
    procedure FindPrice(Line: Variant; AmountType: Enum "Price Amount Type"): Boolean
    var
        SalesLine: Record "Sales Line";
        CandidatePriceListLine: Record "Price List Line";
    begin
        PriceFound := false;

        if not Line.IsRecord() then
            exit(false);

        SalesLine := Line;

        CandidatePriceListLine.Reset();
        CandidatePriceListLine.SetRange("Price Type", Enum::"Price Type"::Sale);
        CandidatePriceListLine.SetRange("Asset Type", Enum::"Price Asset Type"::Item);
        CandidatePriceListLine.SetRange("Asset No.", SalesLine."No.");

        if CandidatePriceListLine.FindFirst() then begin
            FoundUnitPrice := CandidatePriceListLine."Unit Price";
            FoundDiscountPct := CandidatePriceListLine."Line Discount %";
            PriceFound := true;
        end;

        exit(PriceFound);
    end;

    /// <summary>
    /// Apply the found price to the document line.
    /// Called after FindPrice returns TRUE.
    /// </summary>
    procedure ApplyPrice(AmountType: Enum "Price Amount Type"; var Line: Variant)
    var
        SalesLine: Record "Sales Line";
    begin
        if not PriceFound then
            exit;

        SalesLine := Line;
        if AmountType = Enum::"Price Amount Type"::Price then
            SalesLine."Unit Price" := FoundUnitPrice;
        Line := SalesLine;
    end;

    /// <summary>
    /// Apply the found discount to the document line.
    /// </summary>
    procedure ApplyDiscount(var Line: Variant)
    var
        SalesLine: Record "Sales Line";
    begin
        if not PriceFound then
            exit;

        SalesLine := Line;
        SalesLine."Line Discount %" := FoundDiscountPct;
        Line := SalesLine;
    end;

    procedure CountDiscount(ShowAll: Boolean): Integer
    begin
        exit(0);
    end;

    procedure CountPrice(ShowAll: Boolean): Integer
    begin
        exit(0);
    end;

    procedure GetLine(var Line: Variant)
    begin
    end;

    procedure IsDiscountAllowed(FieldName: Text; var IsHandled: Boolean)
    begin
    end;

    procedure PickDiscount()
    begin
    end;

    procedure PickPrice()
    begin
    end;

    procedure ShowPrices(Line: Variant)
    begin
    end;
}

enumextension 50100 "My Price Method Ext" extends "Price Calculation Method"
{
    value(50100; "My Custom Method")
    {
        Caption = 'My Custom Method';
        Implementation = "Price Calculation" = "My Price Calculation";
    }
}

codeunit 50101 "My Price Setup Subscriber"
{
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Price Calculation Mgt.",
        'OnFindSupportedSetup', '', false, false)]
    local procedure RegisterMyMethod(
        var TempPriceCalculationSetup: Record "Price Calculation Setup" temporary)
    begin
        TempPriceCalculationSetup.InsertDuplicate(
            Enum::"Price Calculation Method"::"My Custom Method",
            Enum::"Price Type"::Sale,
            Enum::"Price Asset Type"::Item,
            Codeunit::"My Price Calculation",
            false);
    end;
}

tableextension 50100 "My Price List Line Ext" extends "Price List Line"
{
    fields
    {
        field(50100; "My Pricing Dimension"; Code[20])
        {
            Caption = 'My Pricing Dimension';
            DataClassification = CustomerContent;
        }
    }
}

pageextension 50100 "My Price List Line Page Ext" extends "Price List Lines"
{
    layout
    {
        addafter("Asset No.")
        {
            field("My Pricing Dimension"; Rec."My Pricing Dimension")
            {
                ApplicationArea = All;
                ToolTip = 'Specifies the custom discriminator that your pricing logic uses.';
            }
        }
    }
}
*/