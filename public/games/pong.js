// Enhanced Pong Game
var pongGame = (function() {
    var canvas, ctx;
    var paddleWidth = 10;
    var paddleHeight = 75;
    var ballRadius = 7;
    var ballSpeed = 3;
    var paddleSpeed = 5;
    var aiSpeed = 2.5;
    
    // Game objects
    var leftPaddle = { y: 0 };
    var rightPaddle = { y: 0 };
    var ball = { x: 0, y: 0, dx: ballSpeed, dy: ballSpeed };
    
    // Game state
    var gameRunning = true;
    var playerScore = 0;
    var aiScore = 0;
    var upPressed = false;
    var downPressed = false;
    var gameTime = 0;
    var maxScore = 100; // Changed to 100 for longer games
    var totalHits = 0; // Track total paddle hits for scoring
    
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
        ball.dy = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    }
    
    function drawField() {
        // Disable smoothing for pixelated look
        ctx.imageSmoothingEnabled = false;
        
        // Draw field background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw pixelated center line
        ctx.fillStyle = '#FFFFFF';
        var centerX = Math.floor(canvas.width / 2);
        for (var y = 0; y < canvas.height; y += 8) {
            if (Math.floor(y / 8) % 2 === 0) {
                ctx.fillRect(centerX - 1, y, 2, 6);
            }
        }
        
        // Draw pixelated border
        ctx.fillStyle = '#FFFFFF';
        // Top border
        ctx.fillRect(0, 0, canvas.width, 2);
        // Bottom border
        ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
        // Left border
        ctx.fillRect(0, 0, 2, canvas.height);
        // Right border
        ctx.fillRect(canvas.width - 2, 0, 2, canvas.height);
    }
    
    function drawPaddles() {
        // Left paddle (AI) - pixelated
        ctx.fillStyle = '#FF0000';
        var leftX = 8;
        var leftY = Math.floor(leftPaddle.y / 2) * 2; // Snap to grid
        ctx.fillRect(leftX, leftY, paddleWidth, paddleHeight);
        
        // Right paddle (Player) - pixelated
        ctx.fillStyle = '#00FF00';
        var rightX = canvas.width - paddleWidth - 8;
        var rightY = Math.floor(rightPaddle.y / 2) * 2; // Snap to grid
        ctx.fillRect(rightX, rightY, paddleWidth, paddleHeight);
    }
    
    function drawBall() {
        // Pixelated ball - draw as a square
        ctx.fillStyle = '#FFFFFF';
        var ballX = Math.floor(ball.x / 2) * 2 - ballRadius; // Snap to grid
        var ballY = Math.floor(ball.y / 2) * 2 - ballRadius; // Snap to grid
        var ballSize = ballRadius * 2;
        ctx.fillRect(ballX, ballY, ballSize, ballSize);
        
        // Add a small inner square for detail
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(ballX + 2, ballY + 2, ballSize - 4, ballSize - 4);
    }
    
    function drawUI() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        
        // Scores
        ctx.fillText(aiScore, canvas.width / 4, 30);
        ctx.fillText(playerScore, (canvas.width * 3) / 4, 30);
        
        // Labels
        ctx.font = '10px monospace';
        ctx.fillText('AI', canvas.width / 4, 45);
        ctx.fillText('PLAYER', (canvas.width * 3) / 4, 45);
        
        // Hit counter
        ctx.fillText('HITS: ' + totalHits, canvas.width / 2, 60);
        
        // Controls hint
        ctx.fillText('USE ARROWS', canvas.width / 2, canvas.height - 20);
        
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '32px Courier New';
            ctx.textAlign = 'center';
            
            if (playerScore >= maxScore) {
                ctx.fillStyle = '#44FF44';
                ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 - 40);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '18px Courier New';
                ctx.fillText('🎉 You defeated the AI!', canvas.width / 2, canvas.height / 2);
            } else if (aiScore >= maxScore) {
                ctx.fillStyle = '#FF4444';
                ctx.fillText('AI WINS!', canvas.width / 2, canvas.height / 2 - 40);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '18px Courier New';
                ctx.fillText('💀 The machines are taking over!', canvas.width / 2, canvas.height / 2);
            }
            
            ctx.font = '16px Courier New';
            ctx.fillText('Final Score: ' + playerScore + ' - ' + aiScore, canvas.width / 2, canvas.height / 2 + 40);
            ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 70);
        }
        
        ctx.textAlign = 'left';
    }
    
    function updateAI() {
        // AI follows the ball with some imperfection
        var paddleCenter = leftPaddle.y + paddleHeight / 2;
        var ballCenter = ball.y;
        var difference = ballCenter - paddleCenter;
        
        // Add some randomness to make AI beatable
        var aiError = (Math.random() - 0.5) * 10;
        
        if (Math.abs(difference) > 5) {
            if (difference > 0) {
                leftPaddle.y += aiSpeed + aiError;
            } else {
                leftPaddle.y -= aiSpeed + aiError;
            }
        }
        
        // Keep AI paddle in bounds
        if (leftPaddle.y < 0) leftPaddle.y = 0;
        if (leftPaddle.y > canvas.height - paddleHeight) {
            leftPaddle.y = canvas.height - paddleHeight;
        }
    }
    
    function updatePlayer() {
        // Player paddle movement
        if (upPressed && rightPaddle.y > 0) {
            rightPaddle.y -= paddleSpeed;
        }
        if (downPressed && rightPaddle.y < canvas.height - paddleHeight) {
            rightPaddle.y += paddleSpeed;
        }
    }
    
    function updateBall() {
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Ball collision with top and bottom walls
        if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= canvas.height) {
            ball.dy = -ball.dy;
        }
        
        // Ball collision with left paddle (AI)
        if (ball.x - ballRadius <= 18 && 
            ball.y >= leftPaddle.y && 
            ball.y <= leftPaddle.y + paddleHeight) {
            ball.dx = -ball.dx;
            ball.x = 18 + ballRadius; // Prevent sticking
            
            totalHits++;
            
            // 50/50 chance for +1 score on paddle hit
            if (Math.random() > 0.5) {
                aiScore++;
            }
            
            // Add some variation to the bounce
            var relativeIntersectY = (leftPaddle.y + paddleHeight / 2) - ball.y;
            var normalizedRelativeIntersectionY = relativeIntersectY / (paddleHeight / 2);
            ball.dy = -normalizedRelativeIntersectionY * ballSpeed;
        }
        
        // Ball collision with right paddle (Player)
        if (ball.x + ballRadius >= canvas.width - 18 && 
            ball.y >= rightPaddle.y && 
            ball.y <= rightPaddle.y + paddleHeight) {
            ball.dx = -ball.dx;
            ball.x = canvas.width - 18 - ballRadius; // Prevent sticking
            
            totalHits++;
            
            // 50/50 chance for +1 score on paddle hit
            if (Math.random() > 0.5) {
                playerScore++;
            }
            
            // Add some variation to the bounce
            var relativeIntersectY = (rightPaddle.y + paddleHeight / 2) - ball.y;
            var normalizedRelativeIntersectionY = relativeIntersectY / (paddleHeight / 2);
            ball.dy = -normalizedRelativeIntersectionY * ballSpeed;
        }
        
        // Ball goes out of bounds - +10 points for scoring in enemy net
        if (ball.x < 0) {
            playerScore += 10; // Player scores in AI net
            resetBall();
        } else if (ball.x > canvas.width) {
            aiScore += 10; // AI scores in player net
            resetBall();
        }
        
        // Check for game end
        if (playerScore >= maxScore || aiScore >= maxScore) {
            gameOver();
        }
    }
    
    function gameOver() {
        gameRunning = false;
        
        // Submit score (player's score)
        submitScore('pong', playerScore);
        
        // Achievement messages
        if (playerScore >= maxScore) {
            showMessage('🏓 Pong Champion! You beat the AI!', 'success');
        } else {
            showMessage('💀 The AI crushed your dreams!', 'error');
        }
    }
    
    function loop() {
        if (!gameRunning) {
            drawField();
            drawPaddles();
            drawBall();
            drawUI();
            requestAnimationFrame(loop);
            return;
        }
        
        // Update game objects
        updateAI();
        updatePlayer();
        updateBall();
        
        // Draw everything
        drawField();
        drawPaddles();
        drawBall();
        drawUI();
        
        gameTime++;
        requestAnimationFrame(loop);
    }
    
    function restart() {
        gameRunning = true;
        playerScore = 0;
        aiScore = 0;
        gameTime = 0;
        totalHits = 0;
        
        // Reset paddle positions
        leftPaddle.y = (canvas.height - paddleHeight) / 2;
        rightPaddle.y = (canvas.height - paddleHeight) / 2;
        
        resetBall();
    }
    
    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        // Initialize positions
        leftPaddle.y = (canvas.height - paddleHeight) / 2;
        rightPaddle.y = (canvas.height - paddleHeight) / 2;
        resetBall();
        
        // Event listeners
        document.addEventListener('keydown', function(e) {
            if (!gameRunning && (e.which === 82 || e.key === 'r' || e.key === 'R')) {
                restart();
                return;
            }
            
            if (!gameRunning) return;
            
            if (e.which === 38 || e.key === 'ArrowUp') { // Up
                upPressed = true;
            } else if (e.which === 40 || e.key === 'ArrowDown') { // Down
                downPressed = true;
            }
        });
        
        document.addEventListener('keyup', function(e) {
            if (e.which === 38 || e.key === 'ArrowUp') { // Up
                upPressed = false;
            } else if (e.which === 40 || e.key === 'ArrowDown') { // Down
                downPressed = false;
            }
        });
        
        loop();
    }
    
    return {
        init: createGame,
        restart: restart
    };
})();

function startPongGame() {
    pongGame.init('gameCanvas');
}
