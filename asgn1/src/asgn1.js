var VSHADER_SOURCE = 
    `attribute vec4 a_Position;
     uniform float u_Size;
     void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
     }`;

var FSHADER_SOURCE = 
    `precision mediump float;
     uniform vec4 u_FragColor;
     void main(){
        gl_FragColor = u_FragColor;
     }`;

//global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;

function setupWebGL(){
    //get canvas element
    canvas = document.getElementById('webgl');

    //gets rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL(){
    //initializes shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    //gets storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (u_Size < 0) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }

    //gets storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(!u_FragColor){
        console.log('Failed to get storage location of u_Position');
        return;
    }
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//UI globals
let g_selectedColor = [1.0,0.0,0.0,1.0];
let g_selectedSize = 10.0;
let g_selectedType = POINT;
let g_selectedSegments = 10;

function addHTMLActions(){
    //adds functionality for the color picker
    document.getElementById("colorPicker").addEventListener('input', setColor);

    //adds functionality for size slider
    document.getElementById("sizeSlide").addEventListener('mouseup', function() {g_selectedSize = this.value;});
    document.getElementById("segmentSlide").addEventListener('mouseup', function() {g_selectedSegments = this.value;});


    document.getElementById("clearBtn").addEventListener('click', function() {g_shapesList = []; renderAllShapes();});
    document.getElementById("pointBtn").addEventListener('click', function() {g_selectedType = POINT});
    document.getElementById("triBtn").addEventListener('click', function() {g_selectedType = TRIANGLE});
    document.getElementById("circBtn").addEventListener('click', function() {g_selectedType = CIRCLE});
}

function setColor(ev){
    var hex = ev.target.value;
    var r = parseInt(hex.substring(1, 3), 16) / 255;
    var g = parseInt(hex.substring(3, 5), 16) / 255;
    var b = parseInt(hex.substring(5, 7), 16) / 255;

    g_selectedColor = [r, g, b, 1.0];
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();

    addHTMLActions()

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1){click(ev)};};

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
function click(ev){
    [x, y] = convertCoordinatesEventToGL(ev);

    let shape;
    if(g_selectedType == POINT){
        shape = new Point();
    }
    else if(g_selectedType == TRIANGLE){
        shape = new Triangle();
    }
    else{
        shape = new Circle();
    }

    shape.position = [x,y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
    g_shapesList.push(shape);

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

function renderAllShapes(){

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++){
        g_shapesList[i].render();
    }
}