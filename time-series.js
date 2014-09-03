 // monkey patching
 String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var libsw = new LibSpaceWalk();


var dataArray = [];
for (var i = 0; i < 100; i++) {
	dataArray[i] = 0;
}


// ==== Time Series Data ====
var timeSeriesData = [];
var plotID = 0;
var dim = {
	width: 444,
	height: 148,
	left: 35,
	top: 5,
	bottom: 17,
}

dim.innerHeight = dim.height - (dim.top + dim.bottom);
dim.innerWidth = dim.width - dim.left;

// ==== session stuff ====
var sessionID = 0;

var x = d3.scale.linear()
	.domain([0, 100])
	.range([0, 600])
	
var y = d3.scale.linear()
	.domain([0, 10])
	.range([140, 0])

libsw.onSessionStarted = function() {}
	
libsw.onMessage = function(data) {
	if (data.type == 'core.simpleTelemetry.sample') {
		var pl = data.payload
		var entry = timeSeriesData[pl.name];
		
		if (entry) // plot already exists
		{
			addData(pl.name, pl.value, pl.time);
		} else {
			entry = timeSeriesData[pl.name] = {
				name: pl.name,
				data: [],
				id: plotID++,
				min: pl.value,
				max: pl.value,
				bufferLength: 250,
				scale: 'lin'
			}
			
			var div = d3.select('#data').append('div')
				.attr('id', 'plot-' + entry.id)
				.attr('class', 'plot');
			
			div.append('div')
				.attr('class', 'name')
				.text(pl.name);
			
			// buttons div
			var buttonsDiv = div.append('div')
				.attr('class', 'dataButtons')
				
			// log/linear
			var logLinSpan = buttonsDiv.append('span')
				.attr('class', 'logLin')
			
			logLinSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-lin')
				.attr('class', 'active')
				.text('lin');
			$('#plot-' + entry.id + '-lin').click(function() {
				entry.scale = 'lin';
				d3.select('#plot-' + entry.id + '-lin')
					.attr('class', 'active');
				d3.select('#plot-' + entry.id + '-log')
					.attr('class', '');
			})
				
			logLinSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-log')
				.text('log');
			$('#plot-' + entry.id + '-log').click(function() {
				entry.scale = 'log';
				d3.select('#plot-' + entry.id + '-log')
					.attr('class', 'active');
				d3.select('#plot-' + entry.id + '-lin')
					.attr('class', '');
			})
			
				
			// buffer length spans
			var bufferLengthSpan = buttonsDiv.append('span')
				.attr('class', 'bufferLength')

			bufferLengthSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-100')
				.text('100');
			$('#plot-' + entry.id + '-100').click(function() {
				bufferSetSpanActive(entry.id, '100')
				entry.bufferLength = 100;
			})
			
			bufferLengthSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-250')
				.text('250')
				.attr('class', 'active');
			$('#plot-' + entry.id + '-250').click(function() {
				bufferSetSpanActive(entry.id, '250')
				entry.bufferLength = 250;
			})
			
			bufferLengthSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-500')
				.text('500');
			$('#plot-' + entry.id + '-500').click(function() {
				bufferSetSpanActive(entry.id, '500')
				entry.bufferLength = 500;
			})
			
			bufferLengthSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-1k')
				.text('1k');
			$('#plot-' + entry.id + '-1k').click(function() {
				bufferSetSpanActive(entry.id, '1k')
				entry.bufferLength = 1000;
			})
			
			bufferLengthSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-2-5k')
				.text('2.5k');
			$('#plot-' + entry.id + '-2-5k').click(function() {
				bufferSetSpanActive(entry.id, '2-5k')
				entry.bufferLength = 2500;
			})
			
			
			// update interval spans
			var updateIntervalSpan = buttonsDiv.append('span')
				.attr('class', 'updateInterval');
				
			updateIntervalSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-live')
				.text('live');
			$('#plot-' + entry.id + '-live').click(function() {
				updateSetSpanActive(entry.id, 'live')
				entry.updateCallbackHandle && clearInterval(entry.updateCallbackHandle);
				entry.updateCallbackHandle = setInterval(function() {
					updatePlot(entry.name);
				}, 30);
			})

			updateIntervalSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-1s')
				.text('1s')
			$('#plot-' + entry.id + '-1s').click(function() {
				updateSetSpanActive(entry.id, '1s')
				entry.updateCallbackHandle && clearInterval(entry.updateCallbackHandle);
				entry.updateCallbackHandle = setInterval(function() {
					updatePlot(entry.name);
				}, 1000);
			})
			
			updateIntervalSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-5s')
				.text('5s')
			$('#plot-' + entry.id + '-5s').click(function() {
				updateSetSpanActive(entry.id, '5s')
				entry.updateCallbackHandle && clearInterval(entry.updateCallbackHandle);
				entry.updateCallbackHandle = setInterval(function() {
					updatePlot(entry.name);

				}, 5000);
			})
			
			updateIntervalSpan.append('span')
				.attr('id', 'plot-' + entry.id + '-off')
				.attr('class', 'active')
				.text('off')
			$('#plot-' + entry.id + '-off').click(function() {
				entry.updateCallbackHandle && clearInterval(entry.updateCallbackHandle);
				updateSetSpanActive(entry.id, 'off')
			})
			
						
			// clear button
			buttonsDiv.append('div')
				.attr('class', 'rounded-inline clearData')
				.attr('id', 'clearData-' + entry.id)
				.text('clear!')
			$('#clearData-' + entry.id).click(function() {
				entry.data = [];
				entry.min = Infinity;
				entry.max = -Infinity;
				// updatePlot(entry.name); // does not work, because the plot is not updated if there is no data.
			})
			div.append('div')	
				.style('clear', 'both')
			
			// add the svg
			entry.svg = div.append('svg')
				.attr('width', 444)
				.attr('height', 148)
						
			entry.svg.append('g').attr('class', 'xAxis');
			entry.svg.append('g').attr('class', 'yAxis');
			entry.svg.append('g').attr('class', 'data')
				.attr('transform', 'translate(' + dim.left + ',' + dim.top + ')');
			
							
			// finally add the data.
			addData(pl.name, pl.value, pl.time);
		}
	}
}

