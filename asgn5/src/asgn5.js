import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import { Portal } from './Portal.js';

// seperate scenes for lighting purposes
const labScene = new THREE.Scene();
const planetScene = new THREE.Scene();
let currentScene = labScene;

const cubeMapLoader = new THREE.CubeTextureLoader().setPath('../resources/textures/skybox/');
const cubeTexture = await cubeMapLoader.loadAsync( [
	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
] );
planetScene.background = cubeTexture;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    500
);
camera.position.set(0, -3.5, 2.5);
labScene.add(camera);

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

camera.rotation.order = 'YXZ';

document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== renderer.domElement) return;

    const sensitivity = 0.0012;

    // ignore spikes
    if (Math.abs(e.movementX) > 200 || Math.abs(e.movementY) > 200) return;

    yaw -= e.movementX * sensitivity;
    yaw = yaw % (Math.PI * 2); // prevent overflow

    pitch -= e.movementY * sensitivity;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));

    camera.rotation.set(pitch, yaw, 0);
});

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

//quick and dirty player bounds
const labBounds = {
    minX: -2.4,
    maxX:  2.4,
    minZ: -2.9,
    maxZ:  2.9
};
const planetBounds = {
    minX: -20,
    maxX:  20,
    minZ: -20,
    maxZ:  20
};

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
        velocity.y = 0;
        velocity.normalize();

        velocity.multiplyScalar(speed * delta);
        camera.position.add(velocity);
    }

    if (currentScene === labScene) {
        camera.position.x = clamp(camera.position.x, labBounds.minX, labBounds.maxX);
        camera.position.z = clamp(camera.position.z, labBounds.minZ, labBounds.maxZ);
    }

    if (currentScene === planetScene) {
        camera.position.x = clamp(camera.position.x, planetBounds.minX, planetBounds.maxX);
        camera.position.z = clamp(camera.position.z, planetBounds.minZ, planetBounds.maxZ);
    }
}

//
// world geometry
//

let portals = [];

const textureLoader = new THREE.TextureLoader().setPath('../resources/textures/');
const gltfLoader = new GLTFLoader().setPath('../resources/objects/');

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
const mainSpacePortal = new Portal(1,
    2,
    camera,
    labScene,
    planetScene,
    renderer,
    (newScene) => {
        camera.parent.remove(camera);
        newScene.add(camera);
        currentScene = newScene;
    });
mainRoom.add(mainSpacePortal);
portals.push(mainSpacePortal);

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
        labLight.position.set(0, 0, -0.3);

        mainRoom.add(group);
    }
    
    createWallLight(2.48, 2.5, -1.5, Math.PI/2);
    createWallLight(-2.48, 2.5, -1.5, -Math.PI/2);
    createWallLight(2.48, 2.5, 1.5, Math.PI/2);
    createWallLight(-2.48, 2.5, 1.5, -Math.PI/2);
});

//door
gltfLoader.load('door.glb', (gltf) => {
    let door = gltf.scene;
    door.scale.set(2, 1.9, 2);
    door.position.set(0,0,3);

    mainRoom.add(door);
});

//portal computer
gltfLoader.load('portal_computer.glb', (gltf) => {
    let portalComputer = gltf.scene;
    portalComputer.scale.set(0.7, 0.7, 0.7);
    portalComputer.position.set(1,0,0);

    let planetComputer = portalComputer.clone();
    planetComputer.rotation.y = Math.PI;
    planetComputer.position.set(-1,0,0);

    mainRoom.add(portalComputer);
    planet.add(planetComputer);
});
mainRoom.position.y = -5;
labScene.add(mainRoom);

const ambLight = new THREE.AmbientLight(0xffffff, 0.3);
labScene.add(ambLight);

const planet = new THREE.Group();
gltfLoader.load('crate.glb', (gltf) => {
    let crate = gltf.scene;
    crate.position.set(-2,0,-2);
    crate.rotation.set(0,Math.PI/2,0);

    let planetCrate = crate.clone();
    planetCrate.rotation.set(0,Math.PI/3,0);
    planetCrate.position.set(2,0,-1);

    mainRoom.add(crate);
    planet.add(planetCrate);
});

