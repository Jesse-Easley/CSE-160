class Mesh{
    static s_id = 0;
    constructor(gl, vertices, indices){
        this.vertices = vertices;
        this.indices = indices;

        this.id = Mesh.s_id++;
        
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

    bind(gl){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
    }
}