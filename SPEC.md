# SPEC — Customer Retention Dashboard

> **Status:** Draft, updated with the department manager's decisions (see section 13).
> **Product name:** Customer Retention Dashboard

---

## 1. Background and Goal

A door store runs a customer retention department. The department manager needs a single screen that lets them:

1. See the state of the customer base and the level of customer satisfaction at a glance.
2. Spot customers at risk of churn immediately.
3. Manage the customer list: add, edit, delete, search, filter, sort, import and export.

**Design principles:** clean, light, simple to use, clear and easy to operate. The only user is the department manager. There are no roles and no login.

## 2. Scope

**In scope (V1):**

- A single screen: KPI row, toolbar (search, filters, import, export, add) and customer table.
- Add, edit and delete a customer.
- CSV import and CSV export.
- Free-text search, filters and column sorting.
- Hebrew/English language switch, including text direction (RTL/LTR).
- Mock data loaded on first launch.
- Optional connection to an Airtable base, as an alternative to browser storage (section 7.10).
- Competitor-sale watch: an "Action required" flag and an "Urgent action required" KPI for customers exposed to active competitor sales (section 7.11).
- A small current-weather icon beside the city name in the existing City column, from the Open-Meteo API (section 7.12).

**Out of scope (V1):**

- Login, roles and multiple users.
- A custom server or database of our own. Cross-device sync is available only through the optional Airtable connection.
- Charts, historical reports, and tracking satisfaction changes over time.
- Ticket management (open tickets are shown as a number only, without detail).
- Weather beyond a small icon: no temperature, forecast or history in the table, no weather column, filter or sort, and no weather data stored anywhere (section 7.12).

## 3. Technology Decisions (approved)

| Topic | Decision |
|---|---|
| Technology | HTML + CSS + JavaScript (vanilla) in a single file, no build step, no installation |
| Data persistence | Browser `localStorage` by default. Mock data is loaded on first launch. A "Reset" button restores the mock data. CSV export serves as the backup. Optionally the dashboard connects directly to an Airtable base and stores the customers there (section 7.10) |
| Customer fields | The recommended set of 10 fields (section 5) |
| Filtering | "Filtering" and "screening" are treated as the same thing. The filters are chosen at the team's discretion (section 7.3) |
| Font | System fonts only, nothing loaded from the internet |
| External API | One external service besides the optional Airtable connection: Open-Meteo, used without an API key to show a weather icon beside the city (section 7.12). The page calls it directly from the browser, and the Content-Security-Policy allow-list is in section 9 |

## 4. Business Definitions

| Term | Definition |
|---|---|
| Customer | One row in the table, identified by a unique ID |
| Active customer | A customer whose last purchase date falls within the 365 days before today's actual date (evaluated on every load). A purchase exactly 365 days ago counts as active; 366 days or more does not |
| Satisfaction | An integer from 1 to 5 (1 = low, 5 = high) |
| At-risk customer | Satisfaction **less than or equal to 2** (that is, 1 or 2). Shown in red |
| Action-required customer | While competitor sales are active (section 7.11): last product is an entry door (`entry`) or a steel security door (`security`) **and** satisfaction is exactly 3. Shown in light orange. Never overlaps with at-risk, because at-risk customers have satisfaction 2 or lower |
| Open tickets | An integer ≥ 0 per customer. The KPI shows the sum of tickets across all customers |

## 5. Data Model

Each customer is a record with the following fields:

| Field (key) | Description | Type | Required | Validation |
|---|---|---|---|---|
| `id` | Customer ID | Text | Yes | Unique; auto-generated on add (`C-0001`...) |
| `name` | Full name | Text | Yes | Not empty |
| `phone` | Phone | Text | Yes | Digits, hyphens and spaces only |
| `email` | Email | Text | No | Valid email format if provided |
| `city` | City | Text | No | — |
| `lastPurchaseDate` | Last purchase date | Date (`YYYY-MM-DD`) | Yes | Not in the future |
| `totalPurchases` | Cumulative purchases (₪) | Number | Yes | ≥ 0 |
| `lastProduct` | Last product type | Select from list | Yes | Entry door / Interior door / Safe-room door / Sliding door / Steel security door / Accessories and locks |
| `satisfaction` | Satisfaction | Integer | Yes | 1–5 |
| `openTickets` | Open tickets | Integer | Yes | ≥ 0, default 0 |

