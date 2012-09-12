widgets["gallery"] = Widget.extend({
	type: "gallery",
	name: "Gallery",
	description: "Image gallery",
	icon_large: "/assets/img/gallery.large.png",
	icon_small: "/assets/img/gallery.small.png",
	disable_config: ["background", "padding", "size"],
	config: TemplConfigView.extend({
		template: "gallery",
		events: function(){
			return _.extend({}, TemplConfigView.prototype.events,{
				"change select[name=display]": "displaychange",
				"click #pick_img": "addimg",
				"click .widgetlist .btn": "delimg",
			});
		},
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			this.displaychange();
			this.render_imglist();
			this.$(".widgetlist").sortable({
				containment: "parent",
				handle: ".grip",
				update: _.bind(function(){
					var img = {};
					this.$(".widgetlist li").each(function(){
						img.push(this.data("item"));
					});
					this.model.set("images", playlist).trigger("change");
					this.render_imglist();
				}, this)
			}).disableSelection();
		},
		displaychange: function(){
			this.$(".widgetconfig").hide();
			this.$(".widget_"+this.$("select[name=display]").val()).show();
		},
		render_imglist: function(){
			var images = this.model.get("images") || [];
			this.$(".widgetlist").empty();
			_.each(images, _.bind(function(v){
				var item = $('<li><span class="ui-icon ui-icon-grip-solid-horizontal grip"></span><button class="btn" type="button"><span class="ui-icon ui-icon-trash"></span></button><strong></strong></li>').data("item", v);
				$("strong", item).text(v.desc || v.img);
				item.appendTo(this.$(".widgetlist"));
			}, this));
			if(images.length == 0){
				$("<li>No images</li>").appendTo(this.$(".widgetlist"));
			}
		},
		addimg: function(e){
			pick_file(_.bind(function(f){
				var images = this.model.get("images") || [];
				images.push({"img": f, "desc": this.$("input[name=imgname]").val()});
				this.$("input[name=imgname]").val("");
				this.model.set("images", images).trigger("change");
				this.render_imglist();
			}, this));
			return false;
		},
		delimg: function(e){
			var delWhat = $(e.target).parents("li").data("item");
			var images = _.filter(this.model.get("images") || [], function(item){
				if(item == delWhat){
					return false;
				}else{
					return true;
				}
			});
			this.model.set("images", images).trigger("change");
			this.render_imglist();
			return false;
		}
	}),
	render_on_change: true,
	renderer: Backbone.View.extend({
		tagName: "div",
		render: function(opt){
			this.$el.removeClass("display_images").removeClass("hoverzoom");
			if(this.model.get("display") == "slider"){
				this.el.innerHTML = "<ul class='rs-slider'></ul>";
				_.each(this.model.get("images"), function(v){
					var el = $("<li><img></li>");
					el.find("img").attr("src", !opt ? "/bookfiles/" + page.project.id + "/" + v.img : v.img).attr("alt", v.desc);
					this.$(".rs-slider").append(el);
				}, this);

				if(this.model.get("width") || this.model.get("height")){
					var css = "#"+this.model.get("id")+"{\n"+this.generate_css({
						width: this.model.get("width")+"px",
						height: (this.model.get("height")-90)+"px",
					})+"\n}";
					$("<style></style>").text(css).prependTo(this.el);
				}
			}else if(this.model.get("display") == "images"){
				this.$el.addClass("display_" + this.model.get("display")).empty();
				if(this.model.get("hoverZoom")){
					this.$el.addClass("hoverzoom");
				}
				_.each(this.model.get("images"), function(v){
					var el = $("<div class='gallery_image'><img><div></div></div>");
					el.find("img").attr("src", v.img).attr("alt", v.desc);
					if(v.desc.length > 0){
						el.find("div").html(v.desc);
					}else{
						el.find("div").remove();
					}
					this.$el.append(el);
				}, this);
				$("<div style='clear:left;'></div>").appendTo(this.el);
				var css = ".widget_gallery.display_images .gallery_image{";
				css += this.generate_css({
					width: this.model.get("width"),
					height: this.model.get("height"),
					margin: this.model.get("margin"),
				});
				css += "}";
				$("<style scoped></style>").text(css).prependTo(this.el);
			}else{
				this.el.innerHTML = "Gallery widget is not configured.";
			}
		},
		generate_css: function(opt){
			var out = "";
			_.each(opt, function(v,k){
				if(!v || v == "px"){return;}
				if(parseInt(v) == v){v = v+"px";}
				out += k+": "+v+";\n";
			})
			return out;
		},
		stylesheets: function(opt){
			var files = {
				"slider": ["files/refineslide.css"],
				"images": ["files/gallery_images.css"]
			}
			var out = files[this.model.get("display")] || [];
			return out;
		},
		javascripts: function(opt){
			var files = {
				"slider": ["assets/jquery.js", "files/jquery.refineslide.min.js"],
				"images": []
			}
			var out = files[this.model.get("display")] || [];
			if(this.model.get("display") == "slider"){
				var config = {
					transition: this.model.get("effect"),
					controls: this.model.get("controls") ? "arrows" : null,
					autoPlay: this.model.get("pauseTime") <= 0 ? false: true,
					delay: parseInt(this.model.get("pauseTime")),
					transitionDuration: parseInt(this.model.get("animSpeed")),
				};
				config = JSON.stringify(config);
				out.push("$(function(){\n$('#"+this.model.get("id")+" .rs-slider').refineSlide("+config+");\n});");
			}
			return out;
		},
	}),
});