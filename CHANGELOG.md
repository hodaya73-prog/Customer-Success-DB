# Changelog

All notable changes to this project are documented here, newest first. See [PRACTICE.md](PRACTICE.md) for how this file is maintained.

## 2026-10-01 (later)

### Added
- GitHub Pages site for the dashboard: https://hodaya73-prog.github.io/Customer-Success-DB/ (served from `main`, root). The repository was made public, which GitHub Pages requires on the free plan.

### Changed
- `README.md`: added the live demo link.
- `index.html`: the "Open tickets" KPI card is now light red (was amber), and the "Add customer" button is mint green (was blue). The mint button uses dark text to keep contrast readable.
- `SPEC.md`: color scheme and KPI emphasis updated to match.

## 2026-10-01

### Added
- `index.html`: the Customer Retention Dashboard as a single file with no build step. KPI row, customer table with at-risk highlighting, search, filters, column sorting, add/edit/delete, CSV import (merge by ID with a summary and duplicate warning) and export, Hebrew/English with RTL/LTR, and data persistence in `localStorage`. Sample data is embedded and can be restored with "Reset data".
- `mock-customers.csv`: 40 fictitious customers for the dashboard (30 active, 8 at risk of which 3 are inactive, 13 with open tickets). Emails use `example.com`; phone numbers are fictitious.
- `SPEC.md`: full product specification in English (Customer Retention Dashboard): scope, business definitions, data model, functional and non-functional requirements, acceptance criteria and recorded decisions. The Hebrew working copy is kept local and is not published.
- `PRACTICE.md`: working agreement. Every change is committed, pushed, and documented.
- `CHANGELOG.md`: this file.
- `README.md`: initial project description (first commit).

### Changed
- `README.md`: replaced the placeholder with a project description and run instructions.
- `SPEC.md`: documented the "Inactive" tag in the table, automatic comma/semicolon detection on import, and the accepted `id` format.
- `SPEC.md`: defined the stored `lastProduct` keys (`entry`, `interior`, `safe_room`, `sliding`, `security`, `accessories`) and that import also accepts English or Hebrew labels.
