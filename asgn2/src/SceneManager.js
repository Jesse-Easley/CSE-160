class SceneManager{
    constructor(){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();

        this.makePenguin();
    }

    setRenderer(renderer){
        this.renderer = renderer
    }

    renderScene(){
        var startTime = performance.now();

        const render = this.renderer;
        render.clear();

        this.penguinTransforms();

        //update the transformation matrices of all scene objects
        this.root.updateWorldMatrix(null);

        //start traversal for rendering
        this.traverseSceneGraph(this.root);

        var duration = performance.now() - startTime;
        sendTextToHTML("ms: " + Math.floor(duration) + ", fps: " + Math.floor(10000/duration), "fps");
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

    /**
     * @description Creates and connects SceneObjects for penguin model
     */
    makePenguin(){
        this.body = new Cube();
        this.belly = new Cylinder();
        this.neck = new Cube();
        this.head = new Cube();
        this.upperBeak = new Cylinder();
        this.lowerBeak = new Cylinder();
        this.leftWingJoint = new SceneObject(); //empty to act as joint
        this.leftWing = new Cylinder();
        this.rightWingJoint = new SceneObject(); //empty to act as joint
        this.rightWing = new Cylinder();

        this.root.addChild(this.body);
        this.body.addChild(this.belly);
        this.body.addChild(this.neck);
        this.body.addChild(this.leftWingJoint);
        this.body.addChild(this.rightWingJoint);
        this.leftWingJoint.addChild(this.leftWing);
        this.rightWingJoint.addChild(this.rightWing);
        this.neck.addChild(this.head);
        this.head.addChild(this.upperBeak);
        this.head.addChild(this.lowerBeak);

        this.body.color = [0.15, 0.15, 0.15, 1.0];
        this.neck.color = [0.15, 0.15, 0.15, 1.0];
        this.head.color = [0.15, 0.15, 0.15, 1.0];
        this.upperBeak.color = [1.0, 0.5, 0.0, 1.0];
        this.lowerBeak.color = [1.0, 0.5, 0.0, 1.0];
        this.leftWing.color = [1, 0.15, 0.15, 1.0];
        this.rightWing.color = [1, 0.15, 0.15, 1.0];

    }

    /**
     * @description Creates transformatin matrices for the various parts of the penguin
     */
    penguinTransforms(){
        this.body.localMatrix.setIdentity();
        this.belly.localMatrix.setIdentity();
        this.neck.localMatrix.setIdentity();
        this.head.localMatrix.setIdentity();
        this.upperBeak.localMatrix.setIdentity();
        this.lowerBeak.localMatrix.setIdentity();
        this.leftWingJoint.localMatrix.setIdentity();
        this.leftWing.localMatrix.setIdentity();
        this.rightWingJoint.localMatrix.setIdentity();
        this.rightWing.localMatrix.setIdentity();

        this.body.translate(0, -.3, 0);
        this.body.scale(.4, .5, .4);
        this.body.rotate(0, 1, 0, 0); 

        this.belly.translate(0, 0, -0.22);
        this.belly.scale(0.5, 0.8, 0.4);

        this.neck.translate(0, 0.6, 0);
        this.neck.scale(0.8, 0.4, 0.8);

        this.head.translate(0, 1, 0);
        this.head.scale(.8, 1.5, .8);

        //beaks
        this.upperBeak.translate(0.0, 0.2, -0.1); //move to hinge point
        this.upperBeak.rotate(gBeakAngle, 1, 0, 0);
        this.upperBeak.translate(0.0, 0.0, -.4); //move to final position
        this.upperBeak.scale(0.3, 0.3, 0.9);

        this.lowerBeak.translate(0.0, 0.0, -0.1); //move to hinge point
        this.lowerBeak.rotate(-gBeakAngle, 1, 0, 0);
        this.lowerBeak.translate(0.0, 0.0, -.4); //move to final position
        this.lowerBeak.scale(0.3, 0.1, 0.9);

        //wings
        this.leftWingJoint.translate(0.5,0.4,0);
        this.leftWingJoint.rotate(-gWingAngle, 0, 0, 1);

        this.leftWing.translate(0.5,0,0);
        this.leftWing.scale(0.6, 0.1, 0.4);

        this.rightWingJoint.translate(-0.5,0.6,0);
        this.rightWingJoint.rotate(gWingAngle, 0, 0, 1);

        this.rightWing.translate(-0.5,-0.2,0);
        this.rightWing.scale(0.6, 0.1, 0.4);
    }
}