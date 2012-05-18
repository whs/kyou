widgets["youtube"] = Widget.extend({
	type: "youtube",
	name: "YouTube",
	description: "YouTube Video",
	icon_large: "/assets/img/youtube.large.png",
	icon_small: "/assets/img/youtube.small.png",
	disable_config: ["background-image", "background-repeat", "text-align", "color", "background-color", "padding-top", "padding-right", "padding-bottom", "padding-left"],
	config: TemplConfigView.extend({
		template: "youtube",
		events: function(){
			return _.extend({
				"submit #form_addvideo": "addclip",
				"click .widgetlist .btn": "delclip"
			}, TemplConfigView.prototype.events);
		},
		render: function(){
			TemplConfigView.prototype.render.apply(this, arguments);
			this.render_playlist();
			this.$(".widgetlist").sortable({
				containment: "parent",
				handle: ".grip",
				update: _.bind(function(){
					var playlist = [];
					this.$(".widgetlist li .itemname").each(function(){
						playlist.push(this.textContent);
					});
					this.model.set("playlist", playlist).trigger("change");
					this.render_playlist();
				}, this)
			}).disableSelection();
		},
		render_playlist: function(){
			var playlist = this.model.get("playlist") || [];
			var plinfo = this.model.get("_playlist") || {};
			this.$(".widgetlist").empty();
			_.each(playlist, _.bind(function(v){
				var item = $('<li><span class="ui-icon ui-icon-grip-solid-horizontal grip"></span><button class="btn" type="button"><span class="ui-icon ui-icon-trash"></span></button><strong></strong> <span class="itemname"></span></li>');
				$("strong", item).text(plinfo[v] || "Loading...");
				$(".itemname", item).text(v);
				item.appendTo(this.$(".widgetlist"));
			}, this));
			if(playlist.length == 0){
				$("<li>No video</li>").appendTo(this.$(".widgetlist"));
			}
		},
		addclip: function(e){
			var playlist = this.model.get("playlist") || [];
			var vid = $("input[name=videoid]", e.target).val();
			$("input[name=videoid]", e.target).val("");
			playlist.push(vid);
			this.model.set("playlist", playlist);
			var dataSave = _.bind(function(d){
				d = JSON.parse(d.responseText);
				var clipName;
				if(d['error']){
					clipName = d.error.message;
				}else{
					clipName = d.data.title;
				}
				var plinfo = this.model.get("_playlist") || {};
				plinfo[vid] = clipName;
				this.model.set("_playlist", plinfo);
				this.model.trigger("change");
				this.render_playlist();
			}, this);
			$.get("https://gdata.youtube.com/feeds/api/videos/"+vid+"?v=2&alt=jsonc").complete(dataSave);
			this.render_playlist();
			return false;
		},
		delclip: function(e){
			var playlist = this.model.get("playlist") || [];
			var plinfo = this.model.get("_playlist") || {};
			var rm = $(".itemname", $(e.target).parents("li")).text();
			playlist = _.without(playlist, rm);
			delete plinfo[rm];
			this.model.set("playlist", playlist);
			this.model.set("_playlist", plinfo)
			this.model.trigger("change");
			this.render_playlist();
			return false;
		}
	}),
	renderer: Backbone.View.extend({
		tagName: "iframe",
		initialize: function(){
			this.model.on("change", function(){
				this.render();
			}, this);
		},
		render: function(){
			this.el.style.border = "none";
			var param = _.pick(this.model.toJSON(), "playlist", "autohide", "autoplay", "controls", "iv_load_policy", "loop", "modestbranding", "rel", "showinfo", "theme", "start");
			this.el.style.width = "480px";
			this.el.style.height = "270px";
			if(!param['playlist'] || param['playlist'].length == 0){
				this.el.src = "data:text/plain,No playlist";
				return;
			}
			param['playlist'] = _.clone(param['playlist']);
			var firstClip = param['playlist'].shift();
			param['playlist'] = param['playlist'].join(",");
			this.el.src = "http://www.youtube.com/embed/" + firstClip + "?" + $.param(param);
		}
	}),
});