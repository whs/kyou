$(function(){
	$(".biglogo img").load(function(){
		$(window).resize();
	});
	$(window).resize(function(){
		$(".biglogo").css({
			height: $(window).height(),
			display: "table",
			width: "100%"
		});
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
});