# Customer Retention Dashboard

A single-screen dashboard for a door store's customer retention department. It tracks customer satisfaction and highlights customers at risk of churn. Built for the department manager.

## Run it

No installation or build step. Open [`index.html`](index.html) in a current browser (Chrome, Edge, Firefox or Safari), either by double-clicking it or from the file path.

On first launch the dashboard loads 40 sample customers. Everything you change afterwards is saved in your browser (`localStorage`).

## What it does

- **KPIs:** total customers, active customers (purchased in the last 365 days), average satisfaction (1 low, 5 high), and total open tickets.
- **At-risk customers:** satisfaction of 2 or below. These rows are highlighted in red with an "At risk" badge.
- **Customer table:** all fields, with click-to-sort column headers.
- **Search and filters:** free-text search plus filters for risk, activity, open tickets and last product.
- **Manage customers:** add, edit and delete.
- **CSV import and export:** export always includes all customers. Import merges by customer ID and shows a summary, including duplicates and rejected rows, before applying.
- **Hebrew and English:** switch with the toggle in the header. The layout flips between RTL and LTR.

## Data and backup

Data lives only in your browser. Clearing browser data deletes it, so use **Export CSV** regularly as a backup. **Reset data** restores the sample customers.

[`mock-customers.csv`](mock-customers.csv) is the sample data, in the same format the import accepts. All people in it are fictitious.

## Project documents

- [SPEC.md](SPEC.md): full product specification and recorded decisions.
- [PRACTICE.md](PRACTICE.md): working agreement (every change is committed, pushed and documented).
- [CHANGELOG.md](CHANGELOG.md): history of changes.
