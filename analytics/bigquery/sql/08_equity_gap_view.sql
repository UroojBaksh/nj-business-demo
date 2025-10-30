CREATE OR REPLACE VIEW `nj-portal-demo.analytics.v_equity_gap` AS
WITH completes AS (
  SELECT
    county,
    geographic_region,
    industry_category,
    SUM(CASE WHEN event_name='registration_complete' THEN 1 ELSE 0 END) AS completes,
    SUM(CASE WHEN event_name='registration_complete' AND COALESCE(mwbe_certification_status,'none') <> 'none' THEN 1 ELSE 0 END) AS completes_mwbe
  FROM `nj-portal-demo.analytics.mart_portal_events`
  GROUP BY 1,2,3
)
SELECT
  c.county,
  c.geographic_region,
  c.industry_category,
  SAFE_DIVIDE(c.completes_mwbe, c.completes) AS pct_complete_mwbe,
  b.baseline_pct_mwbe,
  SAFE_DIVIDE(c.completes_mwbe, c.completes) - b.baseline_pct_mwbe AS equity_gap
FROM completes c
LEFT JOIN `nj-portal-demo.analytics.bench_equity` b
  ON b.county=c.county AND b.geographic_region=c.geographic_region AND b.industry_category=c.industry_category;
