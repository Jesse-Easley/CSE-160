// DrawRectangle.js
function main() {
    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    
    document.getElementById('drawBtn').addEventListener('click', handleDrawEvent);
    document.getElementById('opBtn').addEventListener('click', handleDrawOperationEvent);
}

function drawVector(vector, color){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.beginPath();

    //move to origin and do relative
    ctx.moveTo(200,200);
    ctx.lineTo(vector.elements[0]*20+200, -vector.elements[1]*20+200); //there is probably a better way of doing this

    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var v1 = new Vector3([Number(document.getElementById('v1x').value), Number(document.getElementById('v1y').value), 0])
    var v2 = new Vector3([Number(document.getElementById('v2x').value), Number(document.getElementById('v2y').value), 0])

    drawVector(v1, 'red');
    drawVector(v2, 'blue');
}

function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

    //create vectors from input
    var v1 = new Vector3([Number(document.getElementById('v1x').value), Number(document.getElementById('v1y').value), 0])
    var v2 = new Vector3([Number(document.getElementById('v2x').value), Number(document.getElementById('v2y').value), 0])

    var op = document.getElementById('opSelect').value;

    drawVector(v1, 'red');
    drawVector(v2, 'blue');

    if(op == 'add' || op == 'sub'){
        drawVector(v1[op](v2), 'green');
    }
    else if(op == 'mul' || op == 'div'){
        var scalar = document.getElementById('opScalar').value;
        drawVector(v1[op](scalar), 'green');
        drawVector(v2[op](scalar), 'green');
    }
    else if(op == 'mag'){
        console.log(v1.magnitude())
        console.log(v2.magnitude())
    }
    else if(op == 'norm'){
        drawVector(v1.normalize(), 'green');
        drawVector(v2.normalize(), 'green');
    }
    else if(op == 'angle'){
        console.log(angleBetween(v1, v2));
    }
    else if(op == 'area'){
        console.log(areaTriangle(v1, v2));
    }
}

function angleBetween(v1, v2){
    var dot = Vector3.dot(v1, v2);
    var radAngle = Math.acos(dot/(v1.magnitude() * v2.magnitude()))
    return radAngle * (180/(Math.PI));
}

function areaTriangle(v1, v2){
    var para = Vector3.cross(v1, v2).magnitude();
    var area = para / 2;
    return area;
}