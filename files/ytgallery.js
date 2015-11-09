$(function(){
	$(".ytlist").delegate(".ytimg a", "click", function(){
		var vidname = $("img", this).attr("src").match(/^https:\/\/img.youtube.com\/vi\/([^\/]+)\//);
		var config = JSON.parse(decodeURI($(this).parents(".ytimg").data("config")));
		$("iframe", $(this).parents(".ytlist")).attr("src", "https://www.youtube.com/embed/"+vidname[1]+"?"+$.param(config));
		$(".active", $(this).parent()).removeClass("active");
		$(this).addClass("active");
		return false;
	});
});