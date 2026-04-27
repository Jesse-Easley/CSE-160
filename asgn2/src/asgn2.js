//Globals
let canvas;
let gl;

let gAnimalGlobalRotation = 45;
let gViewingAngle = 0;

const gViewingAngleMin = 0;
const gViewingAngleMax = 80;

let gBeakAngle = 0;
let gWingAngle = 0;
let gHipTwist = 0;
let gLeftLegAngle = 0;
let gRightLegAngle = 0;
let gLeftFootAngle = 0;
let gRightFootAngle = 0;
let gBodyTwist = 0;

let gTime = 0;
let gLast = 0;
let gAnimate = true;

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

    document.getElementById("hipTwistSlider").addEventListener("input", function() {
        gHipTwist = Number(this.value);
    });

    document.getElementById("leftLegSlider").addEventListener("input", function() {
        gLeftLegAngle = -Number(this.value);
    });

    document.getElementById("leftFootSlider").addEventListener("input", function() {
        gLeftFootAngle = -Number(this.value);
    });

    document.getElementById("rightLegSlider").addEventListener("input", function() {
        gRightLegAngle = -Number(this.value);
    });

    document.getElementById("rightFootSlider").addEventListener("input", function() {
        gRightFootAngle = -Number(this.value);
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

    //start animation loop
    function tick() {
        gTime = performance.now();

        if (gAnimate) {
            updateAnimationAngles();
        }

        gLast = gTime;
        scene.renderScene();
        requestAnimationFrame(tick);

        var duration = performance.now() - gTime;
        sendTextToHTML("ms: " + Math.floor(duration) + ", fps: " + Math.floor(1000/duration), "fps");
    }
    tick();
}

function updateAnimationAngles(){
    gBeakAngle = (Math.sin(gTime * 0.003) + 1) * 2;
    document.getElementById("beakSlider").value = gBeakAngle;

    gWingAngle = (Math.sin(gTime * 0.003) + 2) * 20;
    document.getElementById("wingSlider").value = gWingAngle;

    gHipTwist = (Math.sin(gTime * 0.005)) * 15;
    document.getElementById("hipTwistSlider").value = gHipTwist;

    gBodyTwist = -gHipTwist*0.1;

    gLeftLegAngle = (Math.sin(gTime * .005)) * 5;
    document.getElementById("leftLegSlider").value = gLeftLegAngle;

    gLeftFootAngle = -gLeftLegAngle*0.6;
    document.getElementById("leftFootSlider").value = gLeftFootAngle;

    gRightLegAngle = (Math.sin(gTime * .005 + Math.PI)) * 5;
    document.getElementById("rightLegSlider").value = gRightLegAngle;

    gRightFootAngle = -gRightLegAngle*0.6;
    document.getElementById("rightFootSlider").value = gRightFootAngle;

}

function sendTextToHTML(text, htmlID){
    var htmlElem = document.getElementById(htmlID);
    if(!htmlElem){
        console.log("Failed to get " + elemID + " from HTML!");
        return;
    }

    htmlElem.innerHTML = text;
}