# Widgets

Widgets is an item on the page. Everything on the page that is not on the layout code is a widget. (In fact, layouts behave similar to widgets too!)

Every widget in Kyou is actually a model. The engine automatically loads and create widget objects as needed. However, widgets does not have a database object and stored in a field of the page instead. You don't need to know this if you're here to know how to write widgets as saving widgets is automatically handled by the engine.

## Boilerplate

Widgets are subclass of the Widget class and stored in the widgets object. The widget source is stored in `assets/widgets/name.js`. Here's the boilerplate:

	widgets["style"] = Widget.extend({
		type: "style",
		name: "CSS",
		description: "Custom CSS",
		config: TemplConfigView.extend({
			template: "style"
		}),
		renderer: Backbone.View.extend({
			tagName: "style",
			initialize: function(){
				this.model.on("change:style", function(){
					this.render();
				}, this);
			},
			render: function(){
				this.el.innerHTML = this.model.get("style") || "";
			}
		}),
	});

- `type`: The machine-readable type of this widget. Must be the same name with the widgets object attribute name. (defined in line 1 here) The system use this field when loading widget to know which widget model it is.
- `name`: Human-readable name
- `description`: Human-readable description. Shown in new widget page's tooltip.
- `config`: When clicking on a widget, a configuration page is shown under the widgets list. This field stores the configuration renderer that must be subclass of Backbone.View. We provides TemplConfigView to simplify the development. More on that later.
- `renderer`: When displaying the page, this subclass of Backbone.View will be initialized and its `render` function called. More on this in [Backbone.View documentation](http://documentcloud.github.com/backbone/#View).

## Configuration

The config object is a subclass of Backbone.View. You can access the canvas in `this.el` (raw DOM object) or `this.$el` (jQuery-wrapped)

When the configuration page is closed, `unload()` is fired. You should pull all events bind to the top level element. Specially, Backbone binds the events specified in `events` attribute of the view to the top level element. Use `this.undelegateEvents()` to unbound. The default implementation of `unload()` automatically does this.

The TemplConfigView is a subclass of Backbone.View and simplify the widget creation process. Just extend this class by `TemplConfigView.extend({})` and specifying the template name in the template attribute.

The configuration template is a file in `handlebars/config/template.html`. Inside should be a form. When is form is submitted, its content will be set on the model object which should be very common for all widgets.

## Renderer

The renderer is also a subclass of Backbone.View. The renderer is automatically initialized with the model set to the associated model. Renderer view is not persistent. Subsequential render will create new renderer.

Apart from the usual `render` method, the renderer class also can supply the `javascripts` and/or `stylesheets` attributes. Both are an array (or a function that returns an array) of JavaScripts/CSS files to load. The injection of JavaScripts/CSS is run after all the widgets have been loaded. If any member of the attributes is a multiline string (have \n inside) it is treated as inline script.

When the packaging process is run, all resource files pointed to by `javascripts` and `stylesheets` in the local filesystem is copied into the package. Also, for security only files in the `assets` folder and `files` folder can be copied. If you're writing widget, put your files in the `files` folder.

Similar to the configuration system, the render target is supplied in `this.el` or `this.$el`. Usually you don't need to replace the element if your view configuration is correct but if you need to do, study how from the h1 widget.

When the user save the widget configuration, change event is fired on the model. (Read more on this on the Backbone.Model documentation) You should listen to this event and update the preview accordingly as the engine does not rerender the widget.

Widget previews should be quick. If you're loading something from other site, make sure that it can be cached or otherwise disable the preview. To know whether you're rendering for the output for not, check for the `dist` attribute of the first parameter supplied to `render()`. When previewing, no argument is supplied, while when rendering it will be an Object with dist attribute. Also, `javascripts` and `stylesheets` does recieve the same parameter.

## Things you should know when writing widgets

- Always unbind your configuration events.
- Never, ever include any external CSS in the page. While it does work, it breaks the page preview. Please use the stylesheets option for this, or if you can't use `setTimeout` to workaround this problem.
- Never put a / in front of stylesheet/javascript URL. The packaging process does not copy any files that have / prefix.
- A newline in stylesheet/javascript URL make the engine treating such string as inline script.