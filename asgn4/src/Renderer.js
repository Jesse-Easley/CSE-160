let VSHADER_SOURCE = 
    `attribute vec4 a_Position;
     uniform mat4 u_ModelMatrix;
     uniform mat4 u_ViewMatrix;
     uniform mat4 u_ProjectionMatrix;
     uniform mat4 u_NormalMatrix;

     attribute vec4 a_Normal;
     varying vec3 v_Normal;

     attribute vec2 a_UV;
     varying vec2 v_UV;

     varying vec3 v_Position;

     void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;

        v_UV = a_UV;

        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        v_Position = vec3(u_ModelMatrix * a_Position);
        v_Normal = normal;
     }`;

let FSHADER_SOURCE = 
    `precision mediump float;

     uniform vec4 u_FragColor;
     uniform float u_texColorWeight;

     uniform sampler2D u_diffuse;
     uniform sampler2D u_ao;
     
     varying vec3 v_Normal;
     varying vec2 v_UV;
     varying vec3 v_Position;

     uniform bool u_LightingOn;
     uniform bool u_NormalsOn;

     uniform vec3 u_LightColor;
     uniform vec3 u_LightPos;

     uniform vec3 u_CameraPos;

     uniform float u_ka;
     uniform float u_kd;
     uniform float u_ks;

     uniform float u_shininess;

     uniform vec3 u_SpotPos;
     uniform vec3  u_SpotDir;
     uniform float u_SpotCutoff;   //cos(inner angle)
     uniform float u_SpotOuter;    //cos(outer angle)
     uniform float u_SpotExponent; //falloff power

     void main(){
        vec4 texColor = texture2D(u_diffuse, v_UV);

        float ao;
        vec4 baseColor;
        if(u_NormalsOn){
            baseColor = vec4(v_Normal * 0.5 + 0.5, 1.0);
            ao = 1.0;
        }
        else{
            baseColor = mix(u_FragColor, texColor, u_texColorWeight);
            ao = texture2D(u_ao, v_UV).r;
        }

        vec3 lightDir = u_LightPos - v_Position;
        vec3 spotLightDir  = u_SpotPos - v_Position;
        vec3 lightColor = u_LightColor;
        vec3 finalColor;
        if(u_LightingOn){
            //spotlight
            vec3 L = normalize(spotLightDir);
            vec3 S = normalize(u_SpotDir);// spotlight direction

            //angle between spotlight direction and vector to fragment
            float spotCos = dot(-L, S);
            //smoothstep soft edge
            float spotFactor = smoothstep(u_SpotOuter, u_SpotCutoff, spotCos);
            spotFactor = pow(spotFactor, u_SpotExponent); //for sharper cutoff

            //ambient
            vec3 ambientLight = lightColor * baseColor.rgb * ao;

            //point light diffuse
            float NdotL_point = max(dot(normalize(v_Normal), normalize(lightDir)), 0.0);
            vec3 diffusePoint = lightColor * baseColor.rgb * NdotL_point;

            //point light specular
            vec3 E = normalize(u_CameraPos - v_Position);
            vec3 H_point = normalize(normalize(lightDir) + E);
            float specPoint = pow(max(dot(normalize(v_Normal), H_point), 0.0), u_shininess);

            //spotlight diffuse
            float NdotL_spot = max(dot(normalize(v_Normal), L), 0.0);
            vec3 diffuseSpot = lightColor * baseColor.rgb * NdotL_spot * spotFactor;

            //spotlight specular
            vec3 H_spot = normalize(L + E);
            float specSpot = pow(max(dot(normalize(v_Normal), H_spot), 0.0), u_shininess) * spotFactor;

            // combine
            vec3 diffuseFinal = diffusePoint + diffuseSpot;
            float specFinal = specPoint + specSpot;

            finalColor = ambientLight * u_ka
                    + diffuseFinal * u_kd
                    + specFinal * u_ks;
        }
        else{
            finalColor = baseColor.rgb;
        }

        gl_FragColor = vec4(finalColor, 1.0);
     }`;

class Renderer{
    constructor(gl, camera){
        this.gl = gl;
        this.camera = camera;

        initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
        this.initGLState();
        this.initShaderVariables();
    }

