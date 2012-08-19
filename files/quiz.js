$(function(){
	$(".widget_quiz .q_ans a").click(function(){
		var self = this;
		var quiz = $(this).closest(".widget_quiz");
		var score = 0;
		quiz.find(".q_item").each(function(){
			var el = $(this).find("input[type=radio]:checked");
			var thisScore = parseInt(el.data("score")) || 0;
			score += thisScore;
			if(thisScore > 0){
				el.closest("label").css("color", "green");
			}else{
				el.closest("label").css("color", "red");
			}
		});
		this.textContent = score + " คะแนน";
		quiz.undelegate("label", "click");
		quiz.delegate("label", "click", function(){
			quiz.find("label").attr("style", "");
			self.textContent = "ตรวจคำตอบ";
			quiz.undelegate("label", "click");
		})
		return false;
	});
	$(".widget_quiz.q_compact .q_contain div:gt(0)").hide();
	$(".widget_quiz.q_compact").css("height", function(){
		return $(this).find(".q_contain div:visible").height() + 64;
	});
	$(".widget_quiz.q_compact .q_contain div").css("width", function(){
		return $(this).closest(".widget_quiz").width();
	});

	$(".widget_quiz .q_next:visible").click(function(){
		var self = $(this);
		var cur = self.closest(".widget_quiz").find(".q_contain div:visible");
		var next = cur.next();
		if(next.length == 0) return false;
		cur.css("transform", "translateX(-"+self.closest(".widget_quiz").width()+"px)");
		next.css("transform", "translateX("+self.closest(".widget_quiz").width()+"px)");
		setTimeout(function(){
			next.show().css("transform", "");
			self.closest(".widget_quiz").animate({"height": next.height() + 64});
		}, 1);
		setTimeout(function(){
			cur.hide();
		}, 500);
		return false;
	});
	$(".widget_quiz .q_prev:visible").click(function(){
		var self = $(this);
		var cur = self.closest(".widget_quiz").find(".q_contain div:visible");
		var next = cur.prev();
		if(next.length == 0) return false;
		cur.css("transform", "translateX("+self.closest(".widget_quiz").width()+"px)");
		next.css("transform", "translateX(-"+self.closest(".widget_quiz").width()+"px)");
		setTimeout(function(){
			next.show().css("transform", "");
			self.closest(".widget_quiz").animate({"height": next.height() + 64});
		}, 1);
		setTimeout(function(){
			cur.hide();
		}, 500);
		return false;
	});
});