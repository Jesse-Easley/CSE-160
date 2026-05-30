import * as THREE from 'three';

export class Portal{
    constructor(playerCam, scene){
        this.playerCam = playerCam;
        this.portalCam = new THREE.PerspectiveCamera(this.playerCam.fov, this.playerCam.aspect, 0.1, 100);
        this.linkedPortal = null;


        //create renderTarget and assign portal texture
        const size = Math.min(window.innerWidth, window.innerHeight);
        this.renderTarget = new THREE.WebGLRenderTarget(
            size,
            size,
            {
                samples: 12
            }
        );
        this.renderTarget.texture.minFilter = THREE.LinearFilter;
        this.renderTarget.texture.magFilter = THREE.LinearFilter;

        let portalMat = new THREE.ShaderMaterial({
            side: THREE.DoubleSide, 
            uniforms: {
            portalTexture: { value: this.renderTarget.texture }
        }});
        const loader = new THREE.FileLoader();
        Promise.all([
            loader.loadAsync('../resources/shaders/portalVertex.glsl'),
            loader.loadAsync('../resources/shaders/portalFragment.glsl')
        ]).then(([vertex, fragment]) => {
            portalMat.vertexShader = vertex;
            portalMat.fragmentShader = fragment;
            portalMat.needsUpdate = true;
        });

        

        //create portal plane
        this.portalSurface = new THREE.Mesh(new THREE.PlaneGeometry(), portalMat);
        this.portalSurface.layers.set(1);
        this.portalCam.layers.enableAll();
        this.portalCam.layers.disable(1);
        
        scene.add(this.portalSurface);
        //create stencil mask
        //create portal frame
    }

    static linkPortals(portal1, portal2){
        portal1.linkedPortal = portal2;
        portal2.linkedPortal = portal1;
    }


    //called before main/player camera is rendered
    render(renderer, scene){
        this.playerCam.updateMatrixWorld(true);
        this.portalSurface.updateMatrixWorld(true);
        this.linkedPortal.portalSurface.updateMatrixWorld(true);

        //calculate relative transform of portal camera
        let portalCamTransform = new THREE.Matrix4().copy(this.linkedPortal.portalSurface.matrixWorld)
                                                    .multiply(this.portalSurface.matrixWorld.invert())
                                                    .multiply(this.playerCam.matrixWorld);
        
        //set portal camera transforms
        portalCamTransform.decompose(
            this.portalCam.position,
            this.portalCam.quaternion,
            this.portalCam.scale
        );

        renderer.setRenderTarget(this.renderTarget);
        renderer.render(scene, this.portalCam);
        renderer.setRenderTarget(null);
    }
}