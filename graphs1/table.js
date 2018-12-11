function chartTable() {
    var data = [],
        width,
        height,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        transTime = 750;

    var updateTableData = function() {};

    function chart(selection){
        selection.each(function() {
            // generate chart
 
            // Remove the existing table and create a new one
            selection.selectAll('table').remove();

            var table = selection.append('table')
                // .attr('width', width + margin.left + margin.right)
                // .attr('height', height + margin.top + margin.bottom)
                // .append('g')
                //  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


            // Add a caption
            table.append('caption')
                .text("Transactions for selected customer");


            var thead = table.append('thead');
            var tbody = table.append('tbody');

            var columns = ['customer_state', 'product_category', 'product_price'];

            thead.append('tr')
                .selectAll('th')
                .data(columns)
                .enter()
                .append('th')
                .text(function(column) { return column;});

     
            // Function to update the chart
            updateTableData = function() {

                var updateRows = tbody.selectAll('tr');

                // console.log(data);

                updateRows.data(data).enter().append('tr')
                    .selectAll('td')
                        .data(function (row) {
                            return columns.map(function (column) {
                                return {column: column, value: row[column]};
                            });
                        })
                        .enter()
                        .append('td')
                        .text(function(d) { return d.value; });
                // // .text(function(d) {
                // //     return d.customer_state + ", " + d.product_category + ", " + d.product_price;
                // });
                // .selectAll('td')
                // .data(function(row) {
                //     return columns.map(function(c) {
                //         return c
                //     })
                // })

                // updateCells.data(function(row, i) {
                //     return columns.map(function(column) {
                //         return row.column;
                //     });
                // })
                // .enter()
                // .append('td')
                // .text(function(d) {
                //     return d;
                // });

                // updateCells.data((row) => {
                //         console.log(row);
                //         return columns.map((column) => {
                //             return {
                //                 column,
                //                 value: row[column]
                //             };
                //         });
                //     })
                    // .enter()
                    // .append('td')
                    // .text(({value}) => value);

                // // remove rows that are not in the current dataset
                // updateRows.exit()
                //     .transition()
                //     .duration(transTime)
                //     .remove();

                // updateCells.exit()
                //     .transition()
                //     .duration(transTime)
                //     .remove();

                // // animates the transition from old to new rows
                // updateRows.transition().duration(transTime);

                // updateCells.transition().duration(transTime);

            };
 
        });
    };

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.colour = function(value) {
        if (!arguments.length) return colour;
        colour = value;
        return chart;
    };

    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        // if (typeof updateTableData === 'function') updateTableData();
        updateTableData();
        return chart;
    };

    chart.transTime = function(value) {
        if (!arguments.length) return transTime;
        transTime = value;
        return chart;
    };

    return chart;
};
