
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var WIDTH = 1590;
var HEIGHT = 580;

// camera
var VIEW_ANGLE = 10;
var ASPECT = WIDTH / HEIGHT;
var NEAR = 1;
var FAR = 20;

var loader = new THREE.JSONLoader();

var groundMirror;

var camera, cameraTarget, controls, scene, renderer;


init();
fillScene();
update();
animate();

function init() {

  var previewDiv = document.getElementById("canvas");

  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.set( 3, 2, 3 );

  cameraTarget = new THREE.Vector3( 0, 0, 0 );

  controls = new THREE.OrbitControls( camera, previewDiv );
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 3;
  controls.maxDistance = 7;
  controls.noPan = false;

  scene = new THREE.Scene();


   // Lights
   scene.add( new THREE.AmbientLight( 0x777777 ) );
   addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
   addShadowedLight( 0.5, 1, -1, 0xffffff, 1 );

  // renderer

  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  renderer.setClearColor( 0xeaeaec );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( WIDTH, HEIGHT );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapCullFace = THREE.CullFaceBack;

  // resize
  window.addEventListener( 'resize', onWindowResize, false );

  function onWindowResize(){

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

  }

}

function addShadowedLight( x, y, z, color, intensity ) {

  var directionalLight = new THREE.DirectionalLight( color, intensity );
  directionalLight.position.set( x, y, z )
  scene.add( directionalLight );

  directionalLight.castShadow = true;
  // directionalLight.shadowCameraVisible = true;

  var d = 2;
  directionalLight.shadowCameraLeft = -d;
  directionalLight.shadowCameraRight = d;
  directionalLight.shadowCameraTop = d;
  directionalLight.shadowCameraBottom = -d;

  directionalLight.shadowCameraNear = 0.01;
  directionalLight.shadowCameraFar = 4;

  directionalLight.shadowMapWidth = 2048;
  directionalLight.shadowMapHeight = 2048;

  directionalLight.shadowBias = -0.005;
  directionalLight.shadowDarkness = 0.15;

}



