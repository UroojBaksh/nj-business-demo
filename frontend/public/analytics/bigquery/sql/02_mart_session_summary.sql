CREATE OR REPLACE TABLE `nj-portal-demo.analytics.mart_session_summary` AS
WITH s AS (
  SELECT
    session_id,
    ANY_VALUE(user_id) AS user_id,
    ANY_VALUE(user_type) AS user_type,
    ANY_VALUE(business_type) AS business_type,
    ANY_VALUE(industry_category) AS industry_category,
    ANY_VALUE(geographic_region) AS geographic_region,
    ANY_VALUE(county) AS county,
    ANY_VALUE(mwbe_certification_status) AS mwbe_certification_status,
    MIN(event_ts) AS session_start,
    MAX(event_ts) AS session_end,
    TIMESTAMP_DIFF(MAX(event_ts), MIN(event_ts), SECOND) AS session_duration_sec,
    COUNTIF(event_name='registration_step_complete') / 4.0 AS step_completion_rate,
    COUNTIF(event_name='form_validation_error') AS form_error_count,
    SUM(CASE WHEN event_name='purchase' THEN price ELSE 0 END) AS checkout_value,
    COUNTIF(event_name='purchase') AS purchase_events
  FROM `nj-portal-demo.analytics.mart_portal_events`
  GROUP BY session_id
)
SELECT * FROM s;
