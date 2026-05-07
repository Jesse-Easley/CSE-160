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

    document.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement === canvas) {
            const sensitivity = 0.18;

            camera.yaw(event.movementX * sensitivity);
            camera.pitch(event.movementY * sensitivity);
        }
    });

    window.addEventListener("keydown", (event) => {
        keys[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        keys[event.key] = false;
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

    let lastFrameTime = performance.now();
    let lastFpsTime = lastFrameTime;
    let frameCount = 0;
    let fps = 0;

    function tick() {
        const now = performance.now();

        const deltaTime = (now - lastFrameTime) / 1000;
        lastFrameTime = now;

        //keyboard control
        if (keys['w']) camera.moveForward(deltaTime);
        if (keys['s']) camera.moveBackward(deltaTime);
        if (keys['a']) camera.moveLeft(deltaTime);
        if (keys['d']) camera.moveRight(deltaTime);
        if (keys['q']) camera.panLeft();
        if (keys['e']) camera.panRight();

        //time to render
        const renderStart = performance.now();
        scene.renderScene();
        const renderTime = performance.now() - renderStart;

        //fps counter
        frameCount++;
        if (now - lastFpsTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsTime = now;
        }

        sendTextToHTML(
            `render: ${renderTime.toFixed(2)} ms | fps: ${fps}`,
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