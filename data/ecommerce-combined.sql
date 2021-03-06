WITH geo3 AS (
	SELECT DISTINCT
		geolocation_zip_code_prefix
		,geolocation_city
		,geolocation_state
		,AVG(geolocation_lat) AS geolocation_lat
		,AVG(geolocation_lng) AS geolocation_lng
	FROM geolocation
	GROUP BY geolocation_zip_code_prefix, geolocation_city, geolocation_state
)
, geo2 AS (
	SELECT DISTINCT
		geolocation_city
		,geolocation_state
		,AVG(geolocation_lat) AS geolocation_lat
		,AVG(geolocation_lng) AS geolocation_lng
	FROM geolocation
	GROUP BY geolocation_city, geolocation_state
)
, geo1 AS (
	SELECT DISTINCT
		geolocation_state
		,AVG(geolocation_lat) AS geolocation_lat
		,AVG(geolocation_lng) AS geolocation_lng
	FROM geolocation
	GROUP BY geolocation_state
)

SELECT
	ord.order_id
	,ord.order_status
	,order_purchase_timestamp
	,order_approved_at
	,order_delivered_carrier_date
	,order_delivered_customer_date
	,order_estimated_delivery_date
	,ord.customer_id
	,COALESCE(geo3.geolocation_lat, geo2.geolocation_lat, geo1.geolocation_lat) AS customer_geo_lat
	,COALESCE(geo3.geolocation_lng, geo2.geolocation_lng, geo1.geolocation_lng) AS customer_geo_lng
	,customer_zip_code_prefix
	,customer_city
	,customer_state
	,oitm.product_id
	,trans.english_name AS product_category
	,oitm.price AS product_price
	,prod.product_weight_g AS product_weight
	,prod.product_length_cm AS product_length
	,prod.product_width_cm AS product_width
	,prod.product_height_cm AS product_height
FROM orders ord
INNER JOIN customers cust
	ON cust.customer_id = ord.customer_id
LEFT JOIN geo3
	ON geo3.geolocation_zip_code_prefix = cust.customer_zip_code_prefix
	AND geo3.geolocation_city = cust.customer_city
	AND geo3.geolocation_state = cust.customer_state
LEFT JOIN geo2
	ON geo2.geolocation_city = cust.customer_city
	AND geo2.geolocation_state = cust.customer_state
LEFT JOIN geo1
	ON geo1.geolocation_state = cust.customer_state
LEFT JOIN order_items oitm
	ON oitm.order_id = ord.order_id
LEFT JOIN products prod
	ON prod.product_id = oitm.product_id
LEFT JOIN product_category_name_translation trans
	ON trans.spanish_name = prod.product_category_name