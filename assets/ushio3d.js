var renderer, scene, camera, threexSparks, sparks2, controls, bg, emitter;
function windsBlow(rev){
	_.each(threexSparks.emitter()._particles, function(x){
		x.velocity.z += 100 * (rev?-1:1);
	});
}
function blast(){
	windsBlow();
	sparks2 = new THREEx.Sparks({
		maxParticles	: 5000,
		counter			: new SPARKS.ShotCounter(100)
	});
	scene.add(sparks2.container());

	var emitter	= sparks2.emitter();

	var initColorSize	= function(){
		this.initialize = function( emitter, particle ){
			particle.target.color().setHSV(0.2,0.5,0.4);
			particle.target.size(50);
		};
	};


	emitter.addInitializer(new initColorSize());
	emitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( new THREE.Vector3(0,0,-100) ) ) );
	emitter.addInitializer(new SPARKS.Lifetime(0,120));
	emitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,0,50))));

	emitter.addAction(new SPARKS.Age());
	emitter.addAction(new SPARKS.Move());
	emitter.addAction(new SPARKS.RandomDrift(500,500,300));
	emitter.start();

	emitter.update(0.2);
}
$(function(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(70, $("#sparks").width() / $("#sparks").height(), 1, 10000 );
	camera.position.z = 10;
	scene.add(camera);

	threexSparks	= new THREEx.Sparks({
		maxParticles	: 5000,
		counter			: new SPARKS.SteadyCounter(10)
	});
	scene.add(threexSparks.container());

	emitter	= threexSparks.emitter();

	var initColorSize	= function(){
		this.initialize = function( emitter, particle ){
			particle.target.color().setHSV(0.6,0.5,0.4);
			particle.target.size(150);
		};
	};


	emitter.addInitializer(new initColorSize());
	emitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( new THREE.Vector3(0,-100,-100) ) ) );
	emitter.addInitializer(new SPARKS.Lifetime(0,120));
	emitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,10,10))));

	emitter.addAction(new SPARKS.Age());
	emitter.addAction(new SPARKS.Move());
	emitter.addAction(new SPARKS.RandomDrift(300,-50,500));
	emitter.start();

	for(var i=0;i<=200; i++){
		//emitter.createParticle();
		emitter.update(0.1);
	}

	// Background
	if(bgImg){
		bg = new THREE.Mesh(new THREE.PlaneGeometry($("#sparks").width(), $("#sparks").height()), new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture(bgImg)
		}));
		bg.position.set(camera.position.x, camera.position.y, -400);
		scene.add(bg);
		new TWEEN.Tween(bg.position).to({ z: -500 }, 1000).easing(TWEEN.Easing.Quadratic.EaseInOut).start();
	}

	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setSize($("#sparks").width(), $("#sparks").height());
	$("#sparks").append(renderer.domElement);


	// Post Processing Filters	
	effectVignette = new THREE.ShaderPass( THREE.ShaderExtras[ "vignette" ] );
	effectVignette.uniforms[ "offset" ].value = 0.3;
	effectVignette.uniforms[ "darkness" ].value = 10;
	

	var renderScene = new THREE.RenderPass( scene, camera );

	composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderScene );
	composer.addPass( effectVignette );
	
	effectVignette.renderToScreen = true;

	//controls = new THREE.TrackballControls(camera, renderer.domElement);

	animate();
});
function animate() {
	requestAnimationFrame(animate);
	render();
}
function render() {
	threexSparks	&& threexSparks.update();
	sparks2	&& sparks2.update();
	//controls.update();
	TWEEN.update();
	//renderer.render( scene, camera );
	renderer.clear();
	composer.render( 0.1 );
}