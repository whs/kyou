widgets["iimg"] = Widget.extend({
	type: "iimg",
	name: "Interactive Image",
	description: "Image with hover points",
	disable_config: ["background-image", "background-repeat", "background-color", "padding-top", "padding-right", "padding-bottom", "padding-left", "text-align", "width", "height", "color"],
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
		render: function(){
			this.config = JSON.parse($.ajax({
				async: false, // as the export page can't wait.
				url: "/projects/" + page.project.id + "/iimg/" + this.model.get("image"),
			}).responseText);
			this.$el.empty();
			_.each(this.config.items || [], function(v){
				var el = $("<a>").attr("id", "iimg_"+v.id).appendTo(this.el);
				if(v.action == "bg" && v.bgimg){
					el.attr("data-img", v.bgimg);
				}
				if(v.action == "link" && v.link){
					el.attr("href", v.link);
				}
				if(v.action == "txt" && v.text){
					var txtel = $("<div>").addClass("txthover").css({
						top: v.txttop || 0,
						left: v.txtleft || 0,
						width: v.txtwidth || 150,
					}).html(v.text).insertAfter(el);
					el.addClass("hastxthover");
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