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
			this.el.innerHTML = '<a></a>';
			this.$("a").attr("href", this.model.get("href"));
			if(this.model.get("video")){
				$("<video loop>").attr("src", this.model.get("video")).attr("poster", this.model.get("src")).appendTo(this.$("a"));
				if(this.model.get("src")){
					this.$("video").attr("preload", true);
					this.$el.addClass("hasPoster");
				}else{
					this.$("video").attr("autoplay", true).attr("muted", true);
					this.$el.removeClass("hasPoster");
				}
				this.$el.addClass("hasVideo");
			}else{
				$("<img>").attr("src", this.model.get("src")).appendTo(this.$("a"));
				this.$el.removeClass("hasVideo").removeClass("hasPoster");
			}
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