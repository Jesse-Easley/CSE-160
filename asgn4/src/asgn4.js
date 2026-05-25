//Globals
let canvas;
let gl;

let hud;
let hudCtx;

let gGlobalRotation = 0;
let gViewingAngle = 0;

let gLightColor = new Vector3([1.0, 0.918, 0.82]);
let gLightPos = new Vector3([0, 10, 0]);
let gKA = 1.0;
let gKD = 1.0;
let gKS = 1.0;
let gShininess = 32.0;

let gSpotPos = new Vector3([0,7,0]);
let gSpotDir = new Vector3([0, -1, 0]);
let gSpotInner = 10;
let gSpotOuter = 50;
let gSpotExponent = 5;

let gLightingOn = true;
let gNormalsOn = false;

let gLightingMoveOn = true;

let gClicked = false;

let keys = {};

const GameState = {
    PLAYING: "playing",
    GAME_OVER: "game_over",
    GAME_WIN: "game_win",
    SANDBOX: "sandbox"
}

let gameState = GameState.SANDBOX;

//sets up webgl contex
function setupWebGL(){
    //get canvas element
    canvas = document.getElementById('webgl');

    //get hud
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
    // HTML EVENTS
    //
    document.getElementById("fovSlider").addEventListener("input", function() {
        camera.setFov(this.value);
        sendTextToHTML(this.value, "fovValue");
    });

    document.getElementById("kaSlider").addEventListener("input", function() {
        gKA = this.value;
        sendTextToHTML(this.value, "kaValue");
    });
    document.getElementById("kdSlider").addEventListener("input", function() {
        gKD = this.value;
        sendTextToHTML(this.value, "kdValue");
    });
    document.getElementById("ksSlider").addEventListener("input", function() {
        gKS = this.value;
        sendTextToHTML(this.value, "ksValue");
    });

    document.getElementById("shininessSlider").addEventListener("input", function() {
        gShininess = this.value;
        sendTextToHTML(this.value, "shininessValue");
    });

    document.getElementById("noClip").addEventListener("change", function() {
        if (event.target.checked) {
            camera.noclip = true;

        }
        else {
            camera.noclip = false;
        }
    });

    document.getElementById("lightToggle").addEventListener("change", function() {
        if (event.target.checked) {
            gLightingOn = true;

        }
        else {
            gLightingOn = false;
        }
    });

    document.getElementById("normalToggle").addEventListener("change", function() {
        if (event.target.checked) {
            gNormalsOn = true;

        }
        else {
            gNormalsOn = false;
        }
    });

    document.getElementById("lightColorPicker").addEventListener("input", function() {
        const hex = event.target.value;

        //convert hex to rgb
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);

        //normalize each rgb value
        gLightColor = new Vector3([r / 255, g / 255, b / 255]);

    });

    document.getElementById("lightMoveToggle").addEventListener("change", function() {
        if (event.target.checked) {
            gLightingMoveOn = true;

        }
        else {
            gLightingMoveOn = false;
        }
    });

    const xPointSlider = document.getElementById("pointLightX");
    const yPointSlider = document.getElementById("pointLightY");
    const zPointSlider = document.getElementById("pointLightZ");

    function updatePointLight() {
        const x = parseFloat(xPointSlider.value);
        const y = parseFloat(yPointSlider.value);
        const z = parseFloat(zPointSlider.value);

        gLightPos = new Vector3([x, y, z]);
    }

    xPointSlider.addEventListener("input", updatePointLight);
    yPointSlider.addEventListener("input", updatePointLight);
    zPointSlider.addEventListener("input", updatePointLight);

    const xSpotSlider = document.getElementById("spotLightX");
    const ySpotSlider = document.getElementById("spotLightY");
    const zSpotSlider = document.getElementById("spotLightZ");

    function updateSpotLight() {
        const x = parseFloat(xSpotSlider.value);
        const y = parseFloat(ySpotSlider.value);
        const z = parseFloat(zSpotSlider.value);

        gSpotPos = new Vector3([x, y, z]);
    }

    xSpotSlider.addEventListener("input", updateSpotLight);
    ySpotSlider.addEventListener("input", updateSpotLight);
    zSpotSlider.addEventListener("input", updateSpotLight);

    const innerSlider = document.getElementById("spotLightInner");
    const outerSlider = document.getElementById("spotLightOuter");
    const falloffSlider = document.getElementById("spotLightFalloff");

    function updateSpotAngles() {
        let inner = parseFloat(innerSlider.value);
        let outer = parseFloat(outerSlider.value);

        //enforce outer >= inner
        if (outer < inner) {
            outer = inner;
            outerSlider.value = inner; //update UI
        }

        gSpotInner = inner;
        gSpotOuter = outer;

        gSpotExponent = parseFloat(falloffSlider.value);
    }

    innerSlider.addEventListener("input", updateSpotAngles);
    outerSlider.addEventListener("input", updateSpotAngles);
    falloffSlider.addEventListener("input", updateSpotAngles);

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

let gteapotMesh;
async function preloadModels() {
    gteapotMesh = await loadOBJMesh("../resources/teapot.obj");
    console.log("OBJ loaded");
}

