/* global d3 */

function segmentedLineChart() {
    
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 400,
    height = 400,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    xValue = function(d) { return d[0]; },
    yValue = function(d) { return d[1]; },
    xScale = d3.scaleBand().padding(0.1),
    yScale = d3.scaleLinear(),
    onMouseOver = function () { },
    onMouseOut = function () { };
    
    function chart(selection) {
        selection.each(function (data) {
            
            // Select the svg element, if it exists.
            var svg = d3.select(this)
                .selectAll("svg")
                .data([data]);
            
            // Otherwise, create the skeletal chart.
            var svgEnter = svg.enter().append("svg");
            var gEnter = svgEnter.append("g");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");
            
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom,
            
            // Update the outer dimensions.
            svg.merge(svgEnter)
                .attr("width", width)
                .attr("height", height);
            
            // Update the inner dimensions.
            var chartGroup = svg.merge(svgEnter)
                .select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            xScale.rangeRound([0, innerWidth])
                .domain(data.map(xValue));
            yScale.rangeRound([innerHeight, 0])
                .domain([0, d3.max(data, yValue)]);
            
            chartGroup.select(".x.axis")
                .attr("transform", "translate(0," + innerHeight + ")")
                .call(d3.axisBottom(xScale));
            
            chartGroup.select(".y.axis")
                .call(d3.axisLeft(yScale).ticks(10));
            
            // g.append("text")
            //     .attr("transform", "rotate(-90)")
            //     .attr("y", 6)
            //     .attr("dy", "0.71em")
            //     .attr("text-anchor", "end");
            // .text("Frequency");
            
            var barGroup = chartGroup.selectAll(".bar")
                .data(function (d) { return d; })
                .enter()
                .append("g")
            
            barGroup.append("rect")
                .attr("class", "bar")
                .merge(barGroup)
                .attr("x", X)
                .attr("y", Y)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) { return innerHeight - Y(d); })
                .on("mouseover", function(d) {
                    // Hide the order value text for 
                    // all bars
                    d3.selectAll('.orders-value')
                        .attr('opacity', 0);

                    // Re-reveal the text for the hovered
                    // bar
                    d3.select(this.parentNode)
                        .select('text')
                        .attr('opacity', 1);
                    
                    // Lower opacity of all bars
                    d3.selectAll('.bar')
                        .attr('opacity', 0.5);

                    // Reset the opacity of the hovered bar
                    d3.select(this.parentNode)
                        .select('rect')
                        .attr('opacity', 1);

                    line = chartGroup.append('line')
                        .attr('class', 'hover-line')
                        .attr('x1', 0)
                        .attr('y1', Y(d))
                        .attr('x2', width)
                        .attr('y2', Y(d))
                })
                .on("mouseout", function(d) {
                    // Reveal the order value text
                    d3.selectAll('.orders-value')
                        .attr('opacity', 1)

                    // Reset the bar appearance
                    d3.selectAll('.bar')
                        .attr('opacity', 1)

                    chartGroup.selectAll('.hover-line').remove()
                });

            barGroup.append('text')
                .attr('class', 'orders-value')
                .attr('x', d => X(d) + 33)
                .attr('y', d => Y(d) + 15)
                .attr('text-anchor', 'middle')
                .style('fill', 'white')
                .text(d => (yValue(d) <= 50) ? '' : yValue(d))
            
            barGroup.exit().remove();
        });
        
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
    
    
    return chart;
}



