
	// 2018-05-10 09:11:00.0000000
var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S.0000000");

//Converting from CSV to new reduced object
var rowConverter = function(d) {
	var r =  ( {
		// customer_id: d.customer_id,
		// product_price: d.product_price,
		product_category: d.product_category,
		customer_state: d.customer_state,
		// delivery_timestamp: parseTime(d.order_delivered_customer_date),
		// purchase_timestamp: parseTime(d.order_purchase_timestamp),
		delivery_time_hr: Math.round(
			(parseTime(d.order_delivered_customer_date) - parseTime(d.order_purchase_timestamp))/(60*60*1000))

	});

	if (r.delivery_time_hr > 0)
		return r;
};

var sorta = function(d) {
	return d.sort(function(x,y) {
		return d3.ascending(x.value, y.value)
	});
};

var BarChart1 = barChart()
  .width(1000)
  .height(500)
  .x(function (d) { return d.key; })
  .y(function (d) { return d.value; });

var BarChart2 = barChart()
  .width(1000)
  .height(500)
  .x(function (d) { return d.key; })
  .y(function (d) { return d.value; });

d3.csv("ecommerce-combined.csv", rowConverter)
	.then(function(data) {

	//Copy data into global dataset
	dataset = data;
	// console.table(dataset);


	// var csData = crossfilter(dataset);

 //    // We create dimensions for each attribute we want to filter by
 //    csData.state = csData.dimension(function (d) { return d["customer_state"]; });
 //    csData.product = csData.dimension(function (d) { return d["product_category"]});


	// Grouping
	// Delivery time by state
	var dtByState = d3.nest()
						.key(function(d) { return d.customer_state})
						//.key(function(d) {return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(dataset);


	sorta(dtByState);


	var dtByProductCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(dataset);

	sorta(dtByProductCat);


	BarChart1.onBrushed(function(selected) {

		// We have the array of categories in our selection now
		// console.log(selected);

		// Show the products with the most delay in these states
		console.log(selected);

		// filter. the dataset with selected
		filteredByState = dataset.filter(function(d) {
			return selected.includes(d.customer_state);
		});

		dtByProductCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(filteredByState);

		dtByProductCat = sorta(dtByProductCat).slice(-10);
		update();
	});

	function update() {

		d3.select("#chart1")
		  .datum(dtByState)
		  .call(BarChart1);

		d3.select("#chart2")
		  .datum(dtByProductCat)
		  .call(BarChart2);

	}

	update();

});

