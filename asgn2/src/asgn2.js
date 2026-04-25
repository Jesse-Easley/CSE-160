//Globals
let canvas;
let gl;

let gAnimalGlobalRotation = 45;
let gViewingAngle = 15;

const gViewingAngleMin = 0;
const gViewingAngleMax = 80;

let gBeakAngle = 0;
let gWingAngle = 0;

let g_time = 0;
let gAnimate = false;

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
    // HTML BUTTON EVENTS
    //

    document.getElementById("rotationSlider").addEventListener("input", function() {
        gAnimalGlobalRotation = Number(this.value);
        //scene.renderScene();
    });

    document.getElementById("viewAngleSlider").addEventListener("input", function() {
        gViewingAngle = Number(this.value);
        //scene.renderScene();
    });

    document.getElementById("beakSlider").addEventListener("input", function() {
        gBeakAngle = Number(this.value);
        //scene.renderScene();
    });

    document.getElementById("wingSlider").addEventListener("input", function() {
        gWingAngle = Number(this.value);
        //scene.renderScene();
    });

    document.getElementById("animToggle").addEventListener("change", function() {
        gAnimate = this.checked;
    });
    

    //
    // MOUSE CONTROL EVENTS
    //

    canvas.addEventListener("mousedown", () => {
        gClicked = true;
    })

    canvas.addEventListener("mouseup", () => {
        gClicked = false;
    })

    canvas.addEventListener("mouseleave", () => {
        gClicked = false;
    })

    canvas.addEventListener("mousemove", (event) => {
        if(!gClicked) return;

        //update angles
        gAnimalGlobalRotation -= event.movementX * 0.75;
        gViewingAngle += event.movementY  * 0.75;

        //clamps the viewing angle
        gViewingAngle = Math.max(gViewingAngleMin, Math.min(gViewingAngleMax, gViewingAngle));

        document.getElementById("rotationSlider").value = ((gAnimalGlobalRotation % 360) + 360) % 360;
        document.getElementById("viewAngleSlider").value = gViewingAngle;
    })

    //ensures that slider and clamp values are the same
    document.getElementById("viewAngleSlider").min = gViewingAngleMin;
    document.getElementById("viewAngleSlider").max = gViewingAngleMax;

    //so I can rotate without changing viewing angle
    canvas.addEventListener("wheel", (event) => {
        gAnimalGlobalRotation -= event.deltaY * 0.2;
        document.getElementById("rotationSlider").value = ((gAnimalGlobalRotation % 360) + 360) % 360;
    })

    //shift click animation
    canvas.addEventListener("mousedown", (event) => {
        if (!event.shiftKey) return
        
        console.log("shift-click animation not implemented!");
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
        g_time = performance.now();

        if (gAnimate) {
            updateAnimationAngles();
        }
        scene.renderScene();
        requestAnimationFrame(tick);

        var duration = performance.now() - g_time;
        sendTextToHTML("ms: " + Math.floor(duration) + ", fps: " + Math.floor(10000/duration), "fps");
    }
    tick();
}

function updateAnimationAngles(){
    gBeakAngle = (Math.sin(g_time * 0.008) + 1) * 2;
    document.getElementById("beakSlider").value = gBeakAngle;

    gWingAngle = (Math.sin(g_time * 0.008)) * 20;
    document.getElementById("wingSlider").value = gWingAngle;
}

function sendTextToHTML(text, htmlID){
    var htmlElem = document.getElementById(htmlID);
    if(!htmlElem){
        console.log("Failed to get " + elemID + " from HTML!");
        return;
    }

    htmlElem.innerHTML = text;
}