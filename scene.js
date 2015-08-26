if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var loader;

var camera, cameraTarget, controls, scene, renderer;

init();
animate();

function init() {

  var previewDiv = document.getElementById("preview");

  camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
  camera.position.set( 3, 2, 3 );

  cameraTarget = new THREE.Vector3( 0, 0, 0 );

  controls = new THREE.OrbitControls( camera );
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 2;
  controls.maxDistance = 6;
  controls.noPan = true;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xdae1e6, 2, 15 );



  // Reflection

  var path = "textures/reflection/";
  var format = '.jpg';

  var urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
  ];

  var envMap = THREE.ImageUtils.loadTextureCube( urls, THREE.CubeReflectionMapping );



  // Ground

  var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 40, 40 ),
    new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
  );
  plane.rotation.x = -Math.PI/2;
  plane.position.y = 0;
  scene.add( plane );

  plane.receiveShadow = true;




  /* motivdruck */

  var motivdruck = new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xffffff, shininess: 50 } );



  /* liniar */

  var liniarBumpMap =  THREE.ImageUtils.loadTexture('textures/liniar.png', {}, function(){});
  liniarBumpMap.anisotropy = 16;
  liniarBumpMap.wrapS = liniarBumpMap.wrapT = THREE.RepeatWrapping;
  liniarBumpMap.repeat.set( 5, 5 );

  var liniarMap = THREE.ImageUtils.loadTexture( 'textures/liniar.jpg' );
  liniarMap.anisotropy = 16;
  liniarMap.wrapS = liniarMap.wrapT = THREE.RepeatWrapping;
  liniarMap.repeat.set( 5, 5 );

  var liniar = {

  "schwarz": 	new THREE.MeshPhongMaterial( {color: 0x222222, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),
  "polarweiss": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),
  "silber": 	new THREE.MeshPhongMaterial( {color: 0xf5f5f5, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),
  "ultramarin": 	new THREE.MeshPhongMaterial( {color: 0x3A4595, emissive: 0x222222, specular: 0x222222, shininess: 20, bumpMap: liniarBumpMap, map: liniarMap } ),

  }


  /* Metallic */

  var metallicMap = THREE.ImageUtils.loadTexture( 'textures/metallic.jpg' );
  metallicMap.anisotropy = 16;
  metallicMap.wrapS = metallicMap.wrapT = THREE.RepeatWrapping;
  metallicMap.repeat.set( 5, 5 );

  var metallic = {

  "kristall": 	new THREE.MeshPhongMaterial( {color: 0xfbfbfd, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "aluminium": 	new THREE.MeshPhongMaterial( {color: 0xeff0f5, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "mineral": 	new THREE.MeshPhongMaterial( {color: 0x898f9f, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "platin": 	new THREE.MeshPhongMaterial( {color: 0x484a56, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "polar": 	new THREE.MeshPhongMaterial( {color: 0x353945, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "basalt": 	new THREE.MeshPhongMaterial( {color: 0x353535, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "patina": 	new THREE.MeshPhongMaterial( {color: 0x474040, emissive: 0x222222, specular: 0x222222, shininess: 20, map: metallicMap } ),
  "sandgold": 	new THREE.MeshPhongMaterial( {color: 0xa48a5a, emissive: 0x000000, specular: 0x000000, shininess: 20, map: metallicMap } )

  }



  /* Lederfaser */

  var lederfaserMap = THREE.ImageUtils.loadTexture( 'textures/lederfaser.jpg' );
  lederfaserMap.anisotropy = 16;
  lederfaserMap.wrapS = lederfaserMap.wrapT = THREE.RepeatWrapping;
  lederfaserMap.repeat.set( 5, 5 );

  var lederfaser = {

  "schwarz": 	new THREE.MeshPhongMaterial( {color: 0x222222, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "weiss": 	new THREE.MeshPhongMaterial( {color: 0xf8f8f8, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "chamois": 	new THREE.MeshPhongMaterial( {color: 0xEDE6D4, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "dunkelbraun": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "dunkelrot": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "dunkelgruen": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),
  "dunkelblau": 	new THREE.MeshPhongMaterial( {color: 0xffffff, emissive: 0x222222, specular: 0x222222, shininess: 20, map: lederfaserMap } ),

  }


  // feinleinen

  var feinleinenMap = THREE.ImageUtils.loadTexture( 'textures/feinleinen.jpg' );
  feinleinenMap.anisotropy = 16;
  feinleinenMap.wrapS = feinleinenMap.wrapT = THREE.RepeatWrapping;
  feinleinenMap.repeat.set( 5, 5 );

  var feinleinen = {

  "schwarz": 	new THREE.MeshPhongMaterial( { color: 0x222222, map: feinleinenMap, combine: THREE.MixOperation } ),
  "weiss": 	new THREE.MeshPhongMaterial( { color: 0xffffff, map: feinleinenMap, combine: THREE.MixOperation } ),
  "chamois": 	new THREE.MeshPhongMaterial( { color: 0xEDE6D4, map: feinleinenMap, combine: THREE.MixOperation } ),
  "beige": 	new THREE.MeshPhongMaterial( { color: 0xE1D3B9, map: feinleinenMap, combine: THREE.MixOperation } ),
  "sandbeige": 	new THREE.MeshPhongMaterial( { color: 0xD0C0B1, map: feinleinenMap, combine: THREE.MixOperation } ),
  "braunbeige": 	new THREE.MeshPhongMaterial( { color: 0xC7A575, map: feinleinenMap, combine: THREE.MixOperation } ),
  "goldgelb": 	new THREE.MeshPhongMaterial( { color: 0xF9D028, map: feinleinenMap, combine: THREE.MixOperation } ),
  "maisgelb": 	new THREE.MeshPhongMaterial( { color: 0xFEB501, map: feinleinenMap, combine: THREE.MixOperation } ),
  "orange": 	new THREE.MeshPhongMaterial( { color: 0xF55F01, map: feinleinenMap, combine: THREE.MixOperation } ),
  "rotbraun": 	new THREE.MeshPhongMaterial( { color: 0xD34E13, map: feinleinenMap, combine: THREE.MixOperation } ),
  "sienabraun": 	new THREE.MeshPhongMaterial( { color: 0xBA4227, map: feinleinenMap, combine: THREE.MixOperation } ),
  "naturbraun": 	new THREE.MeshPhongMaterial( { color: 0x833832, map: feinleinenMap, combine: THREE.MixOperation } ),
  "nussbraun": 	new THREE.MeshPhongMaterial( { color: 0x735E43, map: feinleinenMap, combine: THREE.MixOperation } ),
  "schokolade": 	new THREE.MeshPhongMaterial( { color: 0x423735, map: feinleinenMap, combine: THREE.MixOperation } ),
  "hellrot": 	new THREE.MeshPhongMaterial( { color: 0xE03A3A, map: feinleinenMap, combine: THREE.MixOperation } ),
  "rot": 	new THREE.MeshPhongMaterial( { color: 0xB32F3C, map: feinleinenMap, combine: THREE.MixOperation } ),
  "rosso": 	new THREE.MeshPhongMaterial( { color: 0xBC2F3F, map: feinleinenMap, combine: THREE.MixOperation } ),
  "kardinalrot": 	new THREE.MeshPhongMaterial( { color: 0x833245, map: feinleinenMap, combine: THREE.MixOperation } ),
  "weinrot": 	new THREE.MeshPhongMaterial( { color: 0x743E4B, map: feinleinenMap, combine: THREE.MixOperation } ),
  "altrosa": 	new THREE.MeshPhongMaterial( { color: 0xD1A49F, map: feinleinenMap, combine: THREE.MixOperation } ),
  "beerenrot": 	new THREE.MeshPhongMaterial( { color: 0xCB5877, map: feinleinenMap, combine: THREE.MixOperation } ),
  "purpur": 	new THREE.MeshPhongMaterial( { color: 0xE34DA4, map: feinleinenMap, combine: THREE.MixOperation } ),
  "silbergrau": 	new THREE.MeshPhongMaterial( { color: 0xC5C0C6, map: feinleinenMap, combine: THREE.MixOperation } ),
  "taubengrau": 	new THREE.MeshPhongMaterial( { color: 0xAFB6BC, map: feinleinenMap, combine: THREE.MixOperation } ),
  "titan": 	new THREE.MeshPhongMaterial( { color: 0xBAB6B5, map: feinleinenMap, combine: THREE.MixOperation } ),
  "braungrau": 	new THREE.MeshPhongMaterial( { color: 0x868581, map: feinleinenMap, combine: THREE.MixOperation } ),
  "grau": 	new THREE.MeshPhongMaterial( { color: 0x656460, map: feinleinenMap, combine: THREE.MixOperation } ),
  "anthrazit": 	new THREE.MeshPhongMaterial( { color: 0x3b3b3b, map: feinleinenMap, combine: THREE.MixOperation } ),
  "schiefergrau": 	new THREE.MeshPhongMaterial( { color: 0x2F2F37, map: feinleinenMap, combine: THREE.MixOperation } ),
  "schwarzblau": 	new THREE.MeshPhongMaterial( { color: 0x1F1F2B, map: feinleinenMap, combine: THREE.MixOperation } ),
  "pariserblau": 	new THREE.MeshPhongMaterial( { color: 0x353F58, map: feinleinenMap, combine: THREE.MixOperation } ),
  "opalblau": 	new THREE.MeshPhongMaterial( { color: 0x3A4595, map: feinleinenMap, combine: THREE.MixOperation } ),
  "hellblau": 	new THREE.MeshPhongMaterial( { color: 0xA6B7D3, map: feinleinenMap, combine: THREE.MixOperation } ),
  "mittelblau": 	new THREE.MeshPhongMaterial( { color: 0x0869AD, map: feinleinenMap, combine: THREE.MixOperation } ),
  "meerblau": 	new THREE.MeshPhongMaterial( { color: 0x6E95B6, map: feinleinenMap, combine: THREE.MixOperation } ),
  "cyan": 	new THREE.MeshPhongMaterial( { color: 0x018AD2, map: feinleinenMap, combine: THREE.MixOperation } ),
  "tuerkis": 	new THREE.MeshPhongMaterial( { color: 0x0196AA, map: feinleinenMap, combine: THREE.MixOperation } ),
  "pistazie": 	new THREE.MeshPhongMaterial( { color: 0xC4E886, map: feinleinenMap, combine: THREE.MixOperation } ),
  "bambus": 	new THREE.MeshPhongMaterial( { color: 0xD3CFAA, map: feinleinenMap, combine: THREE.MixOperation } ),
  "lindgruen": 	new THREE.MeshPhongMaterial( { color: 0x6D9E6F, map: feinleinenMap, combine: THREE.MixOperation } ),
  "apfelgruen": 	new THREE.MeshPhongMaterial( { color: 0x9EC46D, map: feinleinenMap, combine: THREE.MixOperation } ),
  "dunkelgruen": 	new THREE.MeshPhongMaterial( { color: 0x234F42, map: feinleinenMap, combine: THREE.MixOperation } ),

  }




  // Chrome

  var chrome = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      specular:0xffffff,
      envMap: envMap,
      combine: THREE.MultiplyOperation,
      shininess: 50,
      reflectivity: 1.0
  } );



  // Papier
  var paperGeometry = new THREE.BoxGeometry(1.69,0.028,1.2);
  var paperrender = new THREE.MeshPhongMaterial( { color: 0x808080 } );
  var paper = new THREE.Mesh(paperGeometry, paperrender);
  paper.castShadow = false;
  paper.receiveShadow = true;
  paper.position.set( 0, 0.012, 0.85 );
  scene.add(paper);



  // basis
  var basisGeometry = new THREE.BoxGeometry(1.8,0.012,3);
  var basis = new THREE.Mesh(basisGeometry, metallic[ "sandgold" ]);
  basis.castShadow = false;
  basis.receiveShadow = true;
  basis.position.set( 0, 0, 0 );
  scene.add(basis);





   // // 2 Ring
   //  var loader = new THREE.JSONLoader();
   //  loader.load('/models/2ring.js', function(geo, mat){
   //
   //      var mesh = new THREE.Mesh(geo, chrome);
   //
   //      mesh.position.set( 0.07, 0.012, -0.2 );
   //      mesh.rotation.set( 0, - Math.PI / 0.67, 0 );
   //      mesh.scale.set( 0.085, 0.085, 0.085 );
   //      mesh.castShadow = true;
   //      mesh.receiveShadow = true;
   //
   //      loadJson(mesh );
   //  });
   //
   //   function loadJson(mesh){
   //       scene.add( mesh );
   //   }



   // 4 Ring
    var loader = new THREE.JSONLoader();
    loader.load('/models/4ring.js', function(geo, mat){

        var mesh = new THREE.Mesh(geo, chrome);

        mesh.position.set( -0.015, 0.005, -0.2 );
        mesh.rotation.set( 0, - Math.PI / 0.67, 0 );
        mesh.scale.set( 0.095, 0.095, 0.095 );
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        loadJson(mesh );
    });

     function loadJson(mesh){
         scene.add( mesh );
     }





   //
   // // Hebelmechanik
   //  var loader = new THREE.JSONLoader();
   //  loader.load('/models/hebelmechanik.js', function(geo, mat){
   //
   //      var mesh = new THREE.Mesh(geo, chrome);
   //
   //      mesh.position.set( 0, 0.012, -0.2 );
   //      mesh.rotation.set( 0, - Math.PI / 0.67, 0 );
   //      mesh.scale.set( 0.12, 0.12, 0.12 );
   //      mesh.castShadow = true;
   //      mesh.receiveShadow = true;
   //
   //      loadJson(mesh );
   //  });
   //
   //   function loadJson(mesh){
   //       scene.add( mesh );
   //   }
   //
   //


   //
   //   // Hebelmechanik Extra
   //    var loader = new THREE.JSONLoader();
   //    loader.load('/models/hebelmechanik-extra.js', function(geo, mat){
   //        var plastik = new THREE.MeshPhongMaterial( { color: 0x000000 } );
   //        var mesh = new THREE.Mesh(geo, plastik);
   //
   //        mesh.position.set( 0, 0.012, -0.2 );
   //        mesh.rotation.set( 0, - Math.PI / 0.67, 0 );
   //        mesh.scale.set( 0.12, 0.12, 0.12 );
   //        mesh.castShadow = true;
   //        mesh.receiveShadow = true;
   //
   //        loadJson(mesh );
   //    });
   //
   //     function loadJson(mesh){
   //         scene.add( mesh );
   //     }
   //
   //



   //
   //   // Schnellheftung
   //    var loader = new THREE.JSONLoader();
   //    loader.load('/models/schnellheftung.js', function(geo, mat){
   //
   //        var mesh = new THREE.Mesh(geo, chrome);
   //
   //        mesh.position.set( 0, 0.012, -0.2 );
   //        mesh.rotation.set( 0, - Math.PI / 0.67, 0 );
   //        mesh.scale.set( 0.15, 0.15, 0.15 );
   //        mesh.castShadow = true;
   //        mesh.receiveShadow = true;
   //
   //        loadJson(mesh );
   //    });
   //
   //     function loadJson(mesh){
   //         scene.add( mesh );
   //     }




   //
   // // Klemmmechanik
   //  var loader = new THREE.JSONLoader();
   //  loader.load('/models/klemmmechanik.js', function(geo, mat){
   //
   //      var mesh = new THREE.Mesh(geo, chrome);
   //
   //      mesh.position.set( -0.65, 0.012, -0.7 );
   //      mesh.rotation.set( 0, - Math.PI / 0.67, 0 );
   //      mesh.scale.set( 0.10, 0.10, 0.10 );
   //      mesh.castShadow = true;
   //      mesh.receiveShadow = true;
   //
   //      loadJson(mesh );
   //  });
   //
   //   function loadJson(mesh){
   //       scene.add( mesh );
   //   }




   // Lights
  scene.add( new THREE.AmbientLight( 0x777777 ) );
  addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
  addShadowedLight( 0.5, 1, -1, 0xffffff, 1 );

  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( scene.fog.color );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapCullFace = THREE.CullFaceBack;
  previewDiv.appendChild (renderer.domElement);

  // resize
  window.addEventListener( 'resize', onWindowResize, false );

}

function addShadowedLight( x, y, z, color, intensity ) {

  var directionalLight = new THREE.DirectionalLight( color, intensity );
  directionalLight.position.set( x, y, z )
  scene.add( directionalLight );

  directionalLight.castShadow = true;
  // directionalLight.shadowCameraVisible = true;

  var d = 1;
  directionalLight.shadowCameraLeft = -d;
  directionalLight.shadowCameraRight = d;
  directionalLight.shadowCameraTop = d;
  directionalLight.shadowCameraBottom = -d;

  directionalLight.shadowCameraNear = 1;
  directionalLight.shadowCameraFar = 4;

  directionalLight.shadowMapWidth = 2048;
  directionalLight.shadowMapHeight = 2048;

  directionalLight.shadowBias = -0.005;
  directionalLight.shadowDarkness = 0.15;

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  render();
}

function render() {

  camera.lookAt( cameraTarget );
  controls.update();

  renderer.render( scene, camera );

}
