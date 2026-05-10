class Camera{
    constructor(){
        this.fov = 90.0;

        this.eye = new Vector3([0,1,0]);
        this.at = new Vector3([0,1,-1]);
        this.up = new Vector3([0,1,0]);

        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
                                  this.at.elements[0], this.at.elements[1], this.at.elements[2],
                                  this.up.elements[0], this.up.elements[1], this.up.elements[2],
        );

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    
        this.moveSpeed = 15.0;
        this.alpha = 2;
    }

    moveForward(deltaTime = 1){
        //forward vector
        let f = new Vector3();
        f.set(this.at).sub(this.eye);

        //remove y component
        f.set(new Vector3([f.elements[0], f.elements[1], f.elements[2]]));

        f.normalize();
        f.mul(this.moveSpeed * deltaTime);

        this.eye.add(f);
        this.at.add(f);

        this.updateView();
    }

    moveBackward(deltaTime = 1){
        //backward vector
        let b = new Vector3();
        b.set(this.eye).sub(this.at);

        //remove y component
        b.set(new Vector3([b.elements[0], b.elements[1], b.elements[2]]));

        b.normalize();
        b.mul(this.moveSpeed * deltaTime);

        this.eye.add(b);
        this.at.add(b);

        this.updateView();
    }

    moveLeft(deltaTime = 1){
        //forward vector
        let f = new Vector3();
        f.set(this.at).sub(this.eye);

        //get left direction
        let s = Vector3.cross(this.up, f);

        //multiply by move speed
        s.normalize();
        s.mul(this.moveSpeed * deltaTime);

        this.eye.add(s);
        this.at.add(s);

        this.updateView();
    }

    moveRight(deltaTime = 1){
        //forward vector
        let f = new Vector3();
        f.set(this.at).sub(this.eye);

        
        //get right direction
        let s = Vector3.cross(f, this.up);

        s.normalize();
        s.mul(this.moveSpeed * deltaTime);
        
        this.eye.add(s);
        this.at.add(s);

        this.updateView();
    }

    panLeft(){
        //forward vector
        let f = new Vector3();
        f.set(this.at).sub(this.eye);
        
        let rot = new Matrix4();
        rot.setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rot.multiplyVector3(f);
        f_prime.normalize();

        this.at.set(new Vector3(this.eye.elements)).add(f_prime);

        this.updateView();
    }

    panRight(){
        //forward vector
        let f = new Vector3();
        f.set(this.at).sub(this.eye);
        
        let rot = new Matrix4();
        rot.setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rot.multiplyVector3(f);
        f_prime.normalize();

        this.at.set(new Vector3(this.eye.elements)).add(f_prime);
        
        this.updateView();
    }

    //used for horizontal mouse camera control
    yaw(alpha) {
        //forward vector
        let f = new Vector3();
        f.set(this.at).sub(this.eye);

        let rot = new Matrix4();

        //negative because +x mouse movement is panRight
        rot.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rot.multiplyVector3(f);
        f_prime.normalize();

        this.at.set(this.eye).add(f_prime);
        this.updateView();
    }

    //used for vertical mouse camera control
    pitch(alpha) {
        //forward vector
        let f = new Vector3();
        f.set(this.at).sub(this.eye);

        let right = Vector3.cross(f, this.up);
        right.normalize();

        let rot = new Matrix4();

        //negative because +y is down on canvas
        rot.setRotate(-alpha, right.elements[0], right.elements[1], right.elements[2]);

        let f_prime = rot.multiplyVector3(f);
        f_prime.normalize();

        //prevent flipping upside down
        let newUp = Vector3.cross(right, f_prime);
        if (newUp.elements[1] <= 0.01) return;  // simple clamp

        this.at.set(this.eye).add(f_prime);
        this.updateView();
    }

    setFov(newFov){
        this.fov = newFov;
        this.updateProjection();
    }

    updateView(){
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    updateProjection(){
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }
}