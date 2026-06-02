import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import { Portal } from './Portal.js';

const scene = new THREE.Scene();
const cubeMapLoader = new THREE.CubeTextureLoader().setPath('../resources/textures/skybox/');
const cubeTexture = await cubeMapLoader.loadAsync( [
	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
] );
scene.background = cubeTexture;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    stencil: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    100
);
camera.position.set(0, 1.5, 3);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const size = Math.min(window.innerWidth, window.innerHeight);
    for(const portal of portals){
        portal.portalCam.aspect = window.innerWidth / window.innerHeight;
        portal.portalCam.updateProjectionMatrix();

        portal.renderTarget.setSize(size, size);
    }
});

//
// controls
//

//pointer lock controls
const controls = new PointerLockControls(camera, renderer.domElement);
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
// world geometry
//

// const portalCube = initCube();
// function initCube(){
//     const cubeGroup = new THREE.Group();
//     scene.add(cubeGroup);

//     function addFace(objectGeometry, objectColor, stencilRef, planeColor, planePos, planeRot){
//         const planeGeom = new THREE.PlaneGeometry();
//         const stencilMat = new THREE.MeshPhongMaterial({color: planeColor, shininess: 0.0});
//         const stencilMesh = new THREE.Mesh(planeGeom, stencilMat);
//         stencilMat.depthWrite = false;
//         // stencilMat.colorWrite = false;
//         stencilMat.stencilWrite = true;
//         stencilMat.stencilRef = stencilRef;
//         stencilMat.stencilFunc = THREE.AlwaysStencilFunc;
//         stencilMat.stencilZPass = THREE.ReplaceStencilOp;

//         stencilMesh.position.copy(planePos);
//         stencilMesh.rotation.x = planeRot.x;
//         stencilMesh.rotation.y = planeRot.y;
//         stencilMesh.rotation.z = planeRot.z;

//         stencilMesh.scale.multiplyScalar(0.97);

//         stencilMesh.renderOrder = 0;

//         cubeGroup.add(stencilMesh);

//         let objectMat = new THREE.MeshPhongMaterial({color: objectColor});
//         let objectMesh = new THREE.Mesh(objectGeometry, objectMat);

//         objectMat.stencilWrite = true;
//         objectMat.stencilRef = stencilRef;
//         objectMat.stencilFunc = THREE.EqualStencilFunc;
//         objectMesh.renderOrder = 1;

//         cubeGroup.add(objectMesh);
//     }

//     addFace(new THREE.ConeGeometry(0.25, 0.5, 32), '#FF0000', 1, '#00FF80', new THREE.Vector3(0,0,0.5), new THREE.Vector3(0,0,0));
//     addFace(new THREE.CylinderGeometry(0.15, 0.15, 0.5), '#0000FF', 2, '#FF8000', new THREE.Vector3(0, 0, -0.5), new THREE.Vector3(0, Math.PI ,0));
//     addFace(new THREE.OctahedronGeometry(0.25), 'orange', 3, '#59FF00', new THREE.Vector3(0,0.5,0), new THREE.Vector3(-Math.PI/2,0,0));
//     addFace(new THREE.IcosahedronGeometry(0.25, 0), 'green', 4, '#8000FF', new THREE.Vector3(0,-0.5,0), new THREE.Vector3(Math.PI/2,0,0));
//     addFace(new THREE.TorusGeometry(0.25, 0.1), '#A800A8', 5, '#A80000', new THREE.Vector3(0.5,0,0), new THREE.Vector3(0,Math.PI/2,0));
//     addFace(new THREE.BoxGeometry(0.5, 0.5, 0.5), 'yellow', 6, '#0080FF', new THREE.Vector3(-0.5,0,0), new THREE.Vector3(0,-Math.PI/2,0));

//     const boxBorderMat = new THREE.MeshPhongMaterial({ color: 'black' });
//     boxBorderMat.stencilWrite = true;
//     boxBorderMat.stencilRef = 0;
//     boxBorderMat.stencilFunc = THREE.EqualStencilFunc;
//     const boxBorderGeom = new THREE.BoxGeometry();
//     cubeGroup.add(new THREE.Mesh(boxBorderGeom, boxBorderMat));

//     return cubeGroup;
// }

const textureLoader = new THREE.TextureLoader().setPath('../resources/textures/');
const gltfLoader = new GLTFLoader().setPath('../resources/objects/');

// let red_ring_planet;
// gltfLoader.load('red_ring_planet.glb', (gltf) => {
//     red_ring_planet = gltf.scene;
//     red_ring_planet.scale.set(10,10,10);
//     scene.add(red_ring_planet);
// });

const mainRoom = new THREE.Group();

//create/load materials for lab room
function setupLabWall(tex) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(2, 1);
    return tex;
}
const labWallBaseColor = setupLabWall(textureLoader.load('walls1/walls_basecolor.png'));
const labWallAO = setupLabWall(textureLoader.load('walls1/walls_ao.png'));
const labWallNormal = setupLabWall(textureLoader.load('walls1/walls_normal.png'));
const labWallRoughness = setupLabWall(textureLoader.load('walls1/walls_roughness.png'));
const labWallMetalness = setupLabWall(textureLoader.load('walls1/walls_metallic.png'));
const mainRoomWallMat = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    map: labWallBaseColor,
    aoMap: labWallAO,
    normalMap: labWallNormal,
    roughnessMap: labWallRoughness,
    metalnessMap: labWallMetalness
});


