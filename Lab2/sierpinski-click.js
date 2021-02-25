"use strict";

var canvas;
var gl;

var points = [];

var x1 = -1;
var y1 = -1;
var x2 = 0;
var y2 = 1;
var x3 = 1;
var y3 = -1;

var numTimesToSubdivide = 0;

var theta = 0.0;
var thetaLoc;
var rotate = false;

var count = 0;
var responses = [
  "No. Within the BOX.", // 0
  "Oh, you think you're funny? Ignoring instructions? Just click in the box.", // 1
  "WOW a REAL jokester! We're ALL laughing! This is SOOOO funny!", // 2
  "Okay seriously stop. Just click inside the box.", // 3
  "I'm not joking anymore. Click. Inside. The. Box.", // 4
  "Only the box.", // 5
  "Click inside ONLY the box.", // 6
  "I won't have the ability to keep doing this anymore. You have 3 more chances.", // 7
  "You're a horrible human. 2 more chances.", // 8
  "Spoke to your mom last night, turns out you're adopted. 1 more chance.", // 9
  "Alright, no more box clicking for you.", // 10
  "What? Did you expect to have no consequences?", // 11
  "Yeah, keep clicking.", // 12
  "That's it, stick it to the man.", // 13
  "No, this is great. A perfect way to spend your time.", // 14
  "I can do this all day. Literally. I'm a computer.", // 15
  "Keep it up. Nothing else is going to happen.", // 16
  ".", // 17
  "..", // 18
  "...", // 19
  "....", // 20
  ".....", // 21
  "......", // 22
  ".......", // 23
  "........", // 24
  ".........", // 25
  "..........", // 26
  "...........", // 27
  "What is wrong with you. Stand up and stretch, we're gonna be here a while apparently.", // 28
  "click click click click click click click click click", // 29
  "I really did set this up to have a ridiculous amount of responses...", // 30
  "I am curious if you'll keep going.", // 31
  "This is like cookie clicker but with absolutely 0 progression or satisfaction.", // 32
  "Dude - do you need someone to talk to?", // 33
  "I'm a computer, not a therapist.", // 34
  "Please.", // 35
  "Stand up, go for a walk. Stop clicking on this screen.", // 36
  "If you're still here, you're almost as messed up in the head as I am.", // 37
  "You ever see that video of monkey trying to shove a square peg in a round hole?", // 38
  "If you have, considering your actions today I don't think you made the connection between that monkey and yourself.", // 39
  "ERROR ERROR ERROR ERROR", // 40
];

function init() {
  try {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
      alert("WebGL isn't available");
    }
    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [vec2(x1, y1), vec2(x2, y2), vec2(x3, y3)];
    divideTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 50000, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider").onchange = function (event) {
      numTimesToSubdivide = parseInt(event.target.value);
    };

    thetaLoc = gl.getUniformLocation(program, "theta");

    render();
  } catch (error) {
    console.log("I removed your canvas muahahahaha");
  }
}

function triangle(a, b, c) {
  points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
  // check for end of recursion

  if (count === 0) {
    triangle(a, b, c);
  } else {
    //bisect the sides

    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    --count;

    // three new triangles

    divideTriangle(a, ab, ac, count);
    divideTriangle(c, ac, bc, count);
    divideTriangle(b, bc, ab, count);
  }
}

function init2() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  canvas.addEventListener("mouseup", function (event) {
    console.log(event.clientX, event.clientY);
    var rect = gl.canvas.getBoundingClientRect();
    var newx = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    var newy = ((event.clientY - rect.top) / canvas.height) * -2 + 1;

    var vertex_id = document.querySelector('input[name="vertex"]:checked')
      .value;
    if (vertex_id == 0) {
      x1 = newx;
      y1 = newy;
    } else if (vertex_id == 1) {
      x2 = newx;
      y2 = newy;
    } else {
      x3 = newx;
      y3 = newy;
    }

    console.log(newx, newy);

    init();
  });

  init();
}

window.onload = init2;

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (rotate) {
    theta += 0.1;
    gl.uniform1f(thetaLoc, theta);
  } else {
    theta = 0.0;
    gl.uniform1f(thetaLoc, theta);
  }

  gl.drawArrays(gl.TRIANGLES, 0, points.length);
  points = [];
  requestAnimFrame(init);
}

document.addEventListener("mouseup", (event) => {
  if ((event.target.tagName != "CANVAS") && (event.target.tagName != "INPUT") && count != 11) {
    if (responses[count] != undefined) {
      document.getElementById("response").innerHTML = responses[count];
    }
    count++;
    rotate = true;

  } else if (count == 11) {
    try {
      document.getElementById("gl-canvas").remove();
    } catch (error) {}

    let remove_array = document.getElementsByClassName("remove");

    while (remove_array.length > 0) {
      remove_array[0].remove();
    }

    document.getElementsByTagName("body")[0].style =
      "background-color: red; display: flex; flex-flow: column-nowrap; justify-content: center; align-items: center;";

    document.getElementById("response").style = "text-align: center;";
    count++;
  } else {
    rotate = false;
    theta = 0.0;
  }
});
