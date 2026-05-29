import * as THREE from 'three';

export class Portal{
    constructor(playerCam, scene){
        this.playerCam = playerCam;
        this.portalCam = new THREE.PerspectiveCamera(this.playerCam.fov, this.playerCam.aspect, 0.1, 100);
        this.linkedPortal = null;

        //create portal plane
        this.portalSurface = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide
        }));
        this.portalSurface.layers.set(1);
        this.portalCam.layers.enableAll();
        this.portalCam.layers.disable(1);
        
        scene.add(this.portalSurface);
        //create stencil mask
        //create portal frame

        //create renderTarget and assign portal texture
        this.renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight
        );
        this.portalSurface.material.map = this.renderTarget.texture;
        this.portalSurface.material.needsUpdate = true;
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