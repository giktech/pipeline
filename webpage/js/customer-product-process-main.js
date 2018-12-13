
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
		return d3.ascending(x.value, y.value)
	});
};

var sortd = function(d) {
	return d.sort(function(x,y) {
		return d3.descending(x.value, y.value)
	});
};

var duration = 1000;
var t = d3.transition().duration(duration);

var chart1M = {top: 40, right: 80, bottom: 40, left: 40};
var BarChart1 = barChart()
  .width(document.getElementById("processing-viz4").clientWidth)
  //.width(500)
  .height(800)
  .margin(chart1M)
  .xAxisLabel("Processing Time (Hrs)")
  .yAxisLabel("States")
  .x(function (d) { return d.value; })
  .y(function (d) { return d.key; });


// For the donut

var timerInterval = 1500;

var donut1 = donutChart()
    .width(document.getElementById("donut_products").clientWidth - 50)
    .height(800)
    .transTime(750) // length of transitions in ms
    .cornerRadius(3) // sets how rounded the corners are on each slice
    .padAngle(0.015) // effectively dictates the gap between slices
    .variable('value')
    .category('key');

var donut2 = donutChart()
    .width(1200)
    .height(800)
    .transTime(750) // length of transitions in ms
    .cornerRadius(3) // sets how rounded the corners are on each slice
    .padAngle(0.015) // effectively dictates the gap between slices
    .variable('value')
    .category('key');

var i = 0;

var table1 = chartTable();


var chart2M = {top: 40, right: 80, bottom: 40, left: 200};

var BarChart2 = barChart()
  .width(document.getElementById("processing-viz5").clientWidth)
  //.width(500)
  .height(800)
  .margin(chart2M)
  .xAxisLabel("Processing Time(Hrs)")
  .yAxisLabel("Product Categories")
  .x(function (d) { return d.value; })
  .y(function (d) { return d.key; });

var chart3M = {top: 80, right: 10, bottom: 40, left: 250};

var BarChart3 = barChart()
  .width(document.getElementById("customer-viz1").clientWidth - 50)
  .height(800)
  .margin(chart3M)
  .xAxisLabel("Total of Purchases ($)")
  .yAxisLabel("Customer ID")
  .x(function (d) { return d.value; })
  .y(function (d) { return d.key; });

d3.csv("data/ecommerce-combined.csv", rowConverter)
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
    var revByCustomer = d3.nest()
						.key(function(d) { return d.customer_id})
						//.key(function(d) {return d.product_category})
						.rollup( function(v) { return Math.round(d3.sum(v, function(d) {
							return d.product_price;
						}));})
						.entries(dataset);

	revByCustomer = sortd(revByCustomer).slice(0,15);


	// Grouping
	// Delivery time by state
	var dtByState = d3.nest()
						.key(function(d) { return d.customer_state})
						//.key(function(d) {return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(dataset);


	dtByState = sortd(dtByState).slice(0,15);


	var dtByProductCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
							return d.delivery_time_hr;
						}));})
						.entries(dataset);

	dtByProductCat = sortd(dtByProductCat).slice(0,15);


	var revByProductCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.sum(v, function(d) {
							return d.product_price;
						}));})
						.entries(dataset);

		revByProductCat = sortd(revByProductCat).slice(0, 11);


var revByProductCata = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.sum(v, function(d) {
							return d.product_price;
						}));})
						.entries(dataset);

		revByProductCat = sorta(revByProductCat).slice(0, 11);

	var filteredByCustomer = [];


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

		dtByProductCat = sorta(dtByProductCat).slice(0, 15);

		updateProcessByProduct();
	});

	BarChart3.onClicked(function(selected) {

		// We have the array of customers in our selection
		// console.log(selected);


		// filter. the dataset with selected
		filteredByCustomer = dataset.filter(function(d) {
			return selected.includes(d.customer_id);
		});

		// console.log(filteredByCustomer);

		revByProductCat = d3.nest()
						.key(function(d) { return d.product_category})
						.rollup( function(v) { return Math.round(d3.sum(v, function(d) {
							return d.product_price;
						}));})
						.entries(filteredByCustomer);

		revByProductCat = sorta(revByProductCat).slice(0, 15);

		// console.log(revByProductCat);

		// Do not want to repaint the donut as its only one customer
		// This paints the table
		updateCustomerTable();
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


	function updateProcessByProduct() {

		d3.select("#bar_products_process")
		  .datum(dtByProductCat)
		  .call(BarChart2);

	};

	function updateProcessByState() {

		d3.select("#bar_states_process")
		  .datum(dtByState)
		  .call(BarChart1);

	};

	function updateCustomer() {

		d3.select("#bar_customer_rev")
		  .datum(revByCustomer)
		  .call(BarChart3);

	};

	function updateProductCharts() {

		donut1.data(revByProductCat);
		d3.select("#donut_products")
			.call(donut1);

		// donut2.data(revByProductCata);
		// d3.select("#donut2_products")
		// 	.call(donut2);

	};

	function updateCustomerTable() {
		d3.select("#table_customer_trans")
			.call(table1);
		table1.data(filteredByCustomer);
	};

	// Start rendering the graphics
	updateCustomer();
	updateProductCharts();
	updateProcessByState();

});

