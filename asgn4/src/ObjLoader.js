class OBJLoader {
    //loads file
    static async load(url) {
        const response = await fetch(url);
        const text = await response.text();
        return OBJLoader.parse(text);
    }

    //parses into vertice and index array
    static parse(objText) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const vertices = [];
        const indices = [];

        const tempPos = [];
        const tempNorm = [];
        const tempUV = [];

        const lines = objText.split("\n");

        for (let line of lines) {
            line = line.trim();
            const parts = line.split(" ");

            switch(parts[0]) {
                case "v":   //position
                    tempPos.push([+parts[1], +parts[2], +parts[3]]);
                    break;

                case "vt":  //uv
                    tempUV.push([+parts[1], +parts[2]]);
                    break;

                case "vn":  //normal
                    tempNorm.push([+parts[1], +parts[2], +parts[3]]);
                    break;

                case "f":
                    for (let i = 1; i <= 3; i++) {
                        const tokens = parts[i].split("/");

                        const v = parseInt(tokens[0]) - 1;
                        const t = (tokens[1] !== "") ? parseInt(tokens[1]) - 1 : null;
                        const n = (tokens[2]) ? parseInt(tokens[2]) - 1 : null;

                        const pos = tempPos[v];
                        const uv  = (t !== null && tempUV[t]) ? tempUV[t] : [0, 0];
                        const nor = (n !== null && tempNorm[n]) ? tempNorm[n] : [0, 1, 0];

                        vertices.push(
                            pos[0], pos[1], pos[2],
                            nor[0], nor[1], nor[2],
                            uv[0], uv[1]
                        );

                        indices.push(indices.length);
                    }
                    break;
            }
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices)
        };
    }
}

//performs mesh setup
async function loadOBJMesh(url) {
    const data = await OBJLoader.load(url);

    const mesh = new Mesh(gl, data.vertices, data.indices);
    mesh.createBuffers();
    mesh.uploadBuffers();

    return mesh;
}