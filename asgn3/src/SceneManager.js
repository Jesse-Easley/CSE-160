class SceneManager{
    constructor(renderer, textureManager){
        //creates root from which all other objects inherit transforms
        this.root = new SceneObject();
        this.renderer = renderer

        this.batches = [];

        //hardcoded for testing purposes
        var cubeMesh = generateCubeMesh(gl);
        cubeMesh.createBuffers();
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
        
        for (let i = 0; i < 1000000; i++) {
            function randomTexture() {
                return Math.random() < 0.5 ? texSky : texGround;
            }

            const obj = new SceneObject(cubeMesh, randomTexture());

            //random position
            const x = (Math.random() - 0.5)*100;
            const y = (Math.random())*100;
            const z = (Math.random() - 0.5)*100;
            obj.translate(x, y, z);

            //random rotation
            obj.rotate(
                Math.random() * 360,
                Math.random(),
                Math.random(),
                Math.random()
            );

            //random scale
            const s = Math.random() * .01 + 0.2;
            obj.scale(s, s, s);

            obj.isStatic = true;

            //add to scene
            this.root.addChild(obj);
        }

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

        //seperate all statics into batches
        const groups = this.groupStatics(staticObjects);

        //merge their meshes and create new batch objects
        for(const [key, group] of groups){
            let newMesh = this.mergeMeshes(group.objects);
            newMesh.createBuffers();
            newMesh.uploadBuffers();
            this.batches.push(new SceneObject(newMesh, group.texture));
        }

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
            const key = object.texture.id + "|" + object.mesh.id;

            if(!groups.has(key)){
                groups.set(key, {
                    texture: object.texture,
                    mesh: object.mesh,
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
}