widgets["wysiwyg"] = Widget.extend({
	type: "wysiwyg",
	name: "WYSIWYG",
	description: "Free text with What You See Is What You Get editor",
	icon_large: "/assets/img/wysiwyg.large.png",
	icon_small: "/assets/img/wysiwyg.small.png",
	config: Backbone.View.extend({
		render: function(){
			page.project.pages.fetch();
			this.$el.html("<textarea></textarea><div class='alert alert-info'>To save, click <span style='width:16px;height:16px;background:url(/assets/ckeditor/skins/kama/icons.png) no-repeat 0px -32px;display:inline-block;vertical-align:middle;'></span></div>");
			this.$("textarea").val(this.model.get("html"));
			var render = _.bind(function(){
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
				this.editor = CKEDITOR.replace(this.$("textarea").get(0), {
					toolbar: [
						['Bold','Italic','Underline','Strike','Subscript','Superscript','-', 'RemoveFormat', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink', '-', 'TextColor','BGColor'],
						['Styles','Format','Font','FontSize'],
						['Image', 'Table', 'SpecialChar', 'HorizontalRule', '-', 'Find','Replace', '-', 'Maximize', 'Source', 'Save']
					]
				});
			}, this);
			var setupAndRender = _.bind(function(){
				// Link to internal pages
				CKEDITOR.on( 'dialogDefinition', function(ev){
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
							children: [
								{
									"type": "select",
									"label": "Pages",
									"id": "localPage",
									"items": pages,
									"onChange": function(ev){
										if(!ev.data.value){
											return;
										}
										var diag = CKEDITOR.dialog.getCurrent();
										var url = diag.getContentElement('info','url');
										url.setValue(ev.data.value+".html");
									}
								},
								{
									"type": "button",
									"label": "Resource",
									"id": "resfile",
									"onClick": function(){
										var diag = CKEDITOR.dialog.getCurrent();
										var url = diag.getContentElement('info','url');
										pick_file(function(d){
											url.setValue(d);
										});
									}
								}
							]
						});
					}else if(ev.data.name == "image"){
						var dialogDefinition = ev.data.definition;
						var infoTab = dialogDefinition.getContents('info');
						infoTab.elements[0].children.push({
							"type": "button",
							"label": "Resource",
							"id": "resfile",
							"onClick": function(){
								var diag = CKEDITOR.dialog.getCurrent();
								var url = diag.getContentElement('info','txtUrl');
								pick_file(function(d){
									url.setValue(d);
								});
							}
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
		},
		unload: function(){
			if(this.model.get("html") != this.editor.getData()){
				if(!confirm("Discard unsaved changes?")){
					return false;
				}
			}
			this.editor.destroy();
			this.undelegateEvents();
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