//barrels (gotta meet the 20 primitives req somehow)
function createBarrel(x, y, z, rotx, roty, rotz, scene){
    const barrel = new THREE.Group();
    const mainBarrelGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, 32);
    const mainBarrelMat = new THREE.MeshStandardMaterial({
        color: '#181761',
        roughness: 0.5,
        metalness: 0.8
    });
    const mainBarrelMesh = new THREE.Mesh(mainBarrelGeo, mainBarrelMat);
    const barrelRingGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.1, 32);
    const barrelRinglMat = new THREE.MeshStandardMaterial({
        color: '#000000',
        roughness: 1.0,
        metalness: 0.8
    });
    const barrelRingMesh = new THREE.Mesh(barrelRingGeo, barrelRinglMat);
    for(let i = 0; i < 3; i++){
        let barrelRing = barrelRingMesh.clone();
        barrelRing.position.set(0,-0.46 + i * 0.45,0);
        barrel.add(barrelRing);
    }

    const barrelCapGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.07, 32);
    const barrelCapMesh = new THREE.Mesh(barrelCapGeo, barrelRinglMat);
    barrelCapMesh.position.set(0,0.5,0.25);
    barrel.add(barrelCapMesh)

    barrel.position.set(x, y + 0.5, z);
    barrel.rotation.set(rotx, roty, rotz);

    barrel.add(mainBarrelMesh);
    scene.add(barrel);
}
createBarrel(2,0,-1,0,0,0,mainRoom);
createBarrel(2,0,-2,0,0,0,mainRoom);
createBarrel(2,1,-1.5,0,0,0,mainRoom);
createBarrel(-2.5,0,-1.5,0,0,0,planetScene);
createBarrel(-3.5,0,-1,0,0,0,planetScene);
createBarrel(-2.5,-0.1, -0.4, Math.PI/2, 0, Math.PI/4,planetScene);

//planet area
function setupPlanetSurface(tex) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.minFilter = THREE.NearestMipmapNearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.repeat.set(20, 20);
    return tex;
}
const planetGround_basecolor = setupPlanetSurface(textureLoader.load('planet_surface/surface_color.png'));
const planetGround_ao = setupPlanetSurface(textureLoader.load('planet_surface/surface_ao.png'));
const planetGround_normal = setupPlanetSurface(textureLoader.load('planet_surface/surface_normal.png'));
const planetGround_roughness = setupPlanetSurface(textureLoader.load('planet_surface/surface_roughness.png'));
const planetGroundMat = new THREE.MeshStandardMaterial({
    map: planetGround_basecolor,
    aoMap: planetGround_ao,
    normalMap: planetGround_normal,
    roughnessMap: planetGround_roughness,
});
const planetGroundGeo = new THREE.PlaneGeometry(100,100);
const planetGroundMesh = new THREE.Mesh(planetGroundGeo, planetGroundMat);
planetGroundMesh.rotation.x = -Math.PI/2;
planet.add(planetGroundMesh);

const otherPortal = new Portal(1,
    2,
    camera,
    planetScene,
    labScene,
    renderer,
    (newScene) => {
        camera.parent.remove(camera);
        newScene.add(camera);
        currentScene = newScene;
    });
portals.push(otherPortal);
planet.add(otherPortal);

Portal.linkPortals(mainSpacePortal, otherPortal);

//sun
const sunGeo = new THREE.SphereGeometry(10, 32, 32);
const sunMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xff6600),   // orange glow
    emissiveIntensity: 5
});
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(300, 300, 0);
planet.add(sunMesh);

const dirLight = new THREE.DirectionalLight(0xffbbaa, 1);
sunMesh.add(dirLight);

const planetAmbient = new THREE.AmbientLight(0xffffff, 0.4);
planetScene.add(planetAmbient);


//other planets
let red_planet_orbit_plane = new THREE.Group();
red_planet_orbit_plane.rotation.x = THREE.MathUtils.degToRad(-15);

