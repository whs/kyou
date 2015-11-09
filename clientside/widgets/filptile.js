widgets["fliptile"] = Widget.extend({
	type: "fliptile",
	name: "Filp Tile",
	description: "Two images that switch when hover",
	disable_config: [""],
	config: TemplConfigView.extend({
		template: "fliptile",
		save: function(){
			var frontEl = $("<img>").attr("src", "/bookfiles/"+page.project.id+"/"+this.$("input[name=frontimg]").val()).css({
				"position": "absolute",
				"top": 0, "left": 0,
				"pointer-events": "none",
				"z-index": "-10000",
				"opacity": 0
			}).appendTo("body").load(_.bind(function(){
				this.model.set("width", frontEl.width());
				this.model.set("height", frontEl.height());
				this.model.trigger("change");
				frontEl.remove();
			}, this));
			return TemplConfigView.prototype.save.apply(this, arguments);
		}
	}),
	render_on_change: true, // CSS need to be recalculated
	renderer: Backbone.View.extend({
		tagName: "div",
		className: "flip-container",
		initialize: function(){
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.el.innerHTML = "<div class='flipper'><div class='front'></div><div class='back'></div></div>";
			$("<img>").attr("src", this.model.get("frontimg")).appendTo(this.$(".front"));
			$("<img>").attr("src", this.model.get("backimg")).appendTo(this.$(".back"));
		},
		stylesheets: function(){
			var out = ["files/flip.css"];
			var css = this.model.get("_css") || {};
			if(this.model.get("width") && !css.width && !css.height){
				out.push("#"+this.model.id+".flip-container, #"+this.model.id+" .front, #"+this.model.id+" .back{\nwidth: "+this.model.get("width")+"px; height: "+this.model.get("height")+"px;\n}");
			}else{
				out.push("#"+this.model.id+".flip-container, #"+this.model.id+" .front, #"+this.model.id+" .back{\nwidth: "+css.width+"px; height: "+css.height+"px;\n}");
			}
			return out;
		},
		javascripts: ["$(function(){\n$('body').delegate('.flip-container', 'ontouchstart', function(){this.classList.toggle('hover');})\n});"]
	}),
});