function textChart() {

  var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800,
    height = 200,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    xValue = 0,
    yValue = 0,
    text = "Sample Text";


  function chart(selection) {
  selection.each(function (data) {

    // Select the svg element, if it exists.
    var svg = d3.select(this)
      .enter()
      .append("svg")
      .attr("width", width)
      .attr("height", height)
        .append("g");

    var g = svg.select("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

	  
	  var dtext = g.select("text");

    dtext.append("text")
      .attr("class", "text")
      .attr("x", xValue)
      .attr("y", yValue)
      .attr("fill", "grey")
      .attr("font-family", "sans-serif")
      .attr("font-size", "20px")
      .text(text);

  });

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

  chart.text = function(_) {
    if (!arguments.length) return text;
    text = _;
    return chart;
  };

  return chart;
}