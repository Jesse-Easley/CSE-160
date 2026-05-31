import * as THREE from 'three';

export class Portal extends THREE.Object3D{
    constructor(width = 1, height = 1, playerCam, scene, renderer){
        super();

        this.width = width;
        this.height = height;

        this.playerCam = playerCam;
        this.portalCam = new THREE.PerspectiveCamera(this.playerCam.fov, this.playerCam.aspect, 0.1, 100);
        this.linkedPortal = null;
        
        this.clippingPlane = new THREE.Plane();
        renderer.localClippingEnabled = true;

        //create renderTarget and assign portal texture
        const size = new THREE.Vector2();
        renderer.getSize(size);
        this.renderTarget = new THREE.WebGLRenderTarget(
            size.x,
            size.y,
            {
                samples: 12
            }
        );

        // this.renderTarget.texture.minFilter = THREE.LinearFilter;
        // this.renderTarget.texture.magFilter = THREE.LinearFilter;

        //create portal material
        let portalMat = new THREE.ShaderMaterial({
            side: THREE.DoubleSide, 
            uniforms: {
            portalTexture: { value: this.renderTarget.texture }
        }});
        
        //load portal shaders
        const loader = new THREE.FileLoader();
        Promise.all([
            loader.loadAsync('../resources/shaders/portalVertex.glsl'),
            loader.loadAsync('../resources/shaders/portalFragment.glsl')
        ]).then(([vertex, fragment]) => {
            portalMat.vertexShader = vertex;
            portalMat.fragmentShader = fragment;
            portalMat.needsUpdate = true;
            portalMat.side = THREE.DoubleSide;
        });

        //create portal surface
        const portalDepth = this.playerCam.near + 0.002; //to avoid flicker when moving through portal
        this.portalSurface = new THREE.Mesh(new THREE.BoxGeometry(width, height, portalDepth), portalMat);
        this.portalSurface.layers.set(1); 
        this.portalCam.layers.disable(1);
                
        //create portal frame
        //group for frames
        this.portalFrame = new THREE.Group();

        const frameThickness = 0.07;             //border width
        const frameDepth = 0.1 + portalDepth;    //how far the frame sticks out

        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.6,
            roughness: 0.3
        });

        //top bar
        const topBar = new THREE.Mesh(
            new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth),
            frameMat
        );
        topBar.position.set(0,  (height + frameThickness) / 2, 0);
        this.portalFrame.add(topBar);

        //left bar
        const leftBar = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth),
            frameMat
        );
        leftBar.position.set(-(width + frameThickness) / 2, 0, 0);
        this.portalFrame.add(leftBar);

        //right bar
        const rightBar = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth),
            frameMat
        );
        rightBar.position.set((width + frameThickness) / 2, 0, 0);
        this.portalFrame.add(rightBar);

        //add portal components to scene
        this.add(this.portalSurface);
        this.add(this.portalFrame);
        scene.add(this);

        //setup bounding box for teleportation
        this.tracked = new Map();
        this.aabb = new THREE.Box3();
        this.trackingDepth = 0.3;
    }

    computeAABB(){
        this.aabb.setFromObject(this.portalSurface);
        this.aabb.expandByScalar(this.trackingDepth);
    }

    //non axis aligned portals may have weird collision boxes due to using AABB
    isObjectNear(object) {
        return this.aabb.containsPoint(object.position);
    }

    startTracking(object) {
        const portalPos = new THREE.Vector3().setFromMatrixPosition(this.portalSurface.matrixWorld);
        const normal = new THREE.Vector3();
        this.portalSurface.getWorldDirection(normal);

        const toObj = object.position.clone().sub(portalPos);
        const side = Math.sign(toObj.dot(normal));

        this.tracked.set(object, side);
    }

    updateTrackedObjects() {
        for (const [object, previousSide] of this.tracked.entries()) {

            //if object moved far away, stop tracking
            if (!this.isObjectNear(object)) {
                this.tracked.delete(object);
                continue;
            }

            //compute current side
            const portalPos = new THREE.Vector3().setFromMatrixPosition(this.portalSurface.matrixWorld);
            const normal = new THREE.Vector3();
            this.portalSurface.getWorldDirection(normal);

            const toObj = object.position.clone().sub(portalPos);
            const currentSide = Math.sign(toObj.dot(normal));

            //detect crossing
            if (currentSide !== previousSide) {
                this.teleportObject(object);
                this.tracked.delete(object);
                continue;
            }

            //update side
            this.tracked.set(object, currentSide);
        }
    }

    teleportObject(object) {
        //get correct relative transform
        const newMatrix = new THREE.Matrix4()
                                   .copy(this.linkedPortal.portalSurface.matrixWorld)
                                   .multiply(this.portalSurface.matrixWorld.clone().invert())
                                   .multiply(object.matrixWorld);

        newMatrix.decompose(object.position, object.quaternion, object.scale);
        object.updateMatrixWorld(true);
    }

    static linkPortals(portal1, portal2){
        portal1.linkedPortal = portal2;
        portal2.linkedPortal = portal1;

        //eliminates some flickering when teleporting
        portal2.portalSurface.rotation.y = Math.PI;
        portal2.rotation.y = -Math.PI;
    }

    //called every frame BEFORE rendering portalCams
    updateCamera() {
        this.playerCam.updateMatrixWorld(true);
        this.portalSurface.updateMatrixWorld(true);
        this.linkedPortal.portalSurface.updateMatrixWorld(true);

        //calculate relative transform of portal camera
        let portalCamTransform = new THREE.Matrix4().copy(this.linkedPortal.portalSurface.matrixWorld)
                                                    .multiply(this.portalSurface.matrixWorld.clone().invert())
                                                    .multiply(this.playerCam.matrixWorld);
        
        //set portal camera transforms
        portalCamTransform.decompose(
            this.portalCam.position,
            this.portalCam.quaternion,
            this.portalCam.scale
        );
        this.portalCam.updateMatrixWorld(true);

        //calculate clipping plane normal and position
        const position = new THREE.Vector3().setFromMatrixPosition(this.linkedPortal.portalSurface.matrixWorld);
        const normal = new THREE.Vector3();
        this.linkedPortal.portalSurface.getWorldDirection(normal);
        normal.normalize();

        //determine if player is in front or behind portal
        const playerToPortal = new THREE.Vector3().subVectors(this.playerCam.position, position);
        if (playerToPortal.dot(normal) > 0) {
            normal.negate();
        }

        //offset to fix gap
        const offset = normal.clone().multiplyScalar(-0.01); 
        position.add(offset);

        //sets position/orientation of clipping plane
        this.clippingPlane.setFromNormalAndCoplanarPoint(normal, position);
    }

    //called every frame before main/player camera is rendered
    render(renderer, scene){
        renderer.clippingPlanes = [this.clippingPlane];

        renderer.setRenderTarget(this.renderTarget);
        renderer.render(scene, this.portalCam);
        renderer.setRenderTarget(null);

        renderer.clippingPlanes = [];
    }
}