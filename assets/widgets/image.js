widgets["image"] = Widget.extend({
	type: "image",
	name: "Image",
	description: "Nice boat!",
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