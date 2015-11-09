widgets["quiz"] = Widget.extend({
	type: "quiz",
	name: "Quiz",
	description: "Self-review exam",
	disable_config: [],
	featured: true,
	config: TemplConfigView.extend({
		template: "quiz",
		events: function(){
			return _.extend({
				"click #quiz_add": "add",
				"click .widgetlist .btn": "del",
				"click #choice_add": "add_choice",
				"click #choicelist .btn": "del_choice",
			}, TemplConfigView.prototype.events);
		},
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			this.render_list();
			this.$(".widgetlist").sortable({
				containment: "parent",
				handle: ".grip",
				update: _.bind(function(){
					var quiz = [];
					this.$(".widgetlist li").each(function(){
						quiz.push($(this).data("item"));
					});
					this.model.set("quiz", quiz);
				}, this)
			}).disableSelection().delegate("li.quiz_realitem", "click", _.bind(function(e){
				this.$(".widgetlist .active").removeClass("active");
				var item = $(e.target).closest("li").addClass("active").data("item");
				$("#quizset").show().data("item", item).data("parent", $(e.target));
				_.each(item, function(v,k){
					$("#quizset [name="+k+"]").val(v);
				});
				this.render_choices();
			}, this));
			$("#quizset").hide();
		},
		render_list: function(){
			var quiz = this.model.get("quiz") || [];
			this.$(".widgetlist").empty();
			_.each(quiz, _.bind(function(v){
				var item = $('<li class="quiz_realitem"><span class="ui-icon ui-icon-grip-solid-horizontal grip"></span><button class="btn" type="button"><span class="ui-icon ui-icon-trash"></span></button><strong></strong></li>').data("item", v);
				$("strong", item).text(v.question);
				item.appendTo(this.$(".widgetlist"));
			}, this));
			if(quiz.length == 0){
				$("<li>Empty</li>").appendTo(this.$(".widgetlist"));
			}
		},
		render_choices: function(){
			var item = this.$("#quizset").data("item");
			this.$("#choicelist tbody").empty();
			_.each(item.choices, function(v){
				var item = $('<tr><td><input type="text" name="answer[]"></td><td><input type="number" class="input-mini" required name="score[]"></td><td><button class="btn" type="button"><span class="ui-icon ui-icon-trash"></span></button></td></tr>');
				item.find("input[name=\"answer[]\"]").val(v.answer);
				item.find("input[name=\"score[]\"]").val(v.score);
				item.data("item", v);
				this.$("#choicelist tbody").append(item);
			});
		},
		add: function(e){
			var quiz = this.model.get("quiz") || [];
			quiz.push({
				id: new Date().getTime().toString(36),
				question: "Enter question",
				choices: [],
			});
			this.model.set("quiz", quiz);
			this.render_list();
			return false;
		},
		del: function(e){
			var quiz = _.without(this.model.get("quiz"), $(e.target).parents("li").data("item"));
			this.model.set("quiz", quiz);
			this.render_list();
			$("#quizset").hide();
			return false;
		},
		add_choice: function(e){
			var item = this.$("#quizset").data("item");
			item.choices.push({
				id: new Date().getTime().toString(36),
				answer: "",
				score: 0,
				parent: item.id
			});
			this.model.trigger("change");
			this.render_choices();
		},
		del_choice: function(e){
			var item = this.$("#quizset").data("item");
			item.choices = _.without(item.choices, $(e.target).closest("tr").data("item"));
			this.model.trigger("change");
			this.render_choices();
		},
		save: function(e){
			var item = this.$("#quizset").data("item");
			item.question = this.$("input[name=question]").val();
			this.model.set("layout", this.$("select[name=layout]").val());
			this.model.set("name", this.$("input[name=name]").val());
			this.$("#choicelist tbody tr").each(function(){
				var c = $(this).data("item");
				c.answer = $(this).find("input[name=\"answer[]\"]").val();
				c.score = parseInt($(this).find("input[name=\"score[]\"]").val());
				c.parent = item.id;
			});
			this.model.trigger("change");
			this.$("#quizset").data("parent").find("strong").text(item.question);
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
			this.template = load_template("widgets", "quiz");
		},
		render: function(){
			this.el.innerHTML = this.template(this.model.toJSON());
			this.$el.removeClass("compact").removeClass("full").addClass("q_" + (this.model.get("layout") || "full"));
		},
		stylesheets: function(){
			return ["files/quiz/" + (this.model.get("layout") || "full") + ".css"];
		},
		javascripts: ["files/quiz.js"]
	}),
});