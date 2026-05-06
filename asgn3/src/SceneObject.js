class SceneObject{
    constructor(mesh = null, texture = null){
        this.localMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();

        this.color = [1.0, 0.0, 0.0, 1.0];

        this.mesh = mesh;

        this.texture = texture;
        this.texColorWeight = 1.0;

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
}