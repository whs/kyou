/**
 * serializeJSON: Used mostly in toJSON()
 */
(function( $ ){
	$.fn.serializeJSON=function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(n, i){
			json[n['name']] = n['value'];
		});
		return json;
	};
})(jQuery);
/**
 * insertAtCaret: Insert text at the cursor. Used in text widget
 */
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

var $templates = {};
/**
 * Load template synchronously.
 * Template is compiled, loaded and subsequential calls will
 * be much faster.
 * @param {string} Folder name
 * @param {string} File name (without .html)
 */
function load_template(kind, id){
	if(!Handlebars){
		throw("Handlebars is not loaded!");
	}
	if($templates[kind+"/"+id]){
		return $templates[kind+"/"+id];
	}else{
		//Handlebars.compile($("#tmpl_layout_"+this.model.get("layout")).html().replace(/^<!-- /, "").replace(/ -->$/, ""));
		$templates[kind+"/"+id] = Handlebars.compile($.ajax({
			async: false,
			url: "/handlebars/" + kind +"/" + id + ".html"
		}).responseText);
		return $templates[kind+"/"+id];
	}
}

/**
 * Project object
 */
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
			"click a[href]": "stopClick",
			"submit form": "stopClick",
		},
		render: function(opt){
			if(this.rendering) return;
			console.time("render");
			this.model.trigger("beforerender");
			this.rendering = true;
			var layout = new layouts[this.model.get("layout")];
			layout.page = this.model;
			this.el.innerHTML = "";
			var layoutRenderer = new layout.renderer({
				model: layout,
				el: this.el
			});

			var javascripts = (_.isFunction(layoutRenderer.javascripts) ? layoutRenderer.javascripts() : layoutRenderer.javascripts) || [];
			var stylesheets = (_.isFunction(layoutRenderer.stylesheets) ? layoutRenderer.stylesheets() : layoutRenderer.stylesheets) || [];

			// Sometimes the layout put some image in. This should fix the link.
			if((!opt || !opt.dist) && window["page"]){
				$("<base>").attr("href", window.location.protocol + "//" + window.location.hostname + "/bookfiles/" + page.project.id + "/").appendTo(this.el);
			}

			layoutRenderer.render(opt);

			if((!opt || !opt.dist) && window["page"]){
				$("<base>").attr("href", window.location.protocol + "//" + window.location.hostname + "/bookfiles/" + page.project.id + "/").appendTo(this.$("head"));
			}

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
			var cssInjectPos = this.$("style,link").eq(0);
			setTimeout(_.bind(function(){
				_.each(stylesheets, function(v){
					if(v.indexOf("\n") != -1){
						var ele = $("<style>").html(v)
					}else{
						var ele = $("<link rel='stylesheet'>").attr('href', (v.indexOf("http") == 0 ? "" : "/")+v);
					}
					if(cssInjectPos.length > 0){
						ele.insertAfter(cssInjectPos);
						cssInjectPos = ele;
					}else{
						ele.appendTo(this.$("head"));
					}
				}, this);
				setTimeout(_.bind(function(){
					this.rendering = false;
					this.model.trigger("render");
					console.timeEnd("render");
				}, this), 50);
			}, this), 10);
			var inProduction = opt && (opt['dist'] || opt['revision']); // in production mode
			var loadJS = _.bind(function(){
				var v = javascripts.shift();
				if(!v){
					return;
				}
				var ele = document.createElement("script");
				ele.type = "text/javascript";
				if(v.indexOf("\n") != -1){
					ele.innerHTML = v;
				}else{
					ele.src = (v.indexOf("http") == 0 ? "" : "/") + v;
					if(!inProduction){
						ele.onload = loadJS;
					}
				}
				this.$("body").get(0).appendChild(ele);
				if(v.indexOf("\n") != -1){
					loadJS();
				}
			}, this);
			if(inProduction){
				while(javascripts.length > 0){
					loadJS();
				}
			}else{
				loadJS();
			}
		},
		stylesheets: function(opt){
			var layout = new layouts[this.model.get("layout")];
			var layoutRenderer = new layout.renderer({
				model: layout
			});
			var stylesheets = (_.isFunction(layoutRenderer.stylesheets) ? layoutRenderer.stylesheets(opt) : layoutRenderer.stylesheets) || [];
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
			var layoutRenderer = new layout.renderer({
				model: layout
			});
			var javascripts = (_.isFunction(layoutRenderer.javascripts) ? layoutRenderer.javascripts(opt) : layoutRenderer.javascripts) || [];
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
			var layoutRenderer = new layout.renderer({
				model: layout
			});
			var resources = (_.isFunction(layoutRenderer.resources) ? layoutRenderer.resources(opt) : layoutRenderer.resources) || [];
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
			this.el.innerHTML = load_template("widgets", this.model.type)(this.model.toJSON());
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
	check_depends: function(){
		return true;
	},
	renderer: Backbone.View.extend({
		get_data: function(opt){
			var data = this.model.page.toJSON();
			data.project = this.model.page.project.toJSON();
			return data;
		},
		render: function(opt){
			this.el.innerHTML = load_template("layout", this.model.type)(this.get_data(opt));
			// run all JavaScripts
			var self = this;
			this.$("script").each(function(){
				self.el.parentNode.defaultView.eval(this.textContent);
			});
		},
		resources: [],
		javascripts: [],
		stylesheets: []
	})
});

var KotomiFile = Backbone.Model.extend({
	initialize: function(opt){
		if(_.isObject(opt) && opt.file){
			this.set("file", opt.file);
		}
		this.on("change:project reset", function(){
			this.project = new Project({id:this.get("project")});
		}, this).trigger("reset");
	},
	url: function(){
		return "/projects/" + this.project.id + "/iimg/" + this.get("file");
	},
});

