# Competitor sale check: Apify Google Search scrape, 2026-10-04

This page records the check that switches on the "Action required" flag and the "Urgent action required" KPI (SPEC section 7.11). The raw results are in [`data/apify-scan-2026-10-04.json`](../data/apify-scan-2026-10-04.json), so the check can be reviewed without access to the Apify account.

## How it was run

| Item | Value |
|---|---|
| Tool | Apify actor [`apify/google-search-scraper`](https://apify.com/apify/google-search-scraper) (Google Search Results Scraper), called through the Apify connection in Claude |
| Run | `QzkEkCdSJOoayzjgE`, status SUCCEEDED, 2026-10-04 19:59 to 20:01 UTC (144 s). Console link: https://console.apify.com/actors/runs/QzkEkCdSJOoayzjgE (visible only when logged in to the owner's Apify account) |
| Dataset | `85dYjBJuYRtZNs9Zr` (6 items: 50 organic results, 3 paid ads) |
| Settings | Country Israel (`il`), search language and interface language Hebrew (`iw`), 1 page per query, paid-ads extraction on |
| Queries | `מבצע דלת כניסה`, `הנחה על פלדלת`, `מבצע דלתות פלדלת רב-בריח`, `מבצע דלתות כניסה חמדיה`, `מבצע דלתות רשפים פלדלת`, `הנחה דלתות כניסה רב בריח` |

## What it found

| Company | Finding | Source in the results |
|---|---|---|
| Rav-Bariach (רב-בריח) | A one-week sale: 15% off a range of entry and interior doors. Entry door model HALEL: 10% off, from ₪10,220 to ₪9,198. A dedicated sales page and a paid Google ad ("מחירים מיוחדים על דלתות כניסה") | rav-bariach.co.il/sales, product-category/entrancedoors, the company's Facebook posts |
| Hamadia (חמדיה), merged with Reshafim (רשפים) | "Up to 18% off entry and interior doors" in the showrooms from 22.9.26 to 6.10.26, so it is active on the check date and ends two days later | hamadia-doors.co.il/מבצעים, Hamadia's Instagram post |
| Others | Entry-door sales also advertised by Gaash (from ₪2,490), a paid ad from raz doors (from ₪2,499), Isradoor, Lee Door, Oz Doors and Lock Me | search results for "מבצע דלת כניסה" |

Conclusion: competitor sales on entry and steel doors are active, so `COMPETITOR_PROMO_ACTIVE` is `true` in `index.html`.

## What it changes in the dashboard

Customers whose last product is an entry door or a steel security door and whose satisfaction is exactly 3 are flagged "Action required" (light-orange row and badge) and counted in the "Urgent action required" KPI. Their satisfaction is not changed. On 2026-10-04 these are C-0010 (נועה פרידמן) and C-0037 (רותם עטיה).

## Limits

- This was a single manual run. There is no schedule, so the flag does not refresh by itself. When the Hamadia sale ends on 6.10.26 the flag stays on until someone re-runs the check and updates the constant.
- Google results show what companies advertise. They do not prove a sale is still running, so each sale's end date should be confirmed on the company's own page.
