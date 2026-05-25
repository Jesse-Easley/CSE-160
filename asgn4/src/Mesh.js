class Mesh{
    static _id = 0;
    constructor(gl, vertices, indices){
        this.gl = gl;
        this.vertices = vertices;
        this.indices = indices;

        this.id = Mesh._id++;
        
        this.indexCount = this.indices.length;

        console.log(`Mesh ${this.id} created!`);
    }

    createBuffers(){
        this.vertexBuffer = this.gl.createBuffer();
        this.indiceBuffer = this.gl.createBuffer();
    }

    uploadBuffers(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);
    
        console.log(`Mesh ${this.id} buffers uploaded!`);
    }

    bind(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
    }

}

let myMesh = new Mesh(gl, new Float32Array([1,2,3]), new Uint16Array([0]));