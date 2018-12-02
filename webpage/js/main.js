/* global d3, crossfilter, timeSeriesChart, barChart */

// Changing the time format to ISO
// 2017-11-01T18:09
// var dateFmt = d3.timeParse("%Y-%m-%d %H:%M:%S");

// var chartTimeline = timeSeriesChart()
//   .width(1000)
//   .x(function (d) { return d.key;}) 
//   .y(function (d) { return d.value;});
// var barChartStyle = barChart()
//   .width(600)
//   .x(function (d) { return d.key;})
//   .y(function (d) { return d.value;});
// var barChartRegion = barChart()
//   .x(function (d) { return d.key;})
//   .y(function (d) { return d.value;});

var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];


d3.csv("data/ecommerce-productgrowth.csv")
.then(function(data) {
    
    var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S.000");
    data.forEach(function(d) {
        d.dt_month = parseDate(d.dt_month)
        d.dt_priormonth = parseDate(d.dt_priormonth)
    })

    // console.log(data)
    // data = data.filter(d => d.product_category == "auto")

    var outerWidth = 1250;
    var outerHeight = 600;

    // 2. Use the margin convention practice 
    var margin = {top: 50, right: 50, bottom: 50, left: 50}
        , width = outerWidth - margin.left - margin.right // Use the window's width 
        , height = outerHeight - margin.top - margin.bottom; // Use the window's height

    // 1. Add the SVG to the page and employ #2
    var svg = d3.select("#product-growth")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 5. X scale will use the index of our data
    var xScale = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.dt_month));

    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.month_order_ct)]) // input 
        .rangeRound([height, 0]); // output 

    var zScale = d3.scaleLinear()
        .domain([0, Math.PI / 2, Math.PI])
        .range(["rgb(46, 204, 113)", "rgb(191, 191, 191)", "rgb(214, 69, 65)"]);

    var xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%b %Y"));

    // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(-45," + (height + 4) + ")")
        .call(xAxis); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
    
    segmentedData = data.map(function(d) {
        segment = []

        segment.push({
            alltime_pctchange_rank: d.alltime_pctchange_rank,
            alltime_diff_rank: d.alltime_diff_rank,
            product_category: d.product_category,
            month: d.dt_priormonth,
            order_ct: d.priormonth_order_ct
        });

        segment.push({
            alltime_pctchange_rank: d.alltime_pctchange_rank,
            alltime_diff_rank: d.alltime_diff_rank,
            product_category: d.product_category,
            month: d.dt_month,
            order_ct: d.month_order_ct
        });

        return segment;
    }).filter(function(d) {
        return d[0].month != null
    });

    // console.log(segmentedData)

    // 7. d3's line generator
    var line = d3.line()
        .x(function(d) { return xScale(d.month); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.order_ct); }); // set the y values for the line generator 

    svg.selectAll(".product-line")
        .data(segmentedData)
        .enter()
        .append("path")
        .attr("class", function(d) {
            classString = "product-line " + d[0].product_category;

            if (d[0].alltime_diff_rank < 6) {
                classString += " product-line-topnetgrowth"
            }

            return classString;
        })
        .attr("d", line)
        .on("mouseover", function(d) {
            d3.selectAll('.product-line')
                .style("stroke", "rgb(210, 215, 211")
                .style("stroke-width", 3)
                .attr("opacity", 0.2);

            d3.selectAll('.' + d[0].product_category)
                .attr("opacity", 1)
                .style("stroke-width", 5)
                .style("stroke", function(d) { return zScale(Math.atan2(1, d[1]["order_ct"] - d[0]["order_ct"])); })
                .raise();

            lineData = data.filter(function(ld) {
                return ld.product_category == d[0].product_category
            });

            svg.selectAll(".product-circle")
                .data(lineData)
                .enter()
                .append("circle")
                .attr("class", "product-circle")
                .attr("cx", function(d, i) { return xScale(d.dt_month); })
                .attr("cy", function(d, i) { return yScale(d.month_order_ct); })
                .attr("r", 4);

            svg.selectAll(".product-circle-text-line1")
                .data(lineData)
                .enter()
                .append("text")
                .attr("class", "product-circle-text product-circle-text-line1")
                .attr("x", function(d) { return xScale(d.dt_month) - 25; })
                .attr("y", function(d) { 
                    yVal = yScale(d.month_order_ct);
                    yVal += (d.priormonth_order_ct_diff < 0) ? 20 : -10;
                    return yVal; 
                })
                .text(function(d) {
                    circleText = d.month_order_ct;
                    if (d.priormonth_order_ct_pctchange != "NULL") {
                        circleText += " ("
                        if (d.priormonth_order_ct_pctchange > 0) {
                            circleText += "+"
                        }
                        circleText += Math.round(d.priormonth_order_ct_pctchange) + "%)"
                    }

                    return circleText;
                })
                .raise()

            // svg.selectAll(".product-circle-text-line2")
            //     .data(lineData)
            //     .enter()
            //     .append("text")
            //     .attr("class", "product-circle-text product-circle-text-line2")
            //     .attr("x", function(d) { return xScale(d.dt_month) + 8; })
            //     .attr("y", function(d) { return yScale(d.month_order_ct) + 15; })
            //     .text(function(d) {
            //         if (d.priormonth_order_ct_diff == "NULL") {
            //             return ""
            //         } else {
            //             return d.priormonth_order_ct_diff
            //         }
            //     })
            //     .raise()
        })
        .on("mouseout", function(d) {
            d3.selectAll(".product-line")
                .attr("opacity", 1)
                .style("stroke", "rgb(210, 215, 211)")
                .style("stroke-width", 3)

            d3.selectAll(".product-line-topnetgrowth")
                .attr("opacity", 1)
                .style("stroke", "rgb(52, 73, 94)")
                .style("stroke-width", 6)
                .raise();

            d3.selectAll(".product-circle")
                .remove()

            d3.selectAll(".product-circle-text")
                .remove()
        });

    d3.selectAll('.product-line-topnetgrowth')
        .raise();

   

    
    
    // var orders_barchart_init = barChartv2()
    // .width(1000)
    // .x(function(d) {
    //     return d.str_month
    // })
    // .y(function(d) {
    //     return d.orders_ct_month
    // })
    
    // var obar = d3.select("#product-growth")
    // .datum(data_timefiltered)
    // .call(orders_barchart_init)
    
    // obar.select(".x.axis") 
    //     .selectAll(".tick text")
    //     .attr("transform", "translate(-8,-1) rotate(-45)");
});

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

d3.csv("data/ecommerce-combined.csv", rowConverter)
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
		// console.log(selected);

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

	}

	update();

});