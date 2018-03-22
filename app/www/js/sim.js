

$(document).ready( function(){ 
	var newWidth,
    mouth = $("#mouth");
	
	var teamid = window.localStorage.getItem("team_id");
	
	// INSTRUCTIONS	- only show when no team id is set
	if( !teamid ){
		$( "#team-number" ).focus(); // Set focus to team id field
		$( "#instructions-a" ).css("display", "block");
	}
	// Instructions-B
	$( "#team-number" ).focusout(function() {
		if ($( "#team-number" ).val()){
			$( "#instructions-a" ).css("display", "none");
			setTimeout(function() { // show second instructions after some time
				$( "#instructions-b" ).css("display", "block");
			}, 500);
		}
	});
	// Instructions close
	$( document ).click(function() {
		if($( "#instructions-b" ).css("display", "block")){
			$( "#instructions-b" ).css("display", "none");
		}
	});
	

	// TEAM NUMBER FIELD -->
	// If there is a team in local storage - set team-number-set
	if(window.localStorage.getItem("team_id")){
		$("#team-number-set").text(window.localStorage.getItem("team_id"));
		$( "#team-number" ).css("display", "none");
		$( "#team-number-set" ).css("display", "inline");
	}else{
		$( "#team-number" ).css("display", "inline");
		$( "#team-number-set" ).css("display", "none");
	}
	
	// Loose focus on team-number field on ENTER
	$(document).keypress(function(e) {
		if(e.which == 13 && $( "#team-number" ).is(":focus")) {
			$( "#team-number" ).blur();
		}
	});
	
	// When focus is lost - get Team value
	$( "#team-number" ).focusout(function() {
		// #team-number-set Gets team-number value
		$( "#team-number-set" ).text($( "#team-number" ).val());
		
		// If a value has been set - show team-number-set
		if($( "#team-number" ).val()){
			$( "#team-number" ).css("display", "none");
			$( "#team-number-set" ).css("display", "inline");
			window.localStorage.setItem("team_id", $( "#team-number" ).val());
			console.log(window.localStorage.getItem("team_id"));
		// Set the team-number to the one in storage
		}else if(window.localStorage.getItem("team_id")){
			$("#team-number-set").text(window.localStorage.getItem("team_id"));
			$( "#team-number" ).css("display", "none");
			$( "#team-number-set" ).css("display", "inline");
		}
	});
	
	// Team-number-set - on click -> focus on empty team-number field
	$("#team-number-set").on("click", function(){
		$( "#team-number" ).css("display", "inline");
		$( "#team-number-set" ).css("display", "none");
		$( "#team-number" ).val("");
		$("#team-number").attr("placeholder", "");
		$( "#team-number" ).focus();
	});

	$("#slider-0").on( "change", function() {
	  
	  	 currentValue = $("#slider-0").val();
	     if (currentValue > 3 ) {
	       
	       mouth.css({ bottom: 0, top: "auto" });
	       
	       newWidth = 160 - (currentValue*20);
	       
	       mouth.css({
	         width           : newWidth,
	         height          : newWidth,
	         "border-radius" : newWidth / 2,
	         left            : -25 + (((currentValue*20)-50) / 2)
	       })
	       .removeClass("straight");
	       
	     } else if (currentValue == 3) {
	       
	       mouth.addClass("straight");
	       
	     }  else {
	       
	       mouth.css({ top: 0, bottom: "auto" });
	       
	       newWidth = (currentValue*20) + 60;
	       
	       mouth.css({
	         width           : newWidth,
	         height          : newWidth,
	         "border-radius" : newWidth / 2,
	         left            : -(currentValue*20) / 2
	       })
	       .removeClass("straight");
	       
	     }
	});


});
		
