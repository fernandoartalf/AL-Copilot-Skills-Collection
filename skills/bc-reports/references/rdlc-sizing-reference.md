# RDLC Sizing Reference

## Unit Conversions

| Unit | cm equivalent |
|------|--------------|
| 11 pt (standard row) | ≈ 0.388 cm |
| 1 pt | ≈ 0.03528 cm |
| 1 cm | 28.346 pt |

## Standard Measurements

| Element | Value |
|---------|-------|
| Row height (11 pt) | 0.388 cm |
| Row spacing between rows | 0.39 cm |
| Minimum bottom margin in section | 0.167 cm |

## Height Calculation Walkthrough

**Scenario:** PageHeader already has a field at Top=4.39469 cm. Adding a new field below it.

```
New field Top    = 4.39469 + 0.39      = 4.78469 cm
New field Height = 11pt                ≈ 0.388 cm
Bottom margin                          = 0.167 cm (minimum)

New Section Height = 4.78469 + 0.388 + 0.167 = 5.33969 cm
```

Round to 5 decimal places → `5.33969cm` (or adjust to match existing precision, e.g. `5.33309cm`).

## Page Width Reference

| Format | Page Width | Left Margin | Right Margin | Available Body Width |
|--------|------------|-------------|--------------|----------------------|
| A4 Portrait | 21 cm | 1.41111 cm | 1.41111 cm | 18.17778 cm |
| A4 Landscape | 29.7 cm | 1.41111 cm | 1.41111 cm | 26.87778 cm |
| Letter Portrait | 21.59 cm | 1.495 cm | 1.495 cm | 18.6 cm |

> Margins may vary per report. Always read `<LeftMargin>` and `<RightMargin>` from the actual RDLC file before calculating.

## Proportional Column Reduction Example

Current Tablix width: 18.5 cm  
Available width: 18.17778 cm  
Reduction factor: 18.17778 / 18.5 = **0.9826**

| Column | Original | Reduced (× 0.9826) |
|--------|----------|---------------------|
| Col A | 3.0 cm | 2.9478 cm |
| Col B | 5.0 cm | 4.913 cm |
| Col C | 4.0 cm | 3.9304 cm |
| Col D | 6.5 cm | 6.3869 cm |
| **Total** | **18.5 cm** | **18.1781 cm ✅** |
