widgets["review"] = Widget.extend({
	type: "review",
	name: "Review",
	description: "Review of the item from 0-10 from multiple authors",
	disable_config: ["padding", "text-align"],
	config: TemplConfigView.extend({
		template: "review",
		events: function(){
			return _.extend({
				"click #review_add": "add",
				"click .widgetlist .btn": "del"
			}, TemplConfigView.prototype.events);
		},
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			this.render_list();
			this.$(".widgetlist").sortable({
				containment: "parent",
				handle: ".grip",
				update: _.bind(function(){
					var reviews = [];
					this.$(".widgetlist li").each(function(){
						reviews.push($(this).data("item"));
					});
					this.model.set("reviews", reviews);
				}, this)
			}).disableSelection().delegate("li.review_item", "click", _.bind(function(e){
				this.$(".widgetlist .active").removeClass("active");
				var item = $(e.target).closest("li").addClass("active").data("item");
				$("#review_param").show().data("item", item).data("parent", $(e.target));
				_.each(item, function(v,k){
					$("#review_param [name="+k+"]").val(v);
				});
			}, this));
			$("#review_param").hide();
		},
		render_list: function(){
			var reviews = this.model.get("reviews") || [];
			this.$(".widgetlist").empty();
			_.each(reviews, _.bind(function(v){
				var item = $('<li class="review_item"><span class="ui-icon ui-icon-grip-solid-horizontal grip"></span><button class="btn" type="button"><span class="ui-icon ui-icon-trash"></span></button><strong></strong></li>').data("item", v);
				$("strong", item).text(v.reviewer);
				item.appendTo(this.$(".widgetlist"));
			}, this));
			if(reviews.length == 0){
				$("<li>Empty</li>").appendTo(this.$(".widgetlist"));
			}
		},
		add: function(e){
			var reviews = this.model.get("reviews") || [];
			reviews.push({
				id: new Date().getTime().toString(36),
				reviewer: "Untitled",
				avatar: "",
				graphics: 10,
				graphicsext: "",
				sound: 10,
				soundext: "",
				story: 10,
				storyext: ""
			});
			this.model.set("reviews", reviews);
			this.render_list();
			return false;
		},
		del: function(e){
			var reviews = _.without(this.model.get("reviews"), $(e.target).parents("li").data("item"));
			this.model.set("reviews", reviews);
			this.render_list();
			$("#review_param").hide();
			return false;
		},
		save: function(e){
			var saveData=this.$("form").serializeJSON();
			var item = this.$("#review_param").data("item");
			_.each(saveData, function(v,k){
				if(k.match(/^(graphics|sound|story)$/)){
					v = parseInt(v);
				}
				item[k] = v;
			});
			item.average = ((item.sound + item.story + item.graphics)/3).toFixed(1).replace(/\.0$/, "");
			var sum = _.reduce(_.pluck(this.model.get("reviews"), "average"), function(a,b){ return parseFloat(a)+parseFloat(b) }, 0);
			this.model.set("average", (sum / this.model.get("reviews").length).toFixed(1).replace(/\.0$/, ""));
			this.model.trigger("change");
			this.$("#review_param").data("parent").find("strong").text(saveData.reviewer);
			this.$("input[type=submit]:first", e.target).val("Saved").attr("disabled", true);
			setTimeout(function(){
				this.$("input[type=submit]:first", e.target).val("Save").attr("disabled", false);
			}, 500);
			return false;
		}
	}),
	render_on_change: true,
	renderer: Backbone.View.extend({
		initialize: function(){
			this.template = load_template("widgets", "review");
		},
		render: function(){
			this.el.innerHTML = this.template(this.model.toJSON());
		},
		stylesheets: ["files/review.css"],
		javascripts: ["files/review.js"]
	}),
});
!(function(){
	var reviewColor = {
		0: "#000",
		1: "#ff2900",
		2: "#ff6c00",
		3: "#ffa500",
		4: "#ffd800",
		5: "#fef900",
		6: "#fef900",
		7: "#e4f200",
		8: "#a9e505",
		9: "#2bcd1e",
		10: "#00c831"
	};
	Handlebars.registerHelper('review_css', function(val){
		var color = reviewColor[val];
		var width = (745/10)*val;
		return "background-color: "+color+"; width: "+width+"px;";
	});
})();