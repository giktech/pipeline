
function barChart() {

  var margin = {top: 40, right: 40, bottom: 40, left: 80},
    width = 600,
    height = 600,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    xValue = function(d) { return d[1] },
    yValue = function(d) { return d[0] },
    xScale = d3.scaleLinear(),
    yScale = d3.scaleBand().padding(0.1);

  var onMouseOver = function() {};
  var onMouseOut = function() {};
  var onBrushed = function() {};
  var onClicked = function() {};

  var duration = 2000;

  var t = d3.transition().duration(duration);

  function invert(scale, y) {
    var eachBand = scale.step();
    var index = Math.round((y / eachBand));
    return scale.domain()[index];
  }

  function chart(selection) {
	   selection.each(function (data) {

	  // Select the svg element, if it exists.
	  var svg = d3.select(this).selectAll("svg").data([data]);

	  // Otherwise, create the skeletal chart.
	  var svgEnter = svg.enter().append("svg");
	  var gEnter = svgEnter.append("g");
	  gEnter.append("g").attr("class", "x axis");
	  gEnter.append("g").attr("class", "y axis");
    // Moving it after making the bars. That way its easier to use with the bars
    // gEnter.append("g").attr("class", "brush");

	  // Update the outer dimensions.
	  svg.merge(svgEnter).attr("width", width)
	    .attr("height", height);

	  // Update the inner dimensions.
	  var g = svg.merge(svgEnter).select("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale.rangeRound([0, innerWidth])
      .domain([0, d3.max(data, xValue)]);
    yScale.range([0, innerHeight])
      .domain(data.map(yValue));

	  g.select(".x.axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
				.attr("y", 0)
		    .attr("x", 9)
		    //.attr("transform", "rotate(45)")
		    .style("text-anchor", "start");

    // g.select(".x.axis")
    //   .append("g")
    //   .attr("class", "axislabel")
    //   .append("text")
    //   .attr("transform", "translate(" + (innerWidth/2) + "," + 40 + ")")
    //   .style("text-anchor", "middle") 
    //   .text("Category")
    //   .attr("fill", "grey");


	  g.select(".y.axis")
	      .call(d3.axisLeft(yScale));

    // g.select(".y.axis")
    //   .append("g")
    //   .attr("class", "axisLabel")
    //   .append("text")
    //     .attr("transform", "translate(" + -(margin.left * 0.7) + "," + (innerHeight/2) + "), rotate(-90)")
    //     .style("text-anchor", "middle")
    //     .text("Categories")
    //     .attr("fill", "grey");

	  var bars = g.selectAll(".bar")
	    .data(function (d) { return d; });

	  bars.enter()
        .append("rect")
	      .attr("class", "bar")
	    .merge(bars)
      // For easing in new elements
	      .attr("x", +0)
	      .attr("y", Y)
        .attr("fill", function(d) {
          var color = "grey";
          if (d.value > +500 ) {
            color = "#E15759";
          };
            return color;
        })
	      .attr("height", yScale.bandwidth())
	      .attr("width", function(d) { return X(d); })
        .on("mouseover", function(d) {

          //Get this bar's x/y values, then augment for the tooltip
          console.log(this);
          var yPosition = parseFloat(d3.select(this).attr("y")) + yScale.bandwidth()/2 + 2;
          var xPosition = parseFloat(d3.select(this).attr("x"));
          var widthNow = parseFloat(d3.select(this).attr("width"));

          //Create the tooltip label
          g.append("text")
             .attr("id", "tooltip")
             .attr("x", xPosition + widthNow + 20)
             .attr("y", yPosition)
             .attr("text-anchor", "middle")
             .attr("font-family", "sans-serif")
             .attr("font-size", "11px")
             .attr("font-weight", "bold")
             .attr("fill", "grey")
             .text(d.value);
         })

         .on("mouseout", function() {
         
          //Remove the tooltip
            d3.select("#tooltip").remove();

        })
        .on("click", handleClick);

    bars.transition(t).ease(d3.easeLinear).delay(100);


	  bars.exit().remove();

    // gEnter.append("g").attr("class", "brush");

    // For extents, we pick up the top of inside to bottom
	  // var brush = g.select(".brush")
	  // 	.call(d3.brushY()
	  // 		.extent([
   //          [0,0],
   //          [xScale.range()[1], yScale.range()[1]]
   //      ])
	  // 		.on("brush", brushed));
    });

};

function handleClick(d, i) {
  onClicked(d.key);
};

// function brushed() {
//   if (!d3.event.sourceEvent) return; // Only transition after input.
//   if (!d3.event.selection) return; // Ignore empty selections.

//   var selectionRange = d3.event.selection.map(function (y) { 
//     return invert(yScale, y); 
//   });

//   console.log(selectionRange);

//   var selection = yScale.domain().filter(function(y) {
//       return (yScale(selectionRange[0]) <= yScale(y)) && (yScale(y) <= yScale(selectionRange[1]));
//   });

//   console.log(selection);

//   // Selection has the entire array of selected now
//     onBrushed(selection);
// }


  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  // The y-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.onMouseOver = function(_) {
    if (!arguments.length) return onMouseOver;
    onMouseOver = _;
    return chart;
  };

  chart.onMouseOut = function(_) {
    if (!arguments.length) return onMouseOut;
    onMouseOut = _;
    return chart;
  };

  chart.onBrushed = function(_) {
    if (!arguments.length) return onBrushed;
    onBrushed = _;
    return chart;
  };

  chart.onClicked = function(_) {
    if (!arguments.length) return onClicked;
    onClicked = _;
    return chart;
  };

  return chart;
}