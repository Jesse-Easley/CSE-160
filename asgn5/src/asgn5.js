import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { Portal } from './Portal.js';

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    stencil: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('#9A34E3');
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 1.6, 5);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

//
// ─────────────────────────────────────────────────────────────
//   CONTROLS
// ─────────────────────────────────────────────────────────────
//

//orbit controls
// const orbit = new OrbitControls(camera, renderer.domElement);
// orbit.enableDamping = true;
// orbit.dampingFactor = 0.1;
// orbit.minDistance = 2;
// orbit.maxDistance = 20;
// orbit.update();

//pointer lock controls
const controls = new PointerLockControls(camera, renderer.donElement);
renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock());
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

document.addEventListener('keydown', e => {
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyD') keys.d = true;
});

document.addEventListener('keyup', e => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyD') keys.d = false;
});

let yaw = 0;
let pitch = 0;

document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== renderer.domElement) return;

    const sensitivity = 0.002;
    yaw -= e.movementX * sensitivity;
    pitch -= e.movementY * sensitivity;

    // clamp pitch so you can't flip upside down
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));

    camera.rotation.set(pitch, yaw, 0, 'YXZ');
});

function updateMovement(delta) {
    const speed = 4;
    const velocity = new THREE.Vector3();

    if (keys.w) velocity.z -= 1;
    if (keys.s) velocity.z += 1;
    if (keys.a) velocity.x -= 1;
    if (keys.d) velocity.x += 1;

    if (velocity.lengthSq() > 0) {
        velocity.normalize();
        velocity.applyEuler(camera.rotation); // move relative to camera direction
        velocity.multiplyScalar(speed * delta);
        camera.position.add(velocity);
    }
}

//
// ─────────────────────────────────────────────────────────────
//   LIGHTING
// ─────────────────────────────────────────────────────────────
//

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const dir = new THREE.DirectionalLight(0xffffff, 3);
dir.position.set(5, 10, 5);
scene.add(dir);

//
// ─────────────────────────────────────────────────────────────
//   WORLD GEOMETRY
// ─────────────────────────────────────────────────────────────
//

for(let i = 0; i < 10; i++){
    const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhongMaterial({color: '#34D4E3'}));
    cubeMesh.position.x = Math.random() * 30 - 15;   
    cubeMesh.position.z = Math.random() * 30 - 15;
    cubeMesh.position.y = 0.5;
    cubeMesh.rotation.y = Math.random() * 2 * Math.PI;
    scene.add(cubeMesh);
}

// const portalCube = initCube();
function initCube(){
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    function addFace(objectGeometry, objectColor, stencilRef, planeColor, planePos, planeRot){
        const planeGeom = new THREE.PlaneGeometry();
        const stencilMat = new THREE.MeshPhongMaterial({color: planeColor, shininess: 0.0});
        const stencilMesh = new THREE.Mesh(planeGeom, stencilMat);
        stencilMat.depthWrite = false;
        // stencilMat.colorWrite = false;
        stencilMat.stencilWrite = true;
        stencilMat.stencilRef = stencilRef;
        stencilMat.stencilFunc = THREE.AlwaysStencilFunc;
        stencilMat.stencilZPass = THREE.ReplaceStencilOp;

        stencilMesh.position.copy(planePos);
        stencilMesh.rotation.x = planeRot.x;
        stencilMesh.rotation.y = planeRot.y;
        stencilMesh.rotation.z = planeRot.z;

        stencilMesh.scale.multiplyScalar(0.97);

        stencilMesh.renderOrder = 0;

        cubeGroup.add(stencilMesh);

        let objectMat = new THREE.MeshPhongMaterial({color: objectColor});
        let objectMesh = new THREE.Mesh(objectGeometry, objectMat);

        objectMat.stencilWrite = true;
        objectMat.stencilRef = stencilRef;
        objectMat.stencilFunc = THREE.EqualStencilFunc;
        objectMesh.renderOrder = 1;

        cubeGroup.add(objectMesh);
    }

    addFace(new THREE.ConeGeometry(0.25, 0.5, 32), '#FF0000', 1, '#00FF80', new THREE.Vector3(0,0,0.5), new THREE.Vector3(0,0,0));
    addFace(new THREE.CylinderGeometry(0.15, 0.15, 0.5), '#0000FF', 2, '#FF8000', new THREE.Vector3(0, 0, -0.5), new THREE.Vector3(0, Math.PI ,0));
    addFace(new THREE.OctahedronGeometry(0.25), 'orange', 3, '#59FF00', new THREE.Vector3(0,0.5,0), new THREE.Vector3(-Math.PI/2,0,0));
    addFace(new THREE.IcosahedronGeometry(0.25, 0), 'green', 4, '#8000FF', new THREE.Vector3(0,-0.5,0), new THREE.Vector3(Math.PI/2,0,0));
    addFace(new THREE.TorusGeometry(0.25, 0.1), '#A800A8', 5, '#A80000', new THREE.Vector3(0.5,0,0), new THREE.Vector3(0,Math.PI/2,0));
    addFace(new THREE.BoxGeometry(0.5, 0.5, 0.5), 'yellow', 6, '#0080FF', new THREE.Vector3(-0.5,0,0), new THREE.Vector3(0,-Math.PI/2,0));

    const boxBorderMat = new THREE.MeshPhongMaterial({ color: 'black' });
    boxBorderMat.stencilWrite = true;
    boxBorderMat.stencilRef = 0;
    boxBorderMat.stencilFunc = THREE.EqualStencilFunc;
    const boxBorderGeom = new THREE.BoxGeometry();
    cubeGroup.add(new THREE.Mesh(boxBorderGeom, boxBorderMat));

    return cubeGroup;
}

const groundGeo = new THREE.PlaneGeometry(15, 30);
const groundMat = new THREE.MeshPhongMaterial({shininess: 128.0,});
const redGroundMesh = new THREE.Mesh(groundGeo, groundMat.clone());
const greenGroundMesh = new THREE.Mesh(groundGeo, groundMat.clone());

scene.add(redGroundMesh);
scene.add(greenGroundMesh);

redGroundMesh.position.x = -7.5;
redGroundMesh.rotation.x = -Math.PI/2;
redGroundMesh.material.color.set('#E34234');


greenGroundMesh.position.x = 7.5;
greenGroundMesh.rotation.x = -Math.PI/2;
greenGroundMesh.material.color.set('#7DE334');

//
// ─────────────────────────────────────────────────────────────
//   PORTAL STUFF (THINKING WITH PORTALS IS MELTING MY BRAIN)
// ─────────────────────────────────────────────────────────────
//

const portal1 = new Portal(camera, scene);
portal1.portalSurface.position.y = 1;
portal1.portalSurface.position.x = 2;

const portal2 = new Portal(camera, scene);
portal2.portalSurface.position.y = 1;
portal2.portalSurface.position.x = -2;

Portal.linkPortals(portal1, portal2);

//
// ─────────────────────────────────────────────────────────────
//   ANIMATION LOOP
// ─────────────────────────────────────────────────────────────
//

let last = 0;
function render(time) {
    const delta = (time - last) / 1000;
    last = time;

    updateMovement(delta);

    portal1.render(renderer, scene);
    portal2.render(renderer, scene);
    // portalCube.rotation.y = time / 1000;
    // portalCube.rotation.x = time / 1000;

    camera.layers.enableAll();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(render);
