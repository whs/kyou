window['inKyou'] = true;

widgets["lyric"] = Widget.extend({
	type: "lyric",
	name: "Lyric",
	description: "Karaoke",
	disable_config: ["text-align", "padding"],
	config: TemplConfigView.extend({
		template: "lyric",
		list: null,
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			this.load_list();
		},
		load_list: function(){
			if(this.list){
				this.render_list();
			}
			$.getJSON("/projects/"+page.project.id+"/lyric.json", _.bind(function(x){
				this.list = x;
				this.render_list();
			}, this));
		},
		render_list: function(){
			this.$("select:first").empty();
			_.each(this.list, function(e){
				$("<option>").text(e.name).val(e.id).appendTo(this.$("select:first"));
			}, this);
			this.$("select:first").val(this.model.get("file"));
		},
		save: function(){
			this.model.set("name", this.$("select:first option:selected").text());
			return TemplConfigView.prototype.save.apply(this, arguments);
		}
	}),
	render_on_change: true,
	renderer: Backbone.View.extend({
		tagName: "div",
		initialize: function(){
			this.model.on("change:file change:template", function(){
				this.render();
			}, this);
			this.loadModel();
		},
		loadModel: function(opt){
			if(!this.model.has("file")){
				return false;
			}
			var viewToken = "";
			if(opt && opt['preview']){
				viewToken = "?token="+page.get("viewtoken");
			}
			var data = JSON.parse($.ajax({
				async: false, // as the export page can't wait.
				url: "/projects/" + page.project.id + "/lyric/" + this.model.get("file") + viewToken,
			}).responseText);
			this.config = new RyouItem(data);
			return this.config;
		},
		render: function(opt){
			if(!this.model.has("file")){
				this.el.innerHTML = "Lyric widget is not configured";
				return;
			}
			this.loadModel(opt);
			this.$el.empty();
			this.$el.attr("data-source", this.config.get("source"));
			this.$el.attr("data-theme", this.model.get("template"));
			var provider = this.config.provider();
			provider.render();
			provider.$el.addClass("ryou_target").appendTo(this.el);
			var list = $("<div>").addClass("ryou_list").appendTo(this.el);
			_.each(this.config.get("lyrics") || [], function(v){
				var line = $("<div>").addClass("ryou_line").attr("id", v.id).attr("data-time", v.time).html(v.text);
				line.appendTo(list);
			});
		},
		javascripts: function(){
			if(!this.config || !this.config.has("source")){
				return [];
			}
			var out = ["assets/jquery.js", "assets/jquery.scrollto.js", "assets/ryou_provider/_ryoup.js", "assets/ryou_provider/"+this.config.get('source')+".js"];
			out.push("$(function(){\nryoup_"+this.config.get("source")+"_init.apply($("+JSON.stringify("#"+this.model.id+" .ryou_target")+").get(0));\n});");
			return out;
		},
		stylesheets: function(){
			return ["files/ryou/" + this.model.get("template") + ".css"];
		},
	}),
});