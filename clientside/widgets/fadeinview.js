widgets["fadeinview"] = Widget.extend({
	type: "fadeinview",
	name: "Fade in",
	description: "Fade in any widget the first time it is appeared in the view",
	config: TemplConfigView.extend({
		template: "fadeinview",
		autocommit: false,
		render: function(){
			var self = this, widgetslist, activeWidgets = this.model.get("widgets")||[];
			TemplConfigView.prototype.render.apply(this, arguments);
			widgetslist = this.$("#fadeinview_widgets");
			this.set_data();
			page.widgets.each(function(v){
				if(v.id == self.model.id){
					return;
				}
				var el = $("<label>");
				el.html(" <strong>"+_.escape(widgets[v.get("type")].prototype.name)+":</strong> "+_.escape(v.get("name")));
				$("<input>").attr({
					type: "checkbox",
					name: "widgets",
					value: v.id,
					checked: activeWidgets.indexOf(v.id) != -1
				}).prependTo(el);
				console.log(activeWidgets, v.id);
				el.appendTo(widgetslist);
			});
		},
		save: function(e){
			TemplConfigView.prototype.save.apply(this, arguments);
			var model = this.model;
			var selected = [];
			this.$("input[name=widgets]:checked").each(function(){
				selected.push($(this).val());
			});
			model.set("widgets", selected);
			model.trigger("change");
			return false;
		}
	}),
	renderer: Backbone.View.extend({
		render: function(){
			this.el.remove();
		},
		javascripts: function(){
			var out = ["files/jquery.inview.min.js"];
			var sel = this.model.get("widgets");
			sel = _.map(sel, function(x){
				return "#"+x;
			});
			sel = sel.join(",");
			var addcss = this.model.get("effect") == "slidefade" ? ",'-webkit-transform':'translatey(200px)','-webkit-transition':'-webkit-transform ease-out "+parseInt(this.model.get("duration"))+"ms','transform':'translatey(200px)','transition':'transform ease-out "+parseInt(this.model.get("duration"))+"ms'" : "";
			var addjs = this.model.get("effect") == "slidefade" ? ".css({'-webkit-transform':'',transform:''})" : "";
			out.push("$(function(){\n$('"+sel+"').css({opacity:0"+addcss+"}).one('inview', function(){\n$(this)"+addjs+".animate({opacity:1}, "+parseInt(this.model.get("duration"))+");\n});\n});");
			return out;
		}
	}),
});