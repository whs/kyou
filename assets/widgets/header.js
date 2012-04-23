widgets["header"] = Widget.extend({
	type: "header",
	name: "Header",
	description: "Page header with column name and author's name",
	config: TemplConfigView.extend({
		template: "header"
	}),
	renderer: Backbone.View.extend({
		tagName: "header",
		initialize: function(){
			this.model.on("change:name change:author change:authorurl", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.$el.html("<h1></h1><h2></h2>");
			this.$("h1").html(this.model.get("name"));
			if(this.model.get("author")){
				this.$("h2").html("By <span>"+this.model.get("author")+"</span>");
				if(this.model.get("authorurl")){
					this.$("h2 span").wrap("<a href='"+this.model.get("authorurl")+"'></a>");
				}
			}else{
				this.$("h2").remove();
			}
		}
	}),
});