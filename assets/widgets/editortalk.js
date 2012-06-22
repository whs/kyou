widgets["editortalk"] = Widget.extend({
	type: "editortalk",
	name: "Editor talk",
	description: "Talks. Talks. Talks some more.",
	disable_config: ["float", "text-align"],
	config: TemplConfigView.extend({
		template: "editortalk"
	}),
	renderer: Backbone.View.extend({
		tagName: "div",
		initialize: function(){
			this.template = load_template("widgets", "editortalk");
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.el.innerHTML = this.template(this.model.toJSON());
		},
		stylesheets: ["files/editortalk.css"]
	}),
});