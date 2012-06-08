widgets["style"] = Widget.extend({
	type: "style",
	name: "CSS",
	description: "Custom CSS",
	disable_config: ["*"],
	icon_large: "/assets/img/css.large.png",
	icon_small: "/assets/img/css.small.png",
	config: TemplConfigView.extend({
		template: "style",
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			_.each(this.model.toJSON(), function(v,k){
				var input = this.$("[name="+k+"]");
				if(input.attr("type") == "checkbox" || input.attr("type") == "radio"){
					input.attr("checked", v);
				}else{
					input.val(v);
				}
			}, this);
		},
	}),
	renderer: Backbone.View.extend({
		tagName: "style",
		initialize: function(){
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(){
			var style = this.model.toJSON();
			delete style.style;
			delete style.name;
			delete style.widget;
			delete style.type;
			delete style.id;
			var addStyle = "body{";
			_.each(style, function(v,k){
				if(!v){return;}
				if(k == "background-image"){
					v = "url(" + v + ")";
				}
				addStyle += k+": "+v+" !important; ";
			});
			if(!style['background-repeat']){
				addStyle += "background-repeat: no-repeat !important;";
			}
			addStyle += "}";
			this.el.innerHTML = (this.model.get("style") || "") + addStyle;
		}
	}),
});