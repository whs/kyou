window['ryoup_video_init'] = function(){
	this.addEventListener("timeupdate", function(){
		ryoup_update.apply(this, [this.currentTime, !this.paused]);
	}, false);
}

if(window['inRyou'] || window['inKyou']){
ryou_provider['video'] = RyouProvider.extend({
	tagName: "video",
	render: function(){
		if(!this.model.get("video").match(/:\/\/|^\//) && !window['inKyou']){
			this.el.src = "/bookfiles/" + this.model.project.id + "/" + this.model.get("video");
		}else{
			this.el.src = this.model.get("video");
		}
		this.el.width = 300;
		this.el.height = 169;
		this.el.controls = true;
		this.el.preload = true;
	},
	seek: function(time){
		this.el.currentTime = time;
		ryoup_update.apply(this.el, [this.el.currentTime, !this.el.paused]);
	},
	stop: function(){
		this.el.paused ? this.el.play() : this.el.pause();
	}
});
}