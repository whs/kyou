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
		var json = $(this).data("effect");
		if(json){
			json = json.replace(/'/g, '"');
		}
		var effectdata = JSON.parse(json||null), el=$(this).next();
		if(effectdata){
			if(effectdata.effect == "fade"){
				el.stop(true).fadeIn(effectdata.duration);
			}else if(effectdata.effect.match(/^slide/)){
				el.stop(true).css({
					top: effectdata.inittop,
					left: effectdata.initleft,
				}).show();
				if(effectdata.effect == "slidefade"){
					el.css("opacity", 0);
				}
				el.animate({
					top: effectdata.top,
					left: effectdata.left,
					opacity: 1
				}, effectdata.duration);
			}
		}else{
			el.stop(true).show();
		}
	}).delegate(".hastxthover, .hasbghover, .hasimghover", mouseout, function(){
		var json = $(this).data("effect");
		if(json){
			json = json.replace(/'/g, '"');
		}
		var effectdata = JSON.parse(json||null), el=$(this).next();
		if(effectdata){
			if(effectdata.effect == "fade"){
				el.stop(true).fadeOut(effectdata.duration);
			}else if(effectdata.effect.match(/^slide/)){
				el.stop(true);
				if(effectdata.effect == "slidefade"){
					el.animate({
						top: effectdata.inittop,
						left: effectdata.initleft,
						opacity: 0
					}, effectdata.duration);
				}else{
					el.hide();
				}
			}
		}else{
			el.hide();
		}
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