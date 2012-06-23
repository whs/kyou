window['ryoup_file_init'] = function(){
	this.addEventListener("timeupdate", function(){
		ryoup_update.apply(this, [this.currentTime, !this.paused]);
	}, true);
}

if(window['inRyou']){
ryou_provider['file'] = RyouProvider.extend({
	tagName: "audio",
	render: function(){
		if(!this.model.get("file").match(/:\/\/|^\//)){
			this.el.src = "/bookfiles/" + this.model.project.id + "/" + this.model.get("file");
		}else{
			this.el.src = this.model.get("file");
		}
		this.el.controls = true;
		this.el.preload = true;
		this.el.setAttribute()
		ryoup_file_init.apply(this.el);
	},
});
}