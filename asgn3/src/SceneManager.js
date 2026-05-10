class SceneManager{
    constructor(renderer, textureManager){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();
        this.renderer = renderer;
        this.textureManager = textureManager;

        this.batches = [];

        this.generateLevel();

        this.batchStatics();
    }

    renderScene(){
        this.renderer.clear();

        //update the transformation matrices of all scene objects
        this.root.updateWorldMatrix(null);

        //render all batches
        for (const batch of this.batches) {
            this.renderer.drawMesh(batch);
        }

        //traverse scene graph and render non-batched 
        this.renderSceneGraph(this.root);
    }

    //batches objects based on texture
    batchStatics(){
        //update world matrices
        this.root.updateWorldMatrix(null);

        //get static objects
        const staticObjects = [];
        this.collectStatics(this.root, staticObjects);
        console.log(`${staticObjects.length} static objects collected!`);

        //seperate all statics into batches
        const groups = this.groupStatics(staticObjects);

        //merge their meshes and create new batch objects
        for(const [key, group] of groups){
            let newMesh = this.mergeMeshes(group.objects);
            newMesh.createBuffers();
            newMesh.uploadBuffers();

            this.batches.push(new SceneObject(newMesh, group.material));
        }
        console.log(`${this.batches.length} static batches created!`);

        //mark batched objects
        for(let obj of staticObjects){
            obj.isBatched = true;
        }
    }

    collectStatics(object, staticObjects){
        if(object.isStatic && object.mesh){
            staticObjects.push(object);
        }

        for(const child of object.children){   
            this.collectStatics(child, staticObjects);
        }
    }

    groupStatics(staticObjects){
        let groups = new Map();

        for(const object of staticObjects){
            const key = object.material.id;

            if(!groups.has(key)){
                groups.set(key, {
                    material: object.material,
                    objects: []
                });
            }

            groups.get(key).objects.push(object);
        }

        return groups;
    }

    //take in list of objects to merge meshes
    //used for batching
    //objects will need same vertex/indice layout
    //update worldmatrices before batching 
    mergeMeshes(objects){
        let mergedVertices = [];
        let mergedIndices = [];
        let indicesOffset = 0; //makes sure indices point to vertices for correct object

        //iterate through objects
        for(let obj of objects){
            const mesh = obj.mesh;
            const world = obj.worldMatrix;

            //apply world transform to vertices
            for(let i = 0; i < mesh.vertices.length; i += 8){
                const x = mesh.vertices[i + 0];
                const y = mesh.vertices[i + 1];
                const z = mesh.vertices[i + 2];

                const newPos = world.multiplyVector3(new Vector3([x, y, z]));

                //push new vertices
                mergedVertices.push(
                    newPos.elements[0], newPos.elements[1], newPos.elements[2], //new position
                    mesh.vertices[i + 3], mesh.vertices[i + 4], mesh.vertices[i + 5], //normals
                    mesh.vertices[i + 6], mesh.vertices[i + 7] //uv
                );
            }

            //push indices
            for(let i = 0; i < mesh.indexCount; i++){
                mergedIndices.push(mesh.indices[i] + indicesOffset)
            }
            indicesOffset += mesh.vertices.length / 8;
        }

        return new Mesh(gl, new Float32Array(mergedVertices), new Uint16Array(mergedIndices));
    }

    renderSceneGraph(object){
        //if not an empty SceneObject, draw it
        if(object.mesh && !object.isBatched){
            this.renderer.drawMesh(object);
        }

        for(let child of object.children){
            this.renderSceneGraph(child);
        }
    }

    generateLevel(){
        const lvlArray = [
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
        ];

        //generate cube mesh
        const cubeMesh = generateCubeMesh(gl);
        const skyboxMesh = generateSkyboxCubeMesh(gl);
        cubeMesh.createBuffers();
        cubeMesh.uploadBuffers();

        //create sky and ground mats
        const skyMat = new Material;
        skyMat.textures.diffuse = this.textureManager.load("../resources/sky.jpg", "diffuse");
        const groundMat = new Material();
        groundMat.textures.diffuse = this.textureManager.load("../resources/ground_texture.png", "diffuse");

        //setup sky and ground cubes
        let skybox = new SceneObject(skyboxMesh, skyMat);
        this.root.addChild(skybox);
        skybox.material.texColorWeight = 0.0;
        skybox.material.color = [0.3, 0.4, 0.8, 1.0];
        skybox.scale(100,100,100);
        skybox.isStatic = true;

        let ground = new SceneObject(cubeMesh, groundMat);
        this.root.addChild(ground);
        ground.translate(0.5, 0.45, 0.5);
        ground.scale(32, 0.1, 32);
        // ground.isStatic = true;

        //material for the walls
        const wallMat = new Material();
        wallMat.textures.diffuse = this.textureManager.load("../resources/rock_wall_16_diff_1k.png");
        wallMat.textures.ao = this.textureManager.load("../resources/rock_wall_16_ao_1k.png");
        const wallMesh = generateCubeMesh(gl);

        //iterate through array and place blocks
        for(let row = 0; row < lvlArray.length; row++){
            for(let col = 0; col < lvlArray[row].length; col++){
                for(let i = 0; i < lvlArray[row][col]; i++){
                    let obj = new SceneObject();

                    let worldCol = 16 - col;
                    let worldRow = 16 - row;

                    obj.translate(worldCol,i+1,worldRow);

                    obj.mesh = wallMesh;
                    obj.material = wallMat;
                    obj.isStatic = true;

                    this.root.addChild(obj);
                }
            }
        }
    }
}