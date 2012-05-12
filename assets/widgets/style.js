widgets["style"] = Widget.extend({
	type: "style",
	name: "CSS",
	description: "Custom CSS",
	disable_config: ["*"],
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