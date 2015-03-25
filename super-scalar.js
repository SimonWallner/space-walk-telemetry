 // monkey patching
 String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var libsw = new LibSpaceWalk();



// ==== Scalar Data ====
var scalarData = [];
var scalarID = 0;

// ==== session stuff ====
var sessionID = 0;


libsw.onMessage = function(data) {
	if (data.type === 'scalar') {
		var scalar = data.payload;
		var entry = scalarData[scalar.name];

		if (entry) { // scalar is already known
			entry.value = scalar.value;

			var sessionDiv = d3.select('#scalar-session-' + sessionID);

			sessionDiv.select('#scalar-' + entry.id + ' div.value')
				.text(round(scalar.value, 2))

			if (scalar.value < entry.min) {
				entry.min = scalar.value;
				sessionDiv.select('#scalar-' + entry.id + ' span.minValue')
					.text(round(entry.min, 2))
			}

			if (scalar.value > entry.max) {
				entry.max = scalar.value
				sessionDiv.select('#scalar-' + entry.id + ' span.maxValue')
					.text(round(entry.max, 2))
			}
		}
		else { // scalar is NEW
			var entry = scalarData[scalar.name] = {
				value: scalar.value,
				min: scalar.value,
				max: scalar.value,
				id: scalarID++,
				highlighted: false
			};

			var tile = d3.select('#scalar-session-' + sessionID).append('div')
				.attr('class', 'tile')
				.attr('id', 'scalar-' + entry.id)
			tile.append('div')
				.attr('class', 'name')
				.text(scalar.name);
			tile.append('div')
				.attr('class', 'value')
				.text(round(scalar.value, 2));
			tile.append('hr');


			var min = tile.append('div')
				.attr('class', 'minMax')
			min.append('span')
				.attr('class', 'label')
				.text('min');
			min.append('br');
			min.append('span')
				.attr('class', 'minValue')
				.text(round(entry.min, 2));


			var max = tile.append('div')
				.attr('class', 'minMax')
			max.append('span')
				.attr('class', 'label')
				.text('max');
			max.append('br');
			max.append('span')
				.attr('class', 'maxValue')
				.text(round(entry.min, 2));

			// make it clickable
			$('#scalar-' + entry.id).click(function() {
				entry.highlighted = !entry.highlighted;

				if (entry.highlighted) {
					d3.select('#scalar-' + entry.id)
						.attr('class', 'tile highlighted')
				}
				else {
					d3.select('#scalar-' + entry.id)
						.attr('class', 'tile')
				}
			})
		}
	}
}

libsw.onSessionStarted = function() {
	// pre new session
	d3.select('#scalar-session-' + (sessionID))
		.transition().duration(500)
			.style('opacity', 0.5)

	// new session
	sessionID++;

	// post new session
	d3.select('#scalar').append('div')
		.attr('class', 'sessionMarker')
		.text('new session started...')
	d3.select('#scalar').append('div')
		.attr('id', 'scalar-session-' + sessionID)
	scalarData = [];
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

function newSessionStarted() {
	// pre new session
	d3.select('#scalar-session-' + (sessionID))
		.transition().duration(500)
			.style('opacity', 0.5)

	// new session
	sessionID++;

	// post new session
	d3.select('#log').append('div')
		.attr('class', 'sessionMarker')
		.text('new session started...');

	d3.select('#scalar').append('div')
		.attr('class', 'sessionMarker')
		.text('new session started...')
	d3.select('#scalar').append('div')
		.attr('id', 'scalar-session-' + sessionID)
	scalarData = [];
}

function toggleCube(state, name, cls) {
	if (state === showState.show) {
		d3.select(name)
			.transition()
				.duration(200)
				.style('opacity', 1);

		d3.selectAll('div.log div.' + cls)
			.style('opacity', 1)
			.style('display', 'block');
	}
	else if (state === showState.faded) {
		d3.select(name)
			.transition()
				.duration(200)
				.style('opacity', 0.5);

		d3.selectAll('div.log div.' + cls)
			.style('opacity', 0.5)
			.style('display', 'block');
	}

	else if (state === showState.hide) {
		d3.select(name)
			.transition()
				.duration(200)
				.style('opacity', 0.1);

		d3.selectAll('div.log div.' + cls)
			.style('opacity', 0.1)
			.style('display', 'none');
	}
}

function init() {
	var clearScalar = function() {
		scalarData = [];

		d3.selectAll('div.scalar div')
			.remove();

		d3.select('#scalar').append('div')
			.attr('id', 'scalar-session-' + sessionID)
	}
	$('#clearScalar').click(clearScalar);

    newSessionStarted();
}


var readyStateCheckInterval = setInterval(function() {
	   if (document.readyState === "complete") {
		   init();
		   clearInterval(readyStateCheckInterval);
	   }
}, 10);

// ================================= util ================================
function round(value, decimals) {
	decimals = decimals || 0;
	var v = value * Math.pow(10, decimals);
	return Math.round(v) / Math.pow(10, decimals);
}

function last(arr) {
	return arr[arr.length-1];
}
