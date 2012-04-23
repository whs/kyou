(function( $ ){
	$.fn.serializeJSON=function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(n, i){
			json[n['name']] = n['value'];
		});
		return json;
	};
})(jQuery);

var Project = Backbone.Model.extend({
	urlRoot: "/projects/",
	initialize: function(){
		this.pages = new PageList;
		this.pages.project = this;
	},
	stage: function(){
		var stage = this.get("stage");
		var stagemap = {
			0: "Planning",
			1: "Working on",
			2: "QA",
			3: "Released"
		}
		return stagemap[stage];
	}
});

var ProjectList = Backbone.Collection.extend({
	model: Project,
	url: "/projects"
});

var Page = Backbone.Model.extend({
	project: null,
	widgets: null,
	initialize: function(){
		this.on("change:project", function(page, val){
			if(_.isObject(val)){
				page.project = new Project(val);
			}else if(val){
				page.project = new Project({id: val});
				page.project.fetch();
			}
			page.unset("project");
		}).trigger("change:project", this, this.get("project"), {});
		if(this.has("widgets") && _.size(widgets) > 0){
			this.widgets = new WidgetList(this.get("widgets"));
		}else{
			this.widgets = new WidgetList();
		}
		this.renderer = new this._renderer({
			model: this
		});
	},
	stage: function(){
		var stage = this.get("stage");
		var stagemap = {
			0: "Planning",
			1: "Waiting for content",
			2: "Working",
			3: "QA",
			4: "Done"
		}
		return stagemap[stage];
	},
	url: function(){
		return this.project.url() + "/pages/" + this.id;
	},
	toJSON: function(){
		var out = Backbone.Model.prototype.toJSON.call(this);
		out.widgets = this.widgets.toJSON();
		return out;
	},
	_renderer: Backbone.View.extend({
		render: function(){
			var layout = new layouts[this.model.get("layout")];
			var templ = Handlebars.compile($("#tmpl_layout_"+this.model.get("layout")).html());

			var javascripts = (_.isFunction(layout.javascripts) ? layout.javascripts() : layout.javascripts) || [];
			var stylesheets = (_.isFunction(layout.stylesheets) ? layout.stylesheets() : layout.stylesheets) || [];

			var tmplData = this.model.toJSON();
			tmplData.project = this.model.project.toJSON();
			this.el.innerHTML = templ(tmplData);
			// Render each widgets!
			this.model.widgets.each(function(widget){
				var renderer = new widget.renderer({
					model: widget
				});
				widget.view = renderer;
				renderer.render();
				renderer.$el.appendTo(this.$(".widgetsInject"));
				renderer.$el.attr("id", widget.get("id")).addClass("widget_"+widget.type);
				javascripts = _.union(javascripts, (_.isFunction(renderer.javascripts) ? renderer.javascripts() : renderer.javascripts) || []);
				stylesheets = _.union(stylesheets, (_.isFunction(renderer.stylesheets) ? renderer.stylesheets() : renderer.stylesheets) || []);
			}, this);
			// Somehow injecting this instantly breaks the iframe.
			setTimeout(_.bind(function(){
				_.each(stylesheets, function(v){
					if(v.indexOf("\n") != -1){
						$("<style>").html(v).appendTo(this.$("head"));
					}else{
						$("<link rel='stylesheet'>").attr('href', "/"+v).appendTo(this.$("head"));
					}
				}, this);
			}, this), 10);
			_.each(javascripts, function(v){
				// Fuck jQuery. Injecting <script> does not work. Hardcore time!
				var ele = document.createElement("script");
				ele.type = "text/javascript";
				if(v.indexOf("\n") != -1){
					ele.innerHTML = v;
				}else{
					ele.src = "/" + v;
				}
				this.$("body").get(0).appendChild(ele);
			}, this);
			this.model.trigger("render");
		}
	})
});

var PageList = Backbone.Collection.extend({
	model: Page,
	project: null,
	url: function(){
		return this.project.url() + "/pages"
	}
});

var Widget = Backbone.Model.extend({
	name: "New widget",
	type: "widget",
	description: "Please set description!",
	// 16x16 transparent
	icon_small: "/assets/img/unknown.small.png",
	// 64x64
	icon_large: "/assets/img/unknown.large.png",
	weight: 0,
	check_depends: function(page){
		return true;
	},
	toJSON: function(){
		var out = Backbone.Model.prototype.toJSON.call(this);
		out.type = this.type;
		return out;
	},
	config: Backbone.View.extend({
		render: function(){
			this.$el.html("<div class='alert alert-info'>This widget does not have configurable options.</div>");
		}
	}),
	renderer: Backbone.View.extend({
		render: function(){
			this.$el.html("<div class='alert alert-info'>Widget does not define renderer!</div>");
		}
	}),
});

var WidgetList = Backbone.Collection.extend({
	model: Widget,
	add: function(model, option){
		if(_.isArray(model)){
			_.each(model, function(v,k){
				model[k] = new widgets[v.type](v);
				model[k].weight = k * 100;
			});
			return Backbone.Collection.prototype.add.call(this, model, option);
		}else if(!model['on']){
			return Backbone.Collection.prototype.add.call(this, new widgets[model.type](model), option);
		}else{
			return Backbone.Collection.prototype.add.call(this, model, option);
		}
	},
	comparator: function(a, b){
		if((a.weight||0) < (b.weight||0)){
			return -1;
		}else if((a.weight||0) > (b.weight||0)){
			return 1;
		}else{
			return 0;
		}
	}
});

var Layout = Backbone.Model.extend({
	name: "base",
	type: "base",
	// 16x16 transparent
	icon_small: "/assets/img/unknown.small.png",
	// 64x64
	icon_large: "/assets/img/unknown.large.png",
	javascripts: [],
	stylesheets: []
});

var TemplConfigView = Backbone.View.extend({
	template: "",
	events: {
		"submit form": "save",
	},
	initialize: function(){
		this.template = Handlebars.compile($("#tmpl_config_"+this.template).html());
	},
	render: function(){
		var modelData = this.model.toJSON();
		this.el.innerHTML = this.template(modelData);
		_.each(modelData, function(v,k){
			this.$("[name="+k+"]").val(v);
		}, this);
	},
	save: function(e){
		_.each($(e.target).serializeJSON(), function(v,k){
			this.model.set(k, v);
		}, this);
		this.$("input[type=submit]").val("Saved").attr("disabled", true);
		setTimeout(function(){
			this.$("input[type=submit]").val("Save").attr("disabled", false);
		}, 500);
		return false;
	}
});

var widgets = {}, layouts = {};

if(!window['localStorage']){
	alert("Browser is not supported!");
}