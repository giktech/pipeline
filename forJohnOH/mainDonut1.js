
	// 2018-05-10 09:11:00.0000000
var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S.0000000");

//Converting from CSV to new reduced object
var rowConverter = function(d) {
	var r =  ( {
		customer_id: d.customer_id,
		product_price: d.product_price,
		product_category: d.product_category,
		customer_state: d.customer_state,
		delivery_timestamp: parseTime(d.order_delivered_customer_date),
		purchase_timestamp: parseTime(d.order_purchase_timestamp),
		delivery_time_hr: Math.round(
			(parseTime(d.order_delivered_customer_date) - parseTime(d.order_purchase_timestamp))/(60*60*1000))

	});

	if (r.delivery_time_hr > 0)
		return r;
};

var sorta = function(d) {
	return d.sort(function(x,y) {
		return d3.descending(x.value, y.value)
	});
};

var duration = 1000;
var t = d3.transition().duration(duration);

var BarChart1 = barChart()
  .width(900)
  .height(600)
  .x(function (d) { return d.value; })
  .y(function (d) { return d.key; });


// For the donut

var timerInterval = 1500;

var donut1 = donutChart()
    .width(960)
    .height(500)
    .transTime(750) // length of transitions in ms
    .cornerRadius(3) // sets how rounded the corners are on each slice
    .padAngle(0.015) // effectively dictates the gap between slices
    .variable('value')
    .category('key');

var i = 0;


var chart2M = {top: 40, right: 40, bottom: 40, left: 200};

var BarChart2 = barChart()
  .width(900)
  .height(600)
  .margin(chart2M)
  .x(function (d) { return d.value; })
  .y(function (d) { return d.key; });

var chart3M = {top: 40, right: 40, bottom: 40, left: 200};

var BarChart3 = barChart()
  .width(900)
  .height(600)
  .margin(chart3M)
  .x(function (d) { return d.value; })
  .y(function (d) { return d.key; });

d3.csv("ecommerce-combined.csv", rowConverter)
	.then(function(data) {

	//Copy data into global dataset
	dataset = data;
	// console.table(dataset);


	// var csData = crossfilter(dataset);

    // We create dimensions for each attribute we want to filter by
    // csData.state = csData.dimension(function (d) { return d["customer_state"]; });
    // csData.product = csData.dimension(function (d) { return d["product_category"]});
    // csData.customer = csData.dimension(function (d) { return d["customer_id"]});

    // Grouping
    // Grouping by customer
    var dtByCustomer = d3.nest()
						.key(function(d) { return d.customer_id})
						//.key(function(d) {return d.product_category})
						.rollup( function(v) { return Math.round(d3.sum(v, function(d) {
							return d.product_price;
						}));})
						.entries(dataset);

	dtByCustomer = sorta(dtByCustomer).slice(0,15);


	// Grouping
	// Delivery time by state
	var dtByState = d3.nest()
						.key(function(d) { return d.customer_state})
						//.key(function(d) {return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(dataset);


	dtByState = sorta(dtByState).slice(0,15);


	var dtByProductCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(dataset);

	dtByProductCat = sorta(dtByProductCat).slice(0,20);


	var dtByProductPriceCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.product_price;
						}));})
						.entries(dataset);

		dtByProductPriceCat = sorta(dtByProductPriceCat).slice(0, 15);




	// BarChart1.onBrushed(function(selected) {

	// 	// We have the array of categories in our selection now
	// 	// console.log(selected);

	// 	// Show the products with the most delay in these states
	// 	// console.log(selected);

	// 	// filter. the dataset with selected
	// 	filteredByState = dataset.filter(function(d) {
	// 		return selected.includes(d.customer_state);
	// 	});

	// 	dtByProductCat = d3.nest()
	// 					.key(function(d) { return d.product_category})
	// 					.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
	// 						return d.delivery_time_hr;
	// 					}));})
	// 					.entries(filteredByState);

	// 	dtByProductCat = sorta(dtByProductCat).slice(0, 20);

	// 	update();
	// });

	BarChart1.onClicked(function(selected) {

		// We have the array of categories in our selection now
		// console.log(selected);

		// Show the products with the most delay in these states
		// console.log(selected);

		// filter. the dataset with selected
		var filteredByState = dataset.filter(function(d) {
			return selected.includes(d.customer_state);
		});

		dtByProductCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(filteredByState);

		dtByProductCat = sorta(dtByProductCat).slice(0, 20);

		update();
	});

	BarChart3.onClicked(function(selected) {

		// We have the array of customers in our selection
		console.log(selected);


		// filter. the dataset with selected
		var filteredByCustomer = dataset.filter(function(d) {
			return selected.includes(d.customer_id);
		});

		console.log(filteredByCustomer)

		dtByProductPriceCatUpdate = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.product_price;
						}));})
						.entries(filteredByCustomer);

		dtByProductPriceCatUpdate = sorta(dtByProductPriceCatUpdate).slice(0, 15);

		// Do not want to repaint the donut as its only one customer
		// updateCustomer();
		// Print customer detail
	});


	// BarChart2.onBrushed(function(selected) {

	// 	// We have the array of categories in our selection now
	// 	// console.log(selected);

	// 	// Show the products with the most delay in these states
	// 	// console.log(selected);

	// 	// filter. the dataset with selected
	// 	filteredByProduct = dataset.filter(function(d) {
	// 		return selected.includes(d.product_category);
	// 	});

	// 	dtByState = d3.nest()
	// 					.key(function(d) { return d.customer_state})
	// 					.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
	// 						return d.delivery_time_hr;
	// 					}));})
	// 					.entries(filteredByProduct);

	// 	dtByState = sorta(dtByState);
	// 	update();
	// });


	function update() {

		d3.select("#chart1")
		  .datum(dtByState)
		  .call(BarChart1);

		d3.select("#chart2")
		  .datum(dtByProductCat)
		  .call(BarChart2);

	};

	function Customer() {

		d3.select("#chart3")
		  .datum(dtByCustomer)
		  .call(BarChart3);

		donut1.data(dtByProductPriceCat);
		d3.select("#chart4")
			.call(donut1);

	};

	// Start rendering the graphics
	update();
	Customer();

});

