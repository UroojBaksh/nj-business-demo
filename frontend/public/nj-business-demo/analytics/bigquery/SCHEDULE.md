# Scheduled Queries for Analytics Models

Target dataset: `nj-portal-demo.analytics`

Create the following scheduled queries (UI or API). Run daily after GA4 raw export completes. Suggested time window: 03:00–04:00 local time.

Order and schedule:
1. 01_mart_portal_events.sql → daily 03:05
2. 02_mart_session_summary.sql → daily 03:10
3. 03_mart_user_summary.sql → daily 03:15
4. 04_mart_registration_funnel.sql → daily 03:20
5. 05_mart_ecommerce.sql → daily 03:25
6. 06_mart_engagement.sql → daily 03:30

Notes:
- 07_bench_equity.sql defines a table for public baselines; load it periodically via external data pipeline.
- 08_equity_gap_view.sql is a VIEW and auto-updates; no schedule required.

Creating a Scheduled Query (UI):
1) BigQuery Console → SQL Editor → open a SQL file content from this repo
2) Click Schedule → Create new scheduled query
3) Name it (e.g., mart_portal_events_daily)
4) Schedule: Daily at specified time
5) Destination: Set to WRITE TRUNCATE (default for CREATE OR REPLACE)
6) Save

Creating with bq (example):
- Use `bq query --use_legacy_sql=false --destination_table nj-portal-demo:analytics.mart_portal_events --replace --display_name=mart_portal_events_daily "$(cat 01_mart_portal_events.sql)"`
- Then configure Cloud Scheduler + Cloud Functions/Workflows for cron-based execution