let red_ring_planet;
gltfLoader.load('red_ring_planet.glb', (gltf) => {
    red_ring_planet = gltf.scene;
    red_ring_planet.traverse((obj) => {
        if (obj.isMesh && obj.material) {
            const mat = obj.material;

            //makes planet easier to see in sky
            if (mat.map) {
                mat.emissiveMap = mat.map;
                mat.emissive = new THREE.Color(0xffffff);
                mat.emissiveIntensity = 1.0;
                mat.needsUpdate = true;
            }
        }
    });
    planetScene.add(red_planet_orbit_plane);
    red_planet_orbit_plane.add(red_ring_planet);
});

let earthlike_orbit_plane = new THREE.Group();
earthlike_orbit_plane.rotation.x = THREE.MathUtils.degToRad(275);

let earthlike_planet;
gltfLoader.load('earthlike_planet.glb', (gltf) => {
    earthlike_planet = gltf.scene;
    earthlike_planet.traverse((obj) => {
        if (obj.isMesh && obj.material) {
            const mat = obj.material;

            //makes planet easier to see in sky
            if (mat.map) {
                mat.emissiveMap = mat.map;
                mat.emissive = new THREE.Color(0xffffff);
                mat.emissiveIntensity = 1.0;
                mat.needsUpdate = true;
            }
        }
    });
    planetScene.add(earthlike_orbit_plane);
    earthlike_orbit_plane.add(earthlike_planet);
});

function mulberry32(seed) { //need for seeded randomization
    return function() {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
const rand = mulberry32(1245);

//plant thingies
gltfLoader.load('plant.glb', (gltf) => {
    let plantModel = gltf.scene;

    plantModel.scale.set(0.5, 0.5, 0.5);
    for (let i = 0; i < 200; i++) {
        const plant = plantModel.clone();

        const x = (rand() - 0.5) * 100;
        const z = (rand() - 0.5) * 100;
        const rot = rand() * Math.PI * 2;

        plant.position.set(x, 0, z);
        plant.rotation.set(0, rot, 0);
        planetScene.add(plant);
    }
});

//trees
gltfLoader.load('tree.glb', (gltf) => {
    let treeModel = gltf.scene;

    treeModel.scale.set(1, 1, 1);
    for (let i = 0; i < 200; i++) {
        const tree = treeModel.clone();

        const x = (rand() - 0.5) * 100;
        const z = (rand() - 0.5) * 100;
        const rot = rand() * Math.PI * 2;

        tree.position.set(x, 0, z);
        tree.rotation.set(0, rot, 0);
        planetScene.add(tree);
    }
});


planetScene.add(planet);

//
// animation loop
//
const teleportObjects = [];
teleportObjects.push(camera);

let last = 0;
function render(time) {
    const delta = (time - last) / 1000;
    last = time;

    updateMovement(delta);
    camera.updateMatrixWorld(true);

    //update sun/planet movement
    sunMesh.position.set(300*Math.cos(time/1000 / 10), 300, 300*Math.sin(Math.sin(time/1000 / 10)));
    if(red_ring_planet){
        let orbit_r = 300;
        
        earthlike_orbit_plane.rotation.z = time / 1000 * 0.05; // orbital precession
        red_ring_planet.position.set(orbit_r*Math.cos(time/1000 / 10 ), orbit_r*Math.sin(Math.sin(time/1000 / 10)), 10);
        red_ring_planet.rotation.x += delta * .08;
        red_ring_planet.rotation.z += delta * .08;
        red_ring_planet.rotation.y += delta * .08;
    }
    if(earthlike_planet){
        let orbit_r = 100;
        
        red_planet_orbit_plane.rotation.z = time / 1000 * 0.1; // orbital precession
        earthlike_planet.position.set(orbit_r*Math.cos(time/1000 / 12 + 0.5), 100, orbit_r*Math.sin(Math.sin(time/1000 / 12 + 0.5)));
        earthlike_planet.rotation.x += delta * .5;

    }

    //render portals
    for (const portal of portals) {
        portal.computeAABB();

        for (const obj of teleportObjects) {
            if (!portal.tracked.has(obj) && portal.isObjectNear(obj)) {
                portal.startTracking(obj);
            }
        }

        portal.updateTrackedObjects();
        portal.updateCamera();
        portal.render(renderer);
    }

    camera.layers.enableAll();
    renderer.render(currentScene, camera);
}
renderer.setAnimationLoop(render);
