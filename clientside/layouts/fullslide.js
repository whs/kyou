layouts["fullslide"] = Layout.extend({
	type: "fullslide",
	name: "Full page slider",
	check_depends: function(widget){
		if(widget.type.indexOf("fullslide_") == 0 || widget.type == "style"){
			return true;
		}
		return false;
	},
	renderer: Layout.prototype.renderer.extend({
		javascripts: [
			"assets/jquery.js",
			"files/fullslide.js",
		],
		stylesheets: [
			"http://fonts.googleapis.com/css?family=Capriola",
			"files/fullslide.css"
		],
		render: function(opt){
			Layout.prototype.renderer.prototype.render.apply(this, arguments);
			setTimeout(_.bind(function(){
				this.$("#navpad").remove();
				$("<div id='navpad'>").appendTo(this.$(".widgetsInject"));
			}, this), 40);
		},
	}),
	//config: TemplLayoutConfigView.extend({
	//	template: "layout_standard",
	//})
});