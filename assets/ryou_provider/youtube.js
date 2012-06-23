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
				}else{
					ryoup_update.apply(self, [self.youtube.getCurrentTime(), false]);
					clearInterval(this.poller);
				}
			}
		}
	});
}

if(window['inRyou']){
ryou_provider['youtube'] = RyouProvider.extend({
	tagName: "iframe",
	render: function(){
		this.$el.attr({
			src: "http://www.youtube.com/embed/" + this.model.get("youtubeid") + "?rel=0&amp;enablejsapi=1&amp;modestbranding=1",
			frameborder: "0",
			allowfullscreen: true,
			width: 400,
			height: 225
		});
		ryoup_youtube_init.apply(this.el);
	},
});
}