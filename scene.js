

var container;

var WIDTH = 1590;
var HEIGHT = 580;

// camera
var VIEW_ANGLE = 10;
var ASPECT = WIDTH / HEIGHT;
var NEAR = 1;
var FAR = 20;

var loader = new THREE.JSONLoader();

var camera, cubeCamera, cameraTarget, controls, scene, renderer;

// Chrome
var chromeMap = THREE.ImageUtils.loadTexture( 'textures/chrome.jpg', THREE.UVMapping, function (){});
var chromeSpecMap =  THREE.ImageUtils.loadTexture('textures/chromescratched.jpg' );
chromeSpecMap.anisotropy = 16;
chromeSpecMap.wrapS = chromeSpecMap.wrapT = THREE.RepeatWrapping;
chromeSpecMap.repeat.set( 8, 8 );

// Material Liniar
var liniarBumpMap =  THREE.ImageUtils.loadTexture('textures/liniar.png', {}, function(){});
liniarBumpMap.anisotropy = 16;
liniarBumpMap.wrapS = liniarBumpMap.wrapT = THREE.RepeatWrapping;
liniarBumpMap.repeat.set( 5, 5 );

var liniarMap = THREE.ImageUtils.loadTexture( 'textures/liniar.jpg' );
liniarMap.anisotropy = 16;
liniarMap.wrapS = liniarMap.wrapT = THREE.RepeatWrapping;
liniarMap.repeat.set( 5, 5 );

// Material Metallic
var metallicMap = THREE.ImageUtils.loadTexture( 'textures/metallic.jpg' );
metallicMap.anisotropy = 16;
metallicMap.wrapS = metallicMap.wrapT = THREE.RepeatWrapping;
metallicMap.repeat.set( 5, 5 );

// Material Lederfaser
var lederfaserMap = THREE.ImageUtils.loadTexture( 'textures/lederfaser.jpg' );
lederfaserMap.anisotropy = 16;
lederfaserMap.wrapS = lederfaserMap.wrapT = THREE.RepeatWrapping;
lederfaserMap.repeat.set( 10, 10 );



// Material Feinleinen
var feinleinenMap = THREE.ImageUtils.loadTexture( 'textures/feinleinen.jpg' );
feinleinenMap.anisotropy = 16;
feinleinenMap.wrapS = feinleinenMap.wrapT = THREE.RepeatWrapping;
feinleinenMap.repeat.set( 8, 8 );


var rueckenschildMap = THREE.ImageUtils.loadTexture( 'textures/rueckenschild.jpg' );


  init();
  setupControls();
  update();
  animate();




