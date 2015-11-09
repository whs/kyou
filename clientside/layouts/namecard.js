layouts["namecard"] = Layout.extend({
	type: "namecard",
	name: "นามบัตร",
	renderer: Layout.prototype.renderer.extend({
		javascripts: [
			"assets/jquery.js",
		],
		stylesheets: [
			"files/namecard.css"
		],
		post_render: function(){
			for(var x=0; x<9; x++){
				this.$(".widgetsInject:eq(0)").clone().appendTo(this.$("body"));
			}
		}
	}),
});