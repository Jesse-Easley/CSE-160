var VSHADER_SOURCE = 
    `attribute vec4 a_Position;
     uniform mat4 u_ModelMatrix;
     uniform mat4 u_GlobalRotation;
     void main() {
        gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
     }`;

var FSHADER_SOURCE = 
    `precision mediump float;
     uniform vec4 u_FragColor;
     void main(){
        gl_FragColor = u_FragColor;
     }`;


class Renderer{
    constructor(gl){
        this.gl = gl;

        initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
        this.initGLState();
        this.initShaderVariables();
    }

    initGLState(){
        const gl = this.gl;

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.4, 0.5, 1.0);
    }

    initShaderVariables(){
        const gl = this.gl;

        //gets storage location of a_Position
        this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (this.a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }

        //gets storage location of u_ModelMatrix
        this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        if(!this.u_ModelMatrix){
            console.log('Failed to get storage location of u_ModelMatrix');
            return;
        }

        //gets storage location of u_GlobalRotation
        this.u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
        if(!this.u_GlobalRotation){
            console.log('Failed to get storage location of u_GlobalRotation');
            return;
        }

        //gets storage location of u_FragColor
        this.u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
        if(!this.u_FragColor){
            console.log('Failed to get storage location of u_FragColor');
            return;
        }
    }

    // initBuffers(){
    //     const gl = this.gl;

    //     //create buffer and fill with base cube
    //     this.cubeBuffer = gl.createBuffer();
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer);
    //     gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices, gl.STATIC_DRAW);
    // }

    clear(){
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    drawCube(M, color){
        const gl = this.gl;

        //base cube which we will transform
        this.cubeVertices = new Float32Array([
            //front face
            -0.5, -0.5,  0.5,
            0.5, -0.5,  0.5,
            0.5,  0.5,  0.5,

            -0.5, -0.5,  0.5,
            0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,

            //back face
            -0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
            0.5,  0.5, -0.5,

            -0.5, -0.5, -0.5,
            0.5,  0.5, -0.5,
            0.5, -0.5, -0.5,

            //left face
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,

            -0.5, -0.5, -0.5,
            -0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5,

            //right face
            0.5, -0.5, -0.5,
            0.5,  0.5, -0.5,
            0.5,  0.5,  0.5,

            0.5, -0.5, -0.5,
            0.5,  0.5,  0.5,
            0.5, -0.5,  0.5,

            //top face
            -0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,
            0.5,  0.5,  0.5,

            -0.5,  0.5, -0.5,
            0.5,  0.5,  0.5,
            0.5,  0.5, -0.5,

            //bottom face
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5,  0.5,

            -0.5, -0.5, -0.5,
            0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5,
        ]);

        //create and bind buffer
        this.cubeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer);

        //send base cube to ARRAY_BUFFER
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices, gl.STATIC_DRAW);

        //assign buffer object to a_Position and enable assignment
        gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_Position);

        //create global rotation matrix
        const globalRot = new Matrix4();
        globalRot.setRotate(gAnimalGlobalRotation, 0, 1, 0);

        //assign data to appropriate variables
        gl.uniformMatrix4fv(this.u_GlobalRotation, false, globalRot.elements)
        gl.uniformMatrix4fv(this.u_ModelMatrix, false, M.elements);
        gl.uniform4fv(this.u_FragColor, color);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}