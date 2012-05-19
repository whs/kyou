widgets["iimg"] = Widget.extend({
	type: "iimg",
	name: "Interactive Image",
	description: "Image with hover points",
	disable_config: ["background-image", "background-repeat", "background-color", "padding-top", "padding-right", "padding-bottom", "padding-left"],
	config: TemplConfigView.extend({
		template: "iimg",
		events: function(){
			return _.extend({}, TemplConfigView.prototype.events,{
				"click #bi": "build",
			});
		},
	}),
	renderer: Backbone.View.extend({
		tagName: "div",
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