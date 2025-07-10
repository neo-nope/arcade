// Flappy Game (Reforged in Fire with Death Screen)
var flappyGame = (function () {
    var canvas, ctx;
    var bird, gravity, lift, velocity;
    var pipes = [];
    var score = 0;
    var gameRunning = true;
    var frameCount = 0;
    var scoreSubmitted = false;
    var highestScore = 0;

    var deathMessages = [
        "💀 Pathetic flap! Even a brick has better lift.",
        "🪦 RIP, birdbrain.",
        "☠️ SPLAT! That pipe wasn't even moving.",
        "🚫 No fly zone. Get rekt."
    ];

    function resetGame() {
        bird = {
            x: 80,
            y: 150,
            radius: 15
        };
        gravity = 0.5;
        lift = -8;
        velocity = 0;
        pipes = [];
        score = 0;
        gameRunning = true;
        frameCount = 0;
        scoreSubmitted = false;
    }

    function createPipe() {
        var top = Math.random() * 150 + 20;
        var gap = 100;
        return {
            x: canvas.width,
            top: top,
            bottom: top + gap,
            width: 50
        };
    }

    function update() {
        if (!gameRunning) return;

        frameCount++;

        velocity += gravity;
        bird.y += velocity;

        if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
            endGame();
        }

        // Spawn pipes every 90 frames
        if (frameCount % 90 === 0) {
            pipes.push(createPipe());
        }

        for (var i = pipes.length - 1; i >= 0; i--) {
            var p = pipes[i];
            p.x -= 2;

            if (
                bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + p.width &&
                (bird.y - bird.radius < p.top || bird.y + bird.radius > p.bottom)
            ) {
                endGame();
            }

            if (p.x + p.width < 0) {
                pipes.splice(i, 1);
                score++;
                
                // Easter Egg: Score milestones
                if (score === 1) {
                    showMessage('🐦 First point! Maybe you\'re not hopeless!', 'success');
                } else if (score === 5) {
                    showMessage('🎯 5 points! You\'re starting to get it!', 'success');
                } else if (score === 10) {
                    showMessage('🎉 Double digits! Actually impressive!', 'success');
                } else if (score === 25) {
                    showMessage('🏆 25 points! Flappy Bird master!', 'success');
                } else if (score === 50) {
                    showMessage('🤯 50 points! You\'ve transcended gravity!', 'success');
                }
                
                // Track highest score for session
                if (score > highestScore) {
                    highestScore = score;
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#70C5CE';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bird
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.closePath();

        // Pipes
        ctx.fillStyle = '#228B22';
        for (var p of pipes) {
            ctx.fillRect(p.x, 0, p.width, p.top);
            ctx.fillRect(p.x, p.bottom, p.width, canvas.height - p.bottom);
        }

        // Score
        ctx.fillStyle = '#FFF';
        ctx.font = '20px Arial';
        ctx.fillText("Score: " + score, 10, 30);

        // Death screen overlay
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FF4444';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';

            // Pick a random death message each frame — savage chaos guaranteed
            var msg = deathMessages[Math.floor(Math.random() * deathMessages.length)];
            ctx.fillText(msg, canvas.width / 2, canvas.height / 2 - 60);

            ctx.fillStyle = '#FF0000';
            ctx.fillText("☠️ SPLAT!", canvas.width / 2, canvas.height / 2 - 20);

            ctx.fillStyle = '#FFF';
            ctx.font = '20px Arial';
            ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText("Press SPACE to try again", canvas.width / 2, canvas.height / 2 + 60);

            ctx.textAlign = 'left';
        }
    }

    function gameLoop() {
        update();
        draw();
        if (gameRunning) requestAnimationFrame(gameLoop);
        else requestAnimationFrame(draw); // Keep drawing death screen to keep messages changing
    }

    function flap() {
        velocity = lift; // 💥 reset velocity for sharp jump
    }

    function endGame() {
        gameRunning = false;
        
        if (!scoreSubmitted) {
            scoreSubmitted = true;
            
            // Easter Egg: Score-based death messages
            if (score === 0) {
                showMessage('💀 Zero points! Did you even try to flap?', 'error');
            } else if (score < 3) {
                showMessage('🪶 Gravity won again! Even feathers fall slower!', 'error');
            } else if (score < 10) {
                showMessage('😅 Not terrible! You\'ve achieved basic bird competence!', 'error');
            } else if (score < 25) {
                showMessage('🎆 Good flying! You\'ve earned your wings!', 'success');
            } else {
                showMessage('🦅 Legendary bird! You\'ve conquered the skies!', 'success');
            }
            
            // Submit score to leaderboard
            submitScore('flappy', score);
        }
    }

    function handleKeyDown(e) {
        if (e.code === 'Space') {
            if (!gameRunning) {
                startGame();
            } else {
                flap();
            }
        }
    }

    function startGame() {
        resetGame();
        gameLoop();
    }

    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');

        document.addEventListener('keydown', handleKeyDown);
        startGame();
    }

    return {
        init: createGame
    };
})();

function startFlappyGame() {
    flappyGame.init('gameCanvas');
}
