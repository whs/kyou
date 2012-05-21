layouts["cover"] = Layout.extend({
	type: "cover",
	name: "Cover",
	check_depends: function(widget){
		if(widget.type.indexOf("cover_") == 0){
			return true;
		}
		return false;
	},
	renderer: Layout.prototype.renderer.extend({
		javascripts: [
			"assets/jquery.js",
			"files/jquery.backgroundpos.js",
			"files/cover.js",
		],
		stylesheets: [
			"http://fonts.googleapis.com/css?family=Antic",
			"files/standard.css"
		],
		resources: [
			"supermarket.ttf",
		],
		get_data: function(opt){
			var data = Layout.prototype.renderer.prototype.get_data.apply(this, arguments);
			data.config_cover = _.clone(data.config_cover);
			try{
				if(opt && opt.dist){
					_.each(data.config_cover.bg, function(v,k){
						data.config_cover.bg[k] = v.replace(/^\/bookfiles\/[^\/]+\//, "");
					});
				}
			}catch(e){}
			try{
				data.config_cover.bg = JSON.stringify(data.config_cover.bg);
			}catch(e){}
			return data;
		},
	}),
	config: TemplLayoutConfigView.extend({
		template: "layout_cover",
		events: function(){
			return _.extend({
				"click #pick_cover": "addbg",
				"click .widgetlist .btn": "delbg",
			}, TemplLayoutConfigView.prototype.events);
		},
		render: function(){
			TemplLayoutConfigView.prototype.render.apply(this, arguments);
			this.render_bglist();
			this.$(".widgetlist").sortable({
				containment: "parent",
				handle: ".grip",
				update: _.bind(function(){
					var bg = [];
					this.$(".widgetlist li .itemname").each(function(){
						bg.push(this.textContent);
					});
					var conf = this.model.page.get("config_cover");
					conf.bg = bg;
					this.model.page.set("config_cover", conf);
					this.model.page.trigger("change");
					this.render_playlist();
				}, this)
			}).disableSelection();
		},
		render_bglist: function(){
			var conf = this.model.page.get("config_cover");
			conf = conf ? conf.bg||[] : [];
			this.$(".widgetlist").empty();
			_.each(conf, _.bind(function(v){
				var item = $('<li><span class="ui-icon ui-icon-grip-solid-horizontal grip"></span><button class="btn" type="button"><span class="ui-icon ui-icon-trash"></span></button><span class="itemname"></span></li>');
				$(".itemname", item).text(v);
				item.appendTo(this.$(".widgetlist"));
			}, this));
			if(conf.length == 0){
				$("<li>No background</li>").appendTo(this.$(".widgetlist"));
			}
		},
		addbg: function(e){
			pick_file(_.bind(function(f){
				var conf = this.model.page.get("config_cover");
				bg = conf ? conf.bg||[] : [];
				bg.push(f);
				conf.bg = bg;
				this.model.page.set("config_cover", conf).trigger("change");
				this.render_bglist();
				this.model.page.renderer.render();
			}, this));
			return false;
		},
		delbg: function(e){
			var delWhat = $(e.target).parents("li").find(".itemname").text();
			var conf = this.model.page.get("config_cover");
			conf.bg = _.without(conf.bg, delWhat);
			this.model.page.set("config_cover", conf).trigger("change");
			this.render_bglist();
			this.model.page.renderer.render();
			return false;
		}
	})
});