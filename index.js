//# dc.js Getting Started and How-To Guide
'use strict';

//charts - divs

//var gainOrLossChart = dc.pieChart("#gain-loss-chart");
//var fluctuationChart = dc.barChart("#fluctuation-chart");
var complaintChart = dc.rowChart("#complaint-chart");

var boroughChart = dc.rowChart("#borough-chart");
var dayOfWeekChart = dc.rowChart("#day-of-week-chart");
var agencyChart = dc.rowChart("#agency-chart");
var hourChart = dc.barChart("#hour-chart");
var nycMap = dc.geoChoroplethChart("#nyc-chart");
var zipcodeChart = dc.rowChart("#zipcode-chart");
//var durationChart = dc.barChart("#duration-chart");
//var moveChart = dc.lineChart("#monthly-move-chart");
//var volumeChart = dc.barChart("#monthly-volume-chart");
//var yearlyBubbleChart = dc.bubbleChart("#yearly-bubble-chart");
//var rwChart = dc.geoChoroplethChart("#choropleth-map-chart");

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


queue()
.defer(d3.csv, "311_data.csv")
//.defer(d3.csv, "nyc_smallSample.csv")
.defer(d3.json, "nyc-zip-codes.geojson")
.await(ready);

//filters for text
var nypd = "NYPD"
var weekend = ["0.Sun","6.Sat"]
var noise = "Loud Music/Party"
var tlc = "TLC"

