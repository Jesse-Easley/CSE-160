class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.cache = new Map();

        this.nextTexID = 0;
    }

    load(path) {
        //if already loaded, return cached texture
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        const gl = this.gl;
        let texture = gl.createTexture();
        texture.id = this.nextTexID++;

        //put it in the cache
        this.cache.set(path, texture);

        let image = new Image();
        image.onload = () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

            //bind TEXTURE0
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.generateMipmap(gl.TEXTURE_2D);

            console.log(`Loaded texture ${texture.id}: ${path}`);
        };

        image.src = path;

        return texture;
    }
}