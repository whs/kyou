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
	}
});

var PageList = Backbone.Collection.extend({
	model: Page,
	project: null,
	url: function(){
		return this.project.url() + "/pages"
	}
});

if(!window['localStorage']){
	alert("Browser is not supported!");
}