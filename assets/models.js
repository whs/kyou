(function( $ ){
	$.fn.serializeJSON=function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(n, i){
			json[n['name']] = n['value'];
		});
		return json;
	};
})(jQuery);
jQuery.fn.extend({
	insertAtCaret: function(myValue){
	  return this.each(function(i) {
	    if (document.selection) {
	      //For browsers like Internet Explorer
	      this.focus();
	      sel = document.selection.createRange();
	      sel.text = myValue;
	      this.focus();
	    }
	    else if (this.selectionStart || this.selectionStart == '0') {
	      //For browsers like Firefox and Webkit based
	      var startPos = this.selectionStart;
	      var endPos = this.selectionEnd;
	      var scrollTop = this.scrollTop;
	      this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
	      this.focus();
	      this.selectionStart = startPos + myValue.length;
	      this.selectionEnd = startPos + myValue.length;
	      this.scrollTop = scrollTop;
	    } else {
	      this.value += myValue;
	      this.focus();
	    }
	  })
	}
});

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
		this.loadWidgets();
		this.renderer = new this._renderer({
			model: this
		});
	},
	loadWidgets: function(){
		if(this.has("widgets") && _.size(this.get("widgets")) > 0){
			this.widgets = new WidgetList(this.get("widgets"));
		}else{
			this.widgets = new WidgetList();
		}
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
		return this.project.url() + "/pages/" + (this.id||"");
	},
	toJSON: function(){
		var out = Backbone.Model.prototype.toJSON.call(this);
		out.widgets = this.widgets.toJSON();
		return out;
	},
	_renderer: Backbone.View.extend({
		rendering: false,
		events: {
			"click a": "stopClick",
			"submit form": "stopClick",
		},
		render: function(opt){
			this.rendering = true;
			var layout = new layouts[this.model.get("layout")];
			var templ = Handlebars.compile($("#tmpl_layout_"+this.model.get("layout")).html());

			var javascripts = (_.isFunction(layout.javascripts) ? layout.javascripts() : layout.javascripts) || [];
			var stylesheets = (_.isFunction(layout.stylesheets) ? layout.stylesheets() : layout.stylesheets) || [];

			var tmplData = this.model.toJSON();
			tmplData.project = this.model.project.toJSON();
			this.el.innerHTML = templ(tmplData);
			var target = this.$(".widgetsInject").get(0);
			// Render each widgets!
			this.model.widgets.each(function(widget){
				var renderer = new widget.renderer({
					model: widget
				});
				widget.view = renderer;
				renderer.render(opt);
				target.appendChild(renderer.$el.get(0));
				renderer.$el.attr("id", widget.get("id")).addClass("widget_"+widget.type);
				format_view(widget);
				javascripts = _.union(javascripts, (_.isFunction(renderer.javascripts) ? renderer.javascripts(opt) : renderer.javascripts) || []);
				stylesheets = _.union(stylesheets, (_.isFunction(renderer.stylesheets) ? renderer.stylesheets(opt) : renderer.stylesheets) || []);
			}, this);
			// Somehow injecting this instantly breaks the iframe.
			setTimeout(_.bind(function(){
				_.each(stylesheets, function(v){
					if(v.indexOf("\n") != -1){
						$("<style>").html(v).appendTo(this.$("head"));
					}else{
						$("<link rel='stylesheet'>").attr('href', (v.indexOf("http") == 0 ? "" : "/")+v).appendTo(this.$("head"));
					}
				}, this);
				setTimeout(_.bind(function(){
					this.rendering = false;
				}, this), 50);
			}, this), 10);
			_.each(javascripts, function(v){
				// Fuck jQuery. Injecting <script> does not work. Hardcore time!
				var ele = document.createElement("script");
				ele.type = "text/javascript";
				if(v.indexOf("\n") != -1){
					ele.innerHTML = v;
				}else{
					ele.src = (v.indexOf("http") == 0 ? "" : "/") + v;
				}
				this.$("body").get(0).appendChild(ele);
			}, this);
			this.model.trigger("render");
		},
		stylesheets: function(opt){
			var layout = new layouts[this.model.get("layout")];
			var stylesheets = (_.isFunction(layout.stylesheets) ? layout.stylesheets(opt) : layout.stylesheets) || [];
			this.model.widgets.each(function(widget){
				var renderer = new widget.renderer({
					model: widget
				});
				stylesheets = _.union(stylesheets, (_.isFunction(renderer.stylesheets) ? renderer.stylesheets(opt) : renderer.stylesheets) || []);
			}, this);
			return stylesheets;
		},
		javascripts: function(opt){
			var layout = new layouts[this.model.get("layout")];
			var javascripts = (_.isFunction(layout.javascripts) ? layout.javascripts(opt) : layout.javascripts) || [];
			this.model.widgets.each(function(widget){
				var renderer = new widget.renderer({
					model: widget
				});
				javascripts = _.union(javascripts, (_.isFunction(renderer.javascripts) ? renderer.javascripts(opt) : renderer.javascripts) || []);
			}, this);
			return javascripts;
		},
		resources: function(opt){
			var layout = new layouts[this.model.get("layout")];
			var resources = (_.isFunction(layout.resources) ? layout.resources(opt) : layout.resources) || [];
			this.model.widgets.each(function(widget){
				var renderer = new widget.renderer({
					model: widget
				});
				resources = _.union(resources, (_.isFunction(renderer.resources) ? renderer.resources(opt) : renderer.resources) || []);
			}, this);
			return resources;
		},
		stopClick: function(e){
			e.preventDefault();
			alert("Link disabled in document preview");
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
	disable_config: [],
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
		},
		resources: [],
		javascripts: [],
		stylesheets: []
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
			try{
				return Backbone.Collection.prototype.add.call(this, new widgets[model.type](model), option);
			}catch(e){
				console.error("unknown widget "+model.type);
				return false;
			}
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
	stylesheets: [],
	resources: [],
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
			var input = this.$("[name="+k+"]");
			if(input.attr("type") == "checkbox" || input.attr("type") == "radio"){
				input.attr("checked", v);
			}else{
				input.val(v);
			}
		}, this);
	},
	save: function(e){
		_.each($(e.target).serializeJSON(), function(v,k){
			this.model.set(k, v);
		}, this);
		var model = this.model;
		$("input[type=checkbox]:not(:checked)", e.target).each(function(){
			model.set(this.name, false);
		});
		this.$("input[type=submit]").val("Saved").attr("disabled", true);
		setTimeout(function(){
			this.$("input[type=submit]").val("Save").attr("disabled", false);
		}, 500);
		return false;
	},
	unload: function(){
		this.undelegateEvents();
	}
});