**Computed fields (not stored):** `isActive`, `isAtRisk`, and the weather icon shown beside `city` (section 7.12). The data model does not change: there is no weather field, in the page, in CSV or in Airtable, and `city` stays free text.

**`lastProduct` values:** stored and exported as language-independent keys: `entry`, `interior`, `safe_room`, `sliding`, `security`, `accessories`. The UI shows a translated label in the selected language. Import also accepts the English or Hebrew label, case-insensitive.

## 6. Mock Data File

- File: `mock-customers.csv` in the project root, in CSV format (UTF-8 with BOM, so it opens correctly in Excel with Hebrew text).
- 40 customers with realistic Israeli names, cities and products. Emails use the reserved `example.com` domain and phone numbers are fictitious, so no real person's data is included.
- Deliberately distributed so every state appears in the dashboard: satisfaction of 1 and 2 (about 20% of customers), active and inactive customers, customers with 0 tickets and customers with several, and at least one customer who is both at risk and inactive.
- Column headers in the file are in English (the keys from section 5), regardless of the UI language.
- A browser blocks automatic reading of an external file when an HTML file is opened from disk. The mock data is therefore also embedded inside `index.html`, so the first-launch load does not depend on the file. `mock-customers.csv` remains a sample file that can be imported at any time. CSV import and export are always available through the buttons (sections 7.7 and 7.8).
- Purchase dates in the mock data are fixed in the file (generated relative to 2026-10-01), so over time more customers will count as inactive. This is expected, because "active" is evaluated against today's date.

## 7. Functional Requirements

### 7.1 KPI Row (5 cards)

| KPI | Calculation |
|---|---|
| Total customers | Number of records |
| Active customers | Number of customers who purchased within the last 365 days |
| Average satisfaction | Mean `satisfaction` across all customers, shown with one decimal place (for example 3.4 out of 5) |
| Open tickets | Sum of `openTickets` across all customers |
| Urgent action required | Number of action-required customers (section 7.11). Light-orange card; its sub-text states the rule, or that no competitor sales are active (value 0) |

- KPIs update immediately after add, edit, delete and import.
- KPIs are calculated over the entire customer base and are not affected by filters or search.
- Empty base: counts show 0 and average satisfaction shows "—".

### 7.2 Customer Table

- Placed below the KPIs and shows all 10 fields.
- **City column:** shows the city name as before, with a small weather icon beside it (section 7.12). No column is added and no temperature is shown in the table.
- **Action-required customer** (section 7.11): the whole row has a light-orange background and a light-orange "Action required" badge sits under the rating. The stored satisfaction is not changed. The text badge means the highlight does not rely on color alone.
- **At-risk customer** (satisfaction ≤ 2): the row is highlighted in red (light red background and a red badge or dot in the satisfaction column). The highlight does not rely on color alone: a text badge "At risk" is also shown.
- The satisfaction column shows the number with a simple visual indicator (dots or a colored badge).
- Open tickets column: a value greater than 0 is shown in bold.
- Last purchase column: customers who are not active show a small "Inactive" tag next to the date.
- Header with a counter: "Showing X of Y customers".
- Empty state: a friendly message ("No customers found") with a suggestion to clear the filters.
- **Sorting:** clicking a column header sorts ascending, a second click sorts descending, and a third click clears the sort. An arrow next to the header shows the direction. Default sort: satisfaction from low to high, so at-risk customers appear first.
- Actions column in every row: edit and delete.
- **Nothing is cut off:** the table always fits its container. Up to 1100 px wide it is a normal table with all 11 columns (text wraps inside cells, edit and delete are stacked). Below that, every customer becomes a card showing every field with its label, and a "Sort" dropdown replaces the column headers. There is no horizontal scrolling on the page.
- All fields run right to left in Hebrew (the ID column is on the right). Phone numbers and emails keep left-to-right digits and characters inside their cells.

### 7.3 Search and Filters

- **Free-text search:** a single field that works as you type, case-insensitive, across name, ID, phone, email and city.
- **Filters** (combined with each other and with the search, AND logic):
  - Risk level: All / At risk (≤2) / Not at risk.
  - Activity: All / Active / Inactive.
  - Open tickets: All / With open tickets / Without.
  - Last product type: All / one of the types.
- A "Clear filters" button resets everything.

