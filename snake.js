// Enhanced Snake Game
var snakeGame = (function() {
    var canvas, ctx;
    var grid = 20;
    var count = 0;
    var snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
    var apple = { x: 320, y: 320 };
    var score = 0;
    var gameRunning = true;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function generateApple() {
        apple.x = getRandomInt(1, (canvas.width / grid) - 1) * grid;
        apple.y = getRandomInt(1, (canvas.height / grid) - 1) * grid;
        
        // Make sure apple doesn't spawn on snake
        snake.cells.forEach(function(cell) {
            if (cell.x === apple.x && cell.y === apple.y) {
                generateApple();
            }
        });
    }

    function drawBorder() {
        // Draw game border
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid pattern
        ctx.strokeStyle = '#004400';
        ctx.lineWidth = 0.5;
        for (var x = 0; x <= canvas.width; x += grid) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (var y = 0; y <= canvas.height; y += grid) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function drawApple() {
        // Draw apple with shadow
        ctx.fillStyle = '#FF6666';
        ctx.fillRect(apple.x + 2, apple.y + 2, grid - 2, grid - 2);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(apple.x, apple.y, grid - 2, grid - 2);
        
        // Apple highlight
        ctx.fillStyle = '#FFAAAA';
        ctx.fillRect(apple.x + 2, apple.y + 2, grid / 2, grid / 2);
    }

    function drawSnake() {
        snake.cells.forEach(function(cell, index) {
            if (index === 0) {
                // Snake head
                ctx.fillStyle = '#44FF44';
                ctx.fillRect(cell.x + 1, cell.y + 1, grid - 2, grid - 2);
                ctx.fillStyle = '#66FF66';
                ctx.fillRect(cell.x + 3, cell.y + 3, grid - 6, grid - 6);
                
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(cell.x + 5, cell.y + 5, 3, 3);
                ctx.fillRect(cell.x + 12, cell.y + 5, 3, 3);
            } else {
                // Snake body
                ctx.fillStyle = '#00AA00';
                ctx.fillRect(cell.x + 1, cell.y + 1, grid - 2, grid - 2);
                ctx.fillStyle = '#22CC22';
                ctx.fillRect(cell.x + 3, cell.y + 3, grid - 6, grid - 6);
            }
        });
    }

    function drawUI() {
        ctx.fillStyle = '#00FF00';
        ctx.font = '16px Courier New';
        ctx.fillText('Score: ' + score, 10, 25);
        ctx.fillText('Length: ' + snake.maxCells, 10, 45);
        
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#FF0000';
            ctx.font = '24px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 10);
            ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 40);
            ctx.textAlign = 'left';
        }
    }

    function loop() {
        if (!gameRunning) {
            drawUI();
            requestAnimationFrame(loop);
            return;
        }
        
        requestAnimationFrame(loop);
        if (++count < 8) return;
        count = 0;
        
        // Clear canvas
        ctx.fillStyle = '#000022';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Move snake
        snake.x += snake.dx;
        snake.y += snake.dy;
        
        // Check wall collision
        if (snake.x < 0 || snake.x >= canvas.width || 
            snake.y < 0 || snake.y >= canvas.height) {
            gameOver();
            return;
        }
        
        // Keep track of where snake has been
        snake.cells.unshift({ x: snake.x, y: snake.y });
        
        // Remove cells as we move away from them
        if (snake.cells.length > snake.maxCells) {
            snake.cells.pop();
        }
        
        // Check apple collision
        if (snake.x === apple.x && snake.y === apple.y) {
            snake.maxCells++;
            score += 10;
            generateApple();
            
            // Easter Egg: Special score milestones
            if (score === 100) {
                showMessage('🐍 Century Snake! You\'re getting better!', 'success');
            } else if (score === 500) {
                showMessage('🏆 Snake Master! The reptiles bow to you!', 'success');
            }
        }
        
        // Check self collision
        for (var i = 1; i < snake.cells.length; i++) {
            if (snake.x === snake.cells[i].x && snake.y === snake.cells[i].y) {
                gameOver();
                return;
            }
        }
        
        drawBorder();
        drawApple();
        drawSnake();
        drawUI();
    }
    
    function gameOver() {
        gameRunning = false;
        
        // Easter Egg: Death messages based on score
        if (score < 50) {
            showMessage('💀 Pathetic! Even a worm could do better!', 'error');
        } else if (score < 100) {
            showMessage('🥦 Not terrible, but still disappointing!', 'error');
        } else {
            showMessage('🎉 Actually decent! Are you sure you\'re human?', 'success');
        }
        
        // Submit score
        submitScore('snake', score);
    }
    
    function restart() {
        snake.x = 160;
        snake.y = 160;
        snake.dx = grid;
        snake.dy = 0;
        snake.cells = [];
        snake.maxCells = 4;
        score = 0;
        gameRunning = true;
        generateApple();
    }

    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        document.addEventListener('keydown', function(e) {
            if (!gameRunning && (e.which === 82 || e.key === 'r' || e.key === 'R')) {
                restart();
                return;
            }
            
            if (!gameRunning) return;
            
            // Prevent snake from backtracking
            if (e.which === 37 && snake.dx === 0) { // Left
                snake.dx = -grid;
                snake.dy = 0;
            } else if (e.which === 38 && snake.dy === 0) { // Up
                snake.dy = -grid;
                snake.dx = 0;
            } else if (e.which === 39 && snake.dx === 0) { // Right
                snake.dx = grid;
                snake.dy = 0;
            } else if (e.which === 40 && snake.dy === 0) { // Down
                snake.dy = grid;
                snake.dx = 0;
            }
        });
        
        generateApple();
        loop();
    }

    return {
        init: createGame,
        restart: restart
    };
})();

function startSnakeGame() {
    snakeGame.init('gameCanvas');
}
