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
	$(".widget_iimg").delegate(".hastxthover, .hasbghover, .hasimghover", mouseover, function(){
		$(this).next().fadeIn($(this).hasClass("hasbghover") ? 0 : 100);
	}).delegate(".hastxthover, .hasbghover, .hasimghover", mouseout, function(){
		$(this).next().fadeOut($(this).hasClass("hasbghover") ? 0 : 100);
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