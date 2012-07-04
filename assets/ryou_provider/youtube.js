$("<script>").attr("src", "http://www.youtube.com/player_api").appendTo("body");

window['ryoup_youtube_init'] = function(){
	var self = this;
	if(!window['YT'] || !window.YT['Player']){
		setTimeout(function(){
			window.ryoup_youtube_init.apply(self, arguments);
		}, 10);
		return false;
	}
	this.setAttribute("id", new Date().getTime().toString(36));
	this.youtube = new YT.Player(this.id, {
		events: {
			onStateChange: function(e){
				if(e.data == 1){
					this.poller = setInterval(function(){
						ryoup_update.apply(self, [self.youtube.getCurrentTime(), true]);
					}, 10);
				}else if(self.youtube.getCurrentTime){
					ryoup_update.apply(self, [self.youtube.getCurrentTime(), false]);
					clearInterval(this.poller);
				}
			}
		}
	});
}

if(window['inRyou'] || window['inKyou']){
ryou_provider['youtube'] = RyouProvider.extend({
	tagName: "iframe",
	render: function(){
		this.$el.attr({
			src: "http://www.youtube.com/embed/" + this.model.get("youtubeid") + "?rel=0&amp;enablejsapi=1&amp;modestbranding=1",
			frameborder: "0",
			allowfullscreen: true,
			width: 300,
			height: 169
		});
	},
	seek: function(time){
		if(!this.el.youtube){
			return false;
		}
		this.el.youtube.seekTo(time, true);
		ryoup_update.apply(this.el, [this.el.youtube.getCurrentTime(), this.el.youtube.getPlayerState() == 1]);
	},
	stop: function(){
		if(!this.el.youtube){
			return false;
		}
		this.el.youtube.getPlayerState() == 1 ? this.el.youtube.pauseVideo() : this.el.youtube.playVideo();
	}
});
}