# GA4 → BigQuery Export Setup (Admin)

Goal: Link your GA4 property to BigQuery and export daily event tables for the NJ Business Portal demo.

Prereqs:
- Access to the GA4 Admin of your property (Editor or higher)
- BigQuery project with billing enabled

Target:
- Project: nj-portal-demo
- Dataset (raw export): ga4_raw

Steps:
1) Open GA4 Admin
   - Navigate to Admin (gear icon) → Product links → BigQuery Links
   - Click Link
   
   [screenshot-placeholder: ga4-admin-bigquery-links.png]

2) Create a Link
   - Choose Google Cloud project: nj-portal-demo
   - Location: US (recommended)
   - Dataset ID: ga4_raw (create new if not present)
   - Frequency: Daily (Standard GA4)
   - Include advertising identifiers: optional
   - Click Submit
   
   [screenshot-placeholder: ga4-admin-create-link.png]

3) Verify in BigQuery
   - In BigQuery console, expand project nj-portal-demo → Dataset ga4_raw
   - After next daily run, you should see events_YYYYMMDD tables
   
   [screenshot-placeholder: bq-dataset-tables.png]

4) Optional Streaming (if available)
   - If your GA4 property supports streaming, enable the intraday events table (events_intraday_YYYYMMDD)

Notes:
- Export begins after link activation; first tables appear on the next day (or intraday if enabled)
- Ensure billing is active on the project
- Dataset location must match your GA4 data region
