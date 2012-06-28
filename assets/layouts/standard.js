layouts["standard"] = Layout.extend({
	type: "standard",
	name: "Standard",
	renderer: Layout.prototype.renderer.extend({
		javascripts: [
			"assets/jquery.js",
		],
		stylesheets: function(){
			var out = ["files/standard.css"];
			try{
				if(this.model.page.get("config_standard").transparentbg){
					out.push("#container,.dark #container{background: transparent;}\n");
				}
			}catch(e){}
			return out;
		},
		resources: [
			"files/bao.otf",
			"files/supermarket.ttf",
			"files/THSarabun.ttf",
			"files/THSarabunBold.ttf",
			"files/THSarabun.woff",
			"files/THSarabunBold.woff",
			"files/qleft.png",
			"files/qright.png"
		],
	}),
	config: TemplLayoutConfigView.extend({
		template: "layout_standard",
	})
});