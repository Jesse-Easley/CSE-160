//Globals
let canvas;
let gl;

let gGlobalRotation = 0;
let gViewingAngle = 0;

let gClicked = false;

let keys = {};

//sets up webgl contex
function setupWebGL(){
    //get canvas element
    canvas = document.getElementById('webgl');

    //gets rendering context for WebGL
    gl = getWebGLContext(canvas, {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function handleMouseMove(dx, dy) {
    
}

function addHTMLActions(camera){
    //
    // SLIDER EVENTS
    //
    document.getElementById("fovSlider").addEventListener("input", function() {
        camera.setFov(this.value);
        sendTextToHTML(this.value, "fovValue");
    });

    //
    // CAMERA CONTROL EVENTS
    //

    canvas.addEventListener("click", () => {
        canvas.requestPointerLock();
    });

    document.addEventListener("mousemove", (e) => {
        if (document.pointerLockElement === canvas) {
            const sensitivity = 0.2;

            camera.yaw(-e.movementX * sensitivity);
            camera.pitch(-e.movementY * sensitivity);  //negative because moving mouse up should look up
        }
    });

    window.addEventListener("keydown", (e) => {
        keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });
}

function main(){
    //setup webgl
    setupWebGL();

    const camera = new Camera();
    const render = new Renderer(gl, camera);
    const textureManager = new TextureManager(gl);

    //create scene
    const scene = new SceneManager(render, textureManager);

    //hookup html inputs
    addHTMLActions(camera);

    let lastFpsTime = 0;
    let frameCount = 0;
    let fps = 0;
    function tick() {
        const frameStart = performance.now();

        if (keys['w']) camera.moveForward();
        if (keys['s']) camera.moveBackward();
        if (keys['a']) camera.moveLeft();
        if (keys['d']) camera.moveRight();
        if (keys['ArrowLeft']) camera.panLeft();
        if (keys['ArrowRight']) camera.panRight();

        scene.renderScene();

        //render time
        const renderTime = performance.now() - frameStart;

        //fps counter
        frameCount++;
        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsTime = now;
        }

        sendTextToHTML(
            `render time: ${renderTime.toFixed(2)} ms | fps: ${fps}`,
            "fps"
        );

        requestAnimationFrame(tick);
    }
    tick();
}

function sendTextToHTML(text, htmlID){
    var htmlElem = document.getElementById(htmlID);
    if(!htmlElem){
        console.log("Failed to get " + elemID + " from HTML!");
        return;
    }

    htmlElem.innerHTML = text;
}