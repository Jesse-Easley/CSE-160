class SceneManager{
    constructor(renderer, textureManager){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();
        this.renderer = renderer

        //hardcoded for testing purposes
        var cubeMesh = generateCubeMesh(gl);
        cubeMesh.uploadBuffers();
        
        const texSky = textureManager.load("../resources/sky.jpg");
        const texGround = textureManager.load("../resources/ground_texture.png");

        let skybox = new SceneObject(cubeMesh, texSky);

        this.root.addChild(skybox);
        skybox.texColorWeight = 0.0;
        skybox.color = [0.3, 0.4, 0.8, 1.0];
        skybox.scale(100,100,100);

        let ground = new SceneObject(cubeMesh, texGround);
        this.root.addChild(ground);
        ground.scale(100, 0.1, 100);
        ground.translate(0, 0, 0);

        
        for (let i = 0; i < 5; i++) {
            function randomTexture() {
                return Math.random() < 0.5 ? texSky : texGround;
            }

            const obj = new SceneObject(cubeMesh, randomTexture());

            //random scale
            const s = Math.random() * 5 + 0.2;
            obj.scale(s, s, s);

            //random position
            const x = (Math.random() - 0.5)*20;
            const y = (Math.random() - 0.5)*20;
            const z = (Math.random() - 0.5)*20;
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