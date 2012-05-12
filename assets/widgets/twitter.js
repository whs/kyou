widgets["twitter"] = Widget.extend({
	type: "twitter",
	name: "Twitter",
	description: "Live & realtime Twitter data",
	config: TemplConfigView.extend({
		template: "twitter",
		render: function(){
			TemplConfigView.prototype.render.call(this);
			this.typechange();
		},
		events: function(){
			return _.extend({}, TemplConfigView.prototype.events,{
				"change select[name=t_type]": "typechange",
			});
		},
		typechange: function(){
			this.$(".twconfig").hide().attr("required", false);
			this.$(".twconfig_"+this.$("select[name=t_type]").val()).show().attr("required", true);
		}
	}),
	disable_config: ["width", "height", "background-color", "background-image", "background-repeat", "text-align", "padding-top", "padding-right", "padding-bottom", "padding-left"],
	renderer: Backbone.View.extend({
		tagName: "div",
		initialize: function(){
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(opt){
			if(!opt || !opt['dist']){
				this.el.innerHTML = "Twitter widget (<em>"+this.model.get("t_type")+"</em>): Preview disabled";
				this.$el.css({
					display: "block",
					background: "#8ec1da",
					color: "#ffffff",
					width: this.model.get("width") ? this.model.get("width") : "auto",
					height: this.model.get("height"),
					padding: 5,
					overflow: "hidden",
					borderRadius: "10px"
				});
			}
		},
		javascripts: function(opt){
			if(!opt || !opt['dist']){
				return [];
			}
			var widgetData = {
				version: 2,
				id: this.model.get("id"),
				type: this.model.get("t_type"),
				search: this.model.get("search"),
				subject: this.model.get("caption"),
				title: this.model.get("title"),
				rpp: this.model.get("rpp"),
				interval: 30000,
				width: this.model.get("width") ? this.model.get("width") : "auto",
				height: this.model.get("height"),
				theme: {
					shell: {
						background: '#8ec1da',
						color: '#ffffff'
					},
					tweets: {
						background: '#ffffff',
						color: '#444444',
						links: '#1985b5'
					}
				},
				features: {
					scrollbar: !!this.model.get("scrollbar"),
					loop: false,
					live: true,
					behavior: 'all'
				}
			};
			var moreCode = "";
			if(this.model.get("t_type") == "profile" || this.model.get("t_type") == "faves"){
				moreCode = ".setUser("+JSON.stringify(this.model.get("username"))+")";
			}
			if(this.model.get("t_type") == "list"){
				moreCode = ".setList("+JSON.stringify(this.model.get("username"))+","+JSON.stringify(this.model.get("list"))+")";
			}
			return ["http://widgets.twimg.com/j/2/widget.js", "\nnew TWTR.Widget("+JSON.stringify(widgetData)+").render()"+moreCode+".start();"];
		}
	}),
});