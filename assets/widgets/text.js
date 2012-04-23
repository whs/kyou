widgets["text"] = Widget.extend({
	type: "text",
	name: "Text",
	description: "HTML text",
	config: TemplConfigView.extend({
		template: "text"
	}),
	renderer: Backbone.View.extend({
		tagName: "p",
		initialize: function(){
			this.model.on("change:content", function(){
				this.$el.html(this.model.get("content"));
			}, this);
		},
		render: function(){
			this.$el.html(this.model.get("content"));
		}
	}),
});