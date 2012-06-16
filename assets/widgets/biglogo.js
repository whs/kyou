widgets["biglogo"] = Widget.extend({
	type: "biglogo",
	name: "Full-page logo",
	description: "Large logo that is centered on a blank screen.",
	disable_config: ["color"],
	config: TemplConfigView.extend({
		template: "biglogo"
	}),
	render_on_change: true, // FIXME: There must be a better way
	renderer: Backbone.View.extend({
		tagName: "header",
		className: "biglogo",
		initialize: function(){
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(){
			if(this.model.has("img") || this.model.has("video")){
				this.el.innerHTML = "<div><div></div></div>";
				if(this.model.has("video")){
					$("<video>").attr("preload", "auto").appendTo(this.$("div div"));
					$("<source>").attr("src", this.model.get("video")).appendTo(this.$("video"));
					if(this.model.has("img")){
						$("<img>").attr("src", this.model.get("img")).appendTo(this.$("video"));
						this.$("video").attr("poster", this.model.get("img"));
					}
				}else{
					$("<img>").attr("src", this.model.get("img")).appendTo(this.$("div div"));
				}
				this.el.setAttribute("data-position", this.model.get("position"));
				this.el.setAttribute("data-transparent", this.model.get("transparent") ? "true" : "false");
				this.el.setAttribute("data-hasVideo", this.model.has("video") ? "true" : "false");
			}else{
				this.el.innerHTML = "Widget not configured";
			}
		},
		javascripts: ["assets/jquery.js", "files/biglogo.js"]
	}),
});