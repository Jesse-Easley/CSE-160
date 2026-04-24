class SceneObject{
    constructor(){
        this.modelMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();

        this.color = [1.0, 1.0, 1.0, 1.0];

        this.parent = null;
        this.children = [];
        this.mesh = null;
    }

    rotate(angle, x, y, z){
        this.modelMatrix.rotate(angle, x, y, z);
    }

    translate(x, y, z){
        this.modelMatrix.translate(x, y, z);
    }

    scale(x, y, z){
        this.modelMatrix.scale(x, y, z);
    }

    updateWorldMatrix(parentWorldMatrix){
        if(parentWorldMatrix){
            this.worldMatrix.set(parentWorldMatrix);
            this.worldMatrix.multiply(this.modelMatrix);
        }
        else{
            this.worldMatrix.set(this.modelMatrix);
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