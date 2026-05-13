class SceneObject{
    constructor(mesh = null, material = null){
        this.localMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();
        this.areTransformsDirty = true;

        this.material = material;

        this.mesh = mesh;
        this.isStatic = false;
        this.isBatched = false;

        this.parent = null;
        this.children = [];
    }

    //needed to wrap the 
    rotate(angle, x, y, z){
        this.localMatrix.rotate(angle, x, y, z);
        this.markDirty();
    }

    translate(x, y, z){
        this.localMatrix.translate(x, y, z);
        this.markDirty();
    }

    scale(x, y, z){
        this.localMatrix.scale(x, y, z);
        this.markDirty();
    }

    markDirty() {
        if (this.isStatic) return;

        if (!this.areTransformsDirty) {
            this.areTransformsDirty = true;

            // children depend on this transform, so they must update too
            for (let child of this.children) {
                child.markDirty();
            }
        }
    }

    //world matrix contains final world transform for the object after updateWorldMatrix
    updateWorldMatrix(parentWorldMatrix){
        //only update if needed
        if (this.areTransformsDirty) {
            if (parentWorldMatrix) {
                this.worldMatrix.set(parentWorldMatrix);
                this.worldMatrix.multiply(this.localMatrix);
            } else {
                this.worldMatrix.set(this.localMatrix);
            }

            this.areTransformsDirty = false;
        }

        //still need to update children
        for(let child of this.children){
            child.updateWorldMatrix(this.worldMatrix);
        }
    }

    addChild(child){
        child.parent = this;
        this.children.push(child);
    }

    removeChild(child){
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    getWorldPosition() {
        //extract translation from the world matrix (last column)
        return [
            this.worldMatrix.elements[12], //x
            this.worldMatrix.elements[13], //y
            this.worldMatrix.elements[14]  //z
        ];
    }
}