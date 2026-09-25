---
name: bc-matrix-page-generator
description: Generates interactive matrix pages for Business Central with configurable periodicity (day, week, month, quarter, year, custom), flexible orientation, pagination, and Excel export in visual matrix format.
---

# Business Central Matrix Page Generator

Generates production-ready AL matrix solutions with these capabilities:

- Configurable periodicity: day, week, month, quarter, year, custom
- Flexible orientation:
  - Rows = periods, columns = dimension entities
  - Rows = dimensions, columns = periods
- Pagination for dynamic columns
- Optional ranking Query generation
- Excel export with same visual layout as matrix page
- DrillDown patterns for source records
- Temporary or persistent buffer table option

## Trigger guidance

Use this skill when user asks for:

- create matrix page
- generate weekly or monthly matrix
- matrix with pagination
- export matrix to excel
- period x customer matrix
- customer x period matrix
- item planning matrix

## Mandatory interview before generation

Ask these questions every time:

1. Matrix orientation?
2. Periodicity?
3. Dimension entity and source?
4. Measures to calculate?
5. Pagination size?
6. Temporary or persistent buffer table?
7. Include ranking Query?
8. Include Excel export?
9. DrillDown targets?
10. Object IDs and naming preferences?

## Generated artifacts

- Buffer table
- Management codeunit
- Matrix page
- Optional ranking query
- Optional permission set

## Quality and safety boundaries

- No customer-specific names in generated code
- No hardcoded credentials, hostnames, paths, or internal endpoints
- Validate date filters and empty datasets
- Avoid recalculating full matrix per pagination page
- Build full dataset once for export, then pivot to visual matrix format

## Anti-patterns to avoid

- Repeating full matrix calculation in pagination loops
- Exporting normalized tabular output that does not match matrix layout
- Hardcoded fixed column assumptions
- Missing total rows

## References

- references/periodicities.md
- references/pagination-patterns.md
- references/excel-export.md
- references/examples/weekly-customer-matrix.md
- references/examples/monthly-item-matrix.md

## Acknowledgments

Inspired by real-world implementation patterns from Takasago project and WAU Technologies team, generalized for community reuse.
