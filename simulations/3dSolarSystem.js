const canvas = document.getElementById("gameCanvas");

const gl =
  canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

const G = 0.1;
const timeScale = 0.01;

alert(
  "Use WASD to move around the XY plane and spacebar and shift to go up and down"
);

// Getting the Width and Height of the Canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

if (!gl) {
  alert(
    "The Browser that you are currently using does not support webgl, please using a different browser that supports webGl"
  );
  throw new Error("WebGl not supported by the Browser");
}

// Set the color of the canvas to black
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

// Camera
let camera = {
  x: 0,
  y: 0,
  z: 150,
  xRotation: 0,
  yRotation: 0,
};

class celistialBody {
  constructor(
    name,
    x,
    y,
    z,
    radii,
    mass,
    color,
    velocityX = 0,
    velocityY = 0,
    velocityZ = 0
  ) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.z = z;
    this.radii = radii;
    this.mass = mass;
    this.color = color;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.velocityZ = velocityZ;

    this.sphereVertices = createSphere(radii, 16);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.sphereVertices),
      gl.STATIC_DRAW
    );
  }

  calculateGravitationalForce(foreignBody) {
    const dx = foreignBody.x - this.x;
    const dy = foreignBody.y - this.y;
    const dz = foreignBody.z - this.z;

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const distanceSquared = distance * distance;

    if (distance === 0) {
      return { forceX: 0, forceY: 0, forceZ: 0 };
    }

    const force = (G * this.mass * foreignBody.mass) / distanceSquared;

    const forceX = force * (dx / distance);
    const forceY = force * (dy / distance);
    const forceZ = force * (dz / distance);

    return { forceX, forceY, forceZ };
  }

  update(bodies) {
    let totalForceX = 0;
    let totalForceY = 0;
    let totalForceZ = 0;

    for (let body of bodies) {
      if (body !== this) {
        const force = this.calculateGravitationalForce(body);
        totalForceX += force.forceX;
        totalForceY += force.forceY;
        totalForceZ += force.forceZ;
      }
    }

    const accelerationX = totalForceX / this.mass;
    const accelerationY = totalForceY / this.mass;
    const accelerationZ = totalForceZ / this.mass;

    this.velocityX += accelerationX * timeScale;
    this.velocityY += accelerationY * timeScale;
    this.velocityZ += accelerationZ * timeScale;

    this.x += this.velocityX * timeScale;
    this.y += this.velocityY * timeScale;
    this.z += this.velocityZ * timeScale;
  }

  draw() {
    const bodyModelView = new Float32Array(modelViewMatrix(camera));

    bodyModelView[12] += this.x;
    bodyModelView[13] += this.y;
    bodyModelView[14] += this.z;

    gl.uniformMatrix4fv(uModelViewMatrix, false, bodyModelView);
    gl.uniform4f(uColor, ...this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, this.sphereVertices.length / 3);
  }
}

const keys = {};

// Setting Up the Shaders
const vertexShaderSource = `
    attribute vec3 aPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        gl_PointSize = 1.0;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;


    
    void main() {
      gl_FragColor = uColor;
    }
`;

// Compiling the Shaders
function compileShader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader Error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Create Shaders Program
const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Get attributes and uniform locations
const aPosition = gl.getAttribLocation(program, "aPosition");
const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const uColor = gl.getUniformLocation(program, "uColor");

gl.enableVertexAttribArray(aPosition);

// Making a Sphere
function createSphere(radius, segments) {
  const position = [];

  for (let i = 0; i <= segments; i++) {
    const latAngle = (Math.PI * i) / segments;
    for (let j = 0; j <= segments; j++) {
      const lonAngle = (2 * Math.PI * j) / segments;

      const x = Math.sin(latAngle) * Math.cos(lonAngle) * radius;
      const y = Math.cos(latAngle) * radius;
      const z = Math.sin(latAngle) * Math.sin(lonAngle) * radius;

      position.push(x, y, z);
    }
  }

  return position;
}

// Makes a Circle
function createCircle(radius, segments) {
  const positions = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = 0;
    positions.push(x, y, z);
  }

  return positions;
}

// Makes a Matrix for perspective while zooming in and out and moving around
function createPerspectiveMatrix(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov * 0.5);
  const rangeInv = 1.0 / (near - far);

  return [
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * rangeInv,
    -1,
    0,
    0,
    near * far * rangeInv * 2,
    0,
  ];
}

