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
    gl = getWebGLContext(canvas, {preserveDrawingBuffer: true});
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

let g_vertexBuffer;
function initBuffer(){
//create a buffer object
  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
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

let g_previewShape
function addHTMLActions(){
    //adds functionality for the color picker
    document.getElementById("colorPicker").addEventListener('input', setColor);

    //adds functionality for size slider
    document.getElementById("sizeSlide").addEventListener('mouseup', function() {g_selectedSize = this.value;});
    document.getElementById("segmentSlide").addEventListener('mouseup', function() {g_selectedSegments = this.value;});

    document.getElementById("clearBtn").addEventListener('click', function() {g_shapesList = []; renderAllShapes(); gl.clearColor(0.0, 0.0, 0.0, 1.0); gl.clear(gl.COLOR_BUFFER_BIT);});
    document.getElementById("pointBtn").addEventListener('click', function() {g_selectedType = POINT; g_previewShape = new Point(); g_previewShape.position = null;});
    document.getElementById("triBtn").addEventListener('click', function() {g_selectedType = TRIANGLE; g_previewShape = new Triangle(); g_previewShape.position = null;});
    document.getElementById("circBtn").addEventListener('click', function() {g_selectedType = CIRCLE; g_previewShape = new Circle(); g_previewShape.position = null;});
    document.getElementById("drawPicBtn").addEventListener('click', drawMyPicture);

    //handles shape preview 
    canvas.addEventListener('mousemove', (ev) => {
        if (!g_previewShape) return;

        var [x, y] = convertCoordinatesEventToGL(ev);
        g_previewShape.position = [x, y];
        g_previewShape.color = g_selectedColor.slice();
        g_previewShape.size = g_selectedSize;

        renderAllShapes();
    });
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
    initBuffer();

    addHTMLActions()

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1){click(ev)};};

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
function click(ev){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    [x, y] = convertCoordinatesEventToGL(ev);

    if (!g_previewShape) return;
    let shape = g_previewShape;
    shape.position = [x, y];
    g_shapesList.push(shape);

    //create new previews
    if (g_selectedType === POINT) g_previewShape = new Point();
    else if (g_selectedType === TRIANGLE) g_previewShape = new Triangle();
    else if (g_selectedType === CIRCLE) g_previewShape = new Circle();

    g_previewShape.position = null;

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

    //draw preview last
    if (g_previewShape && g_previewShape.position) {
        g_previewShape.render();
    }
}

function drawMyPicture() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //beak (orange)
    gl.uniform4f(u_FragColor, 1.0, 0.5, 0.0, 1.0);
    drawTriangle([
        ...grid(9,8.5), ...grid(7,9.5), ...grid(7,7.5)
    ]);

    //feet (orange)
    drawTriangle([
        ...grid(5,0), ...grid(4,1), ...grid(3,0)
    ]);
    drawTriangle([
        ...grid(3.5,0.5), ...grid(4,1), ...grid(3.5,1)
    ]);
    drawTriangle([
        ...grid(4.5,0.5), ...grid(4.5,1), ...grid(4,1)
    ]);
    drawTriangle([
        ...grid(7,0), ...grid(6,1), ...grid(5,0)
    ]);
    drawTriangle([
        ...grid(5.5,0.5), ...grid(6,1), ...grid(5.5,1)
    ]);
    drawTriangle([
        ...grid(6.5,0.5), ...grid(6.5,1), ...grid(6,1)
    ]);

    //body base (black)
    gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
    drawTriangle([
        ...grid(2,1), ...grid(8,1), ...grid(8,7)
    ]);
    drawTriangle([
        ...grid(8,7), ...grid(2,7), ...grid(2,1)
    ]);

    //head (black)
    gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
    drawTriangle([
        ...grid(7,7), ...grid(7,10), ...grid(3,7)
    ]);
    drawTriangle([
        ...grid(7,10), ...grid(3,10), ...grid(3,7)
    ]);

    //left wing (black)
    drawTriangle([
        ...grid(3,7), ...grid(2,7), ...grid(0,4)
    ]);
    drawTriangle([
        ...grid(2,7), ...grid(0,5), ...grid(0,4)
    ]);

    //right wing (black)
    drawTriangle([
        ...grid(8,7), ...grid(7,7), ...grid(10,4)
    ]);
    drawTriangle([
        ...grid(10,5), ...grid(8,7), ...grid(10,4)
    ]);

    //belly (white)
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
    drawTriangle([
        ...grid(3,2), ...grid(7,2), ...grid(7,6)
    ]);
    drawTriangle([
        ...grid(7,6), ...grid(3,6), ...grid(3,2)
    ]);

    //corner cuts (white)
    drawTriangle([
        ...grid(4,10), ...grid(3,10), ...grid(3,9)
    ]);
    drawTriangle([
        ...grid(4,7), ...grid(3,8), ...grid(3,7)
    ]);
    drawTriangle([
        ...grid(3,1), ...grid(2,2), ...grid(2,1)
    ]);
    drawTriangle([
        ...grid(7,1), ...grid(8,1), ...grid(8,2)
    ]);
    drawTriangle([
        ...grid(7,9.5), ...grid(7,10), ...grid(6,10)
    ]);
    drawTriangle([
        ...grid(7,7), ...grid(7,7.5), ...grid(6,7)
    ]);

    //eye (white)
    drawTriangle([
        ...grid(6,9), ...grid(5,9), ...grid(5,8)
    ]);

    //corner cuts (black)
    gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
    drawTriangle([
        ...grid(3,5), ...grid(4,6), ...grid(3,6)
    ]);
    drawTriangle([
        ...grid(3,2), ...grid(4,2), ...grid(3,3)
    ]);
    drawTriangle([
        ...grid(6,2), ...grid(7,2), ...grid(7,3)
    ]);
    drawTriangle([
        ...grid(7,5), ...grid(7,6), ...grid(6,6)
    ]);
}

//used to convert from my paper drawing grid to webgl grid
function grid(x, y) {
    return [(x - 5) / 5, (y - 5) / 5];
}
