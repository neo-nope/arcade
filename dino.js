// Dino Run Game
var dinoGame = (function() {
    var canvas, ctx;
    var gameRunning = false;
    var score = 0;
    var gameSpeed = 3;
    var gravity = 0.5;
    
    var dino = {
        x: 50,
        y: 200,
        width: 40,
        height: 40,
        jumping: false,
        velocityY: 0,
        jumpPower: 12
    };
    
    var obstacles = [];
    var clouds = [];
    var ground = { x: 0, y: 250, width: 400, height: 150 };
    
    function createObstacle() {
        var types = ['cactus', 'rock', 'bird'];
        var type = types[Math.floor(Math.random() * types.length)];
        
        return {
            x: canvas.width,
            y: type === 'bird' ? 180 : 210,
            width: type === 'bird' ? 30 : 20,
            height: type === 'bird' ? 20 : 40,
            type: type,
            passed: false
        };
    }
    
    function createCloud() {
        return {
            x: canvas.width,
            y: Math.random() * 100 + 50,
            width: 40,
            height: 20,
            speed: 1
        };
    }
    
    function drawDino() {
        // Dino body
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        
        // Dino head
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(dino.x + 25, dino.y - 15, 20, 20);
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.fillRect(dino.x + 35, dino.y - 10, 3, 3);
        
        // Legs (animated when running)
        ctx.fillStyle = '#4A4A4A';
        var legOffset = Math.floor(score / 10) % 2 === 0 ? 0 : 3;
        ctx.fillRect(dino.x + 5, dino.y + dino.height, 8, 15 + legOffset);
        ctx.fillRect(dino.x + 25, dino.y + dino.height, 8, 15 - legOffset);
        
        // Tail
        ctx.fillStyle = '#6A6A6A';
        ctx.fillRect(dino.x - 10, dino.y + 10, 15, 8);
    }
    
    function drawObstacle(obstacle) {
        if (obstacle.type === 'cactus') {
            // Cactus
            ctx.fillStyle = '#2D5A2D';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.fillRect(obstacle.x + 5, obstacle.y - 15, 10, 20);
            ctx.fillRect(obstacle.x - 5, obstacle.y + 10, 10, 15);
        } else if (obstacle.type === 'rock') {
            // Rock
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
        } else if (obstacle.type === 'bird') {
            // Bird
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Wings
            ctx.fillStyle = '#654321';
            var wingFlap = Math.floor(score / 5) % 2 === 0 ? -3 : 3;
            ctx.fillRect(obstacle.x - 5, obstacle.y + wingFlap, 15, 8);
            ctx.fillRect(obstacle.x + 20, obstacle.y - wingFlap, 15, 8);
        }
    }
    
    function drawCloud(cloud) {
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
        ctx.fillRect(cloud.x + 10, cloud.y - 5, 20, 15);
        ctx.fillRect(cloud.x + 20, cloud.y + 5, 15, 10);
    }
    
    function drawGround() {
        // Ground
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(0, ground.y, canvas.width, ground.height);
        
        // Ground pattern
        ctx.fillStyle = '#C19A6B';
        for (var i = 0; i < canvas.width; i += 30) {
            var offset = (score * gameSpeed + i) % 60;
            ctx.fillRect(i - offset, ground.y, 20, 5);
        }
    }
    
    function drawUI() {
        ctx.fillStyle = '#333';
        ctx.font = '16px Courier New';
        ctx.fillText('Score: ' + Math.floor(score), 10, 25);
        ctx.fillText('Speed: ' + gameSpeed.toFixed(1), 10, 45);
        
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#FF0000';
            ctx.font = '24px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('EXTINCTION!', canvas.width / 2, canvas.height / 2 - 40);
            ctx.fillText('Score: ' + Math.floor(score), canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 20);
            ctx.textAlign = 'left';
        }
    }
    
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    function updateDino() {
        // Apply gravity
        if (dino.jumping) {
            dino.velocityY += gravity;
            dino.y += dino.velocityY;
            
            // Land on ground
            if (dino.y >= 200) {
                dino.y = 200;
                dino.jumping = false;
                dino.velocityY = 0;
            }
        }
    }
    
    function updateObstacles() {
        // Move obstacles
        for (var i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= gameSpeed;
            
            // Remove off-screen obstacles
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
                continue;
            }
            
            // Check collision
            if (checkCollision(dino, obstacles[i])) {
                gameOver();
                return;
            }
            
            // Score when passing obstacle
            if (!obstacles[i].passed && obstacles[i].x + obstacles[i].width < dino.x) {
                obstacles[i].passed = true;
                score += 10;
                
                // Easter Egg: Speed increases
                if (score % 100 === 0) {
                    gameSpeed += 0.5;
                    showMessage('🦕 Evolution! Speed increased!', 'success');
                }
                
                // Easter Egg: Milestone messages
                if (score === 500) {
                    showMessage('🎉 Dino Champion! You\'ve survived the apocalypse!', 'success');
                }
            }
        }
        
        // Spawn new obstacles
        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
            if (Math.random() < 0.8) { // 80% chance to spawn
                obstacles.push(createObstacle());
            }
        }
    }
    
    function updateClouds() {
        // Move clouds
        for (var i = clouds.length - 1; i >= 0; i--) {
            clouds[i].x -= clouds[i].speed;
            
            if (clouds[i].x + clouds[i].width < 0) {
                clouds.splice(i, 1);
            }
        }
        
        // Spawn new clouds
        if (Math.random() < 0.005) {
            clouds.push(createCloud());
        }
    }
    
    function jump() {
        if (!dino.jumping && gameRunning) {
            dino.jumping = true;
            dino.velocityY = -dino.jumpPower;
        }
    }
    
    function gameOver() {
        gameRunning = false;
        
        // Easter Egg: Death messages
        if (score < 100) {
            showMessage('💀 Pathetic extinction! Even meteors are laughing!', 'error');
        } else if (score < 300) {
            showMessage('🦴 Not bad, but still extinct!', 'error');
        } else {
            showMessage('🏆 Impressive survival! You\'ve delayed extinction!', 'success');
        }
        
        submitScore('dino', Math.floor(score));
    }
    
    function restart() {
        gameRunning = true;
        score = 0;
        gameSpeed = 3;
        dino.y = 200;
        dino.jumping = false;
        dino.velocityY = 0;
        obstacles = [];
        clouds = [];
    }
    
    function gameLoop() {
        // Clear canvas
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawGround();
        
        // Draw clouds
        clouds.forEach(drawCloud);
        
        if (gameRunning) {
            updateDino();
            updateObstacles();
            updateClouds();
            score += 0.1;
        }
        
        // Draw game objects
        drawDino();
        obstacles.forEach(drawObstacle);
        
        drawUI();
        
        requestAnimationFrame(gameLoop);
    }
    
    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                if (gameRunning) {
                    jump();
                } else {
                    restart();
                }
            }
        });
        
        restart();
        gameLoop();
    }
    
    return {
        init: createGame,
        restart: restart
    };
})();

function startDinoGame() {
    dinoGame.init('gameCanvas');
}