### 7.4 Add Customer

- An "Add customer" button opens a modal with a form for all fields in section 5, except `id`, which is auto-generated.
- Field validation follows section 5, with an error message next to the field.
- On save: the customer is added, the table and KPIs update, and a short confirmation message (toast) appears.

### 7.5 Edit Customer

- An edit button in each row opens the same form as Add, pre-filled with the existing values.
- All fields are editable except `id`, which is locked.
- Same validation as Add. On save the row, the table and the KPIs update, and the user receives a toast.

### 7.6 Delete Customer

- A delete button in each row.
- A confirmation dialog before deleting, showing the customer's name ("Delete X? This action cannot be undone."). Deleting without confirmation is not possible.
- After deletion the table and KPIs update.

### 7.7 CSV Import

- An "Import" button opens a file picker (`.csv`).
- The file must include the column headers from section 5 (header check). Comma and semicolon delimiters are both detected automatically. A provided `id` may contain letters, digits, hyphens and underscores, up to 30 characters.
- Every row goes through the same validation as manual add. Invalid rows are not loaded, and a summary is shown at the end: "X rows loaded, Y rejected", with the reason for each rejected row.
- **Merge by ID:** a row whose `id` already exists in the system updates the existing customer. A row with a new `id` is added. Customers that are not in the file are not deleted. A row without an `id` gets a new `id` automatically.
- **Duplicate warning:** before the import is applied, a summary dialog shows how many new customers will be added, how many existing customers will be updated (with the list of IDs), and how many rows were rejected. The user chooses "Confirm" or "Cancel".
- **Duplicate ID inside the file itself:** the first row is loaded, and the duplicates are rejected and listed in the warning summary with their row numbers.

### 7.8 CSV Export

- An "Export" button downloads the file `customers-YYYY-MM-DD.csv`.
- Format: UTF-8 with BOM, English headers per section 5, always all customers, even when a filter or search is active.
- The same format is used for import, so export followed by import is a complete round trip.
- Correct escaping of commas, quotes and line breaks inside fields.

### 7.9 Hebrew / English

- A prominent toggle in the top header (HE | EN).
- Switching changes all interface text: titles, labels, buttons, messages, validation messages and KPI descriptions.
- Hebrew: `dir="rtl"`. English: `dir="ltr"`. The layout mirrors accordingly.
- Customer data itself (names, cities) is not translated.
- Date and number formats follow the selected language.
- The selected language is saved in `localStorage` (default: Hebrew).

### 7.10 Airtable Connection (optional)

- A "Connect to Airtable" button in the header opens a dialog with three fields: Base ID, table name (default `Customers`) and a personal access token.
- **The token is never part of the code or the repository.** The page is public, so the manager types the token once; it is stored in that browser's `localStorage` and sent only to `https://api.airtable.com`. A Content-Security-Policy in the page blocks every network destination except the allow-list in section 9 (Airtable, and Open-Meteo for the weather icon, which never receives the token or any customer data).
- The token needs `data.records:read` and `data.records:write` on the one base only.
- On connect the dashboard loads all records (paginated) and shows a "Connected to Airtable" indicator. If loading fails, the reason is shown with a Retry button, and nothing is saved.
- Field mapping uses the same names as the CSV columns (section 5). Airtable stores `lastProduct` as a single select with the keys from section 5 and `satisfaction` as a 1-5 rating.
- While connected, add, edit, delete and import write to Airtable first and update the screen only after Airtable confirms. A failed write shows an error message and leaves the screen unchanged. Writes are sent in batches of 10 records, and import keeps the merge-by-ID rules of section 7.7.
- Airtable data is never copied into `localStorage`. "Reset data" is hidden while connected, and a "Refresh from Airtable" button reloads the records, for example after someone edits Airtable directly.
- Records created by hand in Airtable without a customer ID get the next free ID automatically (written back to Airtable) so they can be edited. A record without a rating is shown with a dash, is not treated as at risk, and is excluded from the average.
- "Disconnect" removes the saved token and returns to the local sample data.
- Limits: anyone who can open the dashboard in the same browser profile can use the saved token, and there is still no login. Rotate the token in Airtable if it is ever exposed.

### 7.11 Competitor-Sale Watch (Action Required)

