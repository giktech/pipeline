d3.csv(
    "../data/test.csv"
    ,function(error, data) {
        d3.select(".loading-placeholder")
            .style("display", "none");

        d3.select(".viz-row")
            .style("display", "flex");
    }
)

