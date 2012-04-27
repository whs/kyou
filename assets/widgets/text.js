widgets["text"] = Widget.extend({
	type: "text",
	name: "Text",
	description: "HTML text",
	config: TemplConfigView.extend({
		template: "text",
		events: function(){
			return _.extend({}, TemplConfigView.prototype.events,{
				"click #linkbtn": "linkpage"
			});
		},
		linkpage: function(){
			pick_page(_.bind(function(v, name){
				this.$("textarea").insertAtCaret("<a href='/"+v+".html'>"+name+"</a>");
			}, this));
			return false;
		}
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