function fillScene() {


  /* liniarMAP */

  var liniarBumpMap =  THREE.ImageUtils.loadTexture('textures/liniar.png', {}, function(){});
  liniarBumpMap.anisotropy = 16;
  liniarBumpMap.wrapS = liniarBumpMap.wrapT = THREE.RepeatWrapping;
  liniarBumpMap.repeat.set( 5, 5 );

  var liniarMap = THREE.ImageUtils.loadTexture( 'textures/liniar.jpg' );
  liniarMap.anisotropy = 16;
  liniarMap.wrapS = liniarMap.wrapT = THREE.RepeatWrapping;
  liniarMap.repeat.set( 5, 5 );


  /* MetallicMAP */

  var metallicMap = THREE.ImageUtils.loadTexture( 'textures/metallic.jpg' );
  metallicMap.anisotropy = 16;
  metallicMap.wrapS = metallicMap.wrapT = THREE.RepeatWrapping;
  metallicMap.repeat.set( 5, 5 );


  /* LederfaserMAP */

  var lederfaserMap = THREE.ImageUtils.loadTexture( 'textures/lederfaser.jpg' );
  lederfaserMap.anisotropy = 16;
  lederfaserMap.wrapS = lederfaserMap.wrapT = THREE.RepeatWrapping;
  lederfaserMap.repeat.set( 5, 5 );


  // FeinleinenMAP

  var feinleinenMap = THREE.ImageUtils.loadTexture( 'textures/feinleinen.jpg' );
  feinleinenMap.anisotropy = 16;
  feinleinenMap.wrapS = feinleinenMap.wrapT = THREE.RepeatWrapping;
  feinleinenMap.repeat.set( 8, 8 );


  var material = {

  /* feinleinen */
  "feinleinen-schwarz": 	new THREE.MeshPhongMaterial( { color: 0x222222, map: feinleinenMap, combine: THREE.MixOperation} ),
  "feinleinen-weiss": 	new THREE.MeshPhongMaterial( { color: 0xffffff, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-chamois": 	new THREE.MeshPhongMaterial( { color: 0xEDE6D4, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-beige": 	new THREE.MeshPhongMaterial( { color: 0xE1D3B9, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-sandbeige": 	new THREE.MeshPhongMaterial( { color: 0xD0C0B1, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-braunbeige": 	new THREE.MeshPhongMaterial( { color: 0xC7A575, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-goldgelb": 	new THREE.MeshPhongMaterial( { color: 0xF9D028, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-maisgelb": 	new THREE.MeshPhongMaterial( { color: 0xFEB501, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-orange": 	new THREE.MeshPhongMaterial( { color: 0xF55F01, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-rotbraun": 	new THREE.MeshPhongMaterial( { color: 0xD34E13, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-sienabraun": 	new THREE.MeshPhongMaterial( { color: 0xBA4227, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-naturbraun": 	new THREE.MeshPhongMaterial( { color: 0x833832, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-nussbraun": 	new THREE.MeshPhongMaterial( { color: 0x735E43, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-schokolade": 	new THREE.MeshPhongMaterial( { color: 0x423735, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-hellrot": 	new THREE.MeshPhongMaterial( { color: 0xE03A3A, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-rot": 	new THREE.MeshPhongMaterial( { color: 0xB32F3C, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-rosso": 	new THREE.MeshPhongMaterial( { color: 0xBC2F3F, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-kardinalrot": 	new THREE.MeshPhongMaterial( { color: 0x833245, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-weinrot": 	new THREE.MeshPhongMaterial( { color: 0x743E4B, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-altrosa": 	new THREE.MeshPhongMaterial( { color: 0xD1A49F, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-beerenrot": 	new THREE.MeshPhongMaterial( { color: 0xCB5877, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-purpur": 	new THREE.MeshPhongMaterial( { color: 0xE34DA4, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-silbergrau": 	new THREE.MeshPhongMaterial( { color: 0xC5C0C6, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-taubengrau": 	new THREE.MeshPhongMaterial( { color: 0xAFB6BC, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-titan": 	new THREE.MeshPhongMaterial( { color: 0xBAB6B5, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-braungrau": 	new THREE.MeshPhongMaterial( { color: 0x868581, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-grau": 	new THREE.MeshPhongMaterial( { color: 0x656460, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-anthrazit": 	new THREE.MeshPhongMaterial( { color: 0x3b3b3b, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-schiefergrau": 	new THREE.MeshPhongMaterial( { color: 0x2F2F37, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-schwarzblau": 	new THREE.MeshPhongMaterial( { color: 0x1F1F2B, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-pariserblau": 	new THREE.MeshPhongMaterial( { color: 0x353F58, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-opalblau": 	new THREE.MeshPhongMaterial( { color: 0x3A4595, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-hellblau": 	new THREE.MeshPhongMaterial( { color: 0xA6B7D3, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-mittelblau": 	new THREE.MeshPhongMaterial( { color: 0x0869AD, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-meerblau": 	new THREE.MeshPhongMaterial( { color: 0x6E95B6, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-cyan": 	new THREE.MeshPhongMaterial( { color: 0x018AD2, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-tuerkis": 	new THREE.MeshPhongMaterial( { color: 0x0196AA, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-pistazie": 	new THREE.MeshPhongMaterial( { color: 0xC4E886, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-bambus": 	new THREE.MeshPhongMaterial( { color: 0xD3CFAA, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-lindgruen": 	new THREE.MeshPhongMaterial( { color: 0x6D9E6F, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-apfelgruen": 	new THREE.MeshPhongMaterial( { color: 0x9EC46D, map: feinleinenMap, combine: THREE.MixOperation } ),
  "feinleinen-dunkelgruen": 	new THREE.MeshPhongMaterial( { color: 0x234F42, map: feinleinenMap, combine: THREE.MixOperation } ),

  /* liniar */
  "liniar-schwarz": 	new THREE.MeshPhongMaterial( {color: 0x222222, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),
  "liniar-polarweiss": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),
  "liniar-silber": 	new THREE.MeshPhongMaterial( {color: 0xf5f5f5, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),
  "liniar-ultramarin": 	new THREE.MeshPhongMaterial( {color: 0x3A4595, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),

  /* motivdruck */
  "motivdruck-weiss": 	new THREE.MeshPhongMaterial( {color: 0xffffff, specular:0xffffff, shininess: 50 } ),

  /* lederfaser */
  "lederfaser-schwarz": 	new THREE.MeshPhongMaterial( {color: 0x222222, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "lederfaser-weiss": 	new THREE.MeshPhongMaterial( {color: 0xf8f8f8, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "lederfaser-chamois": 	new THREE.MeshPhongMaterial( {color: 0xEDE6D4, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "lederfaser-dunkelbraun": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "lederfaser-dunkelrot": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "lederfaser-dunkelgruen": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "lederfaser-dunkelblau": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),

  /* metallic */
  "metallic-kristall": 	new THREE.MeshPhongMaterial( {color: 0xfbfbfd, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "metallic-aluminium": 	new THREE.MeshPhongMaterial( {color: 0xeff0f5, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "metallic-mineral": 	new THREE.MeshPhongMaterial( {color: 0x898f9f, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "metallic-platin": 	new THREE.MeshPhongMaterial( {color: 0x484a56, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "metallic-polar": 	new THREE.MeshPhongMaterial( {color: 0x353945, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "metallic-basalt": 	new THREE.MeshPhongMaterial( {color: 0x353535, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "metallic-patina": 	new THREE.MeshPhongMaterial( {color: 0x474040, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "metallic-sandgold": 	new THREE.MeshPhongMaterial( {color: 0xa48a5a, emissive: 0x000000, specular: 0x000000, shininess: 20, map: metallicMap } )

  }

  /* Chrome reflection */

  var path = "textures/reflection/";
  var format = '.jpg';

  var urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
  ];

  var envMap = THREE.ImageUtils.loadTextureCube( urls, THREE.CubeReflectionMapping );

  var chrome = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      specular:0xffffff,
      envMap: envMap,
      combine: THREE.MultiplyOperation,
      shininess: 50,
      reflectivity: 1.0
  } );

  // Basis - mirror effect

  // var mirror = new THREE.PlaneBufferGeometry( 40, 40 );
  //
  // groundMirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH * 2, textureHeight: HEIGHT * 2, color: 0x858588 } );
  //
  // var mirrorMesh = new THREE.Mesh( mirror, groundMirror.material );
  // mirrorMesh.add( groundMirror );
  // mirrorMesh.rotateX( - Math.PI / 2 );
  // scene.add( mirrorMesh );



  var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 40, 40 ),
    new THREE.MeshBasicMaterial( { color: 0xd8d8db, transparent: true, opacity: 0.9 } )
  );
  plane.rotation.x = -Math.PI/2;
  plane.position.y = 0;
  scene.add( plane );
  plane.receiveShadow = true;



  var group = new THREE.Group();


      // Geschlossen
       loader.load('/models/closed.js', function(geometry){
         var closed = new THREE.Mesh(geometry, material[ "feinleinen-schwarz" ]);
         closed.position.set( 0, 0.002, 0 );
         closed.rotation.set( 0, - Math.PI / 0.67, 0 );
         closed.scale.set( 0.085, 0.085, 0.085 );
         closed.castShadow = true;
         closed.receiveShadow = true;
         closed.name = "color-outside";
         group.add( closed );
       });

       // Geschlossen Innenfarbe
        loader.load('/models/closedinside.js', function(geometry){
          var closedinside = new THREE.Mesh(geometry, material[ "feinleinen-schiefergrau" ]);
          closedinside.position.set( 0, 0.002, 0 );
          closedinside.rotation.set( 0, - Math.PI / 0.67, 0 );
          closedinside.scale.set( 0.085, 0.085, 0.085 );
          closedinside.castShadow = true;
          closedinside.receiveShadow = false;
          closedinside.name = "color-inside";
          group.add( closedinside );
        });


        // Basis
         loader.load('/models/basis.js', function(geometry){
           var basis = new THREE.Mesh(geometry, material[ "feinleinen-schwarz" ]);
           basis.position.set( 0, 0.002, 0 );
           basis.rotation.set( 0, - Math.PI / 0.67, 0 );
           basis.scale.set( 0.085, 0.085, 0.085 );
           basis.castShadow = true;
           basis.receiveShadow = true;
           basis.name = "color-outside";
           group.add( basis );
         });

         // Innenfarbe
          loader.load('/models/inside.js', function(geometry){
            var basisinside = new THREE.Mesh(geometry, material[ "feinleinen-schiefergrau" ]);
            basisinside.position.set( 0, 0.002, 0 );
            basisinside.rotation.set( 0, - Math.PI / 0.67, 0 );
            basisinside.scale.set( 0.085, 0.085, 0.085 );
            basisinside.castShadow = true;
            basisinside.receiveShadow = true;
            basisinside.name = "color-inside";
            group.add( basisinside );
          });

          // 2 Ring
           loader.load('/models/2ring.js', function(geometry){
             var ring = new THREE.Mesh(geometry, chrome);
             ring.position.set( 0, 0.002, 0 );
             ring.rotation.set( 0, - Math.PI / 0.67, 0 );
             ring.scale.set( 0.085, 0.085, 0.085 );
             ring.castShadow = true;
             ring.receiveShadow = true;
             ring.name = "ring";
             group.add( ring );
           });


         // metallecken
          loader.load('/models/metallecken.js', function(geometry){
            var metallecken = new THREE.Mesh(geometry, chrome);
            metallecken.position.set( 0, 0.002, 0 );
            metallecken.rotation.set( 0, - Math.PI / 0.67, 0 );
            metallecken.scale.set( 0.085, 0.085, 0.085 );
            metallecken.castShadow = true;
            metallecken.receiveShadow = true;
            metallecken.name = "metallecken";
            group.add( metallecken );
          });


  scene.add( group );

  function colorTo (target, value){
      var target = scene.getObjectByName(target);
      var initial = new THREE.Color(target.material.color.getHex());
      var value = new THREE.Color(value.color.getHex());
      var tween = new TWEEN.Tween(initial).to(value, 500)
          .easing(TWEEN.Easing.Cubic.InOut)
          .onUpdate(function(){
              target.material.color = initial;
          })
          .start();
  }


  $("input[name=color-inside]").change(function(event){
  	if ($(this.checked)) {
      	var targetColor = $(this).data("visual");
          colorTo("color-inside", material[targetColor]);
      }
  });

  $("input[name=color-outside]").change(function(event){
  	if ($(this.checked)) {
      	var targetColor = $(this).data("visual");
          colorTo("color-outside", material[targetColor]);
      }
  });

}

function animate() {

  requestAnimationFrame(animate);
  TWEEN.update();
  renderer.render(scene, camera);

}


function render() {

  // groundMirror.render();
  camera.lookAt( cameraTarget );
  controls.update();
  renderer.render( scene, camera );

}

function update() {

  requestAnimationFrame( update );
  render();

}



/* jQuery */
