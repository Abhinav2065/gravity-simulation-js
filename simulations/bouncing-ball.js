const canvas = document.getElementById('gameCanvas')  // Getting the Canvas
const ctx = canvas.getContext('2d');

let g = 0.2; // Acceleration Due to Gravity(g)


let ball = {
    x: 100,
    y: 0, // 580 max
    radius: 20,
    velocityX: 10,
    velocityY: 2,
    color: '#000000'
};


function gameLoop() {
    // Things to do in a game loop
    clearCanvas();
    // Clear the canvas

    // Update the Ball
    updateBall();
    // Draw The Ball

    drawBall();

    requestAnimationFrame(gameLoop);
}   



function clearCanvas() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}


function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fill();
}

function updateBall() {
    if (ball.y < 600 - ball.radius) {
        ball.velocityY += g;
    }
    if (ball.y >= 600 - ball.radius) {
        ball.velocityY = -ball.velocityY;
    }
    
    if (ball.x >= 1000 - ball.radius || ball.x <= 0 + ball.radius) {
        ball.velocityX = -ball.velocityX;
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
}



gameLoop();