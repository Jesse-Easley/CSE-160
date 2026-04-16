//Globals
let canvas;
let gl;

let gAnimalGlobalRotation = 0;
let gBeakAngle = 0;

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
        scene.renderScene();
    });

    document.getElementById("beakSlider").addEventListener("input", function(){
        gBeakAngle = Number(this.value);
        console.log(gBeakAngle);
        scene.renderScene();
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

    scene.makePenguin();

    scene.renderScene();


    //hookup html inputs
    addHTMLActions(scene);

    //animation loop

}