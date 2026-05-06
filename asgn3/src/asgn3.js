//Globals
let canvas;
let gl;

let gGlobalRotation = 0;
let gViewingAngle = 0;

let gClicked = false;

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

function addHTMLActions(scene){
    //
    // MOUSE CONTROL EVENTS
    //

    canvas.addEventListener("mousedown", () => {
        gClicked = true;
    })

    canvas.addEventListener("mouseup", () => {
        gClicked = false;
    })

    canvas.addEventListener("mousemove", (event) => {
        if(!gClicked) return;

        //update angles
        gGlobalRotation -= event.movementX * 0.75;
        gViewingAngle += event.movementY  * 0.75;

    })
    return;
}

function main(){
    //setup webgl
    setupWebGL();

    //create renderer
    const render = new Renderer(gl);
    const textureManager = new TextureManager(gl);

    //create scene
    const scene = new SceneManager(render, textureManager);

    //hookup html inputs
    addHTMLActions(scene);

    let lastFpsTime = 0;
    let frameCount = 0;
    let fps = 0;
    function tick() {
        const frameStart = performance.now();

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