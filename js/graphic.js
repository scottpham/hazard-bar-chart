var mobileThreshold = 500, //set to 500 for testing
    aspect_width = 16,
    aspect_height = 9,
    tickNumber = 10;

//standard margins
var margin = {
    top: 30,
    right: 40,
    bottom: 20,
    left: 135
};
//jquery shorthand
var $graphic = $('#graphic');
//base colors
var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * Render the graphic
 */
//check for svg
$(window).load(function() {
    draw_graphic();
});

function draw_graphic(){
    if (Modernizr.svg){
        $graphic.empty();
        var width = $graphic.width();
        render(width);
        window.onresize = draw_graphic; //very important! the key to responsiveness
    }

}

function render(width) {
    var selected = $("#dropdown").val();
        console.log("dropdown = " + selected );

    //empty object for storing mobile dependent variables
    var mobile = {};
    //check for mobile
    function ifMobile (w) {
        if(w < mobileThreshold){
            console.log("mobileThreshold reached");
            mobile.fontSize = "13px";
            margin.left = 100;
            // margin.right= 
        }
        else{
            mobile.fontSize = null;
            margin.left = 135;
        }
    } 
    //call mobile check
    ifMobile(width);
    //calculate height against container width
    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

    console.log("height = " + height);

    height > 330 ? height = 330: null;

    var x = d3.scale.linear().range([0, width-margin.left-margin.right]),
        //second param is a gap
        y = d3.scale.ordinal().rangeRoundBands([0, height], 0.15);

    var format = d3.format("0.2f"); //formats to two decimal places

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat("")//"" means blank
        .orient("top");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    //create main svg container
    var svg = d3.select("#graphic").append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //tooltip
    var div = d3.select("#graphic").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //gridlines (call this later)
    var make_x_axis = function() { 
        return d3.svg.axis()
            .scale(x)
                .orient("bottom");
            };

    console.log(selected);

    //asynchronous csv call
    d3.csv("spills.csv", type, function(error, data) {
        //x domain is between 0 and max of the selected
        x.domain([0, d3.max(data, function(d){ return 158; })]);
        //y domain sorts counties based on selected value
        y.domain(data.sort( function (a, b) { return b[selected] - a[selected]; }).map(function(d) { return d.county}));

        //bars
        svg.selectAll(".bar")
              .data(data)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("fill", "#bf600a")
                .attr("width", function(d){ return x(d[selected]); })
                .attr("y", function(d){ return y(d.county); })
                .attr("height", y.rangeBand());

        //value labels
        svg.selectAll(".label")
            .data(data)
            .enter().append("text")
                .attr("class", "label")
                .text(function(d) { if(d){ return d[selected]} else{ return "0"} ; })
                .attr("y", function(d){ return y(d.county) + (y.rangeBand()/2); })
                .attr("x", function(d){ return x(d[selected]) + 3; })
                .attr("dy", 3);

        //append g for county names
        svg.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y axis")
            .call(yAxis)
                .attr("text-anchor", "end");

        svg.selectAll(".tick").style("font-size", mobile.fontSize)

        //x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,0)")
            .call(xAxis);
    
    //end of csv call function
    });

   //coercion function called back during csv call
    function type(d){
        d[selected] = +d[selected];
        return d;
    }


    ///////////events////////////

    d3.select("#dropdown").on("change", function(){ 
        //reset selected
        selected = this.value;

        d3.csv("spills.csv", type, function(error, data){
            //standard transitions
            var t = svg.transition().duration(500),
            delay = function(d, i){ return i * 150; };

            //resort the counties
            var ySort = y.domain(data.sort( function(a, b){ return b[selected] - a[selected]; })
                .map(function(d){ return d.county; }));

            //these events chain one after the other
            //because there is a delay, all functions fire for each county and then cycles again
            function sortCounties(){
                t.selectAll(".bar")
                    .attr("y", function(d){ 
                        return ySort(d.county); })
                    .each(resizeBars)
                    .delay(delay)
                    ;
            }

            sortCounties();

            //resize bars
            function resizeBars(){
                t.selectAll(".bar")
                    .attr("width", function(d){ return x(d[selected]); })
                    .each(moveLabel) //call move label at end
                    .delay(delay)
                    ;
                }

            function moveLabel() {

                t.selectAll(".label")
                    .attr("x", function(d){ return x(d[selected]) + 3; })
                    .text(function(d){ return d[selected]; })
                    .attr("y", function(d){ return ySort(d.county) + (y.rangeBand()/2); })
                    .each(callAxis)
                    .delay(delay)
                    ;
                }

            function callAxis() {
                t.selectAll(".y.axis")
                    .call(yAxis)
                    .selectAll(".tick")
                    .delay(delay);  
            }
            

        });//end of d3.csv


    });

}//end function render    





