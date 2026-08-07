// ─────────────────────────────────────────────────────────────────────────────
// Template: Upgrade codeunit that seeds a default Report Selections entry
// on tenants that installed a previous version without it.
//
// If an upgrade codeunit for this feature already exists, ADD the tag
// guard + helper call into its OnUpgradePerCompany trigger — do NOT
// create a duplicate upgrade codeunit.
//
// Replace: {ID}            → object ID from app.json idRanges
//          {Affix}         → project affix (e.g. BCS)
//          {ShortName}     → short entity name (e.g. Stat. Acc.)
//          {InstallCU}     → the Install codeunit name (helper reuse)
//          {UpgTagDefCU}   → the Upgrade Tag Definitions codeunit name
// ─────────────────────────────────────────────────────────────────────────────
codeunit {ID} "{Affix} {ShortName} Upgrade"
{
    Subtype = Upgrade;
    Access = Internal;

    trigger OnUpgradePerCompany()
    var
        UpgradeTag: Codeunit "Upgrade Tag";
        UpgTagDef: Codeunit "{UpgTagDefCU}";
        InstallCU: Codeunit "{InstallCU}";
    begin
        if UpgradeTag.HasUpgradeTag(
            UpgTagDef.GetDefaultReportSelectionTag())
        then
            exit;

        InstallCU.InsertDefault{ShortName}ReportSelection();

        UpgradeTag.SetUpgradeTag(
            UpgTagDef.GetDefaultReportSelectionTag());
    end;

    // Register tag for companies created AFTER the tag was defined so
    // the upgrade code does not run again on new tenants.
    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Upgrade Tag",
        'OnGetPerCompanyUpgradeTags', '', false, false)]
    local procedure RegisterPerCompanyTags(var PerCompanyUpgradeTags: List of [Code[250]])
    var
        UpgTagDef: Codeunit "{UpgTagDefCU}";
    begin
        PerCompanyUpgradeTags.Add(UpgTagDef.GetDefaultReportSelectionTag());
    end;
}
