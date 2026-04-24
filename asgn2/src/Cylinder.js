class Cylinder extends SceneObject{
    constructor(){
        super();
        this.mesh = this.generateCylinderVertices(16, 1, 1);
    }

    generateCylinderVertices(segments, radius = 1, height = 1) {
        const verts = [];

        const halfH = height / 2;
        const angleStep = (Math.PI * 2) / segments;

        //circles
        for (let i = 0; i < segments; i++) {
            const a0 = i * angleStep;
            const a1 = (i + 1) * angleStep;

            const x0 = Math.cos(a0) * radius;
            const z0 = Math.sin(a0) * radius;
            const x1 = Math.cos(a1) * radius;
            const z1 = Math.sin(a1) * radius;

            //push tri
            verts.push(
                0,  halfH, 0,
                x0, halfH, z0,
                x1, halfH, z1,

                0, -halfH, 0,
                x1, -halfH, z1,
                x0, -halfH, z0
            );
        }

        //side walls
        for (let i = 0; i < segments; i++) {
            const a0 = i * angleStep;
            const a1 = (i + 1) * angleStep;

            const x0 = Math.cos(a0) * radius;
            const z0 = Math.sin(a0) * radius;
            const x1 = Math.cos(a1) * radius;
            const z1 = Math.sin(a1) * radius;

            //push tri
            verts.push(
                x0,  halfH, z0,
                x0, -halfH, z0,
                x1,  halfH, z1,

                x1,  halfH, z1,
                x0, -halfH, z0,
                x1, -halfH, z1
            );

        }

        return new Float32Array(verts);
    }
}