async function main(){
    //setup webgl
    setupWebGL();

    await preloadModels();

    const camera = new Camera();
    const render = new Renderer(gl, camera);
    const textureManager = new TextureManager(gl);

    //create scene
    const scene = new SceneManager(render, camera, textureManager, "sandbox");
    camera.setScene(scene);

    //hookup html inputs
    addHTMLActions(camera);

    //define hud font/color
    hudCtx.font = "18px Arial";
    hudCtx.fillStyle = 'rgba(255,255,255,1)';

    //define vars for gameloop
    let timerMax = 120;
    let timer = timerMax; //seconds
    let lastFrameTime = performance.now();
    let lastFpsTime = lastFrameTime;
    let frameCount = 0;
    let fps = 0;

    let lightAngle = 0;

    function tick(time){
        const deltaTime = (time - lastFrameTime) / 1000; //in seconds
        lastFrameTime = time;

        switch(gameState){
            case GameState.PLAYING:
                updatePlaying(deltaTime);
                break;
            case GameState.GAME_OVER:
                updateGameOver();
                break;
            case GameState.GAME_WIN:
                updateGameWin();
                break;
            case GameState.SANDBOX:
                updateSandbox(deltaTime);
                break;
        }

        if(gLightingMoveOn){
            lightAngle += deltaTime * 0.75;   //speed of rotation

            const radius = 40;               //how far from center
            const height = 10;               //how high above the level

            gLightPos = new Vector3([
                Math.cos(lightAngle) * radius,
                height,
                Math.sin(lightAngle) * radius
            ]); 
        }

        scene.light.localMatrix.setTranslate(gLightPos.elements[0], gLightPos.elements[1], gLightPos.elements[2]);
        scene.light.markDirty();
        scene.spotlight.localMatrix.setTranslate(gSpotPos.elements[0], gSpotPos.elements[1], gSpotPos.elements[2]);
        scene.spotlight.markDirty();

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

        requestAnimationFrame(tick);
    }

    function updatePlaying(deltaTime){
        //update timer
        timer -= deltaTime;
        timer = Math.max(timer, 0);

        let minutes = Math.floor(timer / 60);
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

        //get camera pos
        let cameraX = parseInt(camera.eye.elements[0]);
        let cameraZ = parseInt(camera.eye.elements[2]);

        //if player finds the icosahedron
        const row = cameraZ + 16;
        const col = cameraX + 16;
        if (row >= 0 && row < scene.lvlArray.length && col >= 0 && col < scene.lvlArray[row].length) {
            if (scene.lvlArray[row][col] === -1) {
                gameState = GameState.GAME_WIN;
                return;
            }
        }
    }

    function updateGameOver(){
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        //print game over screen
        let GameOverText = "GAME OVER!";
        let GOMids = findTextMiddle(GameOverText);

        let RestartText = "Press R to restart.";
        let RMids = findTextMiddle(RestartText);

        let SandboxText = "Press S to go to the sandbox.";
        let SMids = findTextMiddle(SandboxText);

        hudCtx.fillText(GameOverText, GOMids[0], GOMids[1] - 10);
        hudCtx.fillText(RestartText, RMids[0], RMids[1] + 10);
        hudCtx.fillText(SandboxText, SMids[0], SMids[1] + 30);

        //reset scene after pressing r
        if(keys['r']){
            gameState = GameState.PLAYING;
            timer = timerMax;

            camera.reset();
            scene.reset("maze");
        }
        //go to sandbox
        if(keys['s']){
            gameState = GameState.SANDBOX;

            camera.reset();
            scene.reset("sandbox");
        }
    }

    function updateGameWin(){
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        //print game over screen
        let GameWinText = "You Win!";
        let GWMids = findTextMiddle(GameWinText);

        let RestartText = "Press R to play again.";
        let RMids = findTextMiddle(RestartText);

        let SandboxText = "Press S to go to the sandbox.";
        let SMids = findTextMiddle(SandboxText);

        hudCtx.fillText(GameWinText, GWMids[0], GWMids[1] - 10);
        hudCtx.fillText(RestartText, RMids[0], RMids[1] + 10);
        hudCtx.fillText(SandboxText, SMids[0], SMids[1] + 30);

        //reset scene after pressing r
        if(keys['r']){
            gameState = GameState.PLAYING;
            timer = timerMax;

            camera.reset();
            scene.reset("maze");
        }
        //go to sandbox
        if(keys['s']){
            gameState = GameState.SANDBOX;

            camera.reset();
            scene.reset("sandbox");
        }

        return;
    }

    function updateSandbox(deltaTime){
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        let MazeText = "Press M to play the maze game";
        let MMids = findTextMiddle(MazeText);

        hudCtx.fillText(MazeText, MMids[0], canvas.height - 8);

        //keyboard control
        if (keys['w']) camera.moveForward(deltaTime);
        if (keys['s']) camera.moveBackward(deltaTime);
        if (keys['a']) camera.moveLeft(deltaTime);
        if (keys['d']) camera.moveRight(deltaTime);
        if (keys['q']) camera.panLeft();
        if (keys['e']) camera.panRight();

        //press m to play maze game
        if(keys['m']){
            gameState = GameState.PLAYING;
            timer = timerMax;

            camera.reset();
            scene.reset("maze");
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

//used to center text on screen
function findTextMiddle(text){
    const metrics = hudCtx.measureText(text);
    const textWidth = metrics.width;

    const x = (hudCanvas.width / 2) - (textWidth / 2);
    const y = (hudCanvas.height / 2) + (18 / 2);

    return [x,y];
}