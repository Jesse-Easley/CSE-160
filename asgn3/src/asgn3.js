//Globals
let canvas;
let gl;

let hud;
let hudCtx;

let gGlobalRotation = 0;
let gViewingAngle = 0;

let gClicked = false;

let keys = {};

const GameState = {
    PLAYING: "playing",
    GAME_OVER: "game_over"
}

let gameState = GameState.PLAYING;

//sets up webgl contex
function setupWebGL(){
    //get canvas element
    canvas = document.getElementById('webgl');

    //get canvas an
    hudCanvas = document.getElementById('hud');
    hudCtx = hudCanvas.getContext('2d');

    //gets rendering context for WebGL
    gl = getWebGLContext(canvas, {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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
    const scene = new SceneManager(render, camera, textureManager);

    //hookup html inputs
    addHTMLActions(camera);

    //define hud font/color
    hudCtx.font = "18px Arial";
    hudCtx.fillStyle = 'rgba(255,255,255,1)';

    //define vars for gameloop
    let isGameOver = false;

    function tick(time){
        switch(gameState){
            case GameState.PLAYING:
                updatePlaying(time);
                break;
            case GameState.GAME_OVER:
                updateGameOver();
                break;
        }

        requestAnimationFrame(tick);
    }

    //define variables for timekeeping and measuring fps
    let timerMax = 10;
    let timer = timerMax; //seconds
    let lastFrameTime = performance.now();
    let lastFpsTime = lastFrameTime;
    let frameCount = 0;
    let fps = 0;

    function updatePlaying(time){
        //used for fps independent controls
        const deltaTime = (time - lastFrameTime) / 1000; //in seconds
        lastFrameTime = time;

        //update timer
        timer -= deltaTime;
        timer = Math.max(timer, 0);

        let minutes = timer / 60 - 1;
        minutes = Math.max(minutes, 0);
        let seconds = timer % 60;

        //print hud text
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        const text = "Find the icosahedron in time!";

        let mids = findTextMiddle(text);

        hudCtx.fillText(text, mids[0], 550);
        hudCtx.fillText(`Time remaining: ${minutes.toFixed(0)}:${seconds.toFixed(1)}`, 10, 30);

        if(timer <= 0){
            gameState = GameState.GAME_OVER;
            return;
        }

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
        if (time - lastFpsTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsTime = time;
        }

        sendTextToHTML(
            `render: ${renderTime.toFixed(2)} ms | fps: ${fps}`,
            "fps"
        );
    }

    function updateGameOver(){
        //print game over screen
        let GameOverText = "GAME OVER!";
        let GOMids = findTextMiddle(GameOverText);

        let RestartText = "Press R to restart.";
        let RMids = findTextMiddle(RestartText);

        hudCtx.fillText(GameOverText, GOMids[0], GOMids[1] - 10);
        hudCtx.fillText(RestartText, RMids[0], RMids[1] + 10);

        //reset scene after pressing r
        if(keys['r']){
            gameState = GameState.PLAYING;
            timer = timerMax;
            camera.reset();

            // scene.reset();
        }

        return;
    }
        
    requestAnimationFrame(tick);
}

function sendTextToHTML(text, htmlID){
    let htmlElem = document.getElementById(htmlID);
    if(!htmlElem){
        console.log("Failed to get " + elemID + " from HTML!");
        return;
    }

    htmlElem.innerHTML = text;
}

function findTextMiddle(text){
    const metrics = hudCtx.measureText(text);
    const textWidth = metrics.width;

    const x = (hudCanvas.width / 2) - (textWidth / 2);
    const y = (hudCanvas.height / 2) + (18 / 2);

    return [x,y];
}