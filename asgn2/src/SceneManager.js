class SceneManager{
    constructor(){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();
    }

    setRenderer(renderer){
        this.renderer = renderer
    }

    renderScene(){
        const render = this.renderer;
        render.clear();

        this.penguinTransforms();

        //update the transformation matrices of all scene objects
        this.root.updateWorldMatrix(null);

        //start traversal for rendering
        this.traverseSceneGraph(this.root);
        return;
    }

    traverseSceneGraph(object){
        if(object != this.root){
            this.renderer.drawCube(object.worldMatrix, object.color);
        }

        for(let child of object.children){
            this.traverseSceneGraph(child);
        }
    }

    /**
     * @description Creates and connects SceneObjects for penguin model
     */
    makePenguin(){
        this.body = new SceneObject();
        this.belly = new SceneObject();
        this.neck = new SceneObject();
        this.head = new SceneObject();
        this.upperBeak = new SceneObject();
        this.upperBeakEnd = new SceneObject();
        this.lowerBeak = new SceneObject();
        this.lowerBeakEnd = new SceneObject();

        this.root.addChild(this.body);
        this.body.addChild(this.belly);
        this.body.addChild(this.neck);
        this.neck.addChild(this.head);
        this.head.addChild(this.upperBeak);
        this.upperBeak.addChild(this.upperBeakEnd);
        this.head.addChild(this.lowerBeak);
        this.lowerBeak.addChild(this.lowerBeakEnd);

        this.body.color = [0.15, 0.15, 0.15, 1.0];
        this.neck.color = [0.15, 0.15, 0.15, 1.0];
        this.head.color = [0.15, 0.15, 0.15, 1.0];
        this.upperBeak.color = [1.0, 0.5, 0.0, 1.0];
        this.upperBeakEnd.color = [1.0, 0.5, 0.0, 1.0];
        this.lowerBeak.color = [1.0, 0.5, 0.0, 1.0];
        this.lowerBeakEnd.color = [1.0, 0.5, 0.0, 1.0];

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
        this.upperBeakEnd.localMatrix.setIdentity();
        this.lowerBeak.localMatrix.setIdentity();
        this.lowerBeakEnd.localMatrix.setIdentity();

        this.body.translate(0, -.3, 0);
        this.body.scale(.4, .5, .4);
        this.body.rotate(0, 1, 0, 0);

        this.belly.translate(0, 0, -0.3);
        this.belly.scale(0.8, 0.8, 0.5);

        this.neck.translate(0, 0.6, 0);
        this.neck.scale(0.8, 0.4, 0.8);

        this.head.translate(0, 1, 0);
        this.head.scale(.8, 1.5, .8);

        this.upperBeak.translate(0.0, 0.2, -0.1); //move to hinge point
        this.upperBeak.rotate(gBeakAngle, 1, 0, 0); //angle around hinge
        this.upperBeak.translate(0.0, 0.0, -.4); //move to final position
        this.upperBeak.scale(0.3, 0.3, 0.9);

        this.upperBeakEnd.translate(0.0, -0.1, -0.5)
        this.upperBeakEnd.scale(0.75, 0.8, 0.4);

        this.lowerBeak.translate(0.0, 0.0, -0.1); //move to hinge point
        this.lowerBeak.rotate(-gBeakAngle, 1, 0, 0); //angle around hinge
        this.lowerBeak.translate(0.0, 0.0, -.4); //move to final position
        this.lowerBeak.scale(0.3, 0.1, 0.9);

        this.lowerBeakEnd.translate(0.0, 0.1, -0.5);
        this.lowerBeakEnd.scale(0.75, 0.8, 0.4);

    }
}