var TemplConfigView = Backbone.View.extend({
	template: "",
	autocommit: true,
	events: {
		"submit form": "save",
	},
	initialize: function(){
		this.template = load_template("config", this.template);
	},
	render: function(){
		var modelData = this.model.toJSON();
		this.el.innerHTML = this.template(modelData);
		_.each(modelData, function(v,k){
			var input = this.$("[name="+k+"]");
			if(input.attr("type") == "checkbox"){
				input.attr("checked", v);
			}else if(input.attr("type") == "radio"){
				input.attr("checked", false);
				this.$("[name="+k+"][value="+v+"]").attr("checked", true);
			}else{
				input.val(v);
			}
		}, this);
	},
	save: function(e){
		_.each($(e.target).serializeJSON(), function(v,k){
			if(k.match(/\[\]$/)){
				return;
			}
			this.model.set(k, v);
		}, this);
		var model = this.model;
		$("input[type=checkbox]:not(:checked)", e.target).each(function(){
			if(this.name.match(/\[\]$/)){
				return;
			}
			model.set(this.name, false);
		});
		if(this.autocommit){
			model.trigger("change");
		}
		this.$("input[type=submit]:first", e.target).val("Saved").attr("disabled", true);
		setTimeout(function(){
			this.$("input[type=submit]:first", e.target).val("Save").attr("disabled", false);
		}, 500);
		return false;
	},
	unload: function(){
		this.undelegateEvents();
	}
});

var TemplLayoutConfigView = TemplConfigView.extend({
	render: function(){
		var modelData = this.model.page.get("config_"+this.model.type) || {};
		this.el.innerHTML = this.template(modelData);
		_.each(modelData, function(v,k){
			var input = this.$("[name="+k+"]");
			if(input.attr("type") == "checkbox"){
				input.attr("checked", v);
			}else if(input.attr("type") == "radio"){
				input.attr("checked", false);
				this.$("[name="+k+"][value="+v+"]").attr("checked", true);
			}else{
				input.val(v);
			}
		}, this);
	},
	save: function(e){
		var setDict = this.model.page.get("config_"+this.model.type) || {};
		_.each($(e.target).serializeJSON(), function(v,k){
			setDict[k] = v;
		}, this);
		var model = this.model;
		$("input[type=checkbox]:not(:checked)", e.target).each(function(){
			setDict[this.name] = false;
		});
		this.model.page.set("config_"+this.model.type, setDict).trigger("change");

		this.$("input[type=submit]:first", e.target).val("Saved").attr("disabled", true);
		page.renderer.render();
		setTimeout(function(){
			this.$("input[type=submit]:first", e.target).val("Save").attr("disabled", false);
		}, 500);
		return false;
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
	if(css['background-image']){
		css['background-image'] = "url("+css['background-image']+")";
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
	var customcss = css['customcss'] || "";
	delete css['customcss'];
	if(css['float'] == "center"){
		delete css['float'];
		delete css['margin-left'];
		delete css['margin-right'];
		el.css("float", "none");
		el.css("margin-left", "auto");
		el.css("margin-right", "auto");
		el.css("display", "block");
	}
	var defaultCSS = {
		float: "none",
		"text-align": "left",
		clear: "none",
		"background-repeat": "repeat",
	};
	var cssStr = "";
	_.each(css, function(v,k){
		if(v == defaultCSS[k]){
			return;
		}
		cssStr += k+":"+v+";";
	});
	var cssel = el.data("cssel");
	if(!cssel){
		cssel = $("<style></style>").insertBefore(el);
		el.data("cssel", cssel);
	}
	cssel.text("#" + el.attr("id")+"{"+cssStr+customcss+"}");
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
			this.$("[name="+v+"],[data-name="+v+"]").closest(".span1,.span2,.span3,.span4,.span5").remove();
		});
		_.each(css, function(v,k){
			var input = this.$("[name="+k+"]");
			if(input.attr("type") == "checkbox" || input.attr("type") == "radio"){
				input.attr("checked", v);
			}else{
				input.val(v);
			}
		}, this);
		_.each(["float", "text-align", "clear"], function(v){
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

var RyouItem = Backbone.Model.extend({
	initialize: function(opt){
		this.on("change:project reset", function(){
			this.project = new Project({id:this.get("project")});
		}, this).trigger("reset");
		this.on("change:lyrics reset", function(){
			this.lyrics = new RyouLyrics(this.get("lyrics"));
		}, this).trigger("reset");
	},
	urlRoot: function(){
		return "/projects/" + this.project.id + "/lyric/";
	},
	stage: function(){
		var stage = this.get("stage");
		var stagemap = {
			0: "Planning",
			1: "Transcribing",
			2: "Timing",
			3: "Typesetting",
			4: "QA",
			5: "Done"
		}
		return stagemap[stage];
	},
	provider: function(opt){
		if(this.get("source") == this._provider){
			return this._provider_obj;
		}
		this._provider = this.get("source");
		opt = opt || {};
		opt.model = this;
		this._provider_obj = new ryou_provider[this._provider](opt);
		return this._provider_obj;
	},
	toJSON: function(){
		var out = Backbone.Model.prototype.toJSON.call(this);
		out.lyrics = this.lyrics.toJSON();
		return out;
	}
});
var RyouLyric = Backbone.Model.extend({

});
var RyouLyrics = Backbone.Collection.extend({
	model: RyouLyric,
	comparator: function(x){
		return parseFloat(x.get("time"));
	}
});
var RyouProvider = Backbone.View.extend({

});

var widgets = {}, layouts = {}, ryou_provider = {};

if(!window['localStorage']){
	alert("Browser is not supported!");
}