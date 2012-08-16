!(function(){
var firstTime = true;
function render_cover(){
	if($(".coverbg").length > 0){
		setTimeout(function(){
			$(".coverbg:first").remove();
		}, 1500);
	}
	if(coverImg.length == 1){
		$("<img src='' class='coverbg' />").attr({
			"src": coverImg[0],
		}).appendTo("#covercontain");
		return;
	}
	var curImg = coverImg.shift();
	coverImg.push(curImg);
	var eff = {
		"opacity": $(".coverbg").length > 0 ? 0 : 1
	};
	if($("body").hasClass("cover_pan")){
		eff.top = "-35%";
	}
	var coverbg=$("<img src='' class='coverbg' />").attr({
		"src": curImg,
	}).css(eff).appendTo("#covercontain");
	setTimeout(function(){
		var eff = {
			"opacity": 1
		};
		if($("body").hasClass("cover_pan")){
			eff["-webkit-transform"] = "translateY(20%)";
		}
		coverbg.css(eff);
	}, 1, coverbg)
	setTimeout(render_cover, $("body").hasClass("cover_pan") ? 8500 : (firstTime ? 1500:7000));
	firstTime = false;
}
function resize(){
	$(".col:first .box").css("width", $(window).width() * 0.20)
		.css("height", Math.min(parseInt($(".box:not(.double):not(.featured)").width()) * 0.8, (window.innerHeight-100)/3));
	$(".col:first .box.double").css("width", $(window).width() * 0.40)
	$(".ads.box").css("height", ($(".ads.box").width() / 400) * 100);
	$("#coverbg").css("height", (($(window).width()*1.2/1280)*1024)+"px");
}
$(function(){
	$(window).resize(resize);
	resize();
	var poller = setInterval(function(){
		if(window.coverImg){
			render_cover();
			clearInterval(poller);
		}
	}, 10);
});
})();