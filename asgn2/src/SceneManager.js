class SceneManager{
    constructor(){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();

        this.makePenguin();
    }

    setRenderer(renderer){
        this.renderer = renderer
        if(!renderer){
            console.log("Failed to get renderer!");
        }
    }

    renderScene(){
        this.renderer.clear();

        this.penguinTransforms();

        //update the transformation matrices of all scene objects
        this.root.updateWorldMatrix(null);

        //start traversal for rendering
        this.traverseSceneGraph(this.root);
    }

    traverseSceneGraph(object){
        //if not an empty SceneObject, draw it
        if(object.mesh){
            this.renderer.drawMesh(object);
        }

        for(let child of object.children){
            this.traverseSceneGraph(child);
        }
    }

    //creates and connects sceneobjects which make up the penguin
    makePenguin(){
        this.body = new Cube();
        this.body.color = [0.15, 0.15, 0.15, 1.0];
        this.root.addChild(this.body);

        this.neck = new Cube();
        this.neck.color = [0.15, 0.15, 0.15, 1.0];
        this.body.addChild(this.neck);

        this.head = new Cube();
        this.head.color = [0.15, 0.15, 0.15, 1.0];
        this.neck.addChild(this.head);

        this.belly = new Cylinder();
        this.body.addChild(this.belly);

        //eyes
        this.rightEye = new Cylinder();
        this.head.addChild(this.rightEye);

        this.rightPupil = new Cylinder();
        this.rightPupil.color = [0.15, 0.15, 0.15, 1.0];
        this.rightEye.addChild(this.rightPupil);

        this.leftEye = new Cylinder();
        this.head.addChild(this.leftEye);

        this.leftPupil = new Cylinder();
        this.leftPupil.color = [0.15, 0.15, 0.15, 1.0];
        this.leftEye.addChild(this.leftPupil);

        //beaks
        this.upperBeakJoint = new SceneObject(); //hinge
        this.head.addChild(this.upperBeakJoint);

        this.upperBeak = new Cylinder();
        this.upperBeak.color = [1.0, 0.5, 0.0, 1.0];
        this.upperBeakJoint.addChild(this.upperBeak);
        
        this.lowerBeakJoint = new SceneObject(); //hinge
        this.head.addChild(this.lowerBeakJoint);

        this.lowerBeak = new Cylinder();
        this.lowerBeak.color = [1.0, 0.5, 0.0, 1.0];
        this.lowerBeakJoint.addChild(this.lowerBeak);

        //wings
        this.leftWingJoint = new SceneObject(); //hinge
        this.body.addChild(this.leftWingJoint);

        this.leftWing = new Cylinder();
        this.leftWing.color = [0.18, 0.18, 0.18, 1.0];
        this.leftWingJoint.addChild(this.leftWing);

        this.rightWingJoint = new SceneObject(); //hinge
        this.body.addChild(this.rightWingJoint);

        this.rightWing = new Cylinder();
        this.rightWing.color = [0.18, 0.18, 0.18, 1.0];
        this.rightWingJoint.addChild(this.rightWing);

        //legs
        this.hips = new SceneObject();
        this.body.addChild(this.hips);

        this.upperLeftLeg = new Cylinder();
        this.upperLeftLeg.color = [0.18, 0.18, 0.18, 1.0];
        this.hips.addChild(this.upperLeftLeg);

        this.lowerLeftLeg = new Cylinder();
        this.lowerLeftLeg.color = [0.60, 0.55, 0.55, 1.0];
        this.upperLeftLeg.addChild(this.lowerLeftLeg);

        this.leftFoot = new Cube();
        this.leftFoot.color = [0.60, 0.55, 0.55, 1.0];
        this.lowerLeftLeg.addChild(this.leftFoot);

        this.upperRightLeg = new Cylinder();
        this.upperRightLeg.color = [0.18, 0.18, 0.18, 1.0];
        this.hips.addChild(this.upperRightLeg);

        this.lowerRightLeg = new Cylinder();
        this.lowerRightLeg.color = [0.60, 0.55, 0.55, 1.0];
        this.upperRightLeg.addChild(this.lowerRightLeg);

        this.rightFoot = new Cube();
        this.rightFoot.color = [0.60, 0.55, 0.55, 1.0];
        this.lowerRightLeg.addChild(this.rightFoot);
    }

    //creates transformation matrices for the penguin
    penguinTransforms(){
        this.body.localMatrix.setIdentity();
        this.body.translate(0, -.3, 0);
        this.body.rotate(gBodyTwist, 0, 1, 0);
        this.body.rotate(-10, 1, 0, 0);
        this.body.scale(.4, .5, .4);

        this.belly.localMatrix.setIdentity();
        this.belly.translate(0, 0, -0.22);
        this.belly.scale(0.5, 0.8, 0.4);

        this.neck.localMatrix.setIdentity();
        this.neck.translate(0, 0.6, 0);
        this.neck.scale(0.8, 0.4, 0.8);

        this.head.localMatrix.setIdentity();
        this.head.translate(0, 1, 0);
        this.head.scale(.8, 1.5, .8);

        //eyes
        this.rightEye.localMatrix.setIdentity();
        this.rightEye.translate(0.48,0.2,0);
        this.rightEye.rotate(90,0,0,1);
        this.rightEye.scale(0.1,0.1,0.1);

        this.rightPupil.localMatrix.setIdentity();
        this.rightPupil.translate(0,-0.5,0);
        this.rightPupil.scale(0.5,0.1,0.5)

        this.leftEye.localMatrix.setIdentity();
        this.leftEye.translate(-0.48,0.2,0);
        this.leftEye.rotate(90,0,0,1);
        this.leftEye.scale(0.1,0.1,0.1);

        this.leftPupil.localMatrix.setIdentity();
        this.leftPupil.translate(0,0.5,0);
        this.leftPupil.scale(0.5,0.1,0.5)

        //beaks
        this.upperBeakJoint.localMatrix.setIdentity();
        this.upperBeakJoint.translate(0.0, 0.2, -0.1)
        this.upperBeakJoint.rotate(gBeakAngle, 1, 0, 0);

        this.upperBeak.localMatrix.setIdentity();
        this.upperBeak.translate(0.0, 0.0, -.4);
        this.upperBeak.scale(0.3, 0.3, 0.9);

        this.lowerBeakJoint.localMatrix.setIdentity();
        this.lowerBeakJoint.translate(0.0, 0.0, -0.1);
        this.lowerBeakJoint.rotate(-gBeakAngle, 1, 0, 0);

        this.lowerBeak.localMatrix.setIdentity();
        this.lowerBeak.translate(0.0, 0.0, -.4);
        this.lowerBeak.scale(0.3, 0.1, 0.9);

        //wings
        this.leftWingJoint.localMatrix.setIdentity();
        this.leftWingJoint.translate(0.5,0.4,0);
        this.leftWingJoint.rotate(-gWingAngle, 0, 0, 1);

        this.leftWing.localMatrix.setIdentity();
        this.leftWing.translate(0.4,0,0);
        this.leftWing.scale(0.5, 0.1, 0.4);

        this.rightWingJoint.localMatrix.setIdentity();
        this.rightWingJoint.translate(-0.5,0.4,0);
        this.rightWingJoint.rotate(gWingAngle, 0, 0, 1);

        this.rightWing.localMatrix.setIdentity();
        this.rightWing.translate(-0.4, 0,0);
        this.rightWing.scale(0.5, 0.1, 0.4);

        //legs
        this.hips.localMatrix.setIdentity();
        this.hips.translate(0,-0.55,0);
        this.hips.rotate(gHipTwist, 0, 1, 0);
        this.hips.rotate(8, 1, 0, 0);
        this.hips.scale(1.1,1.4,1.1)

        this.upperLeftLeg.localMatrix.setIdentity();
        this.upperLeftLeg.translate(-0.2,0,0)
        this.upperLeftLeg.rotate(-gHipTwist, 0, 1, 0);
        this.upperLeftLeg.rotate(-gLeftLegAngle, 1, 0, 0);
        this.upperLeftLeg.scale(0.15, 0.15, 0.15);

        this.lowerLeftLeg.localMatrix.setIdentity();
        this.lowerLeftLeg.translate(0,-1,0);
        this.lowerLeftLeg.scale(0.4,1,0.4);

        this.leftFoot.localMatrix.setIdentity();
        this.leftFoot.translate(0,-0.5,0)
        this.leftFoot.rotate(gLeftFootAngle, 1, 0, 0);
        this.leftFoot.translate(0,0,-2)
        this.leftFoot.scale(3,0.4,6);

        this.upperRightLeg.localMatrix.setIdentity();
        this.upperRightLeg.translate(0.2,0,0);
        this.upperRightLeg.rotate(-gHipTwist, 0, 1, 0);
        this.upperRightLeg.rotate(-gRightLegAngle, 1, 0, 0);
        this.upperRightLeg.scale(0.15, 0.15, 0.15);

        this.lowerRightLeg.localMatrix.setIdentity();
        this.lowerRightLeg.translate(0,-1,0);
        this.lowerRightLeg.scale(0.4, 1, 0.4);

        this.rightFoot.localMatrix.setIdentity();
        this.rightFoot.translate(0,-0.5,0);
        this.rightFoot.translate(0,0,-2)
        this.rightFoot.rotate(gRightFootAngle, 1, 0, 0);
        this.rightFoot.scale(3,0.4,6);
    }
}