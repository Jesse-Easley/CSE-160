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
        this.initBuffers();
    }

    initGLState(){
        this.gl.enable(gl.DEPTH_TEST);
        this.gl.clearColor(0.0, 0.4, 0.5, 1.0);
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

    initBuffers(){
        this.buffer = this.gl.createBuffer();
    }

    clear(){
        this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    // drawCube(M, color){
    //     const gl = this.gl;

    //     //create and bind buffer
    //     this.cubeBuffer = gl.createBuffer();
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer);

    //     //send base cube to ARRAY_BUFFER
    //     gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices, gl.STATIC_DRAW);

    //     //assign buffer object to a_Position and enable assignment
    //     gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
    //     gl.enableVertexAttribArray(this.a_Position);

    //     //create global rotation matrix
    //     const globalRot = new Matrix4();
    //     globalRot.rotate(-gViewingAngle, 1, 0, 0);
    //     globalRot.rotate(gAnimalGlobalRotation, 0, 1, 0);

    //     //assign data to appropriate variables
    //     gl.uniformMatrix4fv(this.u_GlobalRotation, false, globalRot.elements)
    //     gl.uniformMatrix4fv(this.u_ModelMatrix, false, M.elements);
    //     gl.uniform4fv(this.u_FragColor, color);

    //     gl.drawArrays(gl.TRIANGLES, 0, this.cubeVertices.length / 3);
    // }

    // drawCylinder(M, color){
    //     const gl = this.gl;

    //     //create and bind buffer
    //     this.cylBuffer = gl.createBuffer();
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.cylBuffer);

    //     //send base cube to ARRAY_BUFFER
    //     gl.bufferData(gl.ARRAY_BUFFER, this.cylinderVertices, gl.STATIC_DRAW);

    //     //assign buffer object to a_Position and enable assignment
    //     gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
    //     gl.enableVertexAttribArray(this.a_Position);

    //     //create global rotation matrix
    //     const globalRot = new Matrix4();
    //     globalRot.rotate(-gViewingAngle, 1, 0, 0);
    //     globalRot.rotate(gAnimalGlobalRotation, 0, 1, 0);

    //     //assign data to appropriate variables
    //     gl.uniformMatrix4fv(this.u_GlobalRotation, false, globalRot.elements)
    //     gl.uniformMatrix4fv(this.u_ModelMatrix, false, M.elements);
    //     gl.uniform4fv(this.u_FragColor, color);

    //     gl.drawArrays(gl.TRIANGLES, 0, this.cylinderVertices.length / 3);
    // }

    drawMesh(object){
        const gl = this.gl;

        //create and bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        //send object mesh to ARRAY_BUFFER
        gl.bufferData(gl.ARRAY_BUFFER, object.mesh, gl.STATIC_DRAW);

        //assign buffer object to a_Position and enable assignment
        gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_Position);

        //create global rotation matrix
        const globalRot = new Matrix4();
        globalRot.rotate(-gViewingAngle, 1, 0, 0);
        globalRot.rotate(gAnimalGlobalRotation, 0, 1, 0);

        //assign data to appropriate variables
        gl.uniformMatrix4fv(this.u_GlobalRotation, false, globalRot.elements)
        gl.uniformMatrix4fv(this.u_ModelMatrix, false, object.worldMatrix.elements);
        gl.uniform4fv(this.u_FragColor, object.color);

        gl.drawArrays(gl.TRIANGLES, 0, object.mesh.length / 3);
    }
}