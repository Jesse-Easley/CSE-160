class Triangle{
    constructor(){
        this.type = 'triangle';
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0];
        this.size = 10.0;
    }


    render(){
        var coords = this.position;
        var rgba = this.color;
        var size = this.size;
        
        gl.uniform1f(u_Size, size);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var d = size * 2 / canvas.height; //keeps tris the same side length as points
        drawTriangle([coords[0], coords[1] + d, coords[0], coords[1], coords[0] + d, coords[1]])
    }
}

function drawTriangle(vertices){
  var n = 3; // The number of vertices

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}