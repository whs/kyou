layouts["standard"] = Layout.extend({
	type: "standard",
	name: "Standard",
	renderer: Layout.prototype.renderer.extend({
		javascripts: [
			"assets/jquery.js",
		],
		stylesheets: [
			"files/standard.css"
		],
		resources: [
			"bao.otf",
			"supermarket.ttf",
			"qleft.png",
			"qright.png"
		]
	}),
});