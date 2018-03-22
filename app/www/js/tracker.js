function gps_distance(lat1, lon1, lat2, lon2)
{
    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    
    return d;
}

var track_id = '';      // Name/ID of the exercise
var watch_id = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects
var timeWatch;
var tracks = []; // All tracks or individual track

$("#home").live('pageshow', function(){
	updateTrackHistory();
});

$("#startTracking_start").live('click', function(){
	console.log('started');
	var previouslat = '';
	var previouslong = '';
	var total_km = 0;
	
	if($("#startTracking_start").hasClass('timeout') == true){
		return false;
	}

	$("#startTracking_start").addClass('timeout');
	setTimeout(function(){
		$("#startTracking_start").removeClass( "timeout" );
	}, 2000)
	

	if ($( "#startTracking_start" ).hasClass( "stopped" )){

		window.watch_id = navigator.geolocation.watchPosition(
		// Success
		function(position){
			var currentEmotion = $("#slider-0").val();
			if (previouslat === '') {
				positionData = {'emotion': currentEmotion,'timestamp':position['timestamp'], 'lat':position['coords']['latitude'], 'lng':position['coords']['longitude'], 'accuracy':position['coords']['accuracy']};
				window.tracking_data.push(positionData);
				
				previouslat = position.coords.latitude;
				previouslong = position.coords.longitude;
			}
			else{
				positionData = {'emotion': currentEmotion, 'timestamp':position['timestamp'], 'lat':position['coords']['latitude'], 'lng':position['coords']['longitude'], 'accuracy':position['coords']['accuracy']};
				window.tracking_data.push(positionData);
				distance = gps_distance(position.coords.latitude, position.coords.longitude, previouslat, previouslong);
				total_km += distance;
				total_km_rounded = total_km.toFixed(2);
				$("#kmlocation").text(total_km_rounded); 
				previouslat = position.coords.latitude;
				previouslong = position.coords.longitude;
			}
			console.log(tracking_data)
		},
		// Error
		function(error){

			alert('Er kan geen nauwkeurige meting worden gedaan. Staat je GPS aan(en op hoge accuraatheid)?');
			$( "#startTracking_start" ).toggleClass( "started stopped" );
			// Change image
			$("#startTracking_start").html('<img src="img/button_go.jpg" onerror="this.onerror=null; this.src=\'img/button_go.jpg\'">');
			window.timeWatch.stop().once();
		},
		// Settings
		{ frequency: 3000, enableHighAccuracy: true});
		setTimeout(function(){
			if(window.tracking_data.length == 0){
				alert('Er kan geen nauwkeurige meting worden gedaan. Staat je GPS aan(en op hoge accuraatheid)?');
				$( "#startTracking_start" ).toggleClass( "started stopped" );
				// Change image
				$("#startTracking_start").html('<img src="img/button_go.jpg" onerror="this.onerror=null; this.src=\'img/button_go.jpg\'">');
				window.timeWatch.stop().once();
			}else{
				console.log(window.tracking_data.length);
			}
		}, 15000)

		$( "#startTracking_start" ).toggleClass( "stopped started" );
		$( "#cancelTracking" ).removeClass( "displayNone" );
		
		// Change image of button !
		$("#startTracking_start").html('<img src="img/button_stop.jpg" onerror="this.onerror=null; this.src=\'img/button_stop.jpg\'">');
		var $stopwatch; // Stopwatch element on the page
		var incrementTime = 1000; // Timer speed in milliseconds
		var currentTime = 0; // Current timer position in milliseconds	
		
		// Start the timer
		$stopwatch = $('#timerlocation');
		window.timeWatch = $.timer(updateTimer, incrementTime, true);  
		
	
		// Output time and increment
		function updateTimer() {
			var timeString = formatTime(currentTime);
			$stopwatch.html(timeString);
			currentTime += incrementTime;
		}
		function pad(number, length) {
			var str = '' + number;
			while (str.length < length) {str = '0' + str;}
			return str;
		}
		
		function formatTime(time) {
		time = time / 10;
		var min = parseInt(time / 6000),
			sec = parseInt(time / 100) - (min * 60);
		return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2)
		}
		
		
	}
	else{
		$( "#startTracking_start" ).toggleClass( "started stopped" );
			// Stop tracking the user
		navigator.geolocation.clearWatch(window.watch_id);
		window.timeWatch.stop().once();





		// Change image
		$("#startTracking_start").html('<img src="img/button_go.jpg" onerror="this.onerror=null; this.src=\'img/button_go.jpg\'">');
		



		if(window.tracking_data.length != 0){
			teamid = window.localStorage.getItem('team_id'); // GET Team ID
			transportType = $(".transport_images.selected").attr('id'); // gets transportType value that look like "choice-1" "choice-2" "choice-3" 
			totalTime = (window.tracking_data[window.tracking_data.length-1].timestamp - window.tracking_data[0].timestamp)/1000;
			
			
			totalKM = $('#kmlocation').text();

			
			
			
			
			// Reset watch_id and tracking_data 
			watch_id = null;
			 // Set to empty array
			
			routerArray = [];
			//router_count = getTracks().length; // Get number of tracks in storage

			//routerdata = getTracks( router_count-1 ); // Get last track
			for(var i=0;i<window.tracking_data.length;i++){ 
				routerArray.push({'timestamp': window.tracking_data[i].timestamp,'coordinates':{'latitude':window.tracking_data[i].lat, 'longitude':window.tracking_data[i].lng, 'accuracy':window.tracking_data[i].accuracy, 'emotion':window.tracking_data[i].emotion}});
			}

			setTracks(teamid, transportType,totalTime,totalKM,routerArray); // Save tracking data
			updateTrackHistory();
			if(teamid !== null){		
				callbody = {'teamid':teamid,'transport_method':transportType, 'route':routerArray}; 
				 $("#slider-0").val(3).slider("refresh");
	
			
				// Tidy up the UI
				//$("#track_id").val("").show();
				$.ajax({
				  type: "POST",
				  url: 'http://149.210.213.121/appdata',
				  data: callbody,
				  dataType: 'json'
				});

			}
			window.tracking_data = [];
			}
		else{
			$("#slider-0").val(3).slider("refresh");
			alert('We hebben geen data ontvangen. Staat je GPS aan?');
		}
	

		
	}

});

