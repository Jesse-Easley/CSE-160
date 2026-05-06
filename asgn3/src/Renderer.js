var VSHADER_SOURCE = 
    `attribute vec4 a_Position;
     uniform mat4 u_ModelMatrix;
     uniform mat4 u_GlobalRotation;

     attribute vec3 a_Normal;
     varying vec3 v_Normal;

     attribute vec2 a_UV;
     varying vec2 v_UV;

     void main() {
        gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;

        v_UV = a_UV;
        v_Normal = a_Normal;
     }`;

var FSHADER_SOURCE = 
    `precision mediump float;

     uniform vec4 u_FragColor;

     varying vec3 v_Normal;

     uniform float u_texColorWeight;
     uniform sampler2D u_Sampler;
     varying vec2 v_UV;

     void main(){
        vec4 texColor = texture2D(u_Sampler, v_UV);
        gl_FragColor = mix(u_FragColor, texColor, u_texColorWeight);
     }`;

class Renderer{
    constructor(gl){
        this.gl = gl;

        initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
        this.initGLState();
        this.initShaderVariables();
    }

    initGLState(){
        this.gl.enable(gl.DEPTH_TEST);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    initShaderVariables(){
        const gl = this.gl;

        //gets storage location of a_Position
        this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (this.a_Position == -1) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }

        //gets storage location of u_ModelMatrix
        this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        if(this.u_ModelMatrix == -1){
            console.log('Failed to get storage location of u_ModelMatrix');
            return;
        }

        //gets storage location of u_ModelMatrix
        this.u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
        if(this.u_GlobalRotation == -1){
            console.log('Failed to get storage location of u_GlobalRotation');
            return;
        }


        //gets storage location of a_UV
        this.a_UV = gl.getAttribLocation(gl.program, 'a_UV');
        if(this.a_UV == -1){
            console.log('Failed to get storage location of a_UV!');
            return;
        }
        
        //gets storage location of u_FragColor
        this.u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
        if(this.u_texColorWeight == -1){
            console.log('Failed to get storage location of u_texColorWeight');
            return;
        }

        //gets storage location of a_FragColor
        this.u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
        if(this.u_FragColor == -1){
            console.log('Failed to get storage location of a_FragColor!');
            return;
        }

        this.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
        if(this.a_Normal == -1){
            console.log('Failed to get storage location of a_Normal!');
            return;
        }
    }

    clear(){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    drawMesh(object){
        const gl = this.gl;
        const mesh = object.mesh;

        //create and bind buffers
        mesh.bind(gl);

        //assign and enable buffer attributes
        var FSIZE = mesh.vertices.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
        gl.enableVertexAttribArray(this.a_Position);

        gl.vertexAttribPointer(this.a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3); //not needed for asgn3, but decided to include now
        gl.enableVertexAttribArray(this.a_Normal);

        gl.vertexAttribPointer(this.a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
        gl.enableVertexAttribArray(this.a_UV);

        //activate and bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, object.texture);
        gl.uniform1i(this.u_Sampler, 0);

        gl.uniform1f(this.u_texColorWeight, object.texColorWeight);
        gl.uniform4fv(this.u_FragColor, object.color);
            
        //calculate rotation
        let globalRot = new Matrix4();
        globalRot.rotate(-gViewingAngle, 1,0,0);
        globalRot.rotate(gGlobalRotation,0,1,0);

        gl.uniformMatrix4fv(this.u_ModelMatrix, false, object.worldMatrix.elements);
        gl.uniformMatrix4fv(this.u_GlobalRotation, false, globalRot.elements);

        gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}