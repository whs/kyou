widgets["fbcomments"] = Widget.extend({
	type: "fbcomments",
	name: "Comments",
	description: "Reader comments by Facebook",
	config: TemplConfigView.extend({
		template: "fbcomments",
	}),
	render_on_change: true,
	renderer: Backbone.View.extend({
		className: "fb-comments",
		render: function(){
			if(page.renderer.$("#fb-root").length == 0){
				page.renderer.$("body").append("<div id='fb-root'></div>");
			}
			this.$el.attr("data-href", this.model.get("href"))
				.attr("data-num-posts", this.model.get("num-posts"))
				.attr("data-colorscheme", this.model.get("colorscheme"))
				.attr("data-width", this.model.get("width"));
		},
		javascripts: function(){
			if(!this.model.has("appid")){
				return;
			}
			return ['(function(d, s, id){\nvar js, fjs = d.getElementsByTagName(s)[0];\nif (d.getElementById(id)) return;\njs = d.createElement(s); js.id = id;\njs.src = "https://connect.facebook.net/en_US/all.js#xfbml=1&appId='+this.model.get("appid")+'";\nfjs.parentNode.insertBefore(js, fjs);\n}(document, "script", "facebook-jssdk"));'];
		}
	}),
});