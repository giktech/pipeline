IF OBJECT_ID('tempdb..#yyyy_mm') IS NOT NULL
	DROP TABLE #yyyy_mm

CREATE TABLE #yyyy_mm (
	dt dATE,
	PRIMARY KEY (dt)
)

DECLARE @start_dt DATE = (SELECT MIN(DATEADD(yy, DATEDIFF(yy, 0, order_purchase_timestamp), 0)) FROM v_commerce_combined)
DECLARE @end_dt DATE = '9/1/2018'
DECLARE @ctr INT = 0

WHILE (@start_dt < @end_dt) BEGIN
	INSERT INTO #yyyy_mm (dt) VALUES (@start_dt)
	SELECT @start_dt = DATEADD(DAY, 1, @start_dt)
END;

WITH product_top30 AS (
	SELECT
		product_category
	FROM (
		SELECT
			product_category
			,ROW_NUMBER() OVER (ORDER BY product_ct DESC) Rn
		FROM (
			SELECT DISTINCT
				product_category
				,COUNT(order_id) OVER (PARTITION BY product_category) AS product_ct
			FROM v_commerce_combined
			WHERE product_category IS NOT NULL
		) p1
	) p2
	WHERE Rn < 31
)
, date_base AS (
	SELECT
		ym.dt
		,pt.product_category
	FROM #yyyy_mm ym
	INNER JOIN product_top30 pt
		ON 1=1
	WHERE ym.dt >= '9/1/2017'
)
, count_base AS (
	SELECT DISTINCT
		db.product_category
		,DATEADD(M, DATEDIFF(M, 0, db.dt), 0) AS dt_month
		,COUNT(order_id) OVER (PARTITION BY DATEADD(M, DATEDIFF(M, 0, db.dt), 0), db.product_category) AS month_order_ct
	FROM date_base db
	LEFT JOIN v_commerce_combined cmb
		ON cmb.product_category = db.product_category
		AND CAST(cmb.order_purchase_timestamp AS DATE) = db.dt
)
, count_withchange AS (
	SELECT
		*
		,LAG(dt_month) OVER (PARTITION BY product_category ORDER BY dt_month) AS dt_priormonth
		,LAG(month_order_ct) OVER (PARTITION BY product_category ORDER BY dt_month) AS priormonth_order_ct
		,100.0 * (month_order_ct - LAG(month_order_ct) OVER (PARTITION BY product_category ORDER BY dt_month)) / LAG(month_order_ct) OVER (PARTITION BY product_category ORDER BY dt_month) AS priormonth_order_ct_pctchange
		,month_order_ct - LAG(month_order_ct) OVER (PARTITION BY product_category ORDER BY dt_month) AS priormonth_order_ct_diff

		,ROW_NUMBER() OVER (PARTITION BY product_category ORDER BY dt_month) AS month_rank_asc
		,ROW_NUMBER() OVER (PARTITION BY product_category ORDER BY dt_month DESC) AS month_rank_desc
	FROM count_base
)
, product_growth AS (
	SELECT
		product_category
		,dt_month
		,month_rank_asc
		,month_rank_desc
		,month_order_ct

		,dt_priormonth
		,priormonth_order_ct
		,priormonth_order_ct_diff
		,priormonth_order_ct_pctchange
		,100.0 * (MAX(IIF(month_rank_desc = 1, month_order_ct, NULL)) OVER (PARTITION BY product_category) - MAX(IIF(month_rank_asc = 1, month_order_ct, NULL)) OVER (PARTITION BY product_category)) / MAX(IIF(month_rank_asc = 1, month_order_ct, NULL)) OVER (PARTITION BY product_category) AS alltime_order_ct_pctchange
		,SUM(priormonth_order_ct_pctchange) OVER (PARTITION BY product_category) AS alltime_order_ct_pctchange_old
		--,AVG(pctchange_priormonth_order_ct) OVER (PARTITION BY product_category) AS pctchange_avg_alltime_productorderct

		,SUM(priormonth_order_ct_diff) OVER (PARTITION BY product_category) AS alltime_order_ct_diff
		--,AVG(diff_priormonth_order_ct) OVER (PARTITION BY product_category) AS diff_avg_alltime_productorderct
	FROM count_withchange
)

SELECT DISTINCT
	product_category
	--,dt_month
	----,month_rank_asc
	----,month_rank_desc
	--,month_order_ct

	--,dt_priormonth
	--,priormonth_order_ct
	--,priormonth_order_ct_diff
	--,priormonth_order_ct_pctchange
	--,alltime_order_ct_pctchange
	--,alltime_order_ct_diff
	--,DENSE_RANK() OVER (ORDER BY alltime_order_ct_pctchange DESC, product_category) AS alltime_pctchange_rank
	--,DENSE_RANK() OVER (ORDER BY alltime_order_ct_diff DESC, product_category) AS alltime_diff_rank
FROM product_growth
ORDER BY product_category
