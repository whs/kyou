widgets["iimg"] = Widget.extend({
	type: "iimg",
	name: "Interactive Image",
	description: "Image with hover points",
	disable_config: ["background", "padding", "text", "size"],
	config: TemplConfigView.extend({
		template: "iimg",
		list: null,
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			this.load_list();
		},
		load_list: function(){
			if(this.list){
				this.render_list();
			}
			$.getJSON("/projects/"+page.project.id+"/iimg.json", _.bind(function(x){
				this.list = x;
				this.render_list();
			}, this));
		},
		render_list: function(){
			this.$("select").empty();
			_.each(this.list, function(e){
				$("<option>").text(e.file).val(e.file).appendTo(this.$("select"));
			}, this);
			this.$("select").val(this.model.get("image"));
		},
	}),
	render_on_change: true,
	renderer: Backbone.View.extend({
		tagName: "div",
		initialize: function(){
			this.model.on("change:image", function(){
				this.render();
			}, this);
		},
		render: function(opt){
			this.config = JSON.parse($.ajax({
				async: false, // as the export page can't wait.
				url: "/projects/" + page.project.id + "/iimg/" + this.model.get("image"),
			}).responseText);
			this.$el.empty();
			_.each(this.config.items || [], function(v){
				var el = $("<a>").attr("id", "iimg_"+v.id).appendTo(this.el);
				if(v.action == "bg" && v.bgimg){
					var d = $("<div>").insertAfter(el).addClass("bghover").attr("style", "background-image: url("+v.bgimg+")");
					// Somehow in-editor preview does not work without this
					if(!opt){
						setTimeout(_.bind(function(d, v){
							d.css({
								backgroundImage: "url("+v.bgimg+")"
							});
						}, d, d, v), 1);
					}
					el.addClass("hasbghover");
				}else if(v.action == "link" && v.link){
					el.attr("href", v.link);
				}else if(v.action == "txt" && v.text){
					$("<div>").addClass("txthover").css({
						top: v.txttop || 0,
						left: v.txtleft || 0,
						width: v.txtwidth || 150,
					}).html(v.text).insertAfter(el);
					el.addClass("hastxthover");
				}else if(v.action == "img" && v.image){
					$("<img>").addClass("imghover").attr("src", v.image).css({
						top: v.txttop || 0,
						left: v.txtleft || 0,
					}).insertAfter(el);
					el.addClass("hasimghover");
				}
				if(v.icon){
					el.css("background", "url("+v.icon+") center center no-repeat");
				}
				el.css({
					position: "absolute",
					top: v.top,
					left: v.left,
					width: v.width,
					height: v.height,
					display: "block",
					cursor: "pointer",
					zIndex: "1000",
				});
			}, this);
			if(this.model.get("help")){
				$("<img>").addClass("help-point").attr("src", "/files/help-point.png").appendTo(this.el);
			}
			$("<img>").addClass("iimg_main").attr("src", this.model.get("image")).appendTo(this.el);
		},
		javascripts: ["files/iimg.js"],
		stylesheets: ["files/iimg.css"],
		resources: ["files/help-point.png"]
	}),
});