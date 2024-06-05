const speed = 2;
const fRnd = 0;
const ballRadiusRelative = 0.030;
const paddleHeightRelative = 0.04;
const paddleWidthRelative = 0.20;
var lives = 1;

var canvas = document.getElementById("GameCanvas");
var ctx = canvas.getContext("2d");

function resizeCanvas() {
  var ratio = window.screen.width / window.screen.height;
  canvas.width = window.innerWidth * 0.65;
  canvas.height = canvas.width / ratio;
  positionCanvas();
}

function positionCanvas() {
  canvas.style.position = 'absolute';
  canvas.style.top = (window.innerHeight - canvas.height) / 2 + 'px';
  canvas.style.left = (window.innerWidth - canvas.width) / 2 + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

var BallGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
BallGradient.addColorStop(0, "white");
BallGradient.addColorStop(1, "rgb(240, 234, 50)");

var ballRadius = 0;

function drawBall() {
  ballRadius = ballRadiusRelative * canvas.height;
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = BallGradient;
  ctx.fill();
  ctx.closePath();
}

var gameOver = false;

function wallCheck() {
  if (y + dy < ballRadius) {
    dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle for paddle
    } else {
      lives--;
      if (lives <= 0) {
        gameOver = true; // Set game over state to true
      } else {
        dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle for bottom wall
      }
    }
  }
  if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
    dx = -dx * (1 + Math.random() * fRnd); // Random Rnd angle for side walls
  }
}

function drawGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "45px Impact"; // Change font to Impact for a more ominous look
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
  
  // Draw circled arrow for restart
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2 + 20, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2 + 20);
  ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2 + 20);
  ctx.lineTo(canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();

  // Add retry button click event listener
  canvas.addEventListener("click", restartGame);
}

function restartGame() {
  // Remove the retry button click event listener
  canvas.removeEventListener("click", restartGame);
  
  // Reset variables and start the game again
  gameOver = false;
  gameWon = false;
  lives = 1; // Reset lives
  score = 0; // Reset score
  x = x0; // Reset ball position
  y = y0;
  dx = speed * dx0; // Reset ball speed
  dy = -1 * speed * dy0;
  paddleX = (canvas.width - paddleWidth) / 2; // Reset paddle position
  
  // Reset bricks
  bricks = [];
  for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: 1
      };
    }
  }
  
  // Restart the game loop
  draw();
}


var paddleHeight = paddleHeightRelative * canvas.height;;
var paddleWidth = paddleWidthRelative * canvas.width;;
var paddleX = (canvas.width - paddleWidth) / 2;

function drawPaddle() {
  paddleHeight = paddleHeightRelative * canvas.height;
  paddleWidth = paddleWidthRelative * canvas.width;
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
}

const brickRowCount = 4;
const brickColumnCount = 6;
const brickTotal = brickRowCount * brickColumnCount
const brickPaddingRelative = 0.01;
const brickOffsetTopRelative = 0.1;

const brickWidthRelative = 0.15;
const brickHeightRelative = 0.06;

const brickOffsetLeftRelative = (1 - brickColumnCount * (brickWidthRelative + brickPaddingRelative) + brickPaddingRelative) / 2;
var brickWidth = brickWidthRelative * canvas.width;
var brickHeight = brickHeightRelative * canvas.height;
var brickPadding = brickPaddingRelative * canvas.width;
var brickOffsetTop = brickOffsetTopRelative * canvas.height;
var brickOffsetLeft = brickOffsetLeftRelative * canvas.width;

var bricks = [];
for (var c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (var r = 0; r < brickRowCount; r++) {
    bricks[c][r] = {
      x: 0,
      y: 0,
      status: 1
    };
  }
}

function drawBricks() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        var brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        var brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

var gameWon = false;

function collisionDetection() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status == 1 && x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
        dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle for bricks
        b.status = 0;
        ++score;

        if (score == brickTotal) {
          gameWon = true; // Set game won state to true
          return; // Stop further collision detection
        }
      }
    }
  }
}

function drawWin() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw congratulatory message
  ctx.font = "45px Comic Sans MS"; // Cheerful font
  ctx.fillStyle = "red"; // Cheerful green color
  ctx.textAlign = "center";
  ctx.fillText("YOU WIN! 😺", canvas.width / 2, canvas.height / 2 - 30);

  // Draw circled arrow for restart
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2 + 20, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#32CD32";
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2 + 20);
  ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2 + 20);
  ctx.lineTo(canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
  
  // Add retry button click event listener
  canvas.addEventListener("click", restartGame);
}

var x0 = canvas.width / 2;
var y0 = canvas.height - 30;

var x = x0;
var y = y0;

var dx0 = Math.random() < 0.5 ? -1 : 1;
var dy0 = 1;

var dx = speed * dx0;
var dy = -1 * speed * dy0;
var score = 0;

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 8, 20);
}

function draw() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  if (gameWon) {
    drawWin();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();

  wallCheck();
  collisionDetection();

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

var rightPressed = false;
var leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
canvas.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if(relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}
function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

draw();