-- Baseline equity table: Load external public stats (CBP/ABS) by county/industry/region
-- This DDL creates the destination table; load data separately via your ETL.
CREATE OR REPLACE TABLE `nj-portal-demo.analytics.bench_equity` (
  county STRING,
  geographic_region STRING,
  industry_category STRING,
  baseline_pct_mwbe FLOAT64,
  baseline_pct_women FLOAT64,
  baseline_pct_veteran FLOAT64,
  baseline_pct_minority FLOAT64,
  source STRING
);
-- TODO: Load baseline data keyed by (county, geographic_region, industry_category)
