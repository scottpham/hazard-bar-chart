var mobileThreshold = 300, //set to 500 for testing
    aspect_width = 16,
    aspect_height = 9;

//standard margins
var margin = {
    top: 30,
    right: 30,
    bottom: 20,
    left: 30
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

    //empty object for storing mobile dependent variables
    var mobile = {};
    //check for mobile
    function ifMobile (w) {
        if(w < mobileThreshold){
        }
        else{
        }
    } 
    //call mobile check
    ifMobile(width);
    //calculate height against container width
    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;


    var x = d3.scale.linear().range([0, width]),
        y = d3.scale.ordinal().rangeRoundBands([0, height], 0.15);

    var format = d3.format("0.2f"); //formats to two decimal places

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(tickNumber)
        .tickFormat()
        .orient("top")
        .tickSize(5, 0, 0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(5, 0, 0);

    //create main svg container
    var svg = d3.select("#graphic").append("svg")
        .attr("width", width + margin.left + margin.right)
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
                .orient("bottom")
                .ticks(tickNumber)
            }

    //asynchronous csv call
    d3.csv("DATAFILE.CSV", type, function(error, data) {

        //BUILD GRID
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize((-height - 10), 0, 0) //grid lines are actually ticks
                .tickFormat("")
            )
    
    //end of csv call function
    });

    //coercion function called back during csv call
    function type(d){
        d.value = +d.value;
        return d;
    }

}//end function render    





