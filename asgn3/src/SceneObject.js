class SceneObject{
    constructor(mesh = null, material = null){
        this.localMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();

        this.mesh = mesh;

        this.material = material;

        this.isStatic = false;
        this.isBatched = false;

        this.parent = null;
        this.children = [];
    }

    //added these so I wouldn't need to write ".localMatrix" every time
    rotate(angle, x, y, z){
        this.localMatrix.rotate(angle, x, y, z);
    }

    translate(x, y, z){
        this.localMatrix.translate(x, y, z);
    }

    scale(x, y, z){
        this.localMatrix.scale(x, y, z);
    }

    //world matrix contains final world transform for the object after updateWorldMatrix
    updateWorldMatrix(parentWorldMatrix){
        if(parentWorldMatrix){
            this.worldMatrix.set(parentWorldMatrix);
            this.worldMatrix.multiply(this.localMatrix);
        }
        else{
            this.worldMatrix.set(this.localMatrix);
        }

        for(let child of this.children){
            child.updateWorldMatrix(this.worldMatrix);
        }
    }

    addChild(child){
        child.parent = this;
        this.children.push(child);
    }

    removeChild(child){
        child.parent = null;
        this.children.pop(child);
    }
}