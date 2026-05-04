class SceneManager{
    constructor(){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();

        this.c = new Cube();
        this.root.addChild(this.c);
    }

    setRenderer(renderer){
        this.renderer = renderer
        if(!renderer){
            console.log("Failed to get renderer!");
        }
    }

    renderScene(){
        this.renderer.clear();

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
}