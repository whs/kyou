!(function(){
var firstTime = true;
function render_cover(){
	if($(".coverbg").length > 0){
		setTimeout(function(){
			$(".coverbg:first").remove();
		}, 1500);
	}
	if(coverImg.length == 1){
		if(coverImg[0].match(/\.(mp4|webm|ogg)$/)){
			$("<video class='coverbg' autoplay muted loop />").attr({
				"src": coverImg[0],
			}).appendTo("#covercontain").get(0).play();
		}else{
			$("<img class='coverbg'>").attr({
				"src": coverImg[0],
			}).appendTo("#covercontain");
		}
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
	var coverbg=$("<img src='' class='coverbg'>").attr({
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
	var video = $("video.coverbg").get(0);
	if(video && video.videoWidth > 0){
		var maxSize = Math.max.apply(null, [window.innerWidth/video.videoWidth, window.innerHeight/video.videoHeight]);
		if(maxSize == window.innerWidth/video.videoWidth){
			$("video.coverbg").css("width", window.innerWidth);
			$("video.coverbg").css("height", (window.innerWidth/video.videoWidth) * video.videoHeight);
		}else{
			$("video.coverbg").css("height", window.innerHeight);
			$("video.coverbg").css("width", (window.innerHeight/video.videoHeight) * video.videoWidth);
		}
		// center video
		var shift = (window.innerWidth/2) - ($("video.coverbg").width()/2);
		$("video.coverbg").css("left", shift);
		var shift = (window.innerHeight/2) - ($("video.coverbg").height()/2);
		$("video.coverbg").css("top", shift);
	}
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