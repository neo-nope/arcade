// TETRIS ON STEROIDS 💀 - The Most Cursed Block-Stacking Experience
var tetrisGame = (function() {
    var canvas, ctx;
    var arena = [];
    var player = { pos: { x: 0, y: 0 }, matrix: null, color: 1 };
    var dropCounter = 0;
    var dropInterval = 1000;
    var lastTime = 0;
    var score = 0;
    var lines = 0;
    var canMove = true;
    var level = 1;
    var gameRunning = true;
    var BLOCK_SIZE = 20; // Smaller blocks for more intense gameplay
    var ARENA_WIDTH = 12;
    var ARENA_HEIGHT = 22; // Taller arena for more chaos
    var nextPiece = null;
    var heldPiece = null;
    var canHold = true;
    
    // STEROIDS FEATURES 💪
    var cursedMode = false;
    var ghostMode = false;
    var explosiveMode = false;
    var rainbowMode = false;
    var speedBoost = 1;
    var shakeIntensity = 10;
    var particles = [];
    var powerUps = [];
    var combo = 0;
    var maxCombo = 0;
    var pieceCounter = 0;
    
    // 🌀 CHAOS EVENTS SYSTEM
    var chaosEventActive = false;
    var chaosEventType = null;
    var chaosEventTimer = 0;
    var chaosEventDuration = 0;
    var lastChaosEvent = 0;
    var controlsFlipped = false;
    var blockFogActive = false;
    var lowGravityActive = false;
    var fastForwardActive = false;
    var ghostModeDisabled = false;
    
    // 🚧 RANDOM OBSTACLES SYSTEM
    var obstacles = [];
    var obstacleLifetime = 5000; // 5 seconds
    
    // 💣 SPECIAL BLOCKS SYSTEM
    var currentSpecialBlock = null;
    var glitchRotateTimer = 0;
    var glassBlockPhasing = false;
    
    // Enhanced colors with more vibrant palette
    const colors = [
        null, 
        '#FF1744', // I piece - Bright Red
        '#00E5FF', // L piece - Electric Cyan  
        '#76FF03', // J piece - Lime Green
        '#E040FB', // O piece - Hot Pink
        '#FF9100', // Z piece - Vivid Orange
        '#FFEA00', // S piece - Electric Yellow
        '#3F51B5', // T piece - Deep Blue
        '#9C27B0', // Cursed piece - Purple
        '#FF5722', // Explosive piece - Red Orange
        '#FFB300', // Glitch block - Amber
        '#E1F5FE', // Glass block - Transparent Blue
        '#FF6EC7', // Color bomb - Hot Pink
        '#808080', // Obstacle block - Gray
        '#000000'  // Movement block - Nigger
    ];
    
    // 🌀 CHAOS EVENTS DEFINITIONS
    const CHAOS_EVENTS = {
        NO_MOVE: {
            name: 'blocked movement',
            icon: '❌',
            duration: 3000, // 3 seconds (why am i commenting this?)
            message: 'YOU CANNOT MOVE! The machine overheated'
        },
        LOW_GRAVITY: {
            name: 'Low Gravity',
            icon: '🌌',
            duration: 8000, // 8 seconds
            message: '🌌 LOW GRAVITY! Pieces float like feathers!'
        },
        FAST_FORWARD: {
            name: 'Fast Forward',
            icon: '⏩',
            duration: 6000, // 6 seconds
            message: '⏩ FAST FORWARD! Pieces falling at lightspeed!'
        },
        FLIPPED_CONTROLS: {
            name: 'Flipped Controls',
            icon: '🔄',
            duration: 10000, // 10 seconds
            message: '🔄 FLIPPED CONTROLS! Left is right, right is left!'
        },
        BLOCK_FOG: {
            name: 'Block Fog',
            icon: '🌫️',
            duration: 12000, // 12 seconds
            message: '🌫️ BLOCK FOG! Vision obscured!'
        },
        GHOST_DISABLED: {
            name: 'Ghost Disabled',
            icon: '😵',
            duration: 10000, // 10 seconds
            message: '😵 GHOST DISABLED! No preview for you!'
        }
    };
    
    // 💣 SPECIAL BLOCK TYPES
    const SPECIAL_BLOCKS = {
        GLITCH: {
            name: 'Glitch Block',
            icon: '🌀',
            color: 10,
            chance: 0.4,
            message: '🌀 GLITCH BLOCK! It has a mind of its own!'
        },
        GLASS: {
            name: 'Glass Block',
            icon: '🔮',
            color: 11,
            chance: 0.8,
            message: '🔮 GLASS BLOCK! Phases through obstacles!'
        },
        COLOR_BOMB: {
            name: 'Color Bomb',
            icon: '💣',
            color: 12,
            chance: 0.3,
            message: '💣 COLOR BOMB! Clears matching colors!'
        }
    };
    
    // Rainbow colors for rainbow mode
    const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    
    // Power-up types
    const POWERUP_TYPES = {
        CLEAR_LINES: { color: '#FFD700', icon: '💥', chance: 0.01 },
        SLOW_TIME: { color: '#00FFFF', icon: '⏰', chance: 0.08 },
        RAINBOW: { color: '#FF69B4', icon: '🌈', chance: 0.1 },
        GHOST: { color: '#FFFFFF', icon: '👻', chance: 0.01 },
        EXPLOSIVE: { color: '#FF4500', icon: '💣', chance: 0.05 }
    };

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
        // STEROIDS PIECES 💀
        if (type === 'X') return [ // Cursed Cross
            [8, 8, 8],
            [8, 0, 8],
            [8, 8, 8]
        ];
        if (type === 'BOMB') return [ // Explosive piece
            [9, 9],
            [9, 9]
        ];
        if (type === 'MEGA_I') return [ // Super long piece
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0]
        ];
        if (type === 'TINY') return [ // Tiny single block
            [1]
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
                        // Glass blocks can pass through obstacles
                        if (glassBlockPhasing && arena[y + o.y][x + o.x] === 13) {
                            continue; // Glass blocks pass through obstacles
                        }
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

    function drawBlock(x, y, colorIndex, glowEffect = false) {
        const pixelX = x * BLOCK_SIZE;
        const pixelY = y * BLOCK_SIZE;
        
        if (colorIndex === 0) return; // Don't draw empty blocks
        
        let blockColor = colors[colorIndex] || '#666';
        
        // Rainbow mode override
        if (rainbowMode) {
            const time = Date.now() * 0.01;
            const rainbowIndex = Math.floor((x + y + time) % rainbowColors.length);
            blockColor = rainbowColors[rainbowIndex];
        }
        
        // Glow effect for special pieces
        if (glowEffect || colorIndex >= 8) {
            ctx.shadowColor = blockColor;
            ctx.shadowBlur = 15;
        }
        
        // Draw block with enhanced gradient
        const gradient = ctx.createLinearGradient(pixelX, pixelY, pixelX + BLOCK_SIZE, pixelY + BLOCK_SIZE);
        gradient.addColorStop(0, lightenColor(blockColor, 20));
        gradient.addColorStop(1, darkenColor(blockColor, 20));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Enhanced border
        ctx.strokeStyle = darkenColor(blockColor, 40);
        ctx.lineWidth = 2;
        ctx.strokeRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Glossy highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${glowEffect ? 0.5 : 0.3})`;
        ctx.fillRect(pixelX + 2, pixelY + 2, BLOCK_SIZE - 4, 3);
        ctx.fillRect(pixelX + 2, pixelY + 2, 3, BLOCK_SIZE - 4);
        
        // Special indicator for obstacles
        if (colorIndex === 13) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🚧', pixelX + BLOCK_SIZE/2, pixelY + BLOCK_SIZE/2 + 5);
            ctx.textAlign = 'left';
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }

    function draw() {
        // Apply screen shake if active
        if (shakeIntensity > 0) {
            ctx.save();
            ctx.translate(
                (Math.random() - 0.5) * shakeIntensity,
                (Math.random() - 0.5) * shakeIntensity
            );
            shakeIntensity *= 0.9; // Decay shake
        }
        
        // Clear canvas with enhanced background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, cursedMode ? '#2D1B69' : '#000814');
        bgGradient.addColorStop(1, cursedMode ? '#000000' : '#001D3D');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw enhanced game border with glow
        ctx.shadowColor = rainbowMode ? '#FF00FF' : '#00FFFF';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = rainbowMode ? '#FF00FF' : '#FFD60A';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, ARENA_WIDTH * BLOCK_SIZE, ARENA_HEIGHT * BLOCK_SIZE);
        ctx.shadowBlur = 0;
        
        // Draw enhanced grid with animated lines
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(Date.now() * 0.002) * 0.05})`;
        ctx.lineWidth = 1;
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
        
        // Draw ghost piece preview
        if (ghostMode && player.matrix) {
            const ghostPlayer = {
                pos: { x: player.pos.x, y: player.pos.y },
                matrix: player.matrix
            };
            
            // Drop ghost piece to bottom
            while (!collide(arena, ghostPlayer)) {
                ghostPlayer.pos.y++;
            }
            ghostPlayer.pos.y--;
            
            // Draw ghost piece
            ctx.globalAlpha = 0.3;
            ghostPlayer.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        drawBlock(x + ghostPlayer.pos.x, y + ghostPlayer.pos.y, value, false);
                    }
                });
            });
            ctx.globalAlpha = 1.0;
        }
        
        // Draw arena (placed blocks) with enhanced effects
        arena.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const isSpecial = value >= 8;
                    let blockColor = cursedMode ? 8 : value;
                    
                    // Special pulsing effect for obstacles
                    if (value === 13) {
                        const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
                        ctx.shadowColor = '#808080';
                        ctx.shadowBlur = 10 + pulse * 5;
                        drawBlock(x, y, blockColor, true);
                        ctx.shadowBlur = 0;
                    } else {
                        drawBlock(x, y, blockColor, isSpecial);
                    }
                }
            });
        });
        
        // Draw current piece with special block effects
        if (player.matrix) {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        let colorToUse = cursedMode ? 8 : value;
                        let isSpecial = value >= 8;
                        
                        // Apply special block coloring
                        if (currentSpecialBlock) {
                            colorToUse = currentSpecialBlock.color;
                            isSpecial = true;
                            
                            // Add extra glow for special blocks
                            if (currentSpecialBlock.type === 'GLITCH') {
                                // Pulsing effect for glitch blocks
                                const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
                                ctx.shadowBlur = 20 + pulse * 10;
                            }
                        }
                        
                        drawBlock(x + player.pos.x, y + player.pos.y, colorToUse, isSpecial);
                        
                        // Reset shadow
                        ctx.shadowBlur = 0;
                    }
                });
            });
        }
        
        // Draw particles
        drawParticles();
        
        // Draw power-ups
        drawPowerUps();
        
        // Draw enhanced UI
        drawEnhancedUI();
        
        // Draw next piece preview
        drawNextPiece();
        
        // Game over screen with enhanced effects
        if (!gameRunning) {
            drawGameOverScreen();
        }
        
        // Restore canvas if shake was applied
        if (shakeIntensity > 0) {
            ctx.restore();
        }
        
        // Random STEROIDS events! 💪
        triggerRandomEvents();
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

    // ENHANCED DRAWING FUNCTIONS 🎨
    function drawParticles() {
        particles.forEach((particle, index) => {
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.5; // Gravity
            particle.life--;
            
            if (particle.life <= 0) {
                particles.splice(index, 1);
            }
        });
    }
    
    function createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x * BLOCK_SIZE + Math.random() * BLOCK_SIZE,
                y: y * BLOCK_SIZE + Math.random() * BLOCK_SIZE,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                color: color,
                size: Math.random() * 4 + 2,
                life: 30 + Math.random() * 20
            });
        }
    }
    
    function drawPowerUps() {
        powerUps.forEach((powerUp, index) => {
            const x = powerUp.x * BLOCK_SIZE;
            const y = powerUp.y * BLOCK_SIZE;
            
            // Pulsing glow effect
            const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
            ctx.shadowColor = powerUp.color;
            ctx.shadowBlur = 15 + pulse * 10;
            
            ctx.fillStyle = powerUp.color;
            ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            
            // Draw icon
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#FFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(powerUp.icon, x + BLOCK_SIZE/2, y + BLOCK_SIZE/2 + 6);
            ctx.textAlign = 'left';
            
            powerUp.life--;
            if (powerUp.life <= 0) {
                powerUps.splice(index, 1);
            }
        });
    }
    
    // 🚧 OBSTACLE MANAGEMENT FUNCTIONS
    function spawnObstacle() {
        const shapes = [
            [[1]], // Single block
            [[1, 1]], // Two blocks horizontal
            [[1], [1]], // Two blocks vertical
            [[1, 1, 1]], // Three blocks horizontal
        ];
        
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Try to find an empty spot
        let attempts = 0;
        let x, y;
        let canSpawn = false;
        
        while (attempts < 10 && !canSpawn) {
            x = Math.floor(Math.random() * (ARENA_WIDTH - shape[0].length));
            y = Math.floor(Math.random() * (ARENA_HEIGHT - shape.length));
            
            canSpawn = true;
            for (let dy = 0; dy < shape.length; dy++) {
                for (let dx = 0; dx < shape[dy].length; dx++) {
                    if (shape[dy][dx] && arena[y + dy] && arena[y + dy][x + dx] !== 0) {
                        canSpawn = false;
                        break;
                    }
                }
                if (!canSpawn) break;
            }
            attempts++;
        }
        
        if (canSpawn) {
            obstacles.push({
                x: x,
                y: y,
                shape: shape,
                spawnTime: Date.now(),
                lifetime: obstacleLifetime
            });
            
            // Place obstacle blocks in arena
            for (let dy = 0; dy < shape.length; dy++) {
                for (let dx = 0; dx < shape[dy].length; dx++) {
                    if (shape[dy][dx]) {
                        arena[y + dy][x + dx] = 13; // Obstacle color index
                    }
                }
            }
        
            
            // Add particles for dramatic effect
            for (let dy = 0; dy < shape.length; dy++) {
                for (let dx = 0; dx < shape[dy].length; dx++) {
                    if (shape[dy][dx]) {
                        createParticles(x + dx, y + dy, colors[13], 3);
                    }
                }
            }
        }
    }
    
    function removeObstacle(obstacle) {
        // Remove obstacle blocks from arena
        for (let dy = 0; dy < obstacle.shape.length; dy++) {
            for (let dx = 0; dx < obstacle.shape[dy].length; dx++) {
                if (obstacle.shape[dy][dx]) {
                    arena[obstacle.y + dy][obstacle.x + dx] = 0;
                }
            }
        }
        
        // Add disappearing particles
        for (let dy = 0; dy < obstacle.shape.length; dy++) {
            for (let dx = 0; dx < obstacle.shape[dy].length; dx++) {
                if (obstacle.shape[dy][dx]) {
                    createParticles(obstacle.x + dx, obstacle.y + dy, colors[13], 5);
                }
            }
        }
    }
    
    function updateObstacles() {
        // Remove expired obstacles
        obstacles = obstacles.filter(obstacle => {
            const age = Date.now() - obstacle.spawnTime;
            if (age >= obstacle.lifetime) {
                removeObstacle(obstacle);
                return false;
            }
            return true;
        });
    }
    
    function drawEnhancedUI() {
        const uiY = ARENA_HEIGHT * BLOCK_SIZE + 10;
        
        // Enhanced score display
        ctx.fillStyle = '#FFD60A';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`SCORE: ${score.toLocaleString()}`, 10, uiY);
        
        // Level with glow
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#00FFFF';
        ctx.fillText(`LEVEL: ${level}`, 180, uiY);
        ctx.shadowBlur = 0;
        
        // Lines cleared
        ctx.fillStyle = '#76FF03';
        ctx.fillText(`LINES: ${lines}`, 300, uiY);
        
        // Combo counter
        if (combo > 1) {
            ctx.fillStyle = '#FF1744';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`COMBO x${combo}!`, 10, uiY + 25);
        }
        
        // Speed indicator
        const speedText = speedBoost > 1 ? `SPEED x${speedBoost.toFixed(1)}!` : '';
        if (speedText) {
            ctx.fillStyle = '#FF9100';
            ctx.fillText(speedText, 180, uiY + 25);
        }
        
        // Mode indicators
        let modeY = uiY + 45;
        if (cursedMode) {
            ctx.fillStyle = '#9C27B0';
            ctx.fillText('💀 CURSED MODE', 10, modeY);
            modeY += 20;
        }
        if (rainbowMode) {
            ctx.fillStyle = '#FF69B4';
            ctx.fillText('🌈 RAINBOW MODE', 10, modeY);
            modeY += 20;
        }
        if (ghostMode) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('👻 GHOST MODE', 10, modeY);
            modeY += 20;
        }
        if (explosiveMode) {
            ctx.fillStyle = '#FF5722';
            ctx.fillText('💣 EXPLOSIVE MODE', 10, modeY);
        }
        
        // Show obstacle count
        if (obstacles.length > 0) {
            ctx.fillStyle = '#808080';
            ctx.fillText(`🚧 Obstacles: ${obstacles.length}`, 10, modeY + 20);
        }
    }
    
    function drawNextPiece() {
        if (!nextPiece) return;
        
        const previewX = ARENA_WIDTH * BLOCK_SIZE + 20;
        const previewY = 20;
        
        // Preview box background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(previewX, previewY, 80, 80);
        
        ctx.strokeStyle = '#FFD60A';
        ctx.lineWidth = 2;
        ctx.strokeRect(previewX, previewY, 80, 80);
        
        // Draw "NEXT" label
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.fillText('NEXT:', previewX, previewY - 5);
        
        // Draw next piece
        if (nextPiece.matrix) {
            const offsetX = previewX + 20;
            const offsetY = previewY + 20;
            
            nextPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        const blockX = offsetX + x * 15;
                        const blockY = offsetY + y * 15;
                        
                        ctx.fillStyle = colors[value] || '#666';
                        ctx.fillRect(blockX, blockY, 12, 12);
                        
                        ctx.strokeStyle = '#FFF';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(blockX, blockY, 12, 12);
                    }
                });
            });
        }
    }
    
    function drawGameOverScreen() {
        // Animated background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, ARENA_WIDTH * BLOCK_SIZE, ARENA_HEIGHT * BLOCK_SIZE);
        
        const centerX = (ARENA_WIDTH * BLOCK_SIZE) / 2;
        const centerY = (ARENA_HEIGHT * BLOCK_SIZE) / 2;
        
        // Pulsing title
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgba(255, 23, 68, ${pulse})`;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', centerX, centerY - 60);
        
        // Score with glow
        ctx.shadowColor = '#FFD60A';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FFD60A';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`FINAL SCORE: ${score.toLocaleString()}`, centerX, centerY - 20);
        
        // Stats
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFF';
        ctx.font = '18px Arial';
        ctx.fillText(`Lines Cleared: ${lines}`, centerX, centerY + 10);
        ctx.fillText(`Max Combo: ${maxCombo}`, centerX, centerY + 35);
        ctx.fillText(`Level Reached: ${level}`, centerX, centerY + 60);
        
        // Restart instruction
        ctx.fillStyle = '#00FFFF';
        ctx.font = '16px Arial';
        ctx.fillText('Press R to restart and face your doom again!', centerX, centerY + 100);
        
        ctx.textAlign = 'left';
    }
    
    // 💣 SPECIAL BLOCKS SYSTEM FUNCTIONS
    function shouldSpawnSpecialBlock() {
        pieceCounter++;
        
        // TESTING: Much higher chance - every 2-3 pieces
        if (pieceCounter >= 2 && Math.random() < 0.1) {
            pieceCounter = 0; // Reset counter
            console.log('shouldSpawnSpecialBlock: YES');
            return true;
        }
        return false;
    }
    
    function generateSpecialBlock() {
        const blockTypes = Object.keys(SPECIAL_BLOCKS);
        let selectedType = null;
        
        // Weighted random selection based on chances
        const roll = Math.random();
        let cumulativeChance = 0;
        
        for (const type of blockTypes) {
            cumulativeChance += SPECIAL_BLOCKS[type].chance;
            if (roll <= cumulativeChance) {
                selectedType = type;
                break;
            }
        }
        
        if (!selectedType) selectedType = blockTypes[0]; // Fallback
        
        const specialBlock = SPECIAL_BLOCKS[selectedType];
        currentSpecialBlock = {
            type: selectedType,
            color: specialBlock.color,
            originalColor: null
        };
        
        
        // Apply special properties
        switch(selectedType) {
            case 'GLITCH':
                glitchRotateTimer = 1000; // Rotate every 1 second
                break;
            case 'GLASS':
                glassBlockPhasing = true;
                break;
            case 'COLOR_BOMB':
                // Color bomb effects applied on placement
                break;
            case 'CHONK':
                    if (!collide(arena, player)) {
                        speedBoost = speedBoost + 10;
                    }
                    else{
                        speedBoost = speedBoost -10;
                    }
                    break;
                    
        }
        
        console.log('Generated special block:', currentSpecialBlock);
        return selectedType;
    }
    
    function updateSpecialBlock(deltaTime) {
        if (!currentSpecialBlock) return;
        
        switch(currentSpecialBlock.type) {
            case 'GLITCH':
                glitchRotateTimer -= deltaTime;
                if (glitchRotateTimer <= 0 && player.matrix) {
                    rotate(player.matrix, 1);
                    if (collide(arena, player)) {
                        rotate(player.matrix, -1); // Undo if collision
                    }
                    glitchRotateTimer = 1000; // Reset timer
                    shakeIntensity = 3;
                    
                    // Glitch particles
                    createParticles(
                        player.pos.x + player.matrix[0].length/2,
                        player.pos.y + player.matrix.length/2,
                        colors[currentSpecialBlock.color],
                        3
                    );
                }
                break;
        }
    }
    
    function activateColorBomb(bombColor) {
        let blocksCleared = 0;
        
        // Clear all blocks matching the bomb color
        for (let y = 0; y < arena.length; y++) {
            for (let x = 0; x < arena[y].length; x++) {
                if (arena[y][x] === bombColor) {
                    createParticles(x, y, colors[bombColor], 5);
                    arena[y][x] = 0;
                    blocksCleared++;
                }
            }
        }
        
        if (blocksCleared > 0) {
            score += blocksCleared * 50;
            shakeIntensity = 15;
            showMessage(`💥 COLOR BOMB! Cleared ${blocksCleared} blocks!`);
            
            // Epic explosion effect
            for (let i = 0; i < blocksCleared * 2; i++) {
                createParticles(
                    Math.random() * ARENA_WIDTH,
                    Math.random() * ARENA_HEIGHT,
                    colors[bombColor],
                    1
                );
            }
        }
    }
    
    function triggerRandomEvents() {
        // STEROIDS random events for maximum chaos!
        if (Math.random() < 0.002) { // More frequent than original
            const events = [
                () => {
                    rainbowMode = !rainbowMode;
                    showMessage(rainbowMode ? '🌈 RAINBOW MODE ACTIVATED!' : '🌈 Rainbow mode deactivated');
                },
                () => {
                    ghostMode = !ghostMode;
                    showMessage(ghostMode ? '👻 GHOST MODE ACTIVATED!' : '👻 Ghost mode deactivated');
                },
                () => {
                    speedBoost = speedBoost === 1 ? 2 : 1;
                    dropInterval = speedBoost === 1 ? 1000 : 500;
                    showMessage(speedBoost > 1 ? '💪 SPEED BOOST!' : '🐢 Back to normal speed');
                },
                () => {
                    shakeIntensity = 20;
                    showMessage('🌋 EARTHQUAKE! The blocks are shaking!');
                },
                () => {
                    cursedMode = !cursedMode;
                    showMessage(cursedMode ? '💀 CURSED MODE ACTIVATED!' : '💀 Curse lifted... for now');
                },
                () => {
                    canMove = false;
                    
                    showMessage(canMove ? 'Machine input fixed' : 'MACHINE INPUT OVERHEATED', 'error');

                     setTimeout(() => {
                        canMove = true;
                    }, 3000); 
                }
                
            ];
            
            const event = events[Math.floor(Math.random() * events.length)];
            event();
        }
        
        // Spawn random power-ups
        if (Math.random() < 0.005 && powerUps.length < 3) {
            spawnPowerUp();
        }
        
        // Spawn random obstacles
        if (Math.random() < 0.003 && obstacles.length < 2) {
            spawnObstacle();
        }
    }
    
    function spawnPowerUp() {
        const types = Object.keys(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        const powerUpData = POWERUP_TYPES[type];
        
        let x, y;
        do {
            x = Math.floor(Math.random() * ARENA_WIDTH);
            y = Math.floor(Math.random() * ARENA_HEIGHT);
        } while (arena[y] && arena[y][x] !== 0);
        
        powerUps.push({
            x: x,
            y: y,
            type: type,
            color: powerUpData.color,
            icon: powerUpData.icon,
            life: 500 // 8-10 seconds at 60fps
        });
        
        showMessage(`🎆 Power-up spawned: ${powerUpData.icon}!`);
    }
    
    function checkPowerUpCollision() {
        if (!player.matrix) return;
        
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const blockX = x + player.pos.x;
                    const blockY = y + player.pos.y;
                    
                    powerUps.forEach((powerUp, index) => {
                        if (powerUp.x === blockX && powerUp.y === blockY) {
                            activatePowerUp(powerUp.type);
                            powerUps.splice(index, 1);
                        }
                    });
                }
            });
        });
    }
    
    function activatePowerUp(type) {
        switch(type) {
            case 'CLEAR_LINES':
                // Clear bottom 3 lines
                for (let i = 0; i < 3; i++) {
                    arena.pop();
                    arena.unshift(new Array(ARENA_WIDTH).fill(0));
                }
                lines += 3;
                score += 300;
                createParticles(ARENA_WIDTH/2, ARENA_HEIGHT-1, '#FFD700', 20);
                break;
                
            case 'SLOW_TIME':
                dropInterval = 2000; // Slow down
                setTimeout(() => {
                    dropInterval = Math.max(100, 1000 - level * 50);
                }, 5000);
                break;
                
            case 'RAINBOW':
                rainbowMode = true;
                setTimeout(() => { rainbowMode = false; }, 10000);
                break;
                
            case 'GHOST':
                ghostMode = true;
                setTimeout(() => { ghostMode = false; }, 8000);
                break;
                
            case 'EXPLOSIVE':
                explosiveMode = true;
                setTimeout(() => { explosiveMode = false; }, 60000);
                break;
        }
    }
    
    function playerReset() {
        const standardPieces = 'ILJOZST';
        const steroidsOnlyPieces = ['MEGA_I', 'TINY', 'BOMB'];
        let piece;
        
        // 💣 Check for special block generation first (INCREASED CHANCE FOR TESTING)
        if (shouldSpawnSpecialBlock() || Math.random() < 0.5) { // 50% chance for testing
            generateSpecialBlock();
            piece = standardPieces[Math.floor(Math.random() * standardPieces.length)];
            console.log('Special block active:', currentSpecialBlock);
        } else {
            // Clear any existing special block state
            currentSpecialBlock = null;
            glassBlockPhasing = false;
            glitchRotateTimer = 0;
            
            // Higher chance of special pieces on higher levels
            const specialChance = Math.min(0.3, level * 0.02);
            
            if (Math.random() < specialChance) {
                if (Math.random() < 0.05) {
                    piece = 'X'; // Cursed cross
                } else {
                    piece = steroidsOnlyPieces[Math.floor(Math.random() * steroidsOnlyPieces.length)];
                }
            } else {
                piece = standardPieces[Math.floor(Math.random() * standardPieces.length)];
            }
        }
        
        // Set up next piece preview
        if (!nextPiece) {
            const nextPieceType = standardPieces[Math.floor(Math.random() * standardPieces.length)];
            nextPiece = {
                type: nextPieceType,
                matrix: createPiece(nextPieceType)
            };
        }
        
        player.matrix = createPiece(piece);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        player.color = Math.floor(Math.random() * 7) + 1;
        
        canHold = true;
        
        if (collide(arena, player)) {
            gameRunning = false;
            showMessage('💀 GAME OVER! Your blocks have consumed you!');
            
            // Epic particle explosion
            for (let i = 0; i < 50; i++) {
                createParticles(
                    Math.random() * ARENA_WIDTH,
                    Math.random() * ARENA_HEIGHT,
                    colors[Math.floor(Math.random() * colors.length)],
                    1
                );
            }
            
            submitScore('tetris', score);
        }
        
        // Update next piece
        const nextType = standardPieces[Math.floor(Math.random() * standardPieces.length)];
        nextPiece = {
            type: nextType,
            matrix: createPiece(nextType)
        };
    }

    function arenaSweep() {
        let clearedLines = 0;
        let linesCleared = [];
        
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            
            // Line is complete - add particles before clearing
            for (let x = 0; x < ARENA_WIDTH; x++) {
                createParticles(x, y, colors[arena[y][x]], 5);
            }
            
            linesCleared.push(y);
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;
            clearedLines++;
        }
        
        if (clearedLines > 0) {
            // Enhanced scoring system
            const baseScore = clearedLines * 100;
            let multiplier = 1;
            
            if (clearedLines === 4) {
                multiplier = 3; // Tetris bonus
                showMessage('🎯 TETRIS! Epic clear!');
                shakeIntensity = 15;
            } else if (clearedLines === 3) {
                multiplier = 2;
                showMessage('🔥 TRIPLE! Nice work!');
            } else if (clearedLines === 2) {
                multiplier = 1.5;
                showMessage('💪 DOUBLE! Keep going!');
            }
            
            // Combo system
            if (clearedLines > 0) {
                combo++;
                if (combo > maxCombo) maxCombo = combo;
                multiplier *= (1 + combo * 0.1); // Combo bonus
                
                if (combo >= 5) {
                    showMessage(`🔥 INSANE COMBO x${combo}!`);
                }
            }
            
            const finalScore = Math.floor(baseScore * multiplier * level);
            score += finalScore;
            lines += clearedLines;
            
            // Level progression
            const newLevel = Math.floor(lines / 10) + 1;
            if (newLevel > level) {
                level = newLevel;
                dropInterval = Math.max(100, 1000 - level * 50);
                showMessage(`📈 LEVEL UP! Level ${level}`);
                
                // Random event on level up
                if (Math.random() < 0.3) {
                    triggerRandomEvents();
                }
            }
            
            // Explosive mode effect
            if (explosiveMode && clearedLines >= 2) {
                // Clear additional random blocks
                for (let i = 0; i < clearedLines * 3; i++) {
                    const x = Math.floor(Math.random() * ARENA_WIDTH);
                    const y = Math.floor(Math.random() * ARENA_HEIGHT);
                    if (arena[y] && arena[y][x] !== 0) {
                        createParticles(x, y, colors[arena[y][x]], 3);
                        arena[y][x] = 0;
                    }
                }
            }
        } else {
            // Reset combo if no lines cleared
            combo = 0;
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
        
        // Apply speed boost
        const adjustedInterval = dropInterval / speedBoost;
        
        dropCounter += deltaTime;
        if (dropCounter > adjustedInterval) {
            playerDrop();
        }
        
        // Update special blocks
        updateSpecialBlock(deltaTime);
        
        // Update obstacles
        updateObstacles();
        
        // Check power-up collisions
        checkPowerUpCollision();
        
        draw();
        requestAnimationFrame(update);
    }

    function restart() {
        // Reset all game state
        arena = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);
        score = 0;
        lines = 0;
        level = 1;
        combo = 0;
        maxCombo = 0;
        gameRunning = true;
        
        // Reset STEROIDS features
        cursedMode = false;
        ghostMode = false;
        explosiveMode = false;
        rainbowMode = false;
        speedBoost = 1;
        shakeIntensity = 0;
        
        // Clear arrays
        particles.length = 0;
        powerUps.length = 0;
        obstacles.length = 0; // Clear obstacles
        
        // Reset pieces
        nextPiece = null;
        heldPiece = null;
        canHold = true;
        
        dropInterval = 1000;
        playerReset();
    }
    
    function holdPiece() {
        if (!canHold || !player.matrix) return;
        
        if (heldPiece) {
            // Swap current piece with held piece
            const temp = {
                type: 'temp',
                matrix: player.matrix
            };
            player.matrix = heldPiece.matrix;
            heldPiece = temp;
        } else {
            // Store current piece
            heldPiece = {
                type: 'held',
                matrix: player.matrix
            };
            // Get next piece
            const standardPieces = 'ILJOZST';
            const pieceType = standardPieces[Math.floor(Math.random() * standardPieces.length)];
            player.matrix = createPiece(pieceType);
        }
        
        // Reset position
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        
        canHold = false;
    }
    
    function hardDrop() {
        while (!collide(arena, player)) {
            player.pos.y++;
            score += 2; // Bonus points for hard drop
        }
        player.pos.y--;
        
        // Create dramatic particles
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    createParticles(x + player.pos.x, y + player.pos.y, colors[value], 8);
                }
            });
        });
        
        merge(arena, player);
        playerReset();
        arenaSweep();
        
        shakeIntensity = 80;
    }
    
    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        // Adjust canvas size for enhanced features
        canvas.width = (ARENA_WIDTH * BLOCK_SIZE) + 200; // Extra space for UI
        canvas.height = (ARENA_HEIGHT * BLOCK_SIZE) + 200; // Extra space for UI
        
        document.addEventListener('keydown', event => {
            if (!gameRunning && (event.keyCode === 82 || event.key === 'r' || event.key === 'R')) {
                restart();
                return;
            }
            if (!gameRunning) return;
            if(canMove) {
                switch(event.keyCode) {
                case 37: // Left Arrow
                    player.pos.x--;
                    if (collide(arena, player)) player.pos.x++;
                    break;
                    
                case 39: // Right Arrow
                    player.pos.x++;
                    if (collide(arena, player)) player.pos.x--;
                    break;
                    
                case 40: // Down Arrow - Soft drop
                    playerDrop();
                    score += 1;
                    break;
                    
                case 38: // Up Arrow - Rotate clockwise
                    rotate(player.matrix, 1);
                    if (collide(arena, player)) {
                        rotate(player.matrix, -1);
                    }
                    break;
                    
                case 90: // Z key - Rotate counter-clockwise
                    rotate(player.matrix, -1);
                    if (collide(arena, player)) {
                        rotate(player.matrix, 1);
                    }
                    break;
                    case 32: // Z key - Rotate counter-clockwise
                    hardDrop();
                    break;
                    
                
            }
            }
            else{}
            
        });
        
        restart();
        update();
        
        showMessage('💪 TETRIS ON STEROIDS ACTIVATED! 💪');
        showMessage('🎮 Controls: Arrows=Move, Space: hard drop');
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

// Initialize the enhanced Tetris game
function startTetrisGame() {
    tetrisGame.init('gameCanvas');
}
