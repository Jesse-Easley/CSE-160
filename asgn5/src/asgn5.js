import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new THREE.FileLoader();
const [vShader, fShader] = await Promise.all([
    loader.loadAsync('../shaders/VShader.glsl'),
    loader.loadAsync('../shaders/FShader.glsl')
]);


const outlineUniforms = {
    thickness: { value: 0.05 },
    outlineColor: { value: new THREE.Color(0xffffff) }
};

const shaderMat = new THREE.ShaderMaterial({
    vertexShader: vShader,
    fragmentShader: fShader,
    uniforms: outlineUniforms,
    side: THREE.BackSide
});

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshPhongMaterial({ color: 0xff2050 });
const cube = new THREE.Mesh( geometry, shaderMat );
scene.add( cube );

const cube2 = new THREE.Mesh(geometry, material);
scene.add( cube2 );
cube2.position.y = 2;

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

camera.position.z = 5;

function animate( time ) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;

    cube2.rotation.x = time / 2000;
    cube2.rotation.y = time / 1000;

    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
