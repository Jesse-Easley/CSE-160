import * as THREE from 'three';
import * as SceneManager from './SceneManager.js';

window.addEventListener("resize", windowResize);
function windowResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 3;

const loader = new THREE.CubeTextureLoader();
const skybox = loader.load([
    "../resources/textures/skybox/px.png",
    "../resources/textures/skybox/nx.png",
    "../resources/textures/skybox/py.png",
    "../resources/textures/skybox/ny.png",
    "../resources/textures/skybox/pz.png",
    "../resources/textures/skybox/nz.png"
]);
scene.background = skybox;
scene.backgroundIntensity = 3;

const geometry = new THREE.SphereGeometry( 1, 32, 32 );
const material = new THREE.MeshPhongMaterial( { color: 0xff1350 } );
material.shininess = 300;
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 3, 2);
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight2.position.set(-2, -4, -5);
scene.add(dirLight2);

const ambLight = new THREE.AmbientLight(0x404040, 1.0);
scene.add(ambLight);

function animate( time ) {
    camera.position.x = Math.cos(time * 0.0005)*3;
    camera.position.z = Math.sin(time * 0.0005)*3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
renderer.setAnimationLoop( animate );