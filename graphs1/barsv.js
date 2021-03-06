
function barChart() {

  var margin = {top: 40, right: 20, bottom: 200, left: 60},
    width = 800,
    height = 600,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    xValue = function(d) { return d[0] },
    yValue = function(d) { return d[1] },
    xScale = d3.scaleBand().padding(0.1),
    yScale = d3.scaleLinear();

    var onMouseOver = function() {};
    var onMouseOut = function() {};
    var onBrushed = function() {};

  function invert(scale, x) {
    var eachBand = scale.step();
    var index = Math.round((x / eachBand));
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
    gEnter.append("g").attr("class", "brush");

	  // Update the outer dimensions.
	  svg.merge(svgEnter).attr("width", width)
	    .attr("height", height);

	  // Update the inner dimensions.
	  var g = svg.merge(svgEnter).select("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	  xScale.range([0, innerWidth])
	    .domain(data.map(xValue));
	  yScale.rangeRound([innerHeight, 0])
	    .domain([0, d3.max(data, yValue)]);

	  g.select(".x.axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
				.attr("y", 0)
		    .attr("x", 9)
		    .attr("transform", "rotate(45)")
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

    g.select(".y.axis")
      .append("g")
      .attr("class", "axisLabel")
      .append("text")
        .attr("transform", "translate(" + -(margin.left * 0.7) + "," + (innerHeight/2) + "), rotate(-90)")
        .style("text-anchor", "middle")
        .text("Time in Hours")
        .attr("fill", "grey");

	  var bars = g.selectAll(".bar")
	    .data(function (d) { return d; });

	  bars.enter().append("rect")
	      .attr("class", "bar")
	    .merge(bars)
	      .attr("x", X)
	      .attr("y", Y)
        .attr("fill", function(d) {
          var color = "grey";
          // console.log(yValue(d));
          if (+yValue(d) > 600) {
            color = "#E15759";
          };
            return color;
        })
	      .attr("width", xScale.bandwidth())
	      .attr("height", function(d) { return innerHeight - Y(d); });
	  bars.exit().remove();

    // For extents, we pick up the top of inside to bottom
	  var brush = g.select(".brush")
	  	.call(d3.brushX()
	  		.extent([
            [0,0],
            [xScale.range()[1], yScale.range()[0]]
        ])
	  		.on("brush", brushed));

 	});

}

function brushed() {
	if (!d3.event.sourceEvent) return; // Only transition after input.
  if (!d3.event.selection) return; // Ignore empty selections.

  var selectionRange = d3.event.selection.map(function (x) { 
    return invert(xScale, x); 
  });

  // console.log(selectionRange);

  var selection = xScale.domain().filter(function(x) {
      return (xScale(selectionRange[0]) <= xScale(x)) && (xScale(x) <= xScale(selectionRange[1]));
  });

  // console.log(selection);

  // Selection has the entire array of selected now
    onBrushed(selection);
}

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

  return chart;
}