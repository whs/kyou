/**
 * Ryou protocol
 */
window['ryoup_update'] = window['ryoup_update'] || function(time, playing){
	if(playing){
		$(this).parent().addClass("nowplaying");
	}else{
		$(this).parent().removeClass("nowplaying");
	}
	var currentEle = null;
	$(this).parent().find(".ryou_line").each(function(){
		if($(this).data("time") < time){
			currentEle = this;
		}else{
			return false;
		}
	});
	$(this).parent().find(".playing").removeClass("playing");
	if(currentEle){
		$(currentEle).addClass("playing");
		if(currentEle != this.lastEle){
			$(this).parent().find(".ryou_list").stop(true).scrollTo(currentEle, 250, { offset: -30 });
		}
		this.lastEle = currentEle;
	}
};