function updateSetSpanActive(id, button) {
	d3.selectAll('#plot-' + id + ' span.updateInterval span')
		.attr('class', '');
	d3.select('#plot-' + id + '-' + button)
		.attr('class', 'active');
}

function bufferSetSpanActive(id, button) {
	d3.selectAll('#plot-' + id + ' span.bufferLength span')
		.attr('class', '');
	d3.select('#plot-' + id + '-' + button)
		.attr('class', 'active');
}
function addData(name, datum, time) {
	var entry = timeSeriesData[name];
	
	entry.data.push({x: time, y: datum});
	
	if (datum < entry.min)
		entry.min = datum;
	if (datum > entry.max)
		entry.max = datum;
		
	if (entry.data.length > entry.bufferLength)
		entry.data.splice(0, entry.data.length - entry.bufferLength);
}

function updatePlot(name) {
	var entry = timeSeriesData[name];
	if (entry.data[0] === undefined) {
		return;
	}

	var x = d3.scale.linear()
		.domain([entry.data[0].x, last(entry.data).x])
		.range([0, dim.innerWidth - 2]);

	if (entry.scale === 'lin') {
		var y = d3.scale.linear()
			.domain([entry.min, entry.max])
			.range([dim.innerHeight, 0])
	} else {
		var y = d3.scale.log()
			.domain([Math.max(entry.min, 0.1), entry.max])
			.range([dim.innerHeight, 0])
	}

		
	var xAxis = d3.svg.axis()
		.scale(x)
		.ticks(5)
		.tickSubdivide(3)
		.tickSize(dim.innerHeight + 6, dim.innerHeight, dim.innerHeight + 6)
		.orient('bottom');
	
	var yAxis = d3.svg.axis()
		.scale(y)
		.ticks(5)
		.tickSize(dim.innerWidth + 3, dim.innerWidth - 3, dim.innerWidth + 3)
		.tickSubdivide(1)
		.orient('left');

	entry.svg.select('g.xAxis')
		.attr('transform', 'translate(' + dim.left + ', ' + dim.top + ')')
		.call(xAxis);
	entry.svg.select('g.yAxis')
		.attr('transform', 'translate(' + (dim.width - 2) + ', ' + dim.top + ')')
		.call(yAxis);

	
	var path = entry.svg.select('g.data').selectAll('path')
		.data([entry.data]);
	
	if (entry.scale === 'lin') {
		var drawPath = function(d) {
			d.attr('d', d3.svg.line() 
				.x(function(d) { return x(d.x); })
				.y(function(d) { return y(d.y); })
				.interpolate('linear'));
		}
	} else {
		var drawPath = function(d) {
			d.attr('d', d3.svg.line() 
				.x(function(d) { return x(d.x); })
				.y(function(d) { return y(Math.max(d.y, 0.1)); })
				.interpolate('linear'));
		}
	}
	
	path.enter().append('path')
		.call(drawPath)
	
	path.transition()
		.duration(0)
		.call(drawPath)
}


// ================================= util ================================
function round(value, decimals) {
	decimals = decimals || 0;
	var v = value * Math.pow(10, decimals);
	return Math.round(v) / Math.pow(10, decimals);
}

function last(arr) {
	return arr[arr.length-1];
}