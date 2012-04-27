widgets["wysiwyg"] = Widget.extend({
	type: "wysiwyg",
	name: "WYSIWYG",
	description: "Free text with What You See Is What You Get editor",
	config: Backbone.View.extend({
		render: function(){
			this.$el.html("<textarea></textarea>");
			this.$("textarea").val(this.model.get("html"));
			var render = _.bind(function(){
				CKEDITOR.replace(this.$("textarea").get(0), {
					toolbar: [
						['Bold','Italic','Underline','Strike','Subscript','Superscript','-', 'RemoveFormat', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink', '-', 'TextColor','BGColor'],
						['Styles','Format','Font','FontSize'],
						['Image', 'Table', 'SpecialChar', 'HorizontalRule', '-', 'Find','Replace', '-', 'Maximize', 'Source', 'Save']
					]
				});
				
			}, this);
			var setupAndRender = _.bind(function(){
				CKEDITOR.plugins.registered['save'] = {
					init: _.bind(function(editor){
						var command = editor.addCommand('save', {
							modes: {wysiwyg:1, source:1},
							exec: _.bind(function(editor){
								this.model.set("html", editor.getData());
							}, this)
						});
						editor.ui.addButton('Save', {label: 'Save', command : 'save'});
					}, this)
				}
				// Link to internal pages
				CKEDITOR.on( 'dialogDefinition', function(ev){
					console.log(ev);
					if(ev.data.name == "link"){
						var dialogDefinition = ev.data.definition;
						var infoTab = dialogDefinition.getContents('info');
						var pages = [["", ""]];
						page.project.pages.each(function(v){
							pages.push([v.get("name"), v.id]);
						});
						infoTab.add({
							type: "vbox",
							id: "localPageOptions",
							children: [{
								"type": "select",
								"label": "Pages",
								"id": "localPage",
								"items": pages,
								"onChange": function(ev){
									var diag = CKEDITOR.dialog.getCurrent();
									var url = diag.getContentElement('info','url');
									url.setValue("/"+ev.data.value+".html");
								}
							}]
						});
					}
				});
				render();
			}, this)
			if(!window.CKEDITOR){
				window.CKEDITOR_BASEPATH = "/assets/ckeditor/";
				$.getScript(CKEDITOR_BASEPATH+"ckeditor.js", setupAndRender);
			}else{
				render();
			}
		}
	}),
	renderer: Backbone.View.extend({
		initialize: function(){
			this.model.on("change:html", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.el.innerHTML = this.model.get("html") || "";
		}
	}),
});