function init() {

  var previewDiv = document.getElementById("canvas");

  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.set( 3, 2, 3 );

  controls = new THREE.OrbitControls( camera, previewDiv );
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 3;
  controls.maxDistance = 7;
  controls.noPan = true;

  scene = new THREE.Scene();


   // Lights
   scene.add( new THREE.AmbientLight( 0x777777 ) );
   addShadowedLight( 1, 1, 1, 0xffffff, 1 );
   addShadowedLight( 0.5, 1, -1, 0xffffff, 1 );


   var mesh = new THREE.Mesh( new THREE.SphereGeometry( 200, 60, 40 ), new THREE.MeshBasicMaterial( { map: chromeMap } ) );
   mesh.scale.x = -1;
   scene.add( mesh );

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


  cubeCamera = new THREE.CubeCamera( 1, 600, 256 );
  cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
  scene.add( cubeCamera );




  var material = {

  /* chrome */
  "chrome": 	new THREE.MeshPhongMaterial( { envMap: cubeCamera.renderTarget, shininess: 100, color: 0xffffff, emissive: 0xffffff,  specularMap: chromeSpecMap, combine: THREE.MixOperation  } ),

  /* plastik */
  "plastik": 	new THREE.MeshPhongMaterial( { color: 0x222222 } ),

  /* transparente folie */
  "transparent": 	new THREE.MeshPhongMaterial( { transparent: true, opacity: 0.3, color: 0xffffff, reflectivity: 0.5 }),

  /* Rückenschild */
  "rueckenschild": 	new THREE.MeshPhongMaterial( { color: 0xffffff, map: rueckenschildMap, combine: THREE.MixOperation } ),

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
  "lederfaser-schwarz": 	new THREE.MeshPhongMaterial( {color: 0x222222, map: lederfaserMap } ),
  "lederfaser-weiss": 	new THREE.MeshPhongMaterial( {color: 0xf8f8f8, map: lederfaserMap } ),
  "lederfaser-chamois": 	new THREE.MeshPhongMaterial( {color: 0xEDE6D4, map: lederfaserMap } ),
  "lederfaser-dunkelbraun": 	new THREE.MeshPhongMaterial( {color: 0xffffff, map: lederfaserMap } ),
  "lederfaser-dunkelrot": 	new THREE.MeshPhongMaterial( {color: 0xffffff, map: lederfaserMap } ),
  "lederfaser-dunkelgruen": 	new THREE.MeshPhongMaterial( {color: 0xffffff, map: lederfaserMap } ),
  "lederfaser-dunkelblau": 	new THREE.MeshPhongMaterial( {color: 0xffffff, map: lederfaserMap } ),

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

  // Basis

  var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 40, 40 ),
    new THREE.MeshBasicMaterial( { color: 0xd8d8db, transparent: true, opacity: 0.9 } )
  );
  plane.rotation.x = -Math.PI/2;
  plane.position.y = 0;
  scene.add( plane );
  plane.receiveShadow = true;



    var group = new THREE.Object3D;


        // Geschlossen
         loader.load('/models/basis/geschlossen.js', function(geometry){
           var geschlossen = new THREE.Mesh(geometry, material[ "lederfaser-schwarz" ]);
           geschlossen.position.set( 0, 0.002, 0 );
           geschlossen.rotation.set( 0, - Math.PI / 0.67, 0 );
           geschlossen.scale.set( 0.085, 0.085, 0.085 );
           geschlossen.castShadow = true;
           geschlossen.receiveShadow = true;
           geschlossen.name = "color-outside";
           group.add( geschlossen );
         });

         // Geschlossen Innenfarbe
          loader.load('/models/basis/geschlossen-innen.js', function(geometry){
            var geschlosseninnen = new THREE.Mesh(geometry, material[ "feinleinen-schiefergrau" ]);
            geschlosseninnen.position.set( 0, 0.002, 0 );
            geschlosseninnen.rotation.set( 0, - Math.PI / 0.67, 0 );
            geschlosseninnen.scale.set( 0.085, 0.085, 0.085 );
            geschlosseninnen.castShadow = true;
            geschlosseninnen.receiveShadow = true;
            geschlosseninnen.name = "color-inside";
            group.add( geschlosseninnen );
          });


          // Basis
           loader.load('/models/basis/offen.js', function(geometry){
             var offen = new THREE.Mesh(geometry, material[ "feinleinen-schwarz" ]);
             offen.position.set( 0, 0.002, 0 );
             offen.rotation.set( 0, - Math.PI / 0.67, 0 );
             offen.scale.set( 0.085, 0.085, 0.085 );
             offen.castShadow = true;
             offen.receiveShadow = true;
             offen.name = "color-outside";
             group.add( offen );
           });

           // Innenfarbe
           loader.load('/models/basis/offen-innenfarbe.js', function(geometry){
              var offeninnen = new THREE.Mesh(geometry, material[ "feinleinen-schiefergrau" ]);
              offeninnen.position.set( 0, 0.002, 0 );
              offeninnen.rotation.set( 0, - Math.PI / 0.67, 0 );
              offeninnen.scale.set( 0.085, 0.085, 0.085 );
              offeninnen.castShadow = true;
              offeninnen.receiveShadow = true;
              offeninnen.name = "color-inside";
              group.add( offeninnen );
            });

            // Hebelmechanik offen
            loader.load('/models/basis/hebelmechanik-offen.js', function(geometry){
               var hebelmechanikoffen = new THREE.Mesh(geometry, material[ "chrome" ]);
               hebelmechanikoffen.position.set( 0, 0.002, 0 );
               hebelmechanikoffen.rotation.set( 0, - Math.PI / 0.67, 0 );
               hebelmechanikoffen.scale.set( 0.085, 0.085, 0.085 );
               hebelmechanikoffen.castShadow = true;
               hebelmechanikoffen.receiveShadow = true;
               hebelmechanikoffen.name = "mechanik-detail";
               group.add( hebelmechanikoffen );
             });

             // Hebelmechanik offen Detail
             loader.load('/models/basis/hebelmechanik-offen-detail.js', function(geometry){
                var hebelmechanikoffendetail = new THREE.Mesh(geometry, material[ "plastik" ]);
                hebelmechanikoffendetail.position.set( 0, 0.002, 0 );
                hebelmechanikoffendetail.rotation.set( 0, - Math.PI / 0.67, 0 );
                hebelmechanikoffendetail.scale.set( 0.085, 0.085, 0.085 );
                hebelmechanikoffendetail.castShadow = true;
                hebelmechanikoffendetail.receiveShadow = true;
                hebelmechanikoffendetail.name = "mechanik-detail";
                group.add( hebelmechanikoffendetail );
              });

            // Hebelmechanik geschlossen
             loader.load('/models/basis/hebelmechanik-geschlossen.js', function(geometry){
                var hebelmechanikgeschlossen = new THREE.Mesh(geometry, material[ "chrome" ]);
                hebelmechanikgeschlossen.position.set( 0, 0.002, 0 );
                hebelmechanikgeschlossen.rotation.set( 0, - Math.PI / 0.67, 0 );
                hebelmechanikgeschlossen.scale.set( 0.085, 0.085, 0.085 );
                hebelmechanikgeschlossen.castShadow = true;
                hebelmechanikgeschlossen.receiveShadow = true;
                hebelmechanikgeschlossen.name = "mechanik";
                group.add( hebelmechanikgeschlossen );
              });

              // Hebelmechanik geschlossen detail
               loader.load('/models/basis/hebelmechanik-geschlossen-detail.js', function(geometry){
                  var hebelmechanikgeschlossendetail = new THREE.Mesh(geometry, material[ "plastik" ]);
                  hebelmechanikgeschlossendetail.position.set( 0, 0.002, 0 );
                  hebelmechanikgeschlossendetail.rotation.set( 0, - Math.PI / 0.67, 0 );
                  hebelmechanikgeschlossendetail.scale.set( 0.085, 0.085, 0.085 );
                  hebelmechanikgeschlossendetail.castShadow = true;
                  hebelmechanikgeschlossendetail.receiveShadow = true;
                  hebelmechanikgeschlossendetail.name = "mechanik";
                  group.add( hebelmechanikgeschlossendetail );
                });

                // Rado geschlossen
                loader.load('/models/basis/rado-geschlossen.js', function(geometry){
                   var radogeschlossen = new THREE.Mesh(geometry, material[ "chrome" ]);
                   radogeschlossen.position.set( 0, 0.002, 0 );
                   radogeschlossen.rotation.set( 0, - Math.PI / 0.67, 0 );
                   radogeschlossen.scale.set( 0.085, 0.085, 0.085 );
                   radogeschlossen.castShadow = true;
                   radogeschlossen.receiveShadow = true;
                   radogeschlossen.name = "rado";
                   group.add( radogeschlossen );
                 });

                 // Rado offen
                 loader.load('/models/basis/rado-offen.js', function(geometry){
                    var radooffen = new THREE.Mesh(geometry, material[ "chrome" ]);
                    radooffen.position.set( 0, 0.002, 0 );
                    radooffen.rotation.set( 0, - Math.PI / 0.67, 0 );
                    radooffen.scale.set( 0.085, 0.085, 0.085 );
                    radooffen.castShadow = true;
                    radooffen.receiveShadow = true;
                    radooffen.name = "rado";
                    group.add( radooffen );
                  });


            // Griffloch geschlossen
             loader.load('/models/basis/griffloch-geschlossen.js', function(geometry){
               var grifflochgeschlossen = new THREE.Mesh(geometry, material[ "chrome" ]);
               grifflochgeschlossen.position.set( 0, 0.002, 0 );
               grifflochgeschlossen.rotation.set( 0, - Math.PI / 0.67, 0 );
               grifflochgeschlossen.scale.set( 0.085, 0.085, 0.085 );
               grifflochgeschlossen.castShadow = true;
               grifflochgeschlossen.receiveShadow = true;
               grifflochgeschlossen.name = "griffloch";
               group.add( grifflochgeschlossen );
             });

             // Griffloch offen
              loader.load('/models/basis/griffloch-offen.js', function(geometry){
                var grifflochoffen = new THREE.Mesh(geometry, material[ "chrome" ]);
                grifflochoffen.position.set( 0, 0.002, 0 );
                grifflochoffen.rotation.set( 0, - Math.PI / 0.67, 0 );
                grifflochoffen.scale.set( 0.085, 0.085, 0.085 );
                grifflochoffen.castShadow = true;
                grifflochoffen.receiveShadow = true;
                grifflochoffen.name = "griffloch";
                group.add( grifflochoffen );
              });

             // Rückenschild folie
              loader.load('/models/basis/rueckenschild-tasche.js', function(geometry){
                var rueckenschildtasche = new THREE.Mesh(geometry, material[ "transparent" ]);
                rueckenschildtasche.position.set( 0, 0.002, 0 );
                rueckenschildtasche.rotation.set( 0, - Math.PI / 0.67, 0 );
                rueckenschildtasche.scale.set( 0.085, 0.085, 0.085 );
                rueckenschildtasche.castShadow = true;
                rueckenschildtasche.receiveShadow = true;
                rueckenschildtasche.name = "rueckenschildtasche";
                group.add( rueckenschildtasche );
              });


              // Rückenschild papier
               loader.load('/models/basis/rueckenschild-einlage.js', function(geometry){
                 var rueckenschild = new THREE.Mesh(geometry, material[ "rueckenschild" ]);
                 rueckenschild.position.set( 0, 0.002, 0 );
                 rueckenschild.rotation.set( 0, - Math.PI / 0.67, 0 );
                 rueckenschild.scale.set( 0.085, 0.085, 0.085 );
                 rueckenschild.castShadow = true;
                 rueckenschild.receiveShadow = true;
                 rueckenschild.name = "rueckenschild";
                 group.add( rueckenschild );
               });

               // Rückenschild papier
                loader.load('/models/basis/metallecken.js', function(geometry){
                  var rueckenschild = new THREE.Mesh(geometry, material[ "chrome" ]);
                  rueckenschild.position.set( 0, 0.002, 0 );
                  rueckenschild.rotation.set( 0, - Math.PI / 0.67, 0 );
                  rueckenschild.scale.set( 0.085, 0.085, 0.085 );
                  rueckenschild.castShadow = true;
                  rueckenschild.receiveShadow = true;
                  rueckenschild.name = "rueckenschild";
                  group.add( rueckenschild );
                });



    scene.add( group );



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

