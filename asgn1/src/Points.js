class Point{
    constructor(){
        this.type = 'point';
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0];
        this.size = 10.0;
    }

    render(){
        var coords = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.disableVertexAttribArray(a_Position);
        gl.vertexAttrib3f(a_Position, coords[0], coords[1], 0.0);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([coords[0], coords[1], 0.0]), gl.DYNAMIC_DRAW);
        gl.uniform1f(u_Size, size);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
