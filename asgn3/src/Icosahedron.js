//adapted code for vertice positions from https://www.hallada.net/2020/02/01/generating-icosahedrons-and-hexspheres-in-rust.html
//and also some Stack Overflow threads which I forgot to save for the norms/uvs
function generateIco(gl) {
    const t = (1 + Math.sqrt(5)) / 2;

    const positions = [
        [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
        [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
        [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1],
    ];

    const indices = new Uint16Array([
        0,11,5,  0,5,1,  0,1,7,  0,7,10, 0,10,11,
        1,5,9,   5,11,4, 11,10,2, 10,7,6, 7,1,8,
        3,9,4,   3,4,2,  3,2,6,  3,6,8,  3,8,9,
        4,9,5,   2,4,11, 6,2,10, 8,6,7,  9,8,1
    ]);

    //build interleaved vertex buffer: pos, normal, uv
    const verts = [];
    for (let [x, y, z] of positions) {
        const len = Math.hypot(x, y, z); //magnitude
        const nx = x / len, ny = y / len, nz = z / len;

        //spherical UVs
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v = 0.5 - Math.asin(y / len) / Math.PI;

        verts.push(x, y, z, nx, ny, nz, u, v);
    }

    return new Mesh(gl, new Float32Array(verts), indices);
}