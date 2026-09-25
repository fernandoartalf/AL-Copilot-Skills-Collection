# Excel Export Patterns

## Core rule

Excel output must match visual matrix layout.

## Recommended export structure

- Sheet 1: Data
  - Matrix title and filters
  - Dynamic headers
  - One row per matrix row
  - Total rows
- Sheet 2: Metadata
  - Export timestamp
  - User
  - Filters
  - Record count

## Performance rule

- Build full export dataset once
- Pivot in memory to matrix layout
- Avoid repeated matrix recalculation per pagination page
