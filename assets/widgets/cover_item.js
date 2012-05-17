widgets["cover_item"] = Widget.extend({
	type: "cover_item",
	name: "Item",
	description: "Item in the front page",
	icon_large: "/assets/img/img.large.png",
	icon_small: "/assets/img/img.small.png",
	config: TemplConfigView.extend({
		template: "cover_item"
	}),
	disable_config: ["*"],
	check_depends: function(page){
		if(page.get("layout") == "cover"){
			return true;
		}
		return false;
	},
	renderer: Backbone.View.extend({
		tagName: "div",
		className: "box",
		initialize: function(){
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.el.innerHTML = '<a><img></a>';
			this.$("a").attr("href", this.model.get("href"));
			this.$("img").attr("src", this.model.get("src"));
			this.$el.removeClass("ads").removeClass("double");
			this.el.title = this.model.get("name");
			if(this.model.get("ads")){
				this.$el.addClass("ads");
				this.$el.addClass("double");
				this.$("a").attr("target", "_blank");
			}
			if(this.model.get("double")){
				this.$el.addClass("double");
			}
			page.renderer.el.parentNode.defaultView.resize && page.renderer.el.parentNode.defaultView.resize();
		}
	}),
});