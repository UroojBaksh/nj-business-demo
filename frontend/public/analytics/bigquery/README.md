# GA4 → BigQuery Analytics Models for NJ Business Portal

This folder contains setup steps and SQL models to build analytics marts and views on GA4 export data. Dashboarding is assumed in Looker Studio.

Datasets
- Raw export: `nj-portal-demo.ga4_raw` (from GA4 BigQuery link)
- Modeling: `nj-portal-demo.analytics`

Files
- SETUP.md: Admin steps with screenshots to enable GA4 → BigQuery export
- SCHEDULE.md: Create daily scheduled queries and ordering
- sql/01_mart_portal_events.sql: Flattens GA4 events into portal-wide event table
- sql/02_mart_session_summary.sql: Session-level rollups (duration, step completion rate, purchases)
- sql/03_mart_user_summary.sql: User-level aggregates and last registration status
- sql/04_mart_registration_funnel.sql: Funnel by segment (region/county/entity/industry/mwbe)
- sql/05_mart_ecommerce.sql: Permit conversion and revenue metrics
- sql/06_mart_engagement.sql: Engagement summary and correlation to session results
- sql/07_bench_equity.sql: DDL for public baselines; load separately
- sql/08_equity_gap_view.sql: View computing equity gap vs baselines

How to run each SQL
1) Create modeling dataset
   - In BigQuery → Create dataset `analytics` in project `nj-portal-demo`
2) Open SQL Editor and paste the file contents in order:
   - 01 → 02 → 03 → 04 → 05 → 06
   - 07 creates a baseline table (load your data next)
   - 08 creates the equity gap view
3) Execute each; verify tables appear in `nj-portal-demo.analytics`

Scheduled queries (Daily)
- See SCHEDULE.md for recommended order and times
- Set destination write mode to `WRITE_TRUNCATE` (CREATE OR REPLACE is used)

Looker Studio
- Connect to `analytics.mart_*` tables and the `v_equity_gap` view
- Build dashboards:
  - Registration funnel with step percentages
  - Abandonment (low step_completion_rate sessions)
  - Ecommerce conversion by permit
  - Engagement (downloads, video milestones, help reads) vs completion
  - Equity gap by county/region/industry

Troubleshooting GA4 → BQ field mapping
- If user-scoped properties are NULL in `user_properties`:
  - Ensure GTM/GA4 sets user_properties using gtag or GTM tag configuration
  - Alternatively, also capture them as event parameters and adapt SQL to extract from `event_params`
- If custom event parameters are missing:
  - In GTM GA4 Event tag, explicitly map parameters (e.g., session_id, step_number, permit_id)
- Intraday tables:
  - If enabled, union `ga4_raw.events_*` and `ga4_raw.events_intraday_*` for near-real-time reporting
- Dataset location mismatch:
  - GA4 property region must match BigQuery dataset location

Notes
- All IDs and datasets are examples; change project/dataset if yours differ
- Equity baselines must be curated and maintained externally then loaded into `analytics.bench_equity`
