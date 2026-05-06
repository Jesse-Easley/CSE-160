class SceneManager{
    constructor(renderer, textureManager){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();
        this.renderer = renderer

        //hardcoded for testing purposes
        // var cubeMesh = generateCubeMesh(gl);
        // let c = new SceneObject(cubeMesh, textureManager.load("../resources/sky.jpg"));
        // this.root.addChild(c);

        // let v = new SceneObject();
        // v.mesh = cubeMesh;
        // v.texture = textureManager.load("../resources/ground_texture.png");
        // this.root.addChild(v);
        // v.scale(0.5,0.5,0.5);
        // v.translate(1,0,0);

        // let d = new SceneObject();
        // d.mesh = cubeMesh;
        // d.texture = textureManager.load("../resources/sky.jpg");
        // v.addChild(d);
        // d.texColorWeight = 0.5;
        // d.scale(0.5,0.5,0.5);
        // d.translate(1,0,0);

        const texSky = textureManager.load("../resources/sky.jpg");
        const texGround = textureManager.load("../resources/ground_texture.png");
        var cubeMesh = generateCubeMesh(gl);
        for (let i = 0; i < 4; i++) {
            const obj = new SceneObject();

            function randomTexture() {
                return Math.random() < 0.5 ? texSky : texGround;
            }

            //mesh + texture
            obj.mesh = cubeMesh;
            obj.texture = randomTexture();

            //random scale
            const s = Math.random() * 0.5 + 0.2;
            obj.scale(s, s, s);

            // random position
            const x = (Math.random() - 0.5)*1.5;
            const y = (Math.random() - 0.5)*1.5;
            const z = (Math.random() - 0.5)*1.5;
            obj.translate(x, y, z);

            //random rotation
            obj.rotate(
                Math.random() * 360,
                Math.random(),
                Math.random(),
                Math.random()
            );

            //add to scene
            this.root.addChild(obj);
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