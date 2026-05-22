class Mesh{
    static _id = 0;
    constructor(gl, vertices, indices){
        this.vertices = vertices;
        this.indices = indices;

        this.id = Mesh._id++;
        
        this.indexCount = this.indices.length;

        console.log(`Mesh ${this.id} created!`);
    }

    createBuffers(){
        this.vertexBuffer = gl.createBuffer();
        this.indiceBuffer = gl.createBuffer();
    }

    uploadBuffers(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    
        console.log(`Mesh ${this.id} buffers uploaded!`);
    }

    bind(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
    }
}

let myMesh = new Mesh(gl, new Float32Array([1,2,3]), new Uint16Array([0]));
console.log(myMesh.vertices);