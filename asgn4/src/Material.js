const MATERIAL_TEXTURE_SLOTS = {
    diffuse: 0,
    ao: 1,
}

//creates a 1x1 ao map for materials that don't otherwise have one
function createDefaultAO(gl) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    const whitePixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        whitePixel
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return tex;
}

class Material{
    static _id = 0;

    constructor(){
        this.id = Material._id++;

        this.color = [1.0, 0.0, 0.0, 1.0];
        this.texColorWeight = 1.0;

        this.textures = {
            diffuse: null,
            ao: createDefaultAO(gl)
        }

        console.log(`Created material ${this.id}!`);
    }
}