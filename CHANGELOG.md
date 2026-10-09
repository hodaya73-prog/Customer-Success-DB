# Changelog

All notable changes to this project are documented here, newest first. See [PRACTICE.md](PRACTICE.md) for how this file is maintained.

## 2026-10-09 (weather refreshed once a day)

### Changed
- Weather data is now refreshed once a day, at 06:00 Israel time, instead of being cached for 30 minutes. A stored result is reused until 06:00 Israel time (Asia/Jerusalem, summer and winter time included, whatever time zone the viewer's device uses); the first lookup after 06:00 replaces it. Fewer calls to Open-Meteo, since weather does not need to be re-read every half hour.
- A tab left open overnight refreshes the weather once when it is shown again after 06:00 (`visibilitychange`). Nothing runs in the background, and the page cannot run at a fixed hour on its own, because it has no server. A true scheduled refresh would need a separate component, for example a scheduled GitHub Action.
- Failed lookups are still retried after 5 minutes. If the browser cannot work out Israel time, results are reused for 24 hours.
- `SPEC.md` section 7.12 and acceptance criterion 21 (the console-errors criterion is now 22) updated; the refresh hour and time zone are the constants `WX_DAY_START` and `WX_TZ` in `index.html`.

### Verification
- Tested in Chromium with a fixed clock: no request at 05:59 Israel time and one request at 06:00, in summer time, winter time, on the night the clocks change (25 Oct 2026) and with the viewer's device set to America/New_York and Asia/Tokyo; a tab open across 06:00 refreshes once. The earlier weather suite (61 checks, mocked Open-Meteo), the regression checks and the layout checks still pass.
- Not verified live: the new schedule against the real Open-Meteo service (the Claude Cloud environment cannot reach it, network proxy 403).

## 2026-10-05 (weather icon verified live)

### Changed
- `SPEC.md` section 7.12 now records the live check of the weather icon. The owner checked the published site in Chrome (DevTools, Network tab): after deleting `crd.weather.v1` from Local Storage and reloading, a request to `api.open-meteo.com/v1/forecast` with `current=weather_code` returned HTTP 200 and the icons appeared. This closes the open point from the entry below, where live access could not be verified from the Claude Cloud environment (network proxy 403).
- A hard reload that keeps `crd.weather.v1` sends no Open-Meteo request, because results are cached for 30 minutes. This is intended, and is noted in the spec.
- Still not verified live: the geocoding request (`geocoding-api.open-meteo.com`), which is sent only for a city that is not in the built-in list. No code changed.

## 2026-10-05 (weather icon)

### Added
- Weather icon beside the city name in the existing City column of the customer table, from the Open-Meteo API (no API key). The icon (sun, partly cloudy, cloudy, fog, rain, snow, thunderstorm) comes from the `weather_code` of the current weather; no column was added and no temperature is shown. Each icon has a text alternative in Hebrew or English that names the condition. If the weather cannot be loaded (unknown city, offline, timeout, HTTP error, empty or invalid answer), the city is shown without an icon and no message appears.
- Built-in coordinates for the 30 cities in the sample data plus common alternative spellings; other cities are looked up through the Open-Meteo geocoding API. Results are cached for 30 minutes in memory and in `localStorage` (`crd.weather.v1`, city names, coordinates and weather codes only). The forecast request asks only for `weather_code`, in batches of up to 50 cities, with an 8-second timeout.
- Footer line "Weather data by Open-Meteo.com" (Hebrew: "נתוני מזג אוויר מאת") with a link.
- `SPEC.md` section 7.12, acceptance criteria 15-21 and decisions 16-18 for the feature.

### Changed
- The Content-Security-Policy now allows `https://geocoding-api.open-meteo.com` and `https://api.open-meteo.com` in addition to `https://api.airtable.com`. All other network destinations stay blocked.
- Privacy: without an Airtable connection the only data that leaves the page is city names and the coordinates derived from them, sent to Open-Meteo. No customer names, phones, emails, IDs, ratings or tokens are sent. `SPEC.md` sections 2, 3, 5, 7.2, 7.10, 8, 9, 11 and 13 updated to match.
- Weather is display only: it is not stored in customer records, Airtable, the CSV export or the customers' `localStorage`, and it does not affect risk, "action required", the KPIs, search, filters or sorting. The Airtable connection and schema are unchanged.

### Verification
- Tested in Chromium against mocked Open-Meteo responses: icons for all 40 sample customers, the CSP allow-list, language switch, caching, unknown and prototype-like city names, failure modes (offline, HTTP 500, invalid JSON, empty answer, unknown code, timeout), the Airtable load path, and no horizontal overflow from 390 px to 1400 px.
- **Live access to Open-Meteo was not verified from the Claude Cloud environment, because the network proxy returned 403 for both Open-Meteo hosts.** The request format and the CORS behavior from a real browser still need to be checked once on a machine with open network access.

## 2026-10-04 (Airtable table instead of interface page)

### Added
- Airtable table "נדרשת פעולה דחופה" in the Customer Retention base, filled with the customers who satisfy the "action required" rule: C-0010 (נועה פרידמן) and C-0037 (רותם עטיה). Fields are the `Customers` columns, with `lastProduct` as plain text and `satisfaction` as a number so no colors appear, plus `apifyRunId` (`QzkEkCdSJOoayzjgE`) and `scanDate` (2026-10-04). It is a snapshot; there is no schedule or automation, so it does not refresh when Apify runs again.

### Removed
- The Airtable interface "Customer Retention" and its page "נדרשת פעולה דחופה" (added earlier today), replaced by the table above. The `Customers` table was not changed.
- `SPEC.md` (section 7.11, criterion 14, decision 14) and `README.md` updated to describe the table instead of the interface page.

## 2026-10-04 (Apify evidence)

### Added
- `docs/apify-scan-2026-10-04.md` and `data/apify-scan-2026-10-04.json`: the record of the Apify Google Search scrape behind the "Action required" flag (actor, run ID `QzkEkCdSJOoayzjgE`, dataset, settings, the six queries, findings and limits). Until now the run was described only in a sentence, with nothing in the repository to open.
- A footer line in the dashboard with the date of the last competitor-sale check and a link to that record.
- `SPEC.md` section 7.11 states where the evidence is and that the check is manual and not scheduled.

## 2026-10-04 (urgent action KPI, layout, Airtable page)

### Added
- "Urgent action required" (נדרשת פעולה דחופה) KPI card, a fifth card in the KPI row, light orange. It counts the customers flagged "action required" (entry or steel door, satisfaction exactly 3, while competitor sales are active). Today: 2.
- Airtable: interface "Customer Retention" with a page "נדרשת פעולה דחופה", a grid of the `Customers` table with a fixed filter (`satisfaction` = 3 and `lastProduct` is `entry` or `security`), sorted by open tickets. It lists C-0010 and C-0037. The Airtable tools available cannot create a grid view inside the table itself, so this interface page is the tab; no table, field or record was changed.
- A "Sort" dropdown that appears on narrow screens, where the column headers are hidden.

### Changed
- Table layout: the table now fits its container instead of scrolling sideways, so no column (including edit/delete and open tickets) is cut off. Up to 1100 px wide it is a normal table with wrapping cells and stacked edit/delete buttons; below that each customer is a card showing every field with its label. Fields run right to left in Hebrew.
- The "Action required" badge sits under the rating, and the badges no longer widen the column.
- Header buttons wrap on phones instead of running off-screen.
- `SPEC.md` updated (sections 2, 4, 7.1, 7.2, 7.11, 8, 10, 13). `PRACTICE.md` is unchanged and still needs the owner's decision on the merge-to-`main` step.

## 2026-10-04 (competitor promo flag)

### Added
- "Action required" flag in `index.html`. After a Google Search scrape (Apify `apify/google-search-scraper`, Israel, Hebrew, 6 queries) showed active competitor sales, customers whose last product is an entry door or a steel security door (`entry`, `security`) and whose satisfaction is exactly 3 get a light-orange row and a light-orange "נדרשת פעולה" / "Action required" badge next to the rating. Display only: the stored satisfaction stays 3 and nothing is written to Airtable. Currently affects C-0010 (נועה פרידמן) and C-0037 (רותם עטיה).
- Scrape findings behind the flag (2026-10-04): Rav-Bariach had a one-week sale of 15% off entry and interior doors plus 10% off selected models and a paid ad for entry-door deals; Hamadia (which merged with Reshafim) lists "up to 18% off entry and interior doors" from 22.9.26 to 6.10.26. Other sellers (Gaash, Isradoor, Lee Door, Oz Doors) also advertise entry-door sales.
- `COMPETITOR_PROMO_ACTIVE` constant in `index.html`; set it to `false` to switch the flag off once the sales end.

## 2026-10-04 (About)

### Changed
- GitHub "About" box filled in: a short description and the repository link (https://github.com/hodaya73-prog/Customer-Success-DB) as the website, so the project can be shared with one link.

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
