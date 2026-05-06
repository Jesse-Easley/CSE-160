class Camera{
    constructor(){
        this.fov = 60.0;

        this.eye = new Vector3([0,0,0]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]);

        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
                                  this.at.elements[0], this.at.elements[1], this.at.elements[2],
                                  this.up.elements[0], this.up.elements[0], this.up.elements[0],
        );

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }

    moveForward(){
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(0.5);

        this.eye.add(f);
        this.at.add(f);
    }

    movevBackward(){
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(0.5);

        this.eye.add(b);
        this.at.add(b);
    }
}