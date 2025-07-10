// Fixed Tetris Game
var tetrisGame = (function() {
    var canvas, ctx;
    var arena = [];
    var player = { pos: { x: 0, y: 0 }, matrix: null };
    var dropCounter = 0;
    var dropInterval = 1000;
    var lastTime = 0;
    var score = 0;
    var cursedMode = false;
    var gameRunning = true;
    var BLOCK_SIZE = 30; // Size of each tetris block in pixels
    var ARENA_WIDTH = 12;
    var ARENA_HEIGHT = 20;
    
    const colors = [
        null, 
        '#FF0D72', // I piece - Pink
        '#0DC2FF', // L piece - Cyan
        '#0DFF72', // J piece - Green
        '#F538FF', // O piece - Purple
        '#FF8E0D', // Z piece - Orange
        '#FFE138', // S piece - Yellow
        '#3877FF'  // T piece - Blue
    ];

    function createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    function createPiece(type) {
        if (type === 'I') return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ];
        if (type === 'L') return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2]
        ];
        if (type === 'J') return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0]
        ];
        if (type === 'O') return [
            [4, 4],
            [4, 4]
        ];
        if (type === 'Z') return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0]
        ];
        if (type === 'S') return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
        if (type === 'T') return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0]
        ];
        // Easter Egg: Secret cursed piece
        if (type === 'X') return [
            [8, 8, 8],
            [8, 0, 8],
            [8, 8, 8]
        ];
    }

    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0) {
                    // Check if position is outside arena bounds
                    if (x + o.x < 0 || 
                        x + o.x >= arena[0].length || 
                        y + o.y >= arena.length) {
                        return true;
                    }
                    // Check if position is occupied
                    if (y + o.y >= 0 && arena[y + o.y][x + o.x] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function drawBlock(x, y, colorIndex) {
        const pixelX = x * BLOCK_SIZE;
        const pixelY = y * BLOCK_SIZE;
        
        if (colorIndex === 0) return; // Don't draw empty blocks
        
        // Draw block with border
        ctx.fillStyle = colors[colorIndex] || '#666';
        ctx.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Draw border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Add inner highlight for 3D effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(pixelX + 1, pixelY + 1, BLOCK_SIZE - 2, 4);
        ctx.fillRect(pixelX + 1, pixelY + 1, 4, BLOCK_SIZE - 2);
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw game border
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, ARENA_WIDTH * BLOCK_SIZE, ARENA_HEIGHT * BLOCK_SIZE);
        
        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= ARENA_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * BLOCK_SIZE, 0);
            ctx.lineTo(x * BLOCK_SIZE, ARENA_HEIGHT * BLOCK_SIZE);
            ctx.stroke();
        }
        for (let y = 0; y <= ARENA_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * BLOCK_SIZE);
            ctx.lineTo(ARENA_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
            ctx.stroke();
        }
        
        // Draw arena (placed blocks)
        arena.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(x, y, cursedMode ? 8 : value);
                }
            });
        });
        
        // Draw current piece
        if (player.matrix) {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        drawBlock(x + player.pos.x, y + player.pos.y, cursedMode ? 8 : value);
                    }
                });
            });
        }
        
        // Draw UI
        ctx.fillStyle = '#FFF';
        ctx.font = '16px Arial';
        ctx.fillText('Score: ' + score, 10, ARENA_HEIGHT * BLOCK_SIZE + 25);
        ctx.fillText('Level: ' + Math.floor(score / 1000) + 1, 150, ARENA_HEIGHT * BLOCK_SIZE + 25);
        
        // Game over screen
        if (!gameRunning) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, ARENA_WIDTH * BLOCK_SIZE, ARENA_HEIGHT * BLOCK_SIZE);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', (ARENA_WIDTH * BLOCK_SIZE) / 2, (ARENA_HEIGHT * BLOCK_SIZE) / 2 - 20);
            ctx.fillText('Score: ' + score, (ARENA_WIDTH * BLOCK_SIZE) / 2, (ARENA_HEIGHT * BLOCK_SIZE) / 2 + 10);
            ctx.fillText('Press R to restart', (ARENA_WIDTH * BLOCK_SIZE) / 2, (ARENA_HEIGHT * BLOCK_SIZE) / 2 + 40);
            ctx.textAlign = 'left';
        }
        
        // Easter Egg: Cursed mode randomly activates
        if (Math.random() < 0.001) {
            cursedMode = !cursedMode;
            if (cursedMode) {
                showMessage('💀 CURSED MODE ACTIVATED! 💀');
            }
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
        }
        dropCounter = 0;
    }

    function playerReset() {
        const pieces = 'ILJOZST'; // Standard tetris pieces
        let piece = pieces[Math.floor(Math.random() * pieces.length)];
        
        // Easter Egg: 1% chance of cursed piece
        if (Math.random() < 0.01) {
            piece = 'X';
            showMessage('🎲 CURSED PIECE SPAWNED! 🎲');
        }
        
        player.matrix = createPiece(piece);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        
        if (collide(arena, player)) {
            gameRunning = false;
            showMessage('💀 GAME OVER! Your failure is complete! 💀');
            submitScore('tetris', score);
        }
    }

    function arenaSweep() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            score += rowCount * 10;
            rowCount *= 2;
        }
    }

    function update(time = 0) {
        if (!gameRunning) {
            draw(); // Still draw the game over screen
            requestAnimationFrame(update);
            return;
        }
        
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        requestAnimationFrame(update);
    }

    function restart() {
        arena = createMatrix(12, 20);
        score = 0;
        gameRunning = true;
        cursedMode = false;
        playerReset();
    }
    
    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        ctx.scale(20, 20);
        
        document.addEventListener('keydown', event => {
            if (!gameRunning && (event.keyCode === 82 || event.key === 'r' || event.key === 'R')) {
                restart();
                return;
            }
            
            if (!gameRunning) return;
            
            if (event.keyCode === 37) { // Left
                player.pos.x--;
                if (collide(arena, player)) player.pos.x++;
            } else if (event.keyCode === 39) { // Right
                player.pos.x++;
                if (collide(arena, player)) player.pos.x--;
            } else if (event.keyCode === 40) { // Down
                playerDrop();
            } else if (event.keyCode === 38) { // Up - Rotate
                rotate(player.matrix, 1);
                if (collide(arena, player)) {
                    rotate(player.matrix, -1);
                }
            }
        });
        
        restart();
        update();
    }
    
    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    return {
        init: createGame,
        restart: restart
    };
})();

function startTetrisGame() {
    tetrisGame.init('gameCanvas');
}
