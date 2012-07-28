widgets["infobox"] = Widget.extend({
	type: "infobox",
	name: "Infobox",
	description: "Metadata of the object in question",
	config: TemplConfigView.extend({
		template: "infobox",
		events: function(){
			return _.extend({
				"click #fdata_add": "newline",
				"click .infoboxdel": "delline",
				"change input[type=checkbox]": "doublecheck",
			}, TemplConfigView.prototype.events);
		},
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			this.render_data.apply(this, arguments);
		},
		render_data: function(){
			_.each(this.model.get("data") || [], function(v){
				var el;
				if(v.dbl){
					el = $("<tr><td colspan='2'><input type='text' name='key[]' class='input-small'></td><td><input type='checkbox' name='double[]' checked> <button type='button' class='btn btn-danger infoboxdel'><i class='icon-trash icon-white'></i></button></td></tr>");
					el.find("input:first").val(v['key']);
				}else{
					el = $("<tr><td><input type='text' class='input-small' name='key[]'></td><td><input type='text' class='input-small' name='value[]'></td><td><input type='checkbox' name='double[]'> <button type='button' class='btn btn-danger infoboxdel'><i class='icon-trash icon-white'></i></button></td></tr>");
					el.find("input:eq(0)").val(v['key']);
					el.find("input:eq(1)").val(v['value']);
				}
				this.$("#fdata tbody").append(el);
			}, this);
		},
		newline: function(e){
			if(e){
				e.preventDefault();
			}
			return $("<tr><td><input type='text' class='input-small' name='key[]'></td><td><input type='text' class='input-small' name='value[]'></td><td><input type='checkbox' name='double[]'> <button type='button' class='btn btn-danger infoboxdel'><i class='icon-trash icon-white'></i></button></td></tr>").appendTo(this.$("#fdata tbody"));
		},
		delline: function(e){
			$(e.target).parents("tr").remove();
			return false;
		},
		doublecheck: function(e){
			var line = $(e.target).parents("tr");
			if($(e.target).is(":checked")){
				line.find("input:eq(1)").parents("td").remove();
				line.find("td:first").attr("colspan", 2);
			}else{
				line.find("td:first").attr("colspan", 1);
				$("<td><input type='text' class='input-small' name='value[]'></td>").insertAfter(line.find("td:first"));
			}
		},
		save: function(){
			var data = [];
			this.$("#fdata tbody tr").each(function(){
				if($(this).find("input[type=checkbox]:checked").val()){
					data.push({
						key: $(this).find("input:first").val(),
						dbl: true
					});
				}else{
					data.push({
						key: $(this).find("input:first").val(),
						value: $(this).find("input:eq(1)").val(),
						dbl: false
					});
				}
			});
			this.model.set("data", data);
			return TemplConfigView.prototype.save.apply(this, arguments);
		}
	}),
	renderer: Backbone.View.extend({
		initialize: function(){
			this.template = load_template("widgets", "infobox");
			this.model.on("change", this.render, this);
		},
		render: function(){
			this.el.innerHTML = this.template(this.model.toJSON());
		},
		stylesheets: ["files/infobox.css"]
	}),
});