function format_view(model){
	if(!model.view){
		return false;
	}
	var el = model.view.$el;
	var css = _.clone(model.get("_css"));
	if(!css){
		return;
	}
	if(!css['background-repeat']){
		css['background-repeat'] = "no-repeat";
	}
	_.each(["width", "height", "margin-top", "margin-right", "margin-bottom", "margin-left"], function(x){
		if(css[x]){
			css[x] = css[x] + "px";
		}
	});
	_.each(css, function(v, x){
		if(!v){
			delete css[x];
		}
	})
	var customcss = css['customcss'];
	delete css['customcss'];
	el.css(css);
	el.attr("style", (el.attr("style") + " ;; " || "") + customcss);
}

var CSSConfigView = TemplConfigView.extend({
	template: "_css",
	events: {
		"submit form": "save",
		"change input": "rerender",
		"change select": "rerender",
		"click select": "rerender",
	},
	render: function(){
		var css = this.model.get("_css") || [];
		this.el.innerHTML = this.template(css);
		_.each(curWidget.disable_config, function(v){
			this.$("[name="+v+"],[data-name="+v+"]").closest(".span1,.span2,.span3,.span4,.span5").hide();
		});
		_.each(css, function(v,k){
			var input = this.$("[name="+k+"]");
			if(input.attr("type") == "checkbox" || input.attr("type") == "radio"){
				input.attr("checked", v);
			}else{
				input.val(v);
			}
		}, this);
		_.each(["float", "text-align"], function(v){
			var el = this.$("[data-name="+v+"] [data-value="+css[v]+"]");
			if(el.length > 0){
				el.button('toggle');
			}else{
				this.$("[data-name="+v+"] .btn:first").button("toggle");
			}
		})
	},
	rerender: function(){
		if(this.model.view){
			format_view(this.model);
		}else{
			console.error("no view is found");
		}
	},
	save: function(e){
		var out = this.$("form").serializeJSON();
		this.$("form .active[data-value]").each(function(){
			out[$(this).parents("[data-name]").data("name")] = $(this).data("value");
		});
		console.log(out);
		this.model.set("_css", out).trigger("change");
		this.$("input[type=submit]").val("Saved").attr("disabled", true);
		setTimeout(function(){
			this.$("input[type=submit]").val("Save").attr("disabled", false);
		}, 500);
		this.rerender();
		return false;
	},
	unload: function(){
		this.undelegateEvents();
	}
});

var widgets = {}, layouts = {};

if(!window['localStorage']){
	alert("Browser is not supported!");
}