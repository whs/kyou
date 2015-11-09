$(function(){
$("body").keydown(function(e){
	if(e.which >= 37 && e.which <= 40){
		var curSlide;
		$(".widget_fullslide_slide").each(function(){
			if($(this).position().top <= $(window).scrollTop()){
				curSlide = this;
			}
		});
		if(e.which == 37 || e.which == 38){
			var prev = $(curSlide).prevAll(".widget_fullslide_slide");
			if(prev.length > 0){
				$("body").animate({scrollTop: prev.position().top}, 250);
			}
		}else if(e.which == 39 || e.which == 40){
			var next = $(curSlide).nextAll(".widget_fullslide_slide");
			if(next.length > 0){
				$("body").animate({scrollTop: next.position().top}, 250);
			}
		}
		return false;
	}
});
setTimeout(function(){
	if($("#navbar").length > 0){
		$("#navpad").replaceWith($("#navbar"));
	}
}, 10);
});