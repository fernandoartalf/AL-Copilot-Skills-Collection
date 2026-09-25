# Periodicities Reference

Supported periodicities:

- Day
- Week
- Month
- Quarter
- Year
- Custom

## Key AL patterns

- Weekly start and end: CalcDate with current-week formulas
- Monthly start and end: CalcDate with current-month formulas
- Quarterly and yearly calculations using Date2DMY and period boundaries
- Custom period formulas via DateFormula

## Recommendations

- Warn when period count becomes too high
- Validate date filter input and parse boundaries early
- Keep labels clear and deterministic for matrix headers
