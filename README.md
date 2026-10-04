# Customer Retention Dashboard

A single-screen dashboard for a door store's customer retention department. It tracks customer satisfaction and highlights customers at risk of churn. Built for the department manager.

## Live demo

https://hodaya73-prog.github.io/Customer-Success-DB/

The demo is a static site on GitHub Pages. It always shows fictitious sample data, and any changes you make stay in your own browser. It cannot connect to Airtable (see below for why).

## Run it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Without a `.env` file the dashboard loads 40 sample customers and saves changes in your browser (`localStorage`).

Other commands: `npm run build` creates the static site in `dist/`, and `npm run preview` serves that build.

## Connect to Airtable (step by step)

The dashboard reads and writes your customers in Airtable through a small proxy that runs inside the Vite server. The proxy reads the credentials from `.env`, so **the token never reaches the browser**.

1. **Prepare the Airtable table.** A table named `Customers` whose fields match the columns of [`mock-customers.csv`](mock-customers.csv): `name` (primary, text), `id` (text), `phone` (text), `email` (email), `city` (text), `lastPurchaseDate` (date), `totalPurchases` (number or currency), `lastProduct` (single select: `entry`, `interior`, `safe_room`, `sliding`, `security`, `accessories`), `satisfaction` (rating, 5 stars, or a number) and `openTickets` (number).
2. **Create a token** at airtable.com/create/tokens with the scopes `data.records:read` and `data.records:write`, with access to that one base only. Copy it once.
3. **Find the Base ID.** Open the base in Airtable. The address looks like `airtable.com/app1234567890abcd/...`. The part that starts with `app` is the Base ID.
4. **Create the `.env` file** in the project folder (next to `package.json`). The name must be exactly `.env`, with no `.txt` at the end. In Windows Explorer, turn on View > Show > File name extensions to check. From a terminal you can run `copy .env.example .env` (Windows) or `cp .env.example .env` (Mac and Linux). Then fill it in:

   ```
   AIRTABLE_TOKEN=your token here
   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
   AIRTABLE_TABLE=Customers
   ```

   No quotes and no spaces around `=`. `AIRTABLE_TABLE` is optional and defaults to `Customers`. If your table has a different name, write exactly that name.
5. **Do not add a `VITE_` prefix** to these names. Vite copies every variable that starts with `VITE_` into the public JavaScript file, and then anyone who opens the site can read your token. Without the prefix the values stay on the server.
6. **Start the server:** `npm run dev`. The header shows a green **Connected to Airtable** and the table shows your Airtable customers. There is no settings button, and the connection is automatic. If you change `.env` while the server is running, Vite restarts it by itself.
7. **Check that the token is not going to GitHub:** `git status` must not list `.env`. The repository ignores it (`.gitignore`).

If something is wrong, the table shows the reason with a **Retry** button. The most common ones: a wrong table name, or a token without access to that base (Airtable answers both with the same 403 error).

### Who can see the Airtable data?

Anyone whose browser reaches the server that has the `.env` file sees the Airtable data, and there is no login.

- On your own computer, `npm run dev` is reachable only from that computer.
- `npm run dev -- --host` makes it reachable from other devices on the same network. Use it only on a network you trust.
- To let people on the internet use it, run the server on a host that supports Node (and keep the variables in that host's secret settings, not in the repository), and put a login in front of it. The GitHub Pages site cannot do this, because it has no server and its files are public.

If your token is ever exposed, delete it at airtable.com/create/tokens and create a new one.

## What it does

- **KPIs:** total customers, active customers (purchased in the last 365 days), average satisfaction (1 low, 5 high), and total open tickets.
- **At-risk customers:** satisfaction of 2 or below. These rows are highlighted in red with an "At risk" badge.
- **Customer table:** all fields, with click-to-sort column headers.
- **Search and filters:** free-text search plus filters for risk, activity, open tickets and last product.
- **Manage customers:** add, edit and delete.
- **CSV import and export:** export always includes all customers. Import merges by customer ID and shows a summary, including duplicates and rejected rows, before applying.
- **Hebrew and English:** switch with the toggle in the header. The layout flips between RTL and LTR.

## Data and backup

Without Airtable, data lives only in your browser. Clearing browser data deletes it, so use **Export CSV** regularly as a backup. **Reset data** restores the sample customers. With Airtable connected, the customers are stored in Airtable.

[`mock-customers.csv`](mock-customers.csv) is the sample data, in the same format the import accepts. All people in it are fictitious.

## Project layout

- `index.html`, `src/main.js`, `src/style.css`: the dashboard.
- `vite.config.js`: build settings and the server-side Airtable proxy.
- `.env.example`: template for your `.env`.
- `.github/workflows/pages.yml`: builds the site and publishes it to GitHub Pages on every push to `main`.
- [SPEC.md](SPEC.md): full product specification and recorded decisions.
- [PRACTICE.md](PRACTICE.md): working agreement (every change is committed, pushed and documented).
- [CHANGELOG.md](CHANGELOG.md): history of changes.
