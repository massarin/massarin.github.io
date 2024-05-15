const speed = 0.010;
const fRnd = 0;
const ballRadiusRelative = 0.030;
const paddleHeightRelative = 0.04;
const paddleWidthRelative = 0.20;
var lives = 1;

var canvas = document.getElementById("GameCanvas");
var ctx = canvas.getContext("2d");

function resizeCanvas() {
  var ratio = window.screen.width / window.screen.height
  canvas.width = window.innerWidth * 0.65
  canvas.height = canvas.width / ratio
}

function positionCanvas() {
  canvas.style.position = 'absolute';
  canvas.style.top = (window.innerHeight - canvas.height) / 2 + 'px';
  canvas.style.left = (window.innerWidth - canvas.width) / 2 + 'px';
}

resizeCanvas();
positionCanvas();
//window.addEventListener('resize', positionCanvas);


var BallGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
BallGradient.addColorStop(0, "black");
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

function wallCheck() {
  if (y + dy < ballRadius) {
    dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle for paddle
    } else {
      lives--;
      if (!lives) {
        alert("GAME OVER");
        document.location.reload();
        clearInterval(interval); // Needed for Chrome to end game
      } else {
        dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle for bottom wall
      }
    }
  }
  if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
    dx = -dx * (1 + Math.random() * fRnd); // Random Rnd angle for side walls
  }
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
  brickWidth = brickWidthRelative * canvas.width;
  brickHeight = brickHeightRelative * canvas.height;
  brickPadding = brickPaddingRelative * canvas.width;
  brickOffsetTop = brickOffsetTopRelative * canvas.height;
  brickOffsetLeft = brickOffsetLeftRelative * canvas.width;

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

function collisionDetection() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status == 1 && x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
        dy = -dy * (1 + Math.random() * fRnd); // Random Rnd angle for bricks
        b.status = 0;
        ++score;

        if (score == brickTotal) {
          alert("YOU WIN, CONGRATULATIONS!");
          setTimeout(function() {
            document.location.reload();
          }, 1000); // Reload after 1000 milliseconds (1 second)
          clearInterval(interval);
        }
      }
    }
  }
}

var ScoreGradient = ctx.createLinearGradient(8 * canvas.width / 480, 20 * canvas.height / 320, 8 * canvas.width / 480 + 7 * 16 * canvas.width / 480, 20 * canvas.height / 320 + 16 * canvas.width / 480);
ScoreGradient.addColorStop(0, "red");
ScoreGradient.addColorStop(1, "black");
var score = 0;

function drawScore() {
  var fontPixels = 16 * canvas.width / 480;
  ctx.font = fontPixels + "px Arial";

  ctx.fillStyle = ScoreGradient;
  ctx.fillText("Score: " + score, 8 * canvas.width / 480, 20 * canvas.height / 320);
}


var LivesGradient = ctx.createLinearGradient(canvas.width - 65 * canvas.width / 480, 20 * canvas.height / 320, canvas.width - 65 * canvas.width / 480 + 7 * 16 * canvas.width / 480, 20 * canvas.height / 320 + 16 * canvas.width / 480);
LivesGradient.addColorStop(0, "red");
LivesGradient.addColorStop(1, "black");

function drawLives() {
  var fontPixels = 16 * canvas.width / 480;
  ctx.font = fontPixels + "px Arial";
  ctx.fillStyle = LivesGradient;
  ctx.fillText("Lives: " + lives, canvas.width - 65 * canvas.width / 480, 20 * canvas.height / 320);
}

const x0 = canvas.width / 2;
const y0 = canvas.height - (paddleHeight + ballRadius);
const myTheta0 = 20;

var x = x0;
var y = y0;
var rndDir
const alpha = 0.1

do {
  rndDir = Math.random();
} while (rndDir < alpha || rndDir > 1 - alpha || (rndDir > 0.45 && rndDir < 0.55)); // Avoid directions close to horizontal or vertical


var myTheta = rndDir * Math.PI

const dx0 = Math.cos(myTheta) * canvas.width;
const dy0 = Math.sin(myTheta) * canvas.height;

var dx = speed * dx0;
var dy = -1 * speed * dy0;

var lastScore = 0
const fBoost = 1.01

// Add these lines at the beginning to set up a new variable
var changeDirectionInterval = setInterval(changeDirection, 2000); // Change direction every 5 seconds

// Add this function to change the direction randomly
function changeDirection() {
  var speedMagnitude = Math.sqrt(dx * dx + dy * dy);
  var newAngle = Math.random() * 2 * Math.PI; // Random angle in radians
  dx = Math.cos(newAngle) * speedMagnitude;
  dy = Math.sin(newAngle) * speedMagnitude;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var canvasWidthRenormalisation = canvas.width;
  var canvasHeightRenormalisation = canvas.height;
  resizeCanvas();
  if (canvas.width != canvasWidthRenormalisation || canvas.height != canvasHeightRenormalisation) {
    dx *= canvas.width / canvasWidthRenormalisation;
    dy *= canvas.height / canvasHeightRenormalisation;
    x *= canvas.width / canvasWidthRenormalisation;
    y *= canvas.height / canvasHeightRenormalisation;
  }
  positionCanvas();
  wallCheck();
  if (lives <= 0 || score === brickTotal) {
    clearInterval(changeDirectionInterval);
  }
  if (score !== lastScore) { // Check if the score has changed
    lastScore = score; // Update the last recorded score
    dx *= fBoost; // Apply boost to dx
    dy *= fBoost; // Apply boost to dy
  }

  // Update ball position
  x += dx;
  y += dy;

  var paddleMove = speed * canvas.width;

  if (rightPressed) {
    paddleX += paddleMove;
    if (paddleX + paddleWidth > canvas.width) {
      paddleX = canvas.width - paddleWidth;
    }
  } else if (leftPressed) {
    paddleX -= paddleMove;
    if (paddleX < 0) {
      paddleX = 0;
    }
  }

  drawBricks();
  collisionDetection();
  drawPaddle();
  //showCoords();
  drawBall();
  drawScore();
  drawLives();

  requestAnimationFrame(draw);
}
var sdx = 0;
var sdy = 0;
var spaceCounter = 0;
var spacePressed = false;
var rightPressed = false;
var leftPressed = false;

function keySpaceHandler(e) {
  if (e.key == " ") {
    spaceCounter += 1;
    if (spaceCounter % 2 == 1){
      spacePressed = true;
    } else {
      spacePressed = false;
    }
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

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function showCoords(event) {
  var cX = event.clientX - canvas.offsetLeft;
  var sX = event.screenX;
  var cY = event.clientY;
  var sY = event.screenY;
  var coords1 = "client - X: " + cX + ", Y coords: " + cY;
  var coords2 = "screen - X: " + sX + ", Y coords: " + sY;
  var coords3 = "canvas-width:" + canvas.width;
  var coords4 = "canvas-height:" + canvas.height;
  var coords5 = "brick 1,0:" + bricks[1][0].x + " " + bricks[1][0].y;
  document.getElementById("display").innerHTML = coords1 + "<br>" + coords2 + "<br>" + coords3 + "<br>" + coords4 + "<br>" + coords5;
}
document.addEventListener("keyspace", keySpaceHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

var interval = requestAnimationFrame(draw, 3);
