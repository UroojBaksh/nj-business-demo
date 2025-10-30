# NJ Business Portal - GA4 Advanced Implementation Demo

This demo showcases advanced GA4 for a government business portal: cross-domain tracking, enhanced ecommerce, multi-step registration analytics, MWBE equity metrics, and BigQuery modeling. It is a front-end prototype; analytics export relies on GA4→BQ Admin linking.

Live demo path (served by this app): /nj-business-demo/index.html

Key features
- Cross-domain tracking (index.html ↔ state-portal.html) via gtag linker + custom decorator
- Multi-step registration analytics with abandonment and step timings
- Enhanced Ecommerce for permits (catalog, details, checkout, purchase)
- User properties persisted in sessionStorage and attached to all events
- GA4→BigQuery marts for funnels, ecommerce, engagement, equity gap
- Debugging toolkit with on-page console and export

Quick start
1) Open /nj-business-demo/index.html
2) Enable debug console in DevTools: `enableGA4Debug()` (disable: `disableGA4Debug()`)
3) Interact with registration and permits; events appear in the floating panel

GA4/GTM setup
- Replace placeholder IDs with your own (GTM-DEMO123, G-DEMO123456)
- Import analytics/gtm-container.json into GTM and publish
- Ensure custom parameters are mapped in GA4 as dimensions if needed

BigQuery models
- See analytics/bigquery/SETUP.md to enable GA4 export to `nj-portal-demo.ga4_raw`
- Create dataset `nj-portal-demo.analytics`
- Run SQL files in analytics/bigquery/sql in order (01→06); 07 creates baseline DDL; 08 creates view
- Use analytics/bigquery/SCHEDULE.md for daily scheduled queries

Looker Studio
- Connect to analytics.mart_* tables and v_equity_gap view
- Build dashboards: funnels, abandonment, ecommerce conversion, engagement, equity

Debug helper
- File: js/debug-helper.js
- Features: intercept dataLayer.push, floating console, export JSON, validate setup, network monitor
- Enable via `enableGA4Debug()`; panel auto-loads on all pages when `ga4_debug` localStorage flag is true

Notes
- All analytics are demo-mode until wired to your GA4
- Registration and ecommerce are simulated; no real payments
