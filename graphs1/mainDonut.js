var timerInterval = 1500;

    var donut = donutChart()
        .width(960)
        .height(500)
        .transTime(750) // length of transitions in ms
        .cornerRadius(3) // sets how rounded the corners are on each slice
        .padAngle(0.015) // effectively dictates the gap between slices
        .variable('prob')
        .category('species');

    var i = 0;

    d3.tsv('species.tsv', function(error, data) {
        if (error) throw error;

        // group entries together by timestamp to simulate  receiving real-time data
        var nestData = d3.nest()
            .key(function(d) { return d.time; }) // collects entries with the same time value
            .entries(data);

        // timer to update chart with new data every timeInterval milliseconds.
        var timer = setInterval(function() {
        	if (i === nestData.length - 1) { clearInterval(timer); }
        	donut.data(nestData[i].values);
            if (i === 0) { // if first time receiving data...
                i++;
                d3.select('#chart')
                    .call(donut); // draw chart in div
            }
            i++;
        }, timerInterval);
    });