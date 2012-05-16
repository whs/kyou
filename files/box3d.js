!(function(){

if(!THREE){
	throw("Three.js is not loaded!");
}

var isWebGL = (function(){
	try{
		return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
	}catch(e){
		return false;
	}
})();
if(window["_gaq"]){
	_gaq.push(['_setCustomVar', 2, 'Renderer', isWebGL ? "WebGL" : "Canvas", 2]);
}

window.box3d_draw = function(target, opt){
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(70, $(target).width() / $(target).height(), 1, 10000 );
	camera.position.z = opt.zoom || 700;
	scene.add(camera);
	var geometry = new THREE.CubeGeometry( opt.x, opt.y, opt.z, 1, 1, 1, [
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture(opt.right) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture(opt.left) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture(opt.top) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture(opt.down) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture(opt.front) } ),
		new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture(opt.back) } )
	]);

 	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
	scene.add(mesh);

	if(isWebGL){
		var renderer = new THREE.WebGLRenderer({antialias: true});
	}else{
		var renderer = new THREE.CanvasRenderer();
	}
	renderer.setSize($(target).width(), $(target).height());
	$(target).append(renderer.domElement)
	if(opt.autorotate){
		if(opt.rotable){
			$(renderer.domElement).mousedown(function(){
				$(this).data("norotate", true);
				$("img", $(this).parent()).css({webkitTransform: "translateY(300px)", transform: "translateY(300px)"});
			});
		}
	}else{
		$(renderer.domElement).data("norotate", true);
	}
	var controls = null;
	if(opt.rotable){
		controls = new THREE.TrackballControls(camera, renderer.domElement);
		$(target).css({
			position: "relative",
			overflow: "hidden"
		});
		$('<img src="files/help-3d.png">').appendTo(target).css({
			display: "block",
			position: "absolute",
			top: "70%",
			left: 300,
			zIndex: 400,
			"-webkit-transition": "-webkit-transform ease-in 500ms",
			"transition": "transform ease-in 500ms",
			"pointer-events": "none"
		});
	}
	initAnimator(renderer, scene, camera, mesh, controls);
}
function initAnimator(renderer, scene, camera, mesh, controls){
	requestAnimationFrame(function(){
		initAnimator(renderer, scene, camera, mesh, controls);
	});
	if(!$(renderer.domElement).data("norotate")){
		//mesh.rotation.x += 0.005;
		mesh.rotation.y += 0.005;
	}
	if(controls){
		controls.update();
	}
	renderer.render(scene, camera);
}

})();