widgets["h1"] = Widget.extend({
	type: "h1",
	name: "H1",
	description: "HTML h1-h6",
	config: TemplConfigView.extend({
		template: "h1"
	}),
	renderer: Backbone.View.extend({
		tagName: "header",
		initialize: function(){
			this.model.on("change:size change:name", function(){
				this.render();
			}, this);
		},
		render: function(){
			var el = this.make(this.model.get("size") || "h1");
			$(this.el).replaceWith(el);
			this.setElement(el);
			this.el.innerHTML = this.model.get("name");
		}
	}),
});