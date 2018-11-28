

			//Width and height
			var w = 1200;
			var h = 400;
			var padding = 40;		
			var dataset;

			function genBars(inData, nShow) {

				var xScale, yScale, cScale, aScale; 
				var xAxis, yAxis, svg;

				// Sort
				inData.sort(function(x, y){
					   return d3.ascending(x.value, y.value);
				})

				// A list of states
				var inKeys = inData.map(function(d,i) { 
											return d.key;
				});


				// Show only the top nShow categories
				if (inKeys.length > nShow) {
					// Take the top nShow from the sorted data
					inData = inData.slice(-nShow);
					inKeys = inData.map(function(d,i) {
										return d.key;
					});
				}	

				// Y scale is the number of hrs between purchase and delivery
				yScale = d3.scaleLinear()
							   .domain([
									d3.min(inData, function(d) { return d.value; }),
									d3.max(inData, function(d) { return d.value; })
								])
							   .range([padding, h-padding]);

				// X Scale is just all the states
				xScale = d3.scaleBand()
						   .domain(inKeys)
						   .range([padding, w - padding])
						   .paddingInner(0.08);


				cScale = d3.scaleSequential(d3.interpolateGreys)
							.domain([
									d3.min(inData, function(d) { return d.value; }),
									d3.max(inData, function(d) { return d.value; })
								]);


				// Need this or the axis come inverted for the bar graphs
				aScale = d3.scaleLinear()
							   .domain([
									d3.min(inData, function(d) { return d.value; }),
									d3.max(inData, function(d) { return d.value; })
								])
							   .range([h-padding, padding]);


				// Axis
				xAxis = d3.axisBottom()
						   .scale(xScale);

				yAxis = d3.axisLeft()
						   .scale(aScale);
		
				//SVG
				svg = d3.select("body")
							.append("svg")
							.attr("width", w)
							.attr("height", h);

				// // Circles
				// svg.selectAll("circle")
				//    .data(dtByState)
				//    .enter()
				//    .append("circle")
				//    .attr("cx", function(d,i) {
				//    		return xScale(d.key);
				//    })
				//    .attr("cy", function(d) {
				//    		return yScale(d.value);
				//    })
				//    .attr("r", 4);

				//Create bars
				svg.selectAll("rect")
				   .data(inData)
				   .enter()
				   .append("rect")
				   .attr("x", function(d, i) {
				   		return xScale(d.key);
				   })
				   .attr("y", function(d) {
				   		return h - padding-yScale(d.value);
				   })
				   .attr("width", xScale.bandwidth())
				   .attr("height", function(d) {
				   		return yScale(d.value);
				   })
				   .attr("stroke", "grey")
				   .attr("fill", function(d) {
						return cScale(d.value);
				   })
				   .on("mouseover", function(d) {

					//Get this bar's x/y values, then augment for the tooltip
					var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
					var yPosition = parseFloat(d3.select(this).attr("y")) - 14;

						//Create the tooltip label
						svg.append("text")
						   .attr("id", "tooltip")
						   .attr("x", xPosition)
						   .attr("y", yPosition)
						   .attr("text-anchor", "middle")
						   .attr("font-family", "sans-serif")
						   .attr("font-size", "14px")
						   .attr("font-weight", "bold")
						   .attr("fill", "orange")
						   .text(Math.round(d.value));

				   })
				   .on("mouseout", function() {
				   
						//Remove the tooltip
						d3.select("#tooltip").remove();
						
				   });

				//Create labels
				// svg.selectAll("text")
				//    .data(dtByState)
				//    .enter()
				//    .append("text")
				//    .text(function(d) {
				//    		return d.value;
				//    })
				//    .attr("text-anchor", "middle")
				//    .attr("x", function(d, i) {
				//    		return xScale(d.key) + xScale.bandwidth() / 2;
				//    })
				//    .attr("y", function(d) {
				//    		return h - yScale(d.value) + 14;
				//    })
				//    .attr("font-family", "sans-serif")
				//    .attr("font-size", "11px")
				//    .attr("fill", "white");

					//Draw Axis
					svg.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(0," + (h - padding) + ")")
						.call(xAxis);

					svg.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(" + padding + ",0)")
						.call(yAxis);

		};
		

			//For converting strings to Dates
			// 2018-05-10 09:11:00.0000000
			var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S.0000000");

			//Converting from CSV to new reduced object
			var rowConverter = function(d) {
									var r =  ( { 
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

			//Load in the data (V5 promise method)
			d3.csv("ecommerce-combined.csv", rowConverter)
				.then(function(data) {

				//Copy data into global dataset
				dataset = data;
				// console.table(dataset);

				// Grouping
				// Delivery time by state
				var dtByState = d3.nest()
									.key(function(d) { return d.customer_state})
									.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
										return d.delivery_time_hr;
									}));})
									.entries(dataset);

				genBars(dtByState, 10);

				// Grouping
				// Delivery time by product
				var dtByProductCat = d3.nest()
									.key(function(d) { return d.product_category})
									.rollup( function(v) { return Math.round(d3.mean(v, function(d) {
										return d.delivery_time_hr;
									}));})
									.entries(dataset);


				// console.log(dtByState);
				// console.log(dtByProductCat)

				// Call the function to Draw
				genBars(dtByProductCat, 10);

			});

			
		