/*$("#startTracking_start").live('click', function(){
	setTracks('5000','bike', 500, 500, '[{"timestamp":1335700802000,"coords":{"heading":null,"altitude":null,"longitude":170.33488333333335,"accuracy":0,"latitude":-45.87475166666666,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700803000,"coords":{"heading":null,"altitude":null,"longitude":170.33481666666665,"accuracy":0,"latitude":-45.87465,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700804000,"coords":{"heading":null,"altitude":null,"longitude":170.33426999999998,"accuracy":0,"latitude":-45.873708333333326,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700805000,"coords":{"heading":null,"altitude":null,"longitude":170.33318333333335,"accuracy":0,"latitude":-45.87178333333333,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700806000,"coords":{"heading":null,"altitude":null,"longitude":170.33416166666666,"accuracy":0,"latitude":-45.871478333333336,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700807000,"coords":{"heading":null,"altitude":null,"longitude":170.33526833333332,"accuracy":0,"latitude":-45.873394999999995,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700808000,"coords":{"heading":null,"altitude":null,"longitude":170.33427333333336,"accuracy":0,"latitude":-45.873711666666665,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700809000,"coords":{"heading":null,"altitude":null,"longitude":170.33488333333335,"accuracy":0,"latitude":-45.87475166666666,"speed":null,"altitudeAccuracy":null}}]');
});*/


	

$('#ranking').live('pageshow', function(){
	$("#ranking_list").empty();
	$.getJSON("http://149.210.213.121/getranking", function( data ) {
		$.each(data['ranking'], function( key, val ) {
			ranknr = key+1
			if(ranknr == 1){
				$("#ranking_list").append('<tr><td><img src="img/triangle.jpg" width="25px"/></td><td>Team: '+val.teamid+'</td><td> '+val.count+' routes</td></tr>');
			}
			else{
				$("#ranking_list").append('<tr><td>'+ranknr+'</td><td>Team: '+val.teamid+'</td><td> '+val.count+' routes</td></tr>');
			}
		});
	});
	
	if (localStorage.getItem("team_id") !== null) {
		//getteamID //if it does not exists do not do this!
		team_id = window.localStorage.getItem('team_id');
		
		$.getJSON("http://149.210.213.121/getdatacount/"+team_id, function( data ) {
			countString = 'Jouw team heeft '+data['count']+' route(s) toegevoegd!';
			$(".team_count").text(countString);
		});
	}
});

// When the user clicks a link to view track info, set/change the track_id attribute on the track_info page.
$(".clickableRow").live('click', function(){
	$("#track_info").attr("track_id", $(this).attr('id'));
	window.document.location = $(this).attr("href");
});


