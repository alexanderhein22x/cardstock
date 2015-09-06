

			var container;
			var camera, scene, projector, renderer;
			var mesh, geo, smooth;

			var obj = {};

			init();
			animate();

			window.onload = function() {
				obj.divisions = 0;
				obj.wireframe = false;

				var gui = new DAT.GUI();

				gui.name('Subdivision Subsurface');
				gui.add(obj, 'divisions', 0, 4, 1).onChange(function(newValue) {

				   if ( smooth ) {
				   	  scene.remove( smooth );
				   	  scene.remove( mesh );
				   }

				   addFlashlight(geo, newValue, obj.wireframe);

				});
				gui.add(obj, 'wireframe').onChange(function(newValue) {

					if(newValue) {
						mesh.material.wireframe = true;
					} else {
						mesh.material.wireframe = false;
					}

				});
			}

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				//

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.y = 300;

				camera.target = new THREE.Vector3( 0, 0, 0 );

				scene = new THREE.Scene();
				var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

				var ambient = new THREE.AmbientLight( 0x444444 );
				scene.add( ambient );

				var light = new THREE.SpotLight( 0xffffff, 3 );
				light.position.set( 0, 1500, 1000 );
				light.target.position.set( 0, 0, 0 );
				light.castShadow = true;
				scene.add( light );

				var loader = new THREE.JSONLoader( true );
				loader.load( { model: "js/flashlight.js", callback: function( geometry ) {

					geo = geometry;
					addFlashlight(geometry, 0, false);

					var l1 = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) );
					l1.position.set(0,0,-280);
					l1.scale.set(10,10,10)
					scene.add( l1 );

					var flashLight = new THREE.SpotLight( 0xffffff, 8);
					flashLight.position.set(0,0,-280);

					scene.add( flashLight );

				} } );

				//

				renderer = new THREE.WebGLRenderer();
				renderer.sortObjects = false;
				renderer.setSize( window.innerWidth, window.innerHeight );



				container.appendChild(renderer.domElement);

			}

			function addFlashlight(geometry, divisions, wireframe) {

				smooth = THREE.GeometryUtils.clone( geometry );
				smooth.mergeVertices();

				var modifier = new THREE.SubdivisionModifier(divisions);
				modifier.modify( smooth );

				mesh = new THREE.Mesh( smooth, new THREE.MeshPhongMaterial( { color: 0x222222, wireframe:wireframe } ) );
				mesh.scale.set( 100,100,100 );
				mesh.position.set(0,0,-100);
				mesh.castShadow = true;
  				mesh.receiveShadow = true;

				scene.add( mesh );
			}

			//

			function animate() {
				requestAnimationFrame( animate );
				render();
			}

			var radius = 600;
			var theta = 0;

			var duration = 1000;
			var keyframes = 15 /*16*/, interpolation = duration / keyframes;
			var lastKeyframe = 0, currentKeyframe = 0;

			function render() {

				theta += 0.7;

				camera.position.x = radius * Math.sin( theta * Math.PI / 360 );
				camera.position.z = radius * Math.cos( theta * Math.PI / 360 );

				camera.lookAt( camera.target );

				renderer.render( scene, camera );

			}
