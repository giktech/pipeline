IF OBJECT_ID('tempdb..#yyyy_mm') IS NOT NULL
	DROP TABLE #yyyy_mm

CREATE TABLE #yyyy_mm (
	dt dATE,
	PRIMARY KEY (dt)
)

DECLARE @start_dt DATE = (SELECT MIN(DATEADD(yy, DATEDIFF(yy, 0, order_purchase_timestamp), 0)) FROM orders)
DECLARE @end_dt DATE = (SELECT MAX(DATEADD(yy, DATEDIFF(yy, 0, order_purchase_timestamp) + 1, -1)) FROM orders)
DECLARE @ctr INT = 0

WHILE (@start_dt < @end_dt) BEGIN
	INSERT INTO #yyyy_mm (dt) VALUES (@start_dt)
	SELECT @start_dt = DATEADD(DAY, 1, @start_dt)
END

SELECT DISTINCT
	--YEAR(ym.dt) AS dt_year
	--,COUNT(cmb.order_id) OVER (PARTITION BY YEAR(ym.dt)) AS orders_ct_year
	MONTH(ym.dt) AS dt_month
	,COUNT(cmb.order_id) OVER (PARTITION BY YEAR(ym.dt), MONTH(ym.dt)) AS orders_ct_month
	--,DATEPART(WW, ym.dt) AS dt_week
	--,COUNT(cmb.order_id) OVER (PARTITION BY YEAR(ym.dt), DATEPART(ww, ym.dt)) AS orders_ct_week
	--,ym.dt AS dt_day
	--,COUNT(cmb.order_id) OVER (PARTITION BY ym.dt) AS orders_ct_day
FROM #yyyy_mm ym
LEFT JOIN v_commerce_combined cmb
	ON CAST(cmb.order_purchase_timestamp AS DATE) = ym.dt
WHERE YEAR(ym.dt) = YEAR(GETDATE())
ORDER BY MONTH(ym.dt)