// When the user views the Track Info page
$('#track_info').live('pageshow', function(){

// ERROR ALS ER EEN PAGE-REFRESH WORDT GEDAAN OP SPECIFIEKE ROUTE !!!

	// Find the track_id of the workout they are viewing
	var key = $(this).attr("track_id");

	
	// Update the Track Info page header to the track_id
	$("#track_info div[data-role=header] h1").text(key);

	var data = getTracks(key);
	data = data.data;
	console.log(data);

	// Calculate the total distance travelled
	total_km = 0;

	for(i = 0; i < data.length; i++){
	    
	    if(i == (data.length - 1)){
	        break;
	    }
	    
	    total_km += gps_distance(data[i].coordinates.latitude, data[i].coordinates.longitude, data[i+1].coordinates.latitude, data[i+1].coordinates.longitude);
	}
	
	total_km_rounded = total_km.toFixed(2);
	
	// Calculate the total time taken for the track
	start_time = new Date(data[0].timestamp).getTime();
	end_time = new Date(data[data.length-1].timestamp).getTime();

	total_time_ms = end_time - start_time;
	total_time_s = total_time_ms / 1000;
	
	final_time_m = Math.floor(total_time_s / 60);
	final_time_s = total_time_s - (final_time_m * 60);

	// Display total distance and time
	$("#track_info_info").html('Travelled <strong>' + total_km_rounded + '</strong> km in <strong>' + final_time_m + 'm</strong> and <strong>' + final_time_s + 's</strong>');
	
	// Set the initial Lat and Long of the Google Map
	var myLatLng = new google.maps.LatLng(data[0].coordinates.latitude, data[0].coordinates.longitude);

	// Google Map options
	var myOptions = {
      zoom: 15,
      center: myLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Create the Google Map, set options
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var trackCoords = [];
    
    // Add each GPS entry to an array
    for(i=0; i<data.length; i++){
    	trackCoords.push(new google.maps.LatLng(data[i].coordinates.latitude, data[i].coordinates.longitude));
    }
    
    // Plot the GPS entries as a line on the Google Map
    var trackPath = new google.maps.Polyline({
      path: trackCoords,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    console.log(trackPath);
    // Apply the line to the map
    trackPath.setMap(map);		
});

// TIMMS FUNCTIONS:

// GET TRACKS 
function getTracks( specificTrack ){
	
	if(window.localStorage.getItem("tracks")=== null){
		return tracks; // return empty tracks array if there are none
	}else{
		tracks = JSON.parse(window.localStorage.getItem("tracks")); // Get item and turn the stringified GPS data back into a JS object - array
		if (!specificTrack){
			return tracks; // return all tracks if no track is specified
		}else{
			return tracks[specificTrack]; // else return the specified track
		}
	}
}

// SET TRACKS
function setTracks( teamName, transportMethod, totalTime, totalKM, Coords){
	if( !teamName ){
		// no teamName set  - do nothing
	}else if(!transportMethod){
		// no transportMethod set - do nothing
	}else if(!Coords){
		// no Coords set - do nothing
	}else{
		
		var newTrack = {'team':teamName, 'totalTime': totalTime, 'totalKM': totalKM, 'transport':transportMethod, 'data':Coords};
	
		tracks = getTracks();

		tracks.push(newTrack); // Push new data in object - array
		console.log(JSON.stringify(tracks));
		window.localStorage.setItem("tracks", JSON.stringify(tracks));
	}
}

// DEVELOPMENT ONLY
$(document).keypress(function (e) {
	if (e.keyCode == 32) { 
		window.localStorage.clear();
		console.log("local Storage cleared");
	}
});
// DEVELOPMENT ONLY

function updateTrackHistory(){
	router_count = getTracks().length; // Get number of tracks in storage
	tracks = getTracks();
	if(router_count != 0){
		$('.scrollnotification').css({'visibility':'visible'});
		// Empty the list of recorded tracks
		$("#history_tracklist").empty();
		
		// Iterate over all of the recorded tracks, populating the list
		/*
		for(i=0; i<window.localStorage.length-2; i++){
			$("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + window.localStorage.key(i) + "</a></li>");
		}
		*/
		for(i=router_count-1; i>=0; i--){
			
			var totalSec = tracks[i].totalTime;
			var minutes = parseInt( totalSec / 60 );
			var seconds = Math.round(totalSec % 60);
			if(tracks[i].transport == 'bike'){
				image_name = 'img/bike_small.jpg';
			}
			else if(tracks[i].transport == 'walking'){
				image_name = 'img/feet_small.jpg';
			}
			else if(tracks[i].transport == 'public_transport'){
				image_name = 'img/public_transport_small.jpg';
			}
			
			var result = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
			$("#history_tracklist").append("<tr class='clickableRow' id='" + i + "' href='#track_info' data-ajax='false'><td>" + (i + 1) + "&deg; route</td><td><img class='table_image' src='"+image_name+"'/></td><td>"+result+"</td><td>"+tracks[i].totalKM+" KM</td></tr>");
		}

		// Tell jQueryMobile to refresh the list
		//$("#history_tracklist").listview('refresh');
	}




$(".transport_images").click(function(event){
	$(".transport_images").each(function(i, obj) {
		$(this).removeClass('selected');
	});
	$(this).addClass('selected');
	$(".transport_images").each(function(i, obj) {
		if($(this).hasClass('selected')== true){
	
			if($(this).attr('id') ==  'walking'){
				$(this).attr("src","img/feet_black.jpg");
			}
			else if($(this).attr('id') == 'bike'){
				$(this).attr("src","img/bike_black.jpg");
			} 
			else if($(this).attr('id') == 'public_transport'){
				$(this).attr("src","img/public t_black.jpg");
			} 	
		}
		else{
			if($(this).attr('id') == 'walking'){
				$(this).attr("src","img/feet.jpg");
			}
			else if($(this).attr('id') == 'bike'){
				$(this).attr("src","img/bike.jpg");
			} 
			else if($(this).attr('id') == 'public_transport'){
				$(this).attr("src","img/public t.jpg");
			} 	
		
		}
		
	});
	
});
}


