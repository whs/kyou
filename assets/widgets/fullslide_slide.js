widgets["fullslide_slide"] = Widget.extend({
	type: "fullslide_slide",
	name: "Slide",
	description: "",
	config: TemplConfigView.extend({
		template: "fullslide_slide"
	}),
	disable_config: ["float", "text-align", "clear", "width", "height", "margin", "padding"],
	check_depends: function(page){
		if(page.get("layout") == "fullslide"){
			return true;
		}
		return false;
	},
	renderer: Backbone.View.extend({
		tagName: "div",
		initialize: function(){
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(){
			/*<h1 class="title">Hello, world</h1>
		<div class="body">
			Short
		</div>*/
			this.el.innerHTML = "";
			if(this.model.has("title")){
				$("<h1 class='title'>").html(this.model.get("title")).appendTo(this.el);
			}
			if(this.model.has("content")){
				$("<div class='body'>").html(this.model.get("content")).appendTo(this.el);
			}
		}
	}),
});