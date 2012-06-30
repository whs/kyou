window['ryoup_file_init'] = function(){
	this.addEventListener("timeupdate", function(){
		ryoup_update.apply(this, [this.currentTime, !this.paused]);
	}, false);
}

if(window['inRyou'] || window['inKyou']){
ryou_provider['file'] = RyouProvider.extend({
	tagName: "audio",
	render: function(){
		if(!this.model.get("file").match(/:\/\/|^\//) && !window['inKyou']){
			this.el.src = "/bookfiles/" + this.model.project.id + "/" + this.model.get("file");
		}else{
			this.el.src = this.model.get("file");
		}
		this.el.controls = true;
		this.el.preload = true;
	},
});
}