    initGLState(){
        this.gl.enable(this.gl.DEPTH_TEST);
        // this.gl.enable(this.gl.CULL_FACE);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    initShaderVariables(){
        const gl = this.gl;

        this.uniformLocations = {};

        //gets storage location of a_Position
        this.a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        this.u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        this.u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
        this.u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
        this.a_UV = gl.getAttribLocation(gl.program, 'a_UV');
        this.u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
        this.u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
        this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
        this.a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');

        this.u_LightingOn = gl.getUniformLocation(gl.program, 'u_LightingOn');
        this.u_NormalsOn = gl.getUniformLocation(gl.program, 'u_NormalsOn');

        this.u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
        this.u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');

        this.u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');

        this.u_ka = gl.getUniformLocation(gl.program, 'u_ka');
        this.u_kd = gl.getUniformLocation(gl.program, 'u_kd');
        this.u_ks = gl.getUniformLocation(gl.program, 'u_ks');
        this.u_shininess = gl.getUniformLocation(gl.program, 'u_shininess');

        this.u_SpotPos = gl.getUniformLocation(gl.program, 'u_SpotPos');
        this.u_SpotDir = gl.getUniformLocation(gl.program, 'u_SpotDir');
        this.u_SpotCutoff = gl.getUniformLocation(gl.program, 'u_SpotCutoff');
        this.u_SpotOuter = gl.getUniformLocation(gl.program, 'u_SpotOuter');
        this.u_SpotExponent = gl.getUniformLocation(gl.program, 'u_SpotExponent');

        const samplerNames = ["diffuse", "ao"];

        for (const name of samplerNames) {
            const uniformName = `u_${name}`;
            this.uniformLocations[uniformName] = gl.getUniformLocation(gl.program, uniformName);
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
        let  FSIZE = mesh.vertices.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
        gl.enableVertexAttribArray(this.a_Position);

        gl.vertexAttribPointer(this.a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3); //not needed for asgn3, but decided to include now
        gl.enableVertexAttribArray(this.a_Normal);

        gl.vertexAttribPointer(this.a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
        gl.enableVertexAttribArray(this.a_UV);

        //activate and bind material textures
        for (const [name, texture] of Object.entries(object.material.textures)){
            if (!texture) continue; // skip missing maps

            const unit = MATERIAL_TEXTURE_SLOTS[name];

            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            const loc = this.uniformLocations[`u_${name}`];
            if (loc) gl.uniform1i(loc, unit);
        }

        gl.uniform1f(this.u_texColorWeight, object.material.texColorWeight);
        gl.uniform4fv(this.u_FragColor, object.material.color);

        //calculate normal matrix
        let normalMatrix = new Matrix4().setInverseOf(object.worldMatrix);
        normalMatrix.transpose();

        //assign data to appropriate variables
        gl.uniformMatrix4fv(this.u_ModelMatrix, false, object.worldMatrix.elements);
        gl.uniformMatrix4fv(this.u_ViewMatrix, false, this.camera.viewMatrix.elements);
        gl.uniformMatrix4fv(this.u_ProjectionMatrix, false, this.camera.projectionMatrix.elements);
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);

        gl.uniform1i(this.u_LightingOn, gLightingOn);
        gl.uniform1i(this.u_NormalsOn, gNormalsOn);

        gl.uniform3fv(this.u_LightColor, gLightColor.elements);
        gl.uniform3fv(this.u_LightPos, gLightPos.elements);

        gl.uniform3fv(this.u_CameraPos, this.camera.eye.elements);

        gl.uniform1f(this.u_ka, object.material.ka * gKA);
        gl.uniform1f(this.u_kd, object.material.kd * gKD);
        gl.uniform1f(this.u_ks, object.material.ks * gKS);
        gl.uniform1f(this.u_shininess, gShininess);

        gl.uniform3fv(this.u_SpotPos, gSpotPos.elements);
        gl.uniform3fv(this.u_SpotDir, gSpotDir.elements);
        gl.uniform1f(this.u_SpotCutoff, Math.cos(gSpotInner * Math.PI/180));
        gl.uniform1f(this.u_SpotOuter, Math.cos(gSpotOuter * Math.PI/180));
        gl.uniform1f(this.u_SpotExponent, gSpotExponent);

        gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}