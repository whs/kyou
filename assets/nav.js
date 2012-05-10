!(function(){
var is_mobile = function(){
	//return true;
	return navigator.userAgent.match(/iPad|iPod|iPhone|Android/);
}
var mouseover = "mouseover";
var mouseout = "mouseout";
if(is_mobile()){
	mouseover = "touchstart";
	mouseout = "touchend";
}

$(function(){
	var curURL = window.location.pathname.split('/');
	curURL = curURL[curURL.length-1].replace(window.location.search, "");
	if(curURL == "") curURL = "index.html";
	$("<div id='navbar' />").appendTo("body");
	$("<div id='navbar-in' />").appendTo("#navbar");
	$("<div id='pagename' />").html(pageName[curURL] || curURL).appendTo("#navbar-in");
	// prev
	if(layout.indexOf(curURL) > 0){
		var prevPage = layout[layout.indexOf(curURL) - 1];
		$("<a id='prevpage' />").attr("href", prevPage).html("&laquo; "+(pageName[prevPage] || prevPage)).appendTo("#navbar-in");
	}
	//next
	if(layout.indexOf(curURL) < layout.length-1){
		var nextPage = layout[layout.indexOf(curURL) + 1];
		$("<a id='nextpage' />").attr("href", nextPage).html((pageName[nextPage] || nextPage)+" &raquo;").appendTo("#navbar-in");
	}
	$("<div id='navpage' />").appendTo("#navbar").delegate(".navpage", mouseover, function(){
		$("#pagename").html(pageName[$(this).attr("href")]);
	}).bind(mouseout, function(){
		$("#pagename").html(pageName[curURL]);
	});
	$.each(layout, function(k,v){
		var ele = $("<a class='navpage' />").text(k+1).attr("href", v).appendTo("#navpage");
		if(v == curURL){
			ele.addClass("navcurrentpage");
		}
	});
	if(is_mobile()){
		$("#navbar").addClass("mobile");
	}
});

})();