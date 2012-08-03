widgets["video"] = Widget.extend({
	type: "video",
	name: "Video",
	description: "HTML5 video. H.264 recommended.",
	disable_config: ["background", "text", "padding"],
	config: TemplConfigView.extend({
		template: "video"
	}),
	renderer: Backbone.View.extend({
		tagName: "video",
		initialize: function(){
			this.model.on("change:video", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.el.src = this.model.get("video");
			this.el.autoplay = !!this.model.get("autoplay");
			this.el.preload = "metadata";
			this.el.controls = !!this.model.get("controls");
			this.el.muted = !!this.model.get("muted");
			this.el.loop = !!this.model.get("loop");
		}
	}),
});