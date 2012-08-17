widgets["biglogo"] = Widget.extend({
	type: "biglogo",
	name: "Full-page logo",
	description: "Large logo that is centered on a blank screen.",
	disable_config: ["text", "float", "size"],
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
			if(this.model.get("video")){
				$("<video>").attr("preload", "auto").appendTo(this.el);
				$("<source>").attr("src", this.model.get("video")).appendTo(this.$("video"));
				if(this.model.get("img")){
					$("<img>").attr("src", this.model.get("img")).appendTo(this.$("video"));
					this.$("video").attr("poster", this.model.get("img"));
				}
				this.el.setAttribute("data-transparent", this.model.get("transparent") ? "true" : "false");
			}else if(this.model.get("img") || this.model.get("video")){
				this.el.innerHTML = "<div><div></div></div>";
				$("<img>").attr("src", this.model.get("img")).appendTo(this.$("div div"));
				this.el.setAttribute("data-position", this.model.get("position"));
				this.el.setAttribute("data-transparent", this.model.get("transparent") ? "true" : "false");
			}else{
				this.el.innerHTML = "Widget not configured";
			}
		},
		javascripts: ["assets/jquery.js", "files/biglogo.js"]
	}),
});