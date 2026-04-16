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

    makePenguin(){
        //create penguin body and attach to scene root
        let body = new SceneObject();
        this.root.addChild(body);

        body.color = [0.15, 0.15, 0.15, 1.0];

        body.translate(0, -.3, 0);
        body.scale(.5, .5, .5);
        body.rotate(-45, 1, 0, 0)

        //add belly
        let belly = new SceneObject();
        body.addChild(belly);

        belly.translate(0,0,-0.3);
        belly.scale(0.8, 0.8, 0.5);
        
        //add neck to body
        let neck = new SceneObject();
        body.addChild(neck);

        neck.color = [0.15, 0.15, 0.15, 1.0];

        //make neck transforms
        //neck.rotate(10,1,0,0);
        neck.translate(0, 0.6, 0);
        neck.scale(0.8, 0.4, 0.8);

        //add head to neck
        let head = new SceneObject();
        neck.addChild(head);

        head.color = [0.15, 0.15, 0.15, 1.0];

        head.translate(0, 1, 0);
        head.scale(.8, 1.5, .8);

        //add upper
        let upperBeak = new SceneObject();
        head.addChild(upperBeak);

        upperBeak.color = [1.0, 0.5, 0.0, 1.0];
        
        upperBeak.translate(0, 0.3, -.5)
        upperBeak.rotate(gBeakAngle, 1, 0, 0)
        upperBeak.scale(.5, .2, 0.8);
        //upperBeak.translate(0, 0, -1);

    }
}