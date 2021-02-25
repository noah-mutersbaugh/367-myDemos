var gl;
var points;
var x = 0.0;
var y = 0.0;
var xLoc, yLoc;
var xDir = 1.0;
var yDir = 1.0;

window.onload = function init() {
  // Setup our canvas and WebGL
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL unavailable");
  }

  // Triangle vertices
  var vertices = [vec2(-0.25, -0.25), vec2(0, 0.25), vec2(0.25, -0.25)];

  // configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 1.0, 0.0, 1.0);

  // load and initialize shaders
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // link shader to our application
  xLoc = gl.getUniformLocation(program, "x");
  yLoc = gl.getUniformLocation(program, "y");

  // load data into GPU
  var bufferID = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  //set position and render
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  render();

  function render() {
    setTimeout(() => {
      x += 0.05 * xDir; //0.001 makes it like the DVD bouncy screen
      y += 0.1 * yDir; //0.0025 makes it like the DVD bouncy screen

      if (y > 0.9) {
        // top hit -- reverse y but keep x
        y = 0.9;
        yDir *= -1.0;
      }
      if (x > 0.9) {
        // right hit -- reverse x but keep y
        x = 0.9;
        xDir *= -1.0;
      }
      if (y < -0.9) {
        // bottom hit -- reverse y but keep x
        y = -0.9;
        yDir *= -1.0;
      }
      if (x < -0.9) {
        // left hit -- reverse x but keep y
        x = -0.9;
        xDir *= -1.0;
      }

      gl.uniform1f(xLoc, x);
      gl.uniform1f(yLoc, y);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      window.requestAnimFrame(render);
    }, 100);
  }
};
