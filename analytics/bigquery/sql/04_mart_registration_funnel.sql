CREATE OR REPLACE TABLE `nj-portal-demo.analytics.mart_registration_funnel` AS
WITH f AS (
  SELECT
    geographic_region, county, business_type, industry_category, mwbe_certification_status,
    COUNTIF(event_name='begin_registration') AS starts,
    COUNTIF(event_name='registration_step_complete' AND step_number=1) AS step1,
    COUNTIF(event_name='registration_step_complete' AND step_number=2) AS step2,
    COUNTIF(event_name='registration_step_complete' AND step_number=3) AS step3,
    COUNTIF(event_name='registration_complete') AS complete
  FROM `nj-portal-demo.analytics.mart_portal_events`
  GROUP BY 1,2,3,4,5
)
SELECT
  *,
  SAFE_DIVIDE(step1, starts) AS pct_step1,
  SAFE_DIVIDE(step2, step1) AS pct_step2,
  SAFE_DIVIDE(step3, step2) AS pct_step3,
  SAFE_DIVIDE(complete, starts) AS pct_complete
FROM f;
