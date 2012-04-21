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
		this.widgets = new WidgetList(this.get("widgets"));
	},
	url: function(){
		return this.project.url() + "/pages/" + this.id;
	},
	toJSON: function(){
		var out = Backbone.Model.prototype.toJSON.call(this);
		out.widgets = this.widgets.toJSON();
		return out;
	}
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
	description: "Widget ใหม่ ยังไม่ได้กำหนดรายละเอียด",
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
	}
});

var WidgetList = Backbone.Collection.extend({
	model: Widget,
	add: function(model, option){
		if(_.isArray(model)){
			_.each(model, function(v,k){
				model[k] = new widgets[v.type](v);
				model[k].weight = k;
			});
			return Backbone.Collection.prototype.add.call(this, model, option);
		}else if(model.type){
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

var widgets = {};

if(!window['localStorage']){
	alert("Browser is not supported!");
}