function modelViewMatrix(camera) {
  const matrix = new Float32Array(16);

  for (let i = 0; i < 16; i++) {
    matrix[i] = 0;
  }

  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;

  matrix[12] = -camera.x;
  matrix[13] = -camera.y;
  matrix[14] = -camera.z;

  const cosX = Math.cos(camera.xRotation);
  const sinX = Math.sin(camera.xRotation);
  const cosY = Math.cos(camera.yRotation);
  const sinY = Math.sin(camera.yRotation);

  const rotMatrix = new Float32Array(16);
  rotMatrix[0] = cosY;
  rotMatrix[2] = sinY;
  rotMatrix[4] = sinX * sinY;
  rotMatrix[5] = cosX;
  rotMatrix[6] = -sinX * cosY;
  rotMatrix[8] = -cosX * sinY;
  rotMatrix[9] = sinX;
  rotMatrix[10] = cosX * cosY;
  rotMatrix[15] = 1;

  return matrix;
}

// Creates the Solar System (yeah ik it sounds kinda stupid)
let solarSystem = [];

// Adding different Plantes and Sun

// Adding Sun

const sun = new celistialBody(
  "sun",
  0,
  0,
  0,
  5,
  1000000,
  [1.0, 0.9, 0.0, 1.0],
  0,
  0,
  0
);

const mercury = new celistialBody(
  "Mercury",
  35,
  0,
  0,
  2,
  0.5,
  [0.7, 0.7, 0.7, 1.0],
  0,
  25,
  0
);

const venus = new celistialBody(
  "Venus",
  40,
  0,
  0,
  2,
  0.5,
  [0.7, 0.2, 0.7, 1.0],
  0,
  30,
  0
);

const earth = new celistialBody(
  "Earth",
  60,
  0,
  0,
  2,
  1.0,
  [0.2, 0.2, 1, 1.0],
  0,
  30,
  0
);

solarSystem.push(sun, mercury, venus, earth);

// Setting up the projection Matrix
const projectionMatrix = createPerspectiveMatrix(
  Math.PI / 4,
  canvas.width / canvas.height,
  0.1,
  1000.0
);
gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

// set the viewport
gl.viewport(0, 0, canvas.width, canvas.height);

// Keyboard Controls

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Mouse Controls

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener("mouseup", () => {
  mouseDown = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;

  const dX = e.clientX - lastMouseX;
  const dY = e.clientY - lastMouseY;

  camera.yRotation += dX * 0.01;
  camera.xRotation += dY * 0.01;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

// Handleing the Resizing of window
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  const aspect = canvas.width / canvas.height;
  const newProjection = createPerspectiveMatrix(
    Math.PI / 4,
    aspect,
    0.1,
    100.0
  );
  gl.uniformMatrix4fv(uProjectionMatrix, false, newProjection);
});

console.log("starting game loop");
console.log("camera pos: ", camera);

let frameCount = 0;
function gameLoop() {
  frameCount++;

  solarSystem.forEach((body) => {
    body.update(solarSystem);
  });

  if (frameCount % 1 == 0) {
    console.log("Game loop running. Camera: ", camera);
  }

  const moveSpeed = 1.0;
  const lookSpeed = 0.05;

  if (keys["w"]) {
    camera.z -= moveSpeed * Math.cos(camera.yRotation);
    camera.x += moveSpeed * Math.sin(camera.yRotation);
  }

  if (keys["s"]) {
    camera.z += moveSpeed * Math.cos(camera.yRotation);
    camera.x -= moveSpeed * Math.sin(camera.yRotation);
  }

  if (keys["a"]) {
    camera.x -= moveSpeed * Math.cos(camera.yRotation);
    camera.z -= moveSpeed * Math.sin(camera.yRotation);
  }

  if (keys["d"]) {
    camera.x += moveSpeed * Math.cos(camera.yRotation);
    camera.z += moveSpeed * Math.sin(camera.yRotation);
  }

  if (keys[" "]) {
    camera.y += moveSpeed;
  }

  if (keys["shift"]) {
    camera.y -= moveSpeed;
  }

  // Clear the Screen
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const modelView = modelViewMatrix(camera);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelView);

  solarSystem.forEach((body) => {
    body.draw();
  });

  requestAnimationFrame(gameLoop);
}

gameLoop();
