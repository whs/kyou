layouts["standard"] = Layout.extend({
	type: "standard",
	name: "Standard",
	renderer: Layout.prototype.renderer.extend({
		javascripts: function(){
			return [
				"assets/jquery.js",
			];
		},
		stylesheets: function(){
			return [
				"files/standard.css"
			];
		}
	}),
});