var VSHADER_SOURCE = 
    `attribute vec4 a_Position;
     uniform mat4 u_ModelMatrix;
     uniform mat4 u_GlobalRotation;

     attribute vec4 a_FragColor;
     varying vec4 v_FragColor;

     attribute vec2 a_UV;
     varying vec2 v_UV;

     void main() {
        gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
        v_FragColor = a_FragColor;
        v_UV = a_UV;
     }`;

var FSHADER_SOURCE = 
    `precision mediump float;

     varying vec4 v_FragColor;

     uniform float u_texColorWeight;
     uniform sampler2D u_Sampler;
     varying vec2 v_UV;

     void main(){
        vec4 texColor = texture2D(u_Sampler, v_UV);
        gl_FragColor = mix(v_FragColor, texColor, u_texColorWeight);
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
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

        //gets storage location of u_ModelMatrix
        this.u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
        if(!this.u_GlobalRotation){
            console.log('Failed to get storage location of u_GlobalRotation');
            return;
        }


        //gets storage location of a_UV
        this.a_UV = gl.getAttribLocation(gl.program, 'a_UV');
        if(!this.a_UV){
            console.log('Failed to get storage location of a_UV!');
            return;
        }

        
        //gets storage location of u_FragColor
        this.u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
        if(!this.u_texColorWeight){
            console.log('Failed to get storage location of u_texColorWeight');
            return;
        }


        //gets storage location of a_FragColor
        this.a_FragColor = gl.getAttribLocation(gl.program, 'a_FragColor');
        if(!this.a_FragColor){
            console.log('Failed to get storage location of a_FragColor!');
            return;
        }
    }

    initBuffers(){
        this.buffer = this.gl.createBuffer();
    }

    clear(){
        this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    drawMesh(object){
        const gl = this.gl;

        //create and bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        //send object mesh to ARRAY_BUFFER
        gl.bufferData(gl.ARRAY_BUFFER, object.mesh, gl.STATIC_DRAW);

        //assign buffer object to a_Position and enable assignment
        gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_Position);

        let globalRot = new Matrix4();
        globalRot.rotate(-gViewingAngle, 1,0,0);
        globalRot.rotate(gGlobalRotation,0,1,0);

        //assign data to appropriate variables
        gl.uniformMatrix4fv(this.u_ModelMatrix, false, object.worldMatrix.elements);
        gl.uniformMatrix4fv(this.u_GlobalRotation, false, globalRot.elements);

        gl.vertexAttrib4fv(this.a_FragColor, object.color);
        gl.uniform1f(this.u_texColorWeight, 0.0);

        gl.drawArrays(gl.TRIANGLES, 0, object.mesh.length / 3);
    }
}