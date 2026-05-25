function generateSphere(radius, segments, rings) {
    const vertices = []; //interleaved: 3 pos, 3 normal, 2 uv
    const indices = [];

    for (let r = 0; r <= rings; r++) {
        let phi = (r * Math.PI) / rings;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);

        for (let s = 0; s <= segments; s++) {
            let theta = (s * 2 * Math.PI) / segments;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            //normal
            let nx = cosTheta * sinPhi;
            let ny = cosPhi;
            let nz = sinTheta * sinPhi;

            //position
            let x = radius * nx;
            let y = radius * ny;
            let z = radius * nz;

            //uv
            let u = 1 - (s / segments);
            let v = 1 - (r / rings);

            //push to interleaved buffer
            vertices.push(x, y, z, nx, ny, nz, u, v);
        }
    }

    //generate indices
    for (let r = 0; r < rings; r++) {
        for (let s = 0; s < segments; s++) {
            let first = (r * (segments + 1)) + s;
            let second = first + segments + 1;

            //two triangles per quad segment
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    return new Mesh(gl, new Float32Array(vertices), new Uint16Array(indices));
}
