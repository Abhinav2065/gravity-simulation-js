const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const G = 0.2; // Universal Graitational Constant (G)

const astroidBeltInnerRadius = 300;
const astroidBeltOuterRadius = 400;

let timeScale = 0.07; // Makes this fun at 7% of the speed

class celistialBody {
  constructor(name, x, y, radii, mass, color, velocityX = 0, velocityY = 0) {
    // Used for Making a new Celistrial Body like stars or Planets
    this.name = name; // Name of the Body
    this.x = x; // X position of the body
    this.y = y; // Y position of the body
    this.radii = radii; // Radius of the Body
    this.mass = mass; // Mass of the Body
    this.color = color; // Color of the Body
    this.velocityX = velocityX; // Initial Velocity of the Body on both of the axis
    this.velocityY = velocityY;
  }

  calculateGravitationalForce(foreignBody) {
    const dx = foreignBody.x - this.x;
    const dy = foreignBody.y - this.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const distanceSquared = distance * distance;

    if (distance == 0) {
      // Avoiding Dividing By 0
      return { forceX: 0, forceY: 0 };
    }

    const force = (G * this.mass * foreignBody.mass) / distanceSquared;

    // F = G*M1*M2/(d^2) Using this formula to calculate the force

    // Calculating The x and y component of the force
    // Fx = F * cos(theta) {cos(theta) = base/hypotenuse}
    // Fx = F * dx/distance

    // Fy = F * sin(theta) {sin(theta) = perpendicular/hypotenuse}
    // Fy = F * dy/distance

    // We get this from the above Calculations
    const forceX = force * (dx / distance);
    const forceY = force * (dy / distance);

    return { forceX, forceY };
  }

  update(bodies) {
    let totalForceX = 0; // Initiliazing the total force for both axis to 0
    let totalForceY = 0;

    // Looping through all the body
    for (let body of bodies) {
      if (body !== this) {
        // Ignoring the calculations for this body
        const force = this.calculateGravitationalForce(body); // Calculate the forces
        totalForceX += force.forceX; // Add the components of the force
        totalForceY += force.forceY;
      }
    }
    // Repeat this for all bodies except itself

    // F = ma, a = F/m

    const accelerationX = totalForceX / this.mass;
    const accelerationY = totalForceY / this.mass;

    this.velocityX += accelerationX * timeScale;
    this.velocityY += accelerationY * timeScale;

    this.x += this.velocityX * timeScale;
    this.y += this.velocityY * timeScale;
  }

  draw() {
    // This Function Draws the Celistial Bodies

    // Draw the Body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radii, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the Name of the Body
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x, this.y - this.radii - 5);
  }
}

let solarSystem = [];

const sun = new celistialBody( // This Creates the Sun
  "Sun",
  canvas.width / 2,
  canvas.height / 2,
  30, // Radii of the Sun
  5000000, // Mass of the Sun
  "#ffd900ff" // Color of the Sun
);

solarSystem.push(sun);

const earth = new celistialBody(
  "Earth",
  canvas.width / 2,
  canvas.height / 2 + 230,
  12,
  100,
  "rgba(0, 94, 255, 1)",
  orbitalVelocity(230),
  0
);

solarSystem.push(earth);

const mercury = new celistialBody(
  "Mercury",
  canvas.width / 2 - 80,
  canvas.height / 2,
  6,
  60,
  "#d7850aff",
  0,
  orbitalVelocity(80)
);

solarSystem.push(mercury);

const venus = new celistialBody(
  "Venus",
  canvas.width / 2 - 140,
  canvas.height / 2,
  6,
  10,
  "#bc8c45ff",
  0,
  orbitalVelocity(140)
);

solarSystem.push(venus);

const mars = new celistialBody(
  "mars",
  canvas.width / 2 - 260,
  canvas.height / 2,
  10,
  80,
  "rgba(168, 159, 3, 1)",
  0,
  orbitalVelocity(260)
);

solarSystem.push(mars);

function gameLoop() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars(stars);

  solarSystem.forEach((body) => {
    body.update(solarSystem);
    body.draw();
  });

  requestAnimationFrame(gameLoop);
}

function orbitalVelocity(orbitalRadius) {
  return Math.sqrt((G * sun.mass) / orbitalRadius);
}

function createStars(numOfStars) {
  const stars = [];

  for (let i = 0; i < numOfStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.5 + 0.2,
    });
  }

  return stars;
}

function drawStars(stars) {
  stars.forEach((star) => {
    const twinkle = Math.sin(Date.now() * star.twinkleSpeed) * 0.3 + 0.7;
    const brightness = star.brightness * twinkle;

    ctx.fillStyle = `rgba(255,255,255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
    ctx.fill();
  });
}

let stars = createStars(100);

gameLoop();
