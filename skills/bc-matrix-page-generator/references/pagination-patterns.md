# Pagination Patterns

## Goal

Show matrix columns in blocks while preserving performance.

## Recommended approach

1. Compute matrix data once into buffer table
2. Load only visible dimension slots per page offset
3. Use caption classes for dynamic headers
4. Keep Previous and Next actions simple
5. Never rebuild whole matrix in OnAfterGetRecord

## Useful conventions

- CurrentPageOffset integer
- Slot variables for top N dimensions
- DisplayOrder for deterministic rendering
