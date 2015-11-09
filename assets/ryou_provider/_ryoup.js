/**
 * Ryou protocol
 */
window['ryoup_update'] = window['ryoup_update'] || function(time, playing){
	if(playing){
		$(this).parent().addClass("nowplaying");
	}else{
		$(this).parent().removeClass("nowplaying");
	}
	var currentEle = null;
	$(this).parent().find(".ryou_line").each(function(){
		if($(this).data("time") < time){
			currentEle = this;
		}else{
			return false;
		}
	});
	$(this).parent().find(".playing").removeClass("playing");
	if(currentEle){
		$(currentEle).addClass("playing");
		if(currentEle != this.lastEle){
			$(this).parent().find(".ryou_list").stop(true).scrollTo(currentEle, 250, { offset: -30 });
		}
		this.lastEle = currentEle;
	}
};


if(window['inRyou'] || window['inKyou']){
}else{
!(function(){
	var initTypeGame = function(){
		var styleEle = $("<style></style>").text(
			"#typoke{" +
			"background: black; position: fixed; top: 0; left: 0; width: 100%; height: 100%;" +
			"z-index: 100000" +
			"}" +
			"#typoke #help{" +
			"font-size: 32pt; font-family: HelveticaNeue-Light, helvetica;" + 
			"text-align: center; margin-top: 50px; color: #333" +
			"}" +
			"#typoke .line{" +
			"text-align: center; margin-top: 100px; font-family: helvetica; font-size: 32pt;" +
			"}" +
			"#typoke .line .done{" +
			"color: #ffff00;" +
			"}" +
			"#typoke .combo{" +
			"color: cornflowerblue; font-family: Tahoma; font-size: 40pt;" +
			"}" +
			"#typoke input{" +
			"position: absolute; top: -100px; left: -100px;" +
			"}" +
			"#typoke video,#typoke audio{" +
			"display: block;margin: auto;margin-top: 20px;" +
			"}"
		).appendTo("body");
		$("<div id='typoke'><div id='help'>Pause media to exit</div><input type='text'></div>").appendTo("body");
		var orig = $(".widget_lyric.nowplaying video,.widget_lyric.nowplaying audio").get(0)
		orig.pause();
		var el = $(".widget_lyric.nowplaying video,.widget_lyric.nowplaying audio").clone().appendTo("#typoke").get(0);
		$(el).on("loadeddata", function(){
			el.currentTime = orig.currentTime;
			el.play();
			$("#typoke video,#typoke audio").one("pause", function(){
				orig.currentTime = el.currentTime;
				$("#typoke").remove();
				orig.play();
				styleEle.remove();
				clearInterval(autoFocus);
			});
		});
		var autoFocus = setInterval(function(){
			$("#typoke input").get(0).focus();
		}, 100);
		document.getElementById("typoke").webkitRequestFullscreen();
		$("#typoke").on("webkitfullscreenchange", function(e){
			if(!document.webkitIsFullScreen){
				$("#typoke video,#typoke audio").get(0).pause();
			}
		});
		var combo = 0;
		$("#typoke video,#typoke audio").on("timeupdate", function(){
			ryoup_update.apply(orig, [el.currentTime, !el.paused]);
			var line = $(orig).parent().find(".playing");
			var lineData = line.find(".enline").length > 0 ? line.find(".enline").text() : line.text();
			lineData = lineData.toLowerCase().replace("ō", "o");
			if($("#typoke .line").text() != lineData){
				if($("#typoke .done").text().length != $("#typoke .line").text().length){
					$("<div class='combo'>").text("MISS").css({
						position: "fixed",
						top: $("#typoke .done").position().top - 50,
						left: $("#typoke .done").position().left + $("#typoke .done").width() - 20,
						color: "red"
					}).appendTo("#typoke").animate({
						top: "-=50",
						opacity: 0
					});
					combo = 0;
				}
				$("#typoke .line").remove();
				$("<div class='line'>").text(lineData).data("pos", 0).appendTo("#typoke");
			}
		});
		$("#typoke input").on("keyup", function(){
			var line = $("#typoke .line");
			var expected = line.text().substr(line.data("pos"), 1);
			var typed = $(this).val().substr(0, 1);
			$(this).val($(this).val().substr(1));
			console.log(typed, expected);
			if(typed == expected && line.data("pos") < line.text().length){
				var pos = line.data("pos") + 1;
				line.data("pos", pos);
				var text = line.text();
				line.html("<span class='done'>" + text.substr(0, pos) + "</span>" + text.substr(pos));
				combo++;
				$("#typoke .combo").remove();
				$("<div class='combo'>").text(combo).css({
					position: "fixed",
					top: $("#typoke .done").position().top - 50,
					left: $("#typoke .done").position().left + $("#typoke .done").width() - 20,
				}).appendTo("#typoke").animate({
					top: "-=50",
					opacity: 0
				});
			}else{
				//combo = 0;
			}
			if($(this).val().length > 0){
				$(this).trigger("keyup");
			}
			return false;
		});
	}

	var konami = "38384040373937396665";
	var konamiState = "";
	$(document).on("keydown", function(e){
		if($("#typoke").length > 0){return true;}
		if($(".widget_lyric.nowplaying video,.widget_lyric.nowplaying audio").length == 1){
			konamiState += e.which.toString();
			if(konamiState != konami.substr(0, konamiState.length)){
				konamiState = "";
			}else if(konamiState.length == konami.length){
				konamiState = "";
				initTypeGame();
			}else{
				e.preventDefault();
			}
		}
	});
})();
}