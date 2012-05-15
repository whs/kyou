widgets["text"] = Widget.extend({
	type: "text",
	name: "Text",
	description: "HTML text",
	icon_large: "/assets/img/html.large.png",
	icon_small: "/assets/img/html.small.png",
	config: TemplConfigView.extend({
		template: "text",
		events: function(){
			return _.extend({}, TemplConfigView.prototype.events,{
				"click #linkbtn": "linkpage",
				"click #filebtn": "filepage",
				"click #imgbtn": "imgpage",
			});
		},
		linkpage: function(){
			pick_page(_.bind(function(v, name){
				this.$("textarea").insertAtCaret("<a href='/"+v+".html'>"+name+"</a>");
			}, this));
			return false;
		},
		filepage: function(){
			pick_file(_.bind(function(f){
				this.$("textarea").insertAtCaret("<a href=\""+f+"\">"+f.match(/\/([^\/]+)$/)[1]+"</a>");
			}, this));
			return false;
		},
		imgpage: function(){
			pick_file(_.bind(function(f){
				this.$("textarea").insertAtCaret("<img src=\""+f+"\">");
			}, this));
			return false;
		},
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