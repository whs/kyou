widgets["javascript"] = Widget.extend({
	type: "javascript",
	name: "JavaScript",
	description: "For advanced user: manually enter JavaScript code",
	disable_config: ["*"],
	config: TemplConfigView.extend({
		template: "javascript"
	}),
	render_on_change: true,
	renderer: Backbone.View.extend({
		render: function(){
			this.$el.remove();
			return false;
		},
		javascripts: function(){
			return ["assets/jquery.js", this.model.get("javascript") || ""];
		}
	}),
});