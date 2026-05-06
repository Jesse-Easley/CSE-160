class Mesh{
    constructor(gl, vertices, indices){
        this.vertices = vertices;
        this.indices = indices;

        this.vertexBuffer = gl.createBuffer();
        this.indiceBuffer = gl.createBuffer();

        //upload buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        this.indexCount = this.indices.length;
    }

    bind(gl){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
    }
}