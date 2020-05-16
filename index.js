// setup
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xcccccc);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();

// initialize materials
var carbon = new THREE.MeshLambertMaterial({color: 0x000000});
var oxygen = new THREE.MeshLambertMaterial({color: 0xcc0000});
var phosphorus = new THREE.MeshLambertMaterial({color: 0xcccc00});
var nitrogen = new THREE.MeshLambertMaterial({color: 0x0000cc});
var hydrogen = new THREE.MeshLambertMaterial({color: 0xffffff});


// add default cube
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
cube.receiveShadow = true;
scene.add(cube);

// add lighting
dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( - 1, 1.75, 1 );
dirLight.position.multiplyScalar( 30 );
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add( dirLight );

camera.position.z = 5;

function render() {
    renderer.render(scene, camera);
}
render();

controls.addEventListener('change', render);
