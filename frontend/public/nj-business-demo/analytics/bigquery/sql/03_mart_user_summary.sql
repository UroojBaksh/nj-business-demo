CREATE OR REPLACE TABLE `nj-portal-demo.analytics.mart_user_summary` AS
SELECT
  user_id,
  ANY_VALUE(user_type) AS user_type,
  ANY_VALUE(business_type) AS business_type,
  ANY_VALUE(industry_category) AS industry_category,
  ANY_VALUE(geographic_region) AS geographic_region,
  ANY_VALUE(county) AS county,
  ANY_VALUE(mwbe_certification_status) AS mwbe_certification_status,
  COUNT(DISTINCT session_id) AS total_sessions,
  SUM(purchase_events) AS total_permits_purchased,
  AVG(step_completion_rate) AS avg_step_completion_rate,
  CASE
    WHEN MAX(session_duration_sec) IS NULL THEN 'not_started'
    WHEN MAX(purchase_events) > 0 THEN 'completed'
    ELSE 'in_progress'
  END AS last_registration_status
FROM `nj-portal-demo.analytics.mart_session_summary`
GROUP BY user_id;
