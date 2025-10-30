CREATE OR REPLACE TABLE `nj-portal-demo.analytics.mart_ecommerce` AS
WITH e AS (
  SELECT
    permit_id, permit_name, permit_category,
    COUNTIF(event_name='view_item') AS views,
    COUNTIF(event_name='add_to_cart') AS adds,
    COUNTIF(event_name='purchase') AS purchases,
    SUM(CASE WHEN event_name='purchase' THEN price ELSE 0 END) AS revenue
  FROM `nj-portal-demo.analytics.mart_portal_events`
  GROUP BY 1,2,3
)
SELECT
  *,
  SAFE_DIVIDE(adds, views) AS add_rate,
  SAFE_DIVIDE(purchases, adds) AS purchase_rate
FROM e;
