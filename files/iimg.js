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
	}).delegate(".hastxthover", mouseover, function(){
		$(this).next().fadeIn(100);
	}).delegate(".hastxthover", mouseout, function(){
		$(this).next().fadeOut(100);
	}).mouseover(function(){
		$(".help-point", this).css({webkitTransform: "translateY(300px)", transform: "translateY(300px)"});
	});
	$(".widget_iimg .iimg_main").each(function(){
		$(this).parents(".widget_iimg").css("width", $(this).width()).css("height", $(this).height());
	});
	$(".widget_iimg .iimg_main").load(function(){
		$(this).parents(".widget_iimg").css("width", $(this).width()).css("height", $(this).height());
	});
});