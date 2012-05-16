widgets["box3d"] = Widget.extend({
	type: "box3d",
	name: "3D Box",
	description: "WebGL powered 3D box. Does not work on the iPad.",
	config: TemplConfigView.extend({
		template: "box3d",
		autocommit: false,
		save: function(){
			this.model.loading = 0;
			var chkLoad = _.bind(function(){
				if(this.model.loading == 2){
					this.model.trigger("change");
				}
			}, this);
			var frontEl = $("<img>").attr("src", this.$("input[name=front]").val()).css({
				"position": "absolute",
				"top": 0, "left": 0,
				"pointer-events": "none",
				"z-index": "-10000",
				"opacity": 0
			}).appendTo("body").load(_.bind(function(){
				this.model.set("x", frontEl.width());
				this.model.set("y", frontEl.height());
				this.model.loading++;
				chkLoad();
				frontEl.remove();
			}, this));
			var rearEl = $("<img>").attr("src", this.$("input[name=left]").val()).css({
				"position": "absolute",
				"top": 0, "left": 0,
				"pointer-events": "none",
				"z-index": "-10000",
				"opacity": 0
			}).appendTo("body").load(_.bind(function(){
				this.model.set("z", rearEl.width());
				this.model.loading++;
				chkLoad();
				rearEl.remove();
			}, this));
			return TemplConfigView.prototype.save.apply(this, arguments);
		}
	}),
	disable_config: ["color", "text-align"],
	render_on_change: true,
	renderer: Backbone.View.extend({
		tagName: "div",
		render: function(){
			this.el.style.width = "100%";
			this.el.style.height=  "400px";
		},
		javascripts: function(opt){
			var out = ["assets/three.js", "files/box3d.js"];
			var opt = {
				zoom: parseInt(this.model.get("zoom")) || 700,
				autorotate: !!this.model.get("autorotate"),
				rotable: !!this.model.get("rotable"),
				top: this.handleURL(this.model.get("top"), opt),
				down: this.handleURL(this.model.get("bottom"), opt),
				front: this.handleURL(this.model.get("front"), opt),
				back: this.handleURL(this.model.get("back"), opt),
				left: this.handleURL(this.model.get("left"), opt),
				right: this.handleURL(this.model.get("right"), opt),
				x: this.model.get("x") || 100,
				y: this.model.get("y") || 100,
				z: this.model.get("z") || 100,
			}
			out.push("$(function(){\nbox3d_draw($('#"+this.model.get("id")+"'), "+JSON.stringify(opt)+");\n});");
			return out;
		},
		handleURL: function(u, opt){
			if(!u){
				return "";
			}else if(!opt){
				return u;
			}else if(opt.dist){
				return u.replace(/^\/bookfiles\/[^\/]+\//, "");
			}
		},
		resources: function(){
			return ["files/help-3d.png"];
		}
	}),
});