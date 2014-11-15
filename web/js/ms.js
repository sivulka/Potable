//MS.JS
$(document).ready(function(){
	$(".ms-expander").hover(function(){
        /*
		$("#ms-btn-red").css("background-color","#dc400b");
		$("#ms-btn-green").css("background-color","#67b40d");
		$("#ms-btn-blue").css("background-color","#0187ba");
		$("#ms-btn-yellow").css("background-color","#d8a002");
		
		$("#ms-btn-green").css("opacity", "0");
		//$(".ms-link").css("padding-top", "100px");
		$(".ms-btn-container").addClass("rotateArrow");				
        */
        $("#ms-btn-green").css("opacity", "0");
	},function(){
        /*
		$("#ms-btn-red").css("background-color","#f1511b");
		$("#ms-btn-green").css("background-color","#80cc28");
		$("#ms-btn-blue").css("background-color","#00adef");
		$("#ms-btn-yellow").css("background-color","#fbbc09");
		
		$("#ms-btn-green").css("opacity", "1");
		//$(".ms-link").css("padding-top", "0px");
		$(".ms-btn-container").removeClass("rotateArrow");
        */
        $("#ms-btn-green").css("opacity", "0.2");
	});
});