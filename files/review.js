$(function(){
	$(".widget_review .tab:gt(0)").hide();
	$(".widget_review .tabbar a:eq(0)").addClass("selected");
	$(".widget_review .progress").each(function(){
		$(this).data("width", $(this).width());
	});
	$(".widget_review .tabbar").delegate("a", "click", function(){
		$(this).addClass("selected")
		$(".widget_review .tabbar .selected").removeClass("selected");
		$(".widget_review .tab").hide();
		var e=$($(this).attr("href"));
		e.show();
		$(".progress", e).css("width", 0).each(function(){
			$(this).animate({"width": $(this).data("width")}, (750/754) * $(this).data("width"));
		})
		return false;
	});
});