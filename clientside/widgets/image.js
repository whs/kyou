widgets["image"] = Widget.extend({
	type: "image",
	name: "Image",
	description: "Nice boat!",
	disable_config: ["background", "text", "padding"],
	icon_large: "/assets/img/img.large.png",
	icon_small: "/assets/img/img.small.png",
	config: TemplConfigView.extend({
		template: "image"
	}),
	renderer: Backbone.View.extend({
		tagName: "img",
		initialize: function(){
			this.model.on("change:img", function(){
				this.render();
			}, this);
		},
		render: function(){
			if(this.el){
				this.el.src = this.model.get("img");
			}
		}
	}),
});