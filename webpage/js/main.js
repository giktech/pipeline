/* global d3, crossfilter, timeSeriesChart, barChart */

// 2015-05-01 00:43:28
var dateFmt = d3.timeParse("%m-%d-%Y %H:%M:%S");

var chartTimeline = timeSeriesChart()
  .width(1000)
  .x(function (d) { return d.key;}) 
  .y(function (d) { return d.value;});
var barChartStyle = barChart()
  .width(600)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});
var barChartRegion = barChart()
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});

d3.csv("data/events-2017.12.csv",
  function (d) {
    // This function is applied to each row of the dataset
    d.Timestamp = dateFmt(d.timestamp);
    return d;
  },
  function (err, data) {
    if (err) throw err;

    d3.select(".loading-placeholder")
        .style("display", "none");

    d3.select(".viz-row")
        .style("display", "flex");

    var csData = crossfilter(data);

    // We create dimensions for each attribute we want to filter by
    csData.dimTime = csData.dimension(function (d) { return d.Timestamp; });
    csData.dimRegion = csData.dimension(function (d) { return d.region; });
    csData.dimProductStyle = csData.dimension(function (d) { return d.productStyle; });

    // We bin each dimension
    csData.timesByHour = csData.dimTime.group(d3.timeHour);
    csData.regions = csData.dimRegion.group();
    csData.styles = csData.dimProductStyle.group();

    chartTimeline.onBrushed(function (selected) {
      csData.dimTime.filter(selected);
      update();
    });

    barChartRegion.onMouseOver(function (d) {
      csData.dimRegion.filter(d.key);
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimRegion.filterAll();
      update();
    });

    barChartStyle.onMouseOver(function (d) {
      csData.dimProductStyle.filter(d.key);
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimProductStyle.filterAll();
      update();
    });

    function update() {
      d3.select("#timeline")
        .datum(csData.timesByHour.all())
        .call(chartTimeline);

      d3.select("#carTypes")
        .datum(csData.regions.all())
        .call(barChartRegion);

      d3.select("#gates")
        .datum(csData.styles.all())
        .call(barChartStyle)
        .select(".x.axis") //Adjusting the tick labels after drawn
        .selectAll(".tick text")
        .attr("transform", "translate(-8,-1) rotate(-45)");

    }

    update();
  }
);

