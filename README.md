# Customer Retention Dashboard

A single-screen dashboard for a door store's customer retention department. It tracks customer satisfaction and highlights customers at risk of churn. Built for the department manager.

## Live demo

https://hodaya73-prog.github.io/Customer-Success-DB/

Published with GitHub Pages from the `main` branch. It uses fictitious sample data, and any changes you make stay in your own browser.

## Run it

No installation or build step. Open [`index.html`](index.html) in a current browser (Chrome, Edge, Firefox or Safari), either by double-clicking it or from the file path.

On first launch the dashboard loads 40 sample customers. Everything you change afterwards is saved in your browser (`localStorage`).

## What it does

- **KPIs:** total customers, active customers (purchased in the last 365 days), average satisfaction (1 low, 5 high), and total open tickets.
- **At-risk customers:** satisfaction of 2 or below. These rows are highlighted in red with an "At risk" badge.
- **Urgent action required:** a fifth KPI card counts those customers. The Airtable base also has a table "נדרשת פעולה דחופה" holding a copy of those customers, filled from the last Apify check (it does not update by itself yet).
- **Competitor check:** the Apify scrape behind the flag is recorded in [`docs/apify-scan-2026-10-04.md`](docs/apify-scan-2026-10-04.md) with the results in `data/`. It is a manual run, not scheduled.
- **Action required:** while `COMPETITOR_PROMO_ACTIVE` is `true` in `index.html`, customers whose last product is an entry or steel door and whose satisfaction is exactly 3 get a light-orange row and an "Action required" badge (display only, the rating is not changed).
- **Customer table:** all fields, with click-to-sort column headers.
- **Search and filters:** free-text search plus filters for risk, activity, open tickets and last product.
- **Manage customers:** add, edit and delete.
- **CSV import and export:** export always includes all customers. Import merges by customer ID and shows a summary, including duplicates and rejected rows, before applying.
- **Hebrew and English:** switch with the toggle in the header. The layout flips between RTL and LTR.

## Connect to Airtable (optional)

By default the dashboard keeps its data in your browser. To use an Airtable base instead:

1. In Airtable, create a base with a `Customers` table whose fields match the columns of [`mock-customers.csv`](mock-customers.csv): `name` (primary, text), `id` (text), `phone` (text), `email` (email), `city` (text), `lastPurchaseDate` (date), `totalPurchases` (number or currency), `lastProduct` (single select: `entry`, `interior`, `safe_room`, `sliding`, `security`, `accessories`), `satisfaction` (rating, 5 stars or a number) and `openTickets` (number).
2. Create a personal access token at airtable.com/create/tokens with `data.records:read` and `data.records:write`, limited to that one base.
3. In the dashboard, click **Connect to Airtable**, enter the Base ID (`app...`, visible in the base URL), the table name and the token, then click **Connect**.

The token is stored only in your browser and is sent only to `api.airtable.com`. It is never part of this repository, and it must not be added to the code, because the page is public. To stop using Airtable, click **Airtable settings**, then **Disconnect**.

## Data and backup

Without Airtable, data lives only in your browser. Clearing browser data deletes it, so use **Export CSV** regularly as a backup. **Reset data** restores the sample customers. With Airtable connected, the customers are stored in Airtable.

[`mock-customers.csv`](mock-customers.csv) is the sample data, in the same format the import accepts. All people in it are fictitious.

## Project documents

- [SPEC.md](SPEC.md): full product specification and recorded decisions.
- [PRACTICE.md](PRACTICE.md): working agreement (every change is committed, pushed and documented).
- [CHANGELOG.md](CHANGELOG.md): history of changes.
