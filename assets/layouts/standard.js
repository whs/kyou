layouts["standard"] = Layout.extend({
	type: "standard",
	name: "Standard",
	javascripts: function(){
		return [
			"assets/jquery.js",
		];
	},
	stylesheets: function(){
		return [
			"files/style.css"
		];
	}
});