"use strict";

var canvas;
var gl;

var numVertices  = 96; //(36+30+30)

var numChecks = 8;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];

var program;

var c;

var flag = true;

var xAxis = 0; 
var yAxis = 1;
var zAxis = 2;

var axis = 1;
var rot_theta = [0, 0, 0];

var thetaLoc; 

//view volume and viewer position parameters
var near = 0.3;
var far = 3.0;
var radius = 2.0;
var theta = 45 * Math.PI/180.0;;
var phi = 60 * Math.PI/180.0;;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var eye;
const at = vec3(0.0, 0, 0);
const up = vec3(0.0, 1.0, 0.0);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;
var ambientColor, diffuseColor, specularColor;

var vertices = [
    vec4( -0.5, 0.4, 0.2, 1.0 ), //UpperBase
    vec4( -0.5, 0.6, 0.2, 1.0 ),
    vec4( 0.5, 0.6, 0.2, 1.0 ),
    vec4( 0.5, 0.4, 0.2, 1.0 ),
    vec4( -0.5, 0.4, -0.2, 1.0 ),
    vec4( -0.5, 0.6, -0.2, 1.0 ),
    vec4( 0.5, 0.6, -0.2, 1.0 ),
    vec4( 0.5, 0.4, -0.2, 1.0 ),

    vec4( -0.5, -0.4, 0.2, 1.0 ), //LeftLeg
    vec4( -0.2, 0.4, 0.2, 1.0 ),
    vec4( 0.2, 0.4, 0.2, 1.0 ),
    vec4( -0.2, -0.4, 0.2, 1.0 ),
    vec4( -0.5, -0.4, -0.2, 1.0 ),
    vec4( -0.2, 0.4, -0.2, 1.0 ),
    vec4( 0.2, 0.4, -0.2, 1.0 ),
    vec4( -0.2, -0.4, -0.2, 1.0 ),

    vec4( 0.2, -0.4, 0.2, 1.0 ), //RightLeg
    vec4( -0.2, 0.4, 0.2, 1.0 ),
    vec4( 0.2, 0.4, 0.2, 1.0 ),
    vec4( 0.5, -0.4, 0.2, 1.0 ),
    vec4( 0.2, -0.4, -0.2, 1.0 ), 
    vec4( -0.2, 0.4, -0.2, 1.0 ),
    vec4( 0.2, 0.4, -0.2, 1.0 ),
    vec4( 0.5, -0.4, -0.2, 1.0 ),
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var thetaLoc;

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     normal = vec3(normal);

     var e = a%8;
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[e]);
     normalsArray.push(normal);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[e]);
     normalsArray.push(normal);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[e]);
     normalsArray.push(normal);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[e]);
     normalsArray.push(normal);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[e]);
     normalsArray.push(normal);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[e]);
     normalsArray.push(normal);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );

    quad( 1+8, 0+8, 3+8, 2+8 );
    quad( 2+8, 3+8, 7+8, 6+8 );
    quad( 3+8, 0+8, 4+8, 7+8 );
    //quad( 6+8, 5+8, 1+8, 2+8 );
    quad( 4+8, 5+8, 6+8, 7+8 );
    quad( 5+8, 4+8, 0+8, 1+8 );

    quad( 1+16, 0+16, 3+16, 2+16 );
    quad( 2+16, 3+16, 7+16, 6+16 );
    quad( 3+16, 0+16, 4+16, 7+16 );
    //quad( 6+16, 5+16, 1+16, 2+16 );
    quad( 4+16, 5+16, 6+16, 7+16 );
    quad( 5+16, 4+16, 0+16, 1+16 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect =  canvas.width/canvas.height;
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

/*    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );*/

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "uTheta"); 

    //event listeners for buttons
    document.getElementById("xRot").onclick = function(){axis = xAxis;};
    document.getElementById("yRot").onclick = function(){axis = yAxis;};
    document.getElementById("zRot").onclick = function(){axis = zAxis;};
    document.getElementById("tRot").onclick = function(){flag = !flag;};

    // buttons for viewing parameters
    document.getElementById("zInc").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("zDec").onclick = function(){near  *= 0.9; far *= 0.9;};
    document.getElementById("rInc").onclick = function(){radius *= 2.0;};
    document.getElementById("rDec").onclick = function(){radius *= 0.5;};
    document.getElementById("thInc").onclick = function(){theta += dr;};
    document.getElementById("thDec").onclick = function(){theta -= dr;};
    document.getElementById("phiInc").onclick = function(){phi += dr;};
    document.getElementById("phiDec").onclick = function(){phi -= dr;};

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
       ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
       diffuseProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
       specularProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
       lightPosition );

    gl.uniform1f(gl.getUniformLocation(program,
       "uShininess"), materialShininess);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if(flag) rot_theta[axis] += 2.0; 
    gl.uniform3fv(thetaLoc, rot_theta); 

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimationFrame(render);
}