function animate() {

  requestAnimationFrame(animate);
  TWEEN.update();
  renderer.render(scene, camera);

}


// var radius = 600;
// var theta = 0;



function render() {

  // theta += 0.15;
  //
  // camera.position.x = radius * Math.sin( theta * Math.PI / 360 );
  // camera.position.y = radius * Math.sin( theta * Math.PI / 360 );
  // camera.position.z = radius * Math.cos( theta * Math.PI / 360 );

  cubeCamera.updateCubeMap( renderer, scene );

  controls.update();
  renderer.render( scene, camera );

}

function update() {

  requestAnimationFrame( update );
  render();

}

function setupControls() {
  $('.zoomin').on('click', function(e) {
    controls.dollyOut();
  });

  $('.zoomout').on('click', function(e) {
    controls.dollyIn();
  });

  $('.rotate').on('click', 'a[data-rotate]', function(e) {
    var btn = $(e.target);

    var angle = parseInt(btn.data('rotate'));
    controls.rotateLeftToDegrees(angle, { animated: true });
  });

  $('a.rotate-free').on('mousedown.rotate', function(e) {
    $(document).on('mousemove.rotate', rotateFree);
    $(document).on('mouseup.rotate', function(e) {
      $(document).off('mousemove.rotate');
      $(document).off('mouseup.rotate');
      return false;
    });
    return false;
  });

  function rotateFree(e) {
    var controller = $('.build-rotate') ;
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    var controllerX = controller.offset().left + controller.outerWidth()/2;
    var controllerY = controller.offset().top + controller.outerHeight()/2;

    var degrees = (Math.round(180/Math.PI * Math.atan2((mouseY-controllerY),(mouseX-controllerX)))+180+360) % 360;

    var radians = degrees * Math.PI / 180.0;
    controls.rotateLeftToDegrees(degrees);
  }

}
