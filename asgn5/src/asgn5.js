    import * as THREE from 'three';
    import * as SceneManager from './SceneManager.js';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

    window.addEventListener("resize", windowResize);
    function windowResize(){
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    }

    const gui = new GUI();
    const mapObject = {
        diffuse_map: true,
        ao_map: true,
        normal_map: true,
        shininess: 0,
        flat_shading: false,
    }

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;
    const controls = new OrbitControls( camera, renderer.domElement );

    const cube_loader = new THREE.CubeTextureLoader();
    const skybox = cube_loader.load([
        "../resources/textures/skybox/px.png",
        "../resources/textures/skybox/nx.png",
        "../resources/textures/skybox/py.png",
        "../resources/textures/skybox/ny.png",
        "../resources/textures/skybox/pz.png",
        "../resources/textures/skybox/nz.png"
    ]);

    scene.background = skybox;
    scene.environment = skybox;
    scene.backgroundIntensity = 3;

    const loader = new THREE.TextureLoader();
    const rock_normal = loader.load("../resources/textures/sphere/rock_normal.png");
    const rock_ao = loader.load("../resources/textures/sphere/rock_ao.png");
    const rock_diffuse = loader.load("../resources/textures/sphere/rock_diffuse.png");

    const geometry = new THREE.SphereGeometry( 1, 128, 128 );
    geometry.attributes.uv2 = geometry.attributes.uv;

    const material = new THREE.MeshPhongMaterial({
        //color: 0xff0000,
        map: rock_diffuse,
        aoMap: rock_ao,
        normalMap: rock_normal,
        shininess: 0
    });
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    const portalTexture = new THREE.WebGLRenderTarget(1024, 1024);
    const portalMat = new THREE.MeshBasicMaterial({
        map: portalTexture.texture,
        side: THREE.DoubleSide
    });

    const planeGeo = new THREE.PlaneGeometry(100,100);
    planeGeo.attributes.uv2 = planeGeo.attributes.uv;
    const planeMat = material.clone();
    planeMat.side = THREE.DoubleSide;
    const groundPlane = new THREE.Mesh(planeGeo, planeMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -2;
    scene.add(groundPlane);

    gui.add(mapObject, "diffuse_map").name("Diffuse").onChange( value => {
        material.map = value ? rock_diffuse : null;

        material.needsUpdate = true;
    });
    gui.add(mapObject, "ao_map").name("AO").onChange( value => {
        material.aoMap = value ? rock_ao : null;

        material.needsUpdate = true;
    });
    gui.add(mapObject, "normal_map").name("Normal").onChange( value => {
        material.normalMap = value ? rock_normal : null;

        material.needsUpdate = true;
    });
    gui.add(mapObject, "flat_shading").name("Flat Shading").onChange( value => {
        material.flatShading = value;

        material.needsUpdate = true;
    });
    gui.add(mapObject, "shininess", 0, 256).name("Shininess").onChange( value => {
        material.shininess = value;

        material.needsUpdate = true;
    });

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 3, 2);
    scene.add(dirLight);

    const dirLightHelper = new THREE.DirectionalLightHelper(dirLight);
    scene.add(dirLightHelper);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-2, -4, -5);
    scene.add(dirLight2);
    const dirLightHelper2 = new THREE.DirectionalLightHelper(dirLight2);
    scene.add(dirLightHelper2);

    const ambLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambLight);

    function animate( time ) {
        cube.rotation.y = time/1000;

        renderer.setRenderTarget(portalTexture);
        renderer.render(scene, camera);

        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop( animate );