$(function(){
	var is_mobile = function(){
		return navigator.userAgent.match(/iPad|iPod|iPhone|Android/);
	}
	var mouseover = "mouseover";
	var mouseout = "mouseout";
	if(is_mobile()){
		mouseover = "touchstart";
		mouseout = "touchend";
	}
	$(".widget_iimg").delegate("[data-img]", mouseover, function(){
		var parent = $(this).parents(".widget_iimg");
		$("<div>").addClass("iimg_img").css({
			width: "100%",
			height: "100%",
			position: "absolute",
			top: 0,
			left: 0,
			"background-image": "url("+$(this).data("img")+")",
			"z-index": "500"
		}).appendTo(parent);
		$("#charbox img").remove();
	}).delegate("[data-img]", mouseout, function(){
		var parent = $(this).parents(".widget_iimg");
		parent.find(".iimg_img").remove();
	});
});