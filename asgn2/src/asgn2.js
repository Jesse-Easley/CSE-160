//Globals
let canvas;
let gl;

let gAnimalGlobalRotation = 0;
let gViewingAngle = 0;
let gBeakAngle = 0;
let gWingAngle = 0;

let g_time = 0;
let gAnimate = false;

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
    document.getElementById("rotationSlider").addEventListener("input", function(){
        gAnimalGlobalRotation = Number(this.value);
        //scene.renderScene();
    });

    document.getElementById("viewAngleSlider").addEventListener("input", function(){
        gViewingAngle = Number(this.value);
        //scene.renderScene();
    });

    document.getElementById("beakSlider").addEventListener("input", function(){
        gBeakAngle = Number(this.value);
        scene.renderScene();
    });

    document.getElementById("wingSlider").addEventListener("input", function(){
        gWingAngle = Number(this.value);
        scene.renderScene();
    });

    document.getElementById("animToggle").addEventListener("change", function() {
        gAnimate = this.checked;
    });
}

function main(){
    //setup webgl
    setupWebGL();

    //create renderer
    const render = new Renderer(gl);

    //create scene
    const scene = new SceneManager();
    scene.setRenderer(render);

    //create penguin geometry and render the scene
    scene.renderScene();

    //hookup html inputs
    addHTMLActions(scene);

    // start animation loop
    function tick() {
        if (gAnimate) {
            g_time = performance.now();
            updateAnimationAngles();
        }
        scene.renderScene();
        requestAnimationFrame(tick);
    }
    tick();
}

function updateAnimationAngles(){
    gBeakAngle = (Math.sin(g_time * 0.008) + 1) * 2;
    document.getElementById("beakSlider").value = gBeakAngle;
}

function sendTextToHTML(text, htmlID){
    var htmlElem = document.getElementById(htmlID);
    if(!htmlElem){
        console.log("Failed to get " + elemID + " from HTML!");
        return;
    }

    htmlElem.innerHTML = text;
}