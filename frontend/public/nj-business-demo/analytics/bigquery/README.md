# GA4 BigQuery Export and Derived Metrics

This project is instrumented for GA4. To analyze in BigQuery, link your GA4 property to BigQuery (Admin > BigQuery Links) and query the exported events tables (events_YYYYMMDD).

Recommended custom dimensions (configure in GA4 UI):
- Event-scoped: business_entity_type, industry_vertical, mwbe_certification_status, geographic_region, form_completion_rate, session_duration_category, interaction_quality_score, content_engagement_depth
- User-scoped: lifetime_permits_purchased, user_type, preferred_language

Example: Recent registration funnel
```sql
-- Registrations started vs completed by entity type
WITH ev AS (
  SELECT event_date, event_timestamp, event_name,
         (SELECT value.string_value FROM UNNEST(event_params) WHERE key='business_entity_type') AS business_entity_type,
         (SELECT value.int_value FROM UNNEST(event_params) WHERE key='step_number') AS step_number,
         (SELECT value.string_value FROM UNNEST(event_params) WHERE key='step_name') AS step_name,
         user_pseudo_id
  FROM `your_project.analytics_XXXX.events_*`
  WHERE event_name IN ('begin_registration','registration_step_complete','registration_complete')
)
SELECT business_entity_type,
       SUM(CASE WHEN event_name='begin_registration' THEN 1 ELSE 0 END) AS begins,
       SUM(CASE WHEN event_name='registration_complete' THEN 1 ELSE 0 END) AS completes
FROM ev
GROUP BY business_entity_type
ORDER BY completes DESC;
```

Ecommerce performance
```sql
WITH ev AS (
  SELECT event_timestamp, event_name,
         (SELECT value.string_value FROM UNNEST(event_params) WHERE key='permit_id') AS permit_id,
         (SELECT value.string_value FROM UNNEST(event_params) WHERE key='permit_name') AS permit_name,
         (SELECT value.float_value FROM UNNEST(event_params) WHERE key='price') AS price,
         (SELECT value.int_value FROM UNNEST(event_params) WHERE key='quantity') AS quantity,
         user_pseudo_id
  FROM `your_project.analytics_XXXX.events_*`
  WHERE event_name IN ('view_item','add_to_cart','purchase')
)
SELECT permit_id, permit_name,
       SUM(CASE WHEN event_name='view_item' THEN 1 ELSE 0 END) AS views,
       SUM(CASE WHEN event_name='add_to_cart' THEN 1 ELSE 0 END) AS adds,
       SUM(CASE WHEN event_name='purchase' THEN 1 ELSE 0 END) AS purchases
FROM ev
GROUP BY permit_id, permit_name
ORDER BY purchases DESC;
```

Engagement depth and session quality
```sql
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key='session_duration_category') AS session_duration_category,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key='content_engagement_depth') AS depth,
  AVG((SELECT value.int_value FROM UNNEST(event_params) WHERE key='interaction_quality_score')) AS avg_iq,
  COUNT(*) AS events
FROM `your_project.analytics_XXXX.events_*`
GROUP BY session_duration_category, depth
ORDER BY avg_iq DESC;
```

Notes:
- Replace `your_project.analytics_XXXX` with your GA4 dataset.
- Consider sessionization using ga_session_id from GA4 export if enabled.
- For user-scoped dimensions, use user_properties in GA4 UI mapping.
