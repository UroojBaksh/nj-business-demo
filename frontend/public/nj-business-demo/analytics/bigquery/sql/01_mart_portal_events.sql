CREATE OR REPLACE TABLE `nj-portal-demo.analytics.mart_portal_events` AS
SELECT
  PARSE_DATE('%Y%m%d', event_date) AS event_date,
  TIMESTAMP_MICROS(event_timestamp) AS event_ts,
  user_pseudo_id,
  -- user properties (as exported by GA4 if configured)
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'user_id') AS user_id,
  -- event-scoped session id (custom param)
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_id') AS session_id,
  event_name,
  -- user-scoped
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='user_type') AS user_type,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='registration_status') AS registration_status,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='business_type') AS business_type,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='industry_category') AS industry_category,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='geographic_region') AS geographic_region,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='county') AS county,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='preferred_language') AS preferred_language,
  (SELECT value.string_value FROM UNNEST(user_properties) WHERE key='mwbe_certification_status') AS mwbe_certification_status,
  -- event-scoped
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key='step_name') AS step_name,
  (SELECT SAFE_CAST(value.int_value AS INT64) FROM UNNEST(event_params) WHERE key='step_number') AS step_number,
  (SELECT SAFE_CAST(value.int_value AS INT64) FROM UNNEST(event_params) WHERE key='fields_completed') AS fields_completed,
  (SELECT SAFE_CAST(value.int_value AS INT64) FROM UNNEST(event_params) WHERE key='time_spent') AS time_spent,
  (SELECT SAFE_CAST(value.int_value AS INT64) FROM UNNEST(event_params) WHERE key='total_time') AS total_time,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key='permit_id') AS permit_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key='permit_name') AS permit_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key='permit_category') AS permit_category,
  (SELECT SAFE_CAST(value.double_value AS FLOAT64) FROM UNNEST(event_params) WHERE key='price') AS price
FROM `nj-portal-demo.ga4_raw.events_*`;