- **Trigger:** a Google Search scrape through Apify (`apify/google-search-scraper`, country Israel, Hebrew) for phrases such as "מבצע דלת כניסה", "הנחה על פלדלת" and the names Rav-Bariach, Hamadia and Reshafim. The scrape is run by hand (through Claude) and is not part of the page; the result is recorded as the constant `COMPETITOR_PROMO_ACTIVE` in `index.html`.
- **Evidence in the repo:** [`docs/apify-scan-2026-10-04.md`](docs/apify-scan-2026-10-04.md) (run ID, settings, queries, findings) and [`data/apify-scan-2026-10-04.json`](data/apify-scan-2026-10-04.json) (the results). The dashboard footer shows the date of the last check with a link to it (`COMPETITOR_CHECK_DATE` and `COMPETITOR_CHECK_URL` in `index.html`).
- **No automatic refresh:** the check is a single manual run, not scheduled. The flag does not follow the sales by itself; after a sale ends the constant must be updated by hand until a schedule is built.
- **Last check (2026-10-04):** sales are active. Rav-Bariach: a one-week sale with 15% off entry and interior doors and 10% off selected models, plus a paid Google ad. Hamadia (merged with Reshafim): up to 18% off entry and interior doors from 22.9.26 to 6.10.26. Gaash, Isradoor, Lee Door and Oz Doors also advertise entry-door sales.
- **Rule:** while `COMPETITOR_PROMO_ACTIVE` is `true`, a customer is action-required when `lastProduct` is `entry` or `security` and `satisfaction` is exactly 3. When the constant is `false`, no customer is flagged and the KPI shows 0.
- **Display only:** the flag is computed in the page and never written to the data, so satisfaction stays 3, and nothing is written to Airtable or CSV.
- **Display:** light-orange row, light-orange "Action required" badge (Hebrew: "נדרשת פעולה") under the rating, and the "Urgent action required" KPI card (section 7.1). Both language versions are translated.
- **Airtable table:** the Airtable base has a table "נדרשת פעולה דחופה" (not an interface page, and no colors) holding a copy of the `Customers` rows that satisfy the rule: `name`, `id`, `phone`, `email`, `city`, `lastPurchaseDate`, `totalPurchases`, `lastProduct` (plain text, `entry` or `security`), `satisfaction` (number), `openTickets`, plus `apifyRunId` and `scanDate`, which point to the Apify run that confirmed the sales (see the evidence file above). It was filled by hand from the 2026-10-04 run with C-0010 and C-0037. It is a snapshot: it does not update by itself, because there is no schedule and no automation yet, and the `Customers` table is never changed by it. The dashboard does not read this table. If the constant is switched off, the table must be emptied by hand.

### 7.12 Weather Icon Beside the City (external API: Open-Meteo)

**Status:** implemented in `index.html` (2026-10-05). **Verification:** (1) Automated tests in a real browser engine (Chromium) against mocked Open-Meteo responses. (2) Live check by the owner in Chrome on the published site (2026-10-05, DevTools Network tab): after deleting `crd.weather.v1` from Local Storage and reloading, a request to `api.open-meteo.com/v1/forecast?...&current=weather_code` returned HTTP 200 and the weather icons appeared. With the cache present, a hard reload sends no Open-Meteo request, by design (when this check was made the cache lasted 30 minutes; since 2026-10-09 it lasts until 06:00 Israel time, see below). (3) Not verified live: a request to the geocoding host, which is sent only for a city that is not in the built-in list. Live access to Open-Meteo was also **not** verifiable from the Claude Cloud environment, because its network proxy returned 403 for both Open-Meteo hosts.

**What the system does:** for the cities that appear in the customer table, the page calls the Open-Meteo API from the browser, reads the current weather condition, and shows the result as a small icon beside the city name in the existing City column.

- **No new column.** The icon sits inside the existing City cell, next to the city name that is already there. In the card layout (section 7.2) it appears next to the city value of the same labelled field.
- **Simple icons only:** sun (clear), partly cloudy, cloudy, fog, rain (drizzle, rain and showers), snow, thunderstorm. They are built into the page (emoji or inline SVG). No image or icon file is loaded from the internet. Open-Meteo returns a WMO weather code, which is mapped to these icons:

| Open-Meteo `weather_code` | Condition | Icon |
|---|---|---|
| 0 | Clear sky | Sun |
| 1, 2 | Mainly clear, partly cloudy | Partly cloudy |
| 3 | Overcast | Cloudy |
| 45, 48 | Fog | Fog |
| 51-57, 61-67, 80-82 | Drizzle, rain, freezing rain, rain showers | Rain |
| 71-77, 85, 86 | Snow, snow grains, snow showers | Snow |
| 95, 96, 99 | Thunderstorm | Thunderstorm |
| anything else | Unknown | No icon |

- **No temperature in the table.** Only the icon is shown. The icon has a text alternative (tooltip and accessible label) that names the condition in the selected language, for example "Rain" or "גשם", and never contains the temperature or any other number.
- **Current weather only.** One lookup per distinct city, not per customer. Lookups happen when the table first loads, when customers are loaded or refreshed (including from Airtable), and when a new city appears through add, edit or import. **Refresh once a day, at 06:00 Israel time:** weather is not refreshed on a timer. A stored result is reused until 06:00 Israel time (Asia/Jerusalem, summer and winter time included, whatever time zone the viewer's device uses), and the first lookup after 06:00 replaces it. In practice the first visit after 06:00 loads the new day's weather and every later visit that day reuses it. A tab left open overnight refreshes when it is shown again after 06:00 (the browser's `visibilitychange` event). The page itself cannot run at a fixed hour, because it has no server; a true scheduled refresh would need a separate component, for example a scheduled GitHub Action. Results are kept in memory and in the browser's `localStorage`; the cache holds only city names, coordinates and weather codes, never customer records.
- **Supplementary information only.** Weather does not affect Churn Risk, the at-risk rule, the action-required rule (section 7.11), satisfaction, the KPIs, search, filters or sorting. It is not editable and is not part of any customer record.
- **Nothing is stored or changed.** Customer data and `city` values are never modified or normalised. Weather is not written to Airtable, the Airtable schema does not change, and no field is added. Weather is not part of the local customer data in `localStorage`, the CSV export or the CSV import.
- **Open-Meteo without an API key.** No account, key or token is used or sent to Open-Meteo. Two public endpoints are used: the geocoding API (`https://geocoding-api.open-meteo.com`) to turn a city name into coordinates, and the forecast API (`https://api.open-meteo.com`) for the current weather at those coordinates. Only the city name or coordinates are sent: never a customer name, phone, email, ID, rating or any other field.
- **Attribution:** a short line in the page footer, "Weather data by Open-Meteo.com", linking to https://open-meteo.com. Open-Meteo's free API is intended for non-commercial use, so its terms must be checked before any commercial use.
- **Failure is silent and harmless.** If a city is empty or unknown, the request fails, times out, is blocked or the device is offline, that city is shown without an icon. No error message or toast is shown, and loading, editing, Airtable and every other feature work exactly as before.
- **Language and layout:** the condition text follows the selected language (Hebrew/English). The icon is about the height of the text, never changes a row's red or orange highlight, and must not make the table wider than its container or cut off any field (section 7.2).
- **Coordinates (as implemented):** the page first uses a built-in list of coordinates for the 30 cities in the sample data and a few common alternative spellings (for example "קרית שמונה"). Only a city that is not in the list is sent to the geocoding API (`countryCode=IL`), up to 10 per round, and its coordinates are cached. Because of this, the geocoding host is contacted only for new cities. The built-in coordinates are approximate city-center values and were not checked against an external source.
- **Parameters (as implemented):** the forecast request asks only for `current=weather_code` (never a temperature) and covers up to 50 cities per request, with the cities as comma-separated coordinates. A request is abandoned after 8 seconds. Results are cached in memory and in `localStorage` under the key `crd.weather.v1` (city names, coordinates and weather codes only) until the next 06:00 Israel time. After a failed lookup a city is not asked again for 5 minutes. The refresh hour is the constant `WX_DAY_START` (6) and the time zone is `WX_TZ` (`Asia/Jerusalem`) in `index.html`. If the browser cannot work out Israel time, results are reused for 24 hours instead.
- **Known risk:** Open-Meteo's geocoding may not match every Hebrew spelling of a city. If a Hebrew name is not found the city simply has no icon.

## 8. Design and UX Requirements

- **Layout:** header (the name "Customer Retention Dashboard" in both languages + language toggle) → KPI row → toolbar (search, filters, import, export, add) → table.
- **Color scheme:** light background, white cards, one calm primary color (blue). Red is used only for risk and for the "Open tickets" card, light orange only for the action-required flag and its KPI card, and the "Add customer" button is mint green.
- **Weather icon:** small and neutral, shown beside the city name only. It is not part of the color scheme above and never changes the red or orange highlighting. It is never the only carrier of information, because it has a text alternative (section 7.12).
- **Typography:** system fonts only (`system-ui`, `Segoe UI`, `Arial`, sans-serif), which support Hebrew and work offline. Readable size, high contrast.
- **KPIs:** a large, clear number with a small label below it. The "Open tickets" card is shown in light red when the value is greater than 0.
- **Accessibility:** WCAG AA contrast, keyboard navigation, labels on all fields, dialogs with focus management, and risk highlighting that does not rely on color alone.
- **Responsiveness:** the five KPIs are in one row on wide screens, 3 + 2 up to 1100 px, and one per row on phones. The table follows section 7.2 (full table, then cards), with no horizontal scrolling and no cut-off fields.
- **Feedback:** short toast messages for add, edit, delete, import and export.

## 9. Non-Functional Requirements

- **Performance:** instant response with up to a few thousand customers.
- **Privacy:** by default all customer data stays in the browser. There are no external libraries, and no fonts, images or files are loaded from the internet. The only data that leaves the page without an Airtable connection is city names (and the coordinates derived from them), sent to Open-Meteo for the weather icon (section 7.12). When connected to Airtable, customer data and the token go only to `api.airtable.com`. Open-Meteo never receives customer names, phones, emails, IDs, ratings or the token.
- **External APIs and Content-Security-Policy:** the page's `connect-src` allow-list contains exactly `https://api.airtable.com` (optional Airtable connection) and `https://geocoding-api.open-meteo.com` and `https://api.open-meteo.com` (weather icon, no API key). Every other destination stays blocked, and `object-src`, `base-uri` and `form-action` stay restricted. Adding any other external service requires changing this section first.
- **Compatibility:** current versions of Chrome, Edge, Firefox and Safari.
- **Security:** content coming from a CSV is rendered as text and never executed (HTML escaping), to prevent code injection. On export, cells starting with `=`, `+`, `-` or `@` are neutralized (CSV injection).
- **Data retention:** clearing browser data deletes the data. Export therefore serves as the backup, and a reminder is shown in the interface.

## 10. Acceptance Criteria

1. On first launch the mock customers load, and the five KPIs show correct values, verified against a manual calculation on the file.
2. Every customer with satisfaction 1 or 2 is highlighted in red, and no customer with 3 or higher is.
3. Adding a customer with valid data updates the table and KPIs immediately and persists after a refresh.
4. Adding with invalid data is blocked with an error message on the relevant field.
5. Editing a customer changes the data and updates the table and KPIs, and changing satisfaction changes the risk marking accordingly.
6. Deleting requires confirmation, after which the customer disappears and the counters update.
7. Search and every filter work alone and in combination, and "Clear filters" resets them. Sorting works on the columns and on the filtered results.
8. Exporting and then importing the same file restores exactly the same data. Hebrew displays correctly in Excel.
9. Import merges by ID, shows a warning about existing records and duplicates before applying, and rejects faulty rows with an accurate summary.
10. Switching language changes all text and the direction (RTL/LTR) without a refresh and without losing filters or data.
11. Connected to Airtable, the dashboard loads the table, writes add/edit/delete/import to Airtable, shows an error without changing the screen when a write fails, and never stores the token in the repository or customer data in `localStorage`.
12. With the mock data and `COMPETITOR_PROMO_ACTIVE` = `true`, exactly C-0010 and C-0037 have a light-orange row and the "Action required" badge, the "Urgent action required" KPI shows 2, and their satisfaction is still 3. With the constant `false` nobody is flagged and the KPI shows 0.
13. At widths from 390 px to 1400 px, every field of every customer (including the actions) is fully visible, with no horizontal page scroll and no clipped text, in both languages.
14. The Airtable table "נדרשת פעולה דחופה" contains exactly the customers who satisfy the rule of section 7.11 as of the last Apify check (2026-10-04: C-0010 and C-0037).
15. Weather icon (section 7.12): every customer whose city has a known weather condition shows a small icon beside the city name in the existing City column; no column is added, no temperature or other number appears in the table, and the city text is unchanged. Checked in both languages and at widths from 390 px to 1400 px with Open-Meteo responses covering each icon in the mapping table.
16. Weather is supplementary: changing the weather returned for a city changes nothing in the at-risk marking, the action-required marking, the KPIs, search, filters, sorting or any satisfaction value.
17. If Open-Meteo is unreachable or blocked, or a city is empty or unknown, the table and every other feature still work, the city is shown without an icon, and no error message is shown.
18. Network check: the only destinations contacted are `api.airtable.com` (when connected) and the two Open-Meteo hosts of section 9. No API key, token or `Authorization` header is sent to Open-Meteo, and its URLs contain only city names or coordinates.
19. After using the page with weather enabled, the Airtable schema and records are unchanged, and weather values appear nowhere in Airtable, the local customer data, the CSV export or the CSV import.
20. The footer shows the Open-Meteo attribution with a working link.
21. Daily refresh: with a clock fixed in the test, weather cached after 06:00 Israel time is reused until 05:59 Israel time the next day and sends no Open-Meteo request, and the first load at 06:00 or later sends exactly one request. This holds in summer time, in winter time, on the night the clocks change, and when the viewer's device is in another time zone. A tab left open across 06:00 refreshes once when it is shown again, and further tab switches that day send nothing.
22. There are no console errors in any of these scenarios.

## 11. Test Strategy

- Manual testing against the acceptance criteria (section 10) in the browser, in both languages.
- Edge cases: empty base, a single customer, satisfaction of exactly 2 (at risk) and exactly 3 (not at risk), a purchase exactly 365 days ago and 366 days ago, a CSV with commas and quotes in fields, a CSV with missing headers, an empty CSV.
- Verifying the KPI calculations with a short script against the mock data file.
- Weather (section 7.12): test the weather-code-to-icon mapping for every row of its table plus an unknown code; run the page against mocked Open-Meteo responses (success, empty result, HTTP error, timeout, offline) so the tests do not depend on the live service, and check the network destinations and the absence of any key or customer data in the requests. The daily refresh (criterion 21) is tested with a fixed clock around 05:59 and 06:00 Israel time in summer time, winter time, on the night the clocks change, and for viewers in other time zones.

## 12. Deliverables (after the SPEC is approved)

| File | Description |
|---|---|
| `SPEC.md` | This document |
| `mock-customers.csv` | Mock data |
| `index.html` | The dashboard (single file) |
| `README.md` | Updated with run instructions |

---

## 13. Decisions Made

| # | Topic | Decision |
|---|---|---|
| 1 | Open tickets KPI | Sum of all tickets across all customers |
| 2 | Active customer | Evaluated against today's date |
| 3 | Edit customer | Included (section 7.5) |
| 4 | Column sorting | Included (section 7.2) |
| 5 | KPIs and export vs. filters | Always over all customers |
| 6 | Import | Merge by ID, with a warning about duplicates (section 7.7) |
| 7 | Mock data loading | Embedded in the HTML. CSV import and export are always available |
| 8 | Font | System font |
| 9 | Product name | Customer Retention Dashboard |
| 10 | Risk threshold | Fixed at 2 or below |
| 11 | Airtable | Optional direct connection from the browser. The token is entered by the manager and kept only in that browser, never in the repository (section 7.10) |
| 12 | Action-required rule | Entry or steel door, satisfaction exactly 3, only while competitor sales are active. Display only, satisfaction is never changed (section 7.11) |
| 13 | Competitor check | A manual Apify Google Search scrape, recorded as a constant in `index.html`; not a live feature of the page |
| 14 | Airtable list | A separate table with a copy of the matching customers, filled from the Apify check; no interface page, no colors. Updating it automatically is not built yet (section 7.11) |
| 15 | Table layout | Full table up to 1100 px, cards below it, so nothing is ever cut off (section 7.2) |
| 16 | External API | Open-Meteo, called directly from the browser, no API key, to show a small current-weather icon beside the city in the existing City column. No new column, no temperature in the table (section 7.12) |
| 17 | Weather data | Supplementary only: not stored (not in Airtable, CSV or customer data), no schema change, and no effect on Churn Risk, at-risk, action-required or satisfaction (section 7.12) |
| 18 | CSP and privacy | `connect-src` allow-list of exactly Airtable and the two Open-Meteo hosts; only city names and coordinates are sent to Open-Meteo (section 9) |