function setupLabFloorCeil(tex) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
}
const labFloorBaseColor = setupLabFloorCeil(textureLoader.load('floor/floor_basecolor.png'));
const labFloorAO = setupLabFloorCeil(textureLoader.load('floor/floor_ao.png'));
const labFloorNormal = setupLabFloorCeil(textureLoader.load('floor/floor_normal.png'));
const labFloorRoughness = setupLabFloorCeil(textureLoader.load('floor/floor_roughness.png'));
const mainRoomFloorMat = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    map: labFloorBaseColor,
    aoMap: labFloorAO,
    normalMap: labFloorNormal,
    roughnessMap: labFloorRoughness,
});

const labCeilBaseColor = setupLabFloorCeil(textureLoader.load('ceiling/ceiling_basecolor.png'));
const labCeilAO = setupLabFloorCeil(textureLoader.load('ceiling/ceiling_ao.png'));
const labCeilNormal = setupLabFloorCeil(textureLoader.load('ceiling/ceiling_normal.png'));
const labCeilRoughness = setupLabFloorCeil(textureLoader.load('ceiling/ceiling_roughness.png'));
const mainRoomCeilMat = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    map: labCeilBaseColor,
    aoMap: labCeilAO,
    normalMap: labCeilNormal,
    roughnessMap: labCeilRoughness,
});
const mainRoomMats = [mainRoomWallMat, mainRoomWallMat, mainRoomCeilMat, mainRoomFloorMat, mainRoomWallMat, mainRoomWallMat];

const mainRoomGeo = new THREE.BoxGeometry(5,3,6);

//create lab room
const mainRoomMesh = new THREE.Mesh(mainRoomGeo, mainRoomMats);
mainRoomMesh.position.y = 1.5; //so bottom plane aligns with y = 0;
mainRoom.add(mainRoomMesh);

//create portal
const mainSpacePortal = new Portal(1, 2, camera, scene, renderer);
mainRoom.add(mainSpacePortal);
// portals.push(mainSpacePortal);

//place wall lights
gltfLoader.load('industrial_wall_light.glb', (gltf) => {
    let wallLightModel = gltf.scene;

    //scale model correctly
    const box = new THREE.Box3().setFromObject(wallLightModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 0.5 / size.y;
    wallLightModel.scale.setScalar(scale);

    function createWallLight(x, y, z, rotY) {
        if (!wallLightModel) return;

        const group = new THREE.Group();

        // Deep clone the model
        const model = wallLightModel.clone(true);
        group.add(model);

        // Transform the instance
        group.position.set(x, y, z);
        group.rotation.y = rotY;

        // Add the point light
        const labLight = new THREE.PointLight(0xe0ffff, 0.4, 0, 0.03);
        group.add(labLight);
        labLight.position.set(0, 0, -0.5);

        mainRoom.add(group);
    }
    
    createWallLight(2.48, 2.5, -1.5, Math.PI/2);
    createWallLight(-2.48, 2.5, -1.5, -Math.PI/2);
    createWallLight(2.48, 2.5, 1.5, Math.PI/2);
    createWallLight(-2.48, 2.5, 1.5, -Math.PI/2);
});

//place portal computer
gltfLoader.load('portal_computer.glb', (gltf) => {
    let portalComputer = gltf.scene;
    portalComputer.scale.set(0.7, 0.7, 0.7);
    portalComputer.position.set(1,0,0);
    mainRoom.add(portalComputer);
});

mainRoom.position.y = -5;
scene.add(mainRoom);

//planet scene
const planetGround_basecolor = textureLoader.load('planet_surface/surface_color.png')
const planetGroundMat = new THREE.MeshStandardMaterial({
    map: planetGround_basecolor,
});

const planetGroundGeo = new THREE.PlaneGeometry(100,100);
const planetGroundMesh = new THREE.Mesh(planetGroundGeo, planetGroundMat);
planetGroundMesh.rotation.x = -Math.PI/2;
scene.add(planetGroundMesh);

const ambLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambLight);

// const otherPortal = new Portal(1, 2, camera, scene, renderer);
// mainRoom.add(otherPortal);
// otherPortal.position.x = 3;

// Portal.linkPortals(mainSpacePortal, otherPortal);

//
// animation loop
//
let portals = [];
// portals.push(otherPortal);

const teleportObjects = [];
teleportObjects.push(camera);

let last = 0;
function render(time) {
    const delta = (time - last) / 1000;
    last = time;

    updateMovement(delta);
    camera.updateMatrixWorld(true);

    for (const portal of portals) {
        portal.computeAABB(); //used for moving portals

        for (const obj of teleportObjects) {
            if (!portal.tracked.has(obj) && portal.isObjectNear(obj)) {
                portal.startTracking(obj);
            }
        }

        portal.updateTrackedObjects();
        portal.updateCamera();
        portal.render(renderer, scene);
    }

    camera.layers.enableAll();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(render);
