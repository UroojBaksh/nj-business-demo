CREATE OR REPLACE TABLE `nj-portal-demo.analytics.mart_engagement` AS
WITH e AS (
  SELECT
    session_id,
    SUM(CASE WHEN event_name='resource_download' THEN 1 ELSE 0 END) AS resource_downloads,
    SUM(CASE WHEN event_name='video_engagement' THEN 1 ELSE 0 END) AS video_engagement_events,
    MAX(CASE WHEN event_name='video_engagement' THEN (SELECT SAFE_CAST(value.int_value AS INT64) FROM UNNEST(event_params) WHERE key='percentage_watched') END) AS max_video_pct,
    SUM(CASE WHEN event_name='help_article_read' THEN 1 ELSE 0 END) AS help_articles_read,
    SUM(CASE WHEN event_name='chat_initiated' THEN 1 ELSE 0 END) AS chats_started
  FROM `nj-portal-demo.analytics.mart_portal_events`
  GROUP BY session_id
)
SELECT
  s.session_id,
  s.user_id,
  e.resource_downloads,
  e.video_engagement_events,
  e.max_video_pct,
  e.help_articles_read,
  e.chats_started,
  s.session_duration_sec,
  s.step_completion_rate,
  s.purchase_events,
  s.checkout_value
FROM `nj-portal-demo.analytics.mart_session_summary` s
LEFT JOIN e USING(session_id);
