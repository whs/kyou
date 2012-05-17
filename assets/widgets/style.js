widgets["style"] = Widget.extend({
	type: "style",
	name: "CSS",
	description: "Custom CSS",
	disable_config: ["*"],
	icon_large: "/assets/img/css.large.png",
	icon_small: "/assets/img/css.small.png",
	config: TemplConfigView.extend({
		template: "style"
	}),
	renderer: Backbone.View.extend({
		tagName: "style",
		initialize: function(){
			this.model.on("change:style", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.el.innerHTML = this.model.get("style") || "";
		}
	}),
});