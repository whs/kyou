layouts["standard"] = Layout.extend({
	type: "standard",
	name: "Standard",
	renderer: Layout.prototype.renderer.extend({
		javascripts: [
			"assets/jquery.js",
		],
		stylesheets: function(){
			var out = ["files/standard.css"];
			var config = this.get_data();
			if(config['config_standard']){
				config = config.config_standard;
				var extraCSS = "";
				if(config.fgcolor){
					extraCSS += "#container,.dark #container{background: "+config.fgcolor+";}\n";
				}
				if(config.transparentbg){
					extraCSS += "#container,.dark #container{background: transparent;}\n";
				}
				if(extraCSS.length > 0){
					out.push(extraCSS);
				}
			}
			return out;
		},
		resources: [
			"files/thaisans/",
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
		render: function(){
			TemplLayoutConfigView.prototype.render.apply(this, arguments);
			this.$(".cp").ColorPicker({
				onSubmit: function(hsb, hex, rgb, el){
					el.value = "#"+hex;
				}
			});
		},
	})
});