function ready(error, data, geodata){
	//format dates
    var numberFormat = d3.format(".2f");
	
	//prepars date and month
   // data.forEach(function (d) {
   //     d.dd = Date.parse(d["Created Date"]);
   //     var date = new Date(d["Created Date"]);
   //     d.month = date.getMonth()+1; 
   //     d.hour = date.getHours()+1;
   //     d.day = date.getDay()
   // });

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    // dimension by month
    var monthDimension = ndx.dimension(function (d) {
        var date = new Date(d["Created Date"]);
        return date.getMonth()+1;
    });
  
//    var dateDimension = ndx.dimension(function (d) {
//        var date = new Date(d["Created Date"]);
//        return d.getDate();
//    });
//
	
    var agency = ndx.dimension(function (d) {
        return d["Agency"];
    });
    var agencyGroup = agency.group();

    var complaint = ndx.dimension(function (d) {
        return d["Descriptor"];
    });
    var complaintGroup = complaint.group();
  
    var hour = ndx.dimension(function (d) {
        var date = new Date(d["Created Date"]);
        return date.getHours();
    });
    var hourGroup = hour.group();
  
  
    var borough = ndx.dimension(function (d) {
        return d["Park Borough"];
    });
    var boroughGroup = borough.group();
	

    // counts per weekday
    var dayOfWeek = ndx.dimension(function (d) {
        var date = new Date(d["Created Date"]);
        var day = date.getDay();
        var dayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return day+"."+dayNames[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();


	var zipcode = ndx.dimension(function(d){
        if(d["Incident Zip"]==""){
            return "NA"
        }
		return d["Incident Zip"]
	})
	var zipcodeGroup = zipcode.group();

	var topRowHeight = 120;
	var topRowColor = "#EDA929"
    
    //var duration = ndx.dimension(function(d){
    //    var start = new Date(d["Created Date"])
    //    
    //    if(d["Closed Date"]==""){
    //        var end = new Date()
    //    }else{
    //        var end = new Date( d["Closed Date"])
    //    }
    //    
    //    var duration = (end.getTime()-start.getTime())/1000/60/60
    //    console.log(duration)
    //    return duration
    //})
   //var durationGroup = duration.group()
   //
   //durationChart.width(300)
   //    .height(topRowHeight)
   //    .margins({top: 0, right: 50, bottom: 20, left: 50})
   //    .ordinalColors([topRowColor])
   //    .dimension(duration)
   //    .group(durationGroup)
   //    .centerBar(true)
   //  //  .elasticY(true)
   //	
   //    .gap(1)
   //    .x(d3.scale.linear().domain([0,20]))
   //    .yAxis().ticks(4);
   //
    
    dayOfWeekChart.width(200)
        .height(topRowHeight)
        .margins({top: 0, left: 30, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        // assign colors to each value in the x scale domain
        .ordinalColors([topRowColor])
        .label(function (d) {
            return d.key.split(".")[1];
        })
		.labelOffsetX(-30)
		.labelOffsetY(10)
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .gap(2)
        .xAxis().ticks(4);
		
	hourChart.width(400)
	        .height(topRowHeight)
	        .margins({top: 0, right: 50, bottom: 20, left: 50})
	        .ordinalColors([topRowColor])
	        .dimension(hour)
	        .group(hourGroup)
	        .centerBar(true)			
	        .gap(1)
	        .x(d3.scale.linear().domain([1,24]))
	        .yAxis().ticks(4);
			
   
		var boroughScale = d3.scale.linear().domain([0,7]).range(["#ffffff", "#dc3a23"])
		var boroughChartColors = []
		for(var i =2; i < 7; i ++){
			boroughChartColors.push(boroughScale(i))
		}
		
		var allValue = data.length
		
    boroughChart.width(220)
        .height(140)
	    .margins({top: 20, left: 90, right: 10, bottom: 20})
		.ordinalColors(boroughChartColors)
		.gap(1)
		.data(function(zipcodeGroup){return zipcodeGroup.top(5)})
        .dimension(borough)
		.ordering(function(d){ return -d.value})
        .group(boroughGroup)
	    .ordinalColors(["#DE3E2A"])
	    .label(function (d) {
	        return d.key;
	    })
	    .elasticX(true)
		.labelOffsetX(-90)
		.labelOffsetY(15)
        .label(function (d) {
            return toTitleCase(d.key+ "  "+Math.round(d.value/allValue*100)+"%");
        })
        .xAxis().ticks(2)
		
	zipcodeChart.width(200)
	    .height(200)
	    .margins({top: 20, left: 40, right: 10, bottom: 20})
	    .group(zipcodeGroup)
	    .dimension(zipcode)
		.gap(1)
		.data(function(zipcodeGroup){return zipcodeGroup.top(10)})
		.ordering(function(d){ return -d.value })
	    .ordinalColors(["#D96947"])
	    .label(function (d) {
	        return d.key;
	    })
		.labelOffsetX(-35)
		.labelOffsetY(12)
	    .title(function (d) {
	        return d.value;
	    })
	    .elasticX(true)
	    .xAxis().ticks(4);
			
			
		var bottomRowHeight = 800
		
	agencyChart.width(380)
        .height(bottomRowHeight)
        .margins({top: 0, left: 125, right: 10, bottom: 20})
        .group(agencyGroup)
        .dimension(agency)
		.labelOffsetX(-120)
		.labelOffsetY(12)
		.data(function(agencyGroup){return agencyGroup.top(50)})
		.ordering(function(d){ return -d.value })
        .ordinalColors(["#5CDD89"])
        .label(function (d) {
            return d.key+": "+ d.value+ " Reports";
        })
        // title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4)
		
	complaintChart.width(390)
        .height(bottomRowHeight)
        .margins({top: 0, left: 180, right: 10, bottom: 20})
        .group(complaintGroup)
        .dimension(complaint)
		.labelOffsetX(-175)
		.labelOffsetY(12)		
		.data(function(complaintGroup){return complaintGroup.top(50)})
		.ordering(function(d){ return -d.value })
        .ordinalColors(["#63D965"])
		.title("test")
		.label(function (d){
			var keyString = d.key.split(" ")
			//return d.key
            return keyString[0]+" "+keyString[1]+": "+ d.value + " Reports";
        })
        .elasticX(true)
        .xAxis().ticks(4)
		//.on("mouseover", function(d){console.log("test")})
	
			
    dc.dataCount(".dc-data-count")
        .dimension(ndx)
        .group(all)
        .html({
            some:"%filter-count selected out of <strong>%total-count</strong> records | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
            all:"All  %total-count records selected."
        })

 	var maxZipcode = zipcodeGroup.top(1)[0].value
	var projection = d3.geo.mercator()
					.center([-74.25,40.915])
					.translate([0, 0])
					.scale(45000);
    nycMap
		.projection(projection)
        .width(480) // (optional) define chart width, :default = 200
        .height(430) // (optional) define chart height, :default = 200
        .transitionDuration(1000) // (optional) define chart transition duration, :default = 1000
        .dimension(zipcode) // set crossfilter dimension, dimension key should match the name retrieved in geo json layer
        .group(zipcodeGroup) // set crossfilter group
        //.colors(function(d, i){return  colorScale(d.value);})
		//.colorAccessor(function(d){return d.value})
		.colors(d3.scale.sqrt().domain([0,maxZipcode*.8]).range(["#dddddd", "red"]))
		.overlayGeoJson(geodata.features, "zipcode", function(d) {
            return d.properties.postalCode;
        })
		//.on('mouseover', tip.show)
		.legend(dc.legend().x(400).y(10).itemHeight(13).gap(5))
		
    dc.renderAll();
	d3.select("#loader").remove();
};

d3.selectAll("#version").text(dc.version);
