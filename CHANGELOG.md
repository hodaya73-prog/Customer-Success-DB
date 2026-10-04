# Changelog

All notable changes to this project are documented here, newest first. See [PRACTICE.md](PRACTICE.md) for how this file is maintained.

## 2026-10-04 (revert)

### Changed
- Reverted the Vite migration (commit `4138643`) at the owner's request. The project is back to the single-file `index.html` with the optional in-browser Airtable connection (Base ID, table name and token typed into the "Connect to Airtable" dialog, stored only in that browser). The Vite commit stays in the git history and can be restored.
- GitHub Pages serves the repository root from `main` again, and the Pages workflow, `package.json`, `vite.config.js`, `src/` and `.env.example` are removed.

## 2026-10-04

### Fixed
- Airtable connection error message now also mentions a wrong table name. Airtable answers 403 for an unknown table, which looked like a bad token.

### Added
- Optional Airtable connection in `index.html`. A "Connect to Airtable" dialog takes the Base ID, table name and a personal access token. The token is stored only in the user's browser and is never committed. While connected, the dashboard loads the table (paginated), writes add/edit/delete/import to Airtable in batches of 10, shows an error without changing the screen when a write fails, and offers Refresh and Disconnect. Airtable data is not cached in `localStorage`.
- A Content-Security-Policy meta tag that limits network requests to `api.airtable.com`.
- Handling for records created by hand in Airtable: missing customer IDs are assigned and written back, and a missing rating shows a dash and is excluded from "at risk" and from the average.
- `SPEC.md` section 7.10, acceptance criterion 11 and decision 11 describing the Airtable connection; `README.md` setup steps.

## 2026-10-01 (later)

### Added
- Airtable base "Customer Retention" with a `Customers` table, loaded from `mock-customers.csv` as committed in this repo (40 rows). This is groundwork for connecting the dashboard to Airtable; the dashboard itself is unchanged and still uses browser storage. Field mapping (names match the CSV columns): `name` (primary, text), `id` (text, unique key), `phone` (text), `email` (email), `city` (text), `lastPurchaseDate` (date, ISO), `totalPurchases` (currency, ₪), `lastProduct` (single select: entry, interior, safe_room, sliding, security, accessories), `satisfaction` (rating, 1-5 stars), `openTickets` (integer).

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
