widgets["image"] = Widget.extend({
	type: "image",
	name: "Image",
	description: "Nice boat!",
	disable_config: ["background-image", "background-repeat", "color", "background-color", "padding-top", "padding-right", "padding-bottom", "padding-left"],
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