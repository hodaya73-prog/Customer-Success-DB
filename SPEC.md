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

**Out of scope (V1):**

- Login, roles and multiple users.
- Server, database and cross-device sync.
- Charts, historical reports, and tracking satisfaction changes over time.
- Ticket management (open tickets are shown as a number only, without detail).

## 3. Technology Decisions (approved)

| Topic | Decision |
|---|---|
| Technology | HTML + CSS + JavaScript (vanilla) in a single file, no build step, no installation |
| Data persistence | Browser `localStorage`. Mock data is loaded on first launch. A "Reset" button restores the mock data. CSV export serves as the backup |
| Customer fields | The recommended set of 10 fields (section 5) |
| Filtering | "Filtering" and "screening" are treated as the same thing. The filters are chosen at the team's discretion (section 7.3) |
| Font | System fonts only, nothing loaded from the internet |

## 4. Business Definitions

| Term | Definition |
|---|---|
| Customer | One row in the table, identified by a unique ID |
| Active customer | A customer whose last purchase date falls within the 365 days before today's actual date (evaluated on every load). A purchase exactly 365 days ago counts as active; 366 days or more does not |
| Satisfaction | An integer from 1 to 5 (1 = low, 5 = high) |
| At-risk customer | Satisfaction **less than or equal to 2** (that is, 1 or 2). Shown in red |
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

**Computed fields (not stored):** `isActive`, `isAtRisk`.

## 6. Mock Data File

- File: `mock-customers.csv` in the project root, in CSV format (UTF-8 with BOM, so it opens correctly in Excel with Hebrew text).
- About 40 customers with realistic Israeli names, cities and products.
- Deliberately distributed so every state appears in the dashboard: satisfaction of 1 and 2 (about 20% of customers), active and inactive customers, customers with 0 tickets and customers with several, and at least one customer who is both at risk and inactive.
- Column headers in the file are in English (the keys from section 5), regardless of the UI language.
- A browser blocks automatic reading of an external file when an HTML file is opened from disk. The mock data is therefore also embedded inside `index.html`, so the first-launch load does not depend on the file. `mock-customers.csv` remains a sample file that can be imported at any time. CSV import and export are always available through the buttons (sections 7.7 and 7.8).
- Purchase dates in the mock data are fixed in the file (generated relative to 2026-10-01), so over time more customers will count as inactive. This is expected, because "active" is evaluated against today's date.

## 7. Functional Requirements

### 7.1 KPI Row (4 cards)

| KPI | Calculation |
|---|---|
| Total customers | Number of records |
| Active customers | Number of customers who purchased within the last 365 days |
| Average satisfaction | Mean `satisfaction` across all customers, shown with one decimal place (for example 3.4 out of 5) |
| Open tickets | Sum of `openTickets` across all customers |

- KPIs update immediately after add, edit, delete and import.
- KPIs are calculated over the entire customer base and are not affected by filters or search.
- Empty base: counts show 0 and average satisfaction shows "—".

### 7.2 Customer Table

- Placed below the KPIs and shows all 10 fields.
- **At-risk customer** (satisfaction ≤ 2): the row is highlighted in red (light red background and a red badge or dot in the satisfaction column). The highlight does not rely on color alone: a text badge "At risk" is also shown.
- The satisfaction column shows the number with a simple visual indicator (dots or a colored badge).
- Open tickets column: a value greater than 0 is shown in bold.
- Header with a counter: "Showing X of Y customers".
- Empty state: a friendly message ("No customers found") with a suggestion to clear the filters.
- **Sorting:** clicking a column header sorts ascending, a second click sorts descending, and a third click clears the sort. An arrow next to the header shows the direction. Default sort: satisfaction from low to high, so at-risk customers appear first.
- Actions column in every row: edit and delete.

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
- The file must include the column headers from section 5 (header check).
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

## 8. Design and UX Requirements

- **Layout:** header (the name "Customer Retention Dashboard" in both languages + language toggle) → KPI row → toolbar (search, filters, import, export, add) → table.
- **Color scheme:** light background, white cards, one calm primary color (blue). Red is reserved **only** for risk, so it draws the eye.
- **Typography:** system fonts only (`system-ui`, `Segoe UI`, `Arial`, sans-serif), which support Hebrew and work offline. Readable size, high contrast.
- **KPIs:** a large, clear number with a small label below it. The "Open tickets" card gets a subtle emphasis when the value is greater than 0.
- **Accessibility:** WCAG AA contrast, keyboard navigation, labels on all fields, dialogs with focus management, and risk highlighting that does not rely on color alone.
- **Responsiveness:** designed primarily for desktop. On narrow screens the table scrolls horizontally and the KPIs switch to a 2×2 grid.
- **Feedback:** short toast messages for add, edit, delete, import and export.

## 9. Non-Functional Requirements

- **Performance:** instant response with up to a few thousand customers.
- **Privacy:** all data stays in the browser. Nothing is sent to a server, there are no external libraries, and no fonts or files are loaded from the internet.
- **Compatibility:** current versions of Chrome, Edge, Firefox and Safari.
- **Security:** content coming from a CSV is rendered as text and never executed (HTML escaping), to prevent code injection. On export, cells starting with `=`, `+`, `-` or `@` are neutralized (CSV injection).
- **Data retention:** clearing browser data deletes the data. Export therefore serves as the backup, and a reminder is shown in the interface.

## 10. Acceptance Criteria

1. On first launch the mock customers load, and the four KPIs show correct values, verified against a manual calculation on the file.
2. Every customer with satisfaction 1 or 2 is highlighted in red, and no customer with 3 or higher is.
3. Adding a customer with valid data updates the table and KPIs immediately and persists after a refresh.
4. Adding with invalid data is blocked with an error message on the relevant field.
5. Editing a customer changes the data and updates the table and KPIs, and changing satisfaction changes the risk marking accordingly.
6. Deleting requires confirmation, after which the customer disappears and the counters update.
7. Search and every filter work alone and in combination, and "Clear filters" resets them. Sorting works on the columns and on the filtered results.
8. Exporting and then importing the same file restores exactly the same data. Hebrew displays correctly in Excel.
9. Import merges by ID, shows a warning about existing records and duplicates before applying, and rejects faulty rows with an accurate summary.
10. Switching language changes all text and the direction (RTL/LTR) without a refresh and without losing filters or data.
11. There are no console errors in any of these scenarios.

## 11. Test Strategy

- Manual testing against the acceptance criteria (section 10) in the browser, in both languages.
- Edge cases: empty base, a single customer, satisfaction of exactly 2 (at risk) and exactly 3 (not at risk), a purchase exactly 365 days ago and 366 days ago, a CSV with commas and quotes in fields, a CSV with missing headers, an empty CSV.
- Verifying the KPI calculations with a short script against the mock data file.

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
