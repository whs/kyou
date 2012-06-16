$(function(){
	$(".biglogo img").load(function(){
		$(window).resize();
	});
	$(".biglogo").css({
		height: $(window).height(),
		display: "table",
		width: "100%"
	});
	$(".biglogo img").css({
		maxWidth: "100%",
		maxHeight: "100%"
	});
	$(".biglogo video").css({
		width: "100%",
		height: "100%"
	});
	$(window).resize(function(){
		$(".biglogo").each(function(){
			var position = $(this).data("position") || "mc";
			if($(this).data("transparent")){
				$(this).insertBefore("#container");
			}
			$(".biglogo div:first").css({
				display: "table-row",
			});
			$(".biglogo div:last").css({
				display: "table-cell",
				verticalAlign: position[0] == "t" ? "top" : (position[0] == "m" ? "middle" : "bottom"),
				textAlign: position[1] == "l" ? "left" : (position[1] == "c" ? "center" : "right")
			});
		});
	}).resize();
	$(".biglogo video").bind("canplaythrough", function(){
		$(this).addClass("readyload");
		if(isFocus){
			$(this).addClass("playstarted");
			$(this).get(0).play();
		}
	});
	var isFocus = true;
	$(window).blur(function(){
		isFocus = false;
		$(".biglogo video").attr("autoplay", false);
	});
	$(window).focus(function(){
		isFocus = true;
		$(".biglogo video").attr("autoplay", true);
		$(".biglogo video.readyload:not(.playstarted)").addClass("playstarted").each(function(){
			this.play();
		});
		// hard scan
		$(".biglogo video:not(.readyload)").each(function(){
			if(this.readyState == 4){
				this.play();
				$(this).addClass("readyload playstarted");
			}
		});
	});
});