
var game2048 = (function() {
    var canvas, ctx;
    var tiles = [];
    var score = 0;
    var gameSize = 4;
    var tileSize;
    var gameOver = false;
    var gameWon = false;
    var scoreSubmitted = false;

    function initTiles() {
        tiles = [];
        for (var i = 0; i < gameSize; i++) {
            var row = [];
            for (var j = 0; j < gameSize; j++) {
                row.push(0);
            }
            tiles.push(row);
        }

        addRandomTile();
        addRandomTile();
    }

    function addRandomTile() {
        var emptySpaces = [];
        for (var i = 0; i < gameSize; i++) {
            for (var j = 0; j < gameSize; j++) {
                if (tiles[i][j] === 0) {
                    emptySpaces.push({ x: i, y: j });
                }
            }
        }

        if (emptySpaces.length !== 0) {
            var chosenSpace = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
            tiles[chosenSpace.x][chosenSpace.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#BBADA0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < gameSize; i++) {
            for (var j = 0; j < gameSize; j++) {
                drawTile(i, j);
            }
        }

        ctx.font = '18px Arial';
        ctx.fillStyle = '#776E65';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 10, canvas.height - 10);

        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💀 YOU LOST 💀', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Arial';
            ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 40);
        }
    }

    function drawTile(i, j) {
        var value = tiles[i][j];
        ctx.fillStyle = value ? getBackgroundColor(value) : '#CDC1B4';
        ctx.fillRect(j * tileSize + 5, i * tileSize + 5, tileSize - 10, tileSize - 10);

        if (value) {
            ctx.font = '36px Arial';
            ctx.fillStyle = value > 4 ? '#F9F6F2' : '#776E65';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, j * tileSize + tileSize / 2, i * tileSize + tileSize / 2);
        }
    }

    function getBackgroundColor(value) {
        switch (value) {
            case 2: return '#EEE4DA';
            case 4: return '#EDE0C8';
            case 8: return '#F2B179';
            case 16: return '#F59563';
            case 32: return '#F67C5F';
            case 64: return '#F65E3B';
            case 128: return '#EDCF72';
            case 256: return '#EDCC61';
            case 512: return '#EDC850';
            case 1024: return '#EDC53F';
            case 2048: return '#EDC22E';
            default: return '#3C3A32';
        }
    }

    function moveLeft() {
        if (!canMoveLeft()) return false;

        for (var i = 0; i < gameSize; i++) {
            var row = tiles[i].filter(value => value);
            for (var j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    row[j + 1] = 0;
                    score += row[j];
                    
                    // Check for 2048 win condition
                    if (row[j] === 2048 && !gameWon) {
                        gameWon = true;
                        showMessage('🏆 2048 achieved! You\'re actually good at math!', 'success');
                    }
                    
                    // Easter Egg: Achievement milestones
                    if (row[j] === 512) {
                        showMessage('🎯 512 tile! Half way to mathematical glory!', 'success');
                    } else if (row[j] === 1024) {
                        showMessage('🧠 1024 tile! Your brain is finally working!', 'success');
                    } else if (row[j] === 4096) {
                        showMessage('🤯 4096 tile! You\'ve transcended mathematics!', 'success');
                    }
                }
            }
            tiles[i] = row.filter(value => value);
            while (tiles[i].length < gameSize) tiles[i].push(0);
        }

        return true;
    }

    function moveRight() {
        reverseRows();
        var moved = moveLeft();
        reverseRows();
        return moved;
    }

    function moveUp() {
        transpose();
        var moved = moveLeft();
        transpose();
        return moved;
    }

    function moveDown() {
        transpose();
        var moved = moveRight();
        transpose();
        return moved;
    }

    function canMoveLeft() {
        for (var i = 0; i < gameSize; i++) {
            for (var j = 0; j < gameSize - 1; j++) {
                if (tiles[i][j] === 0 && tiles[i][j + 1] !== 0 ||
                    tiles[i][j] !== 0 && tiles[i][j] === tiles[i][j + 1]) {
                    return true;
                }
            }
        }
        return false;
    }

    function reverseRows() {
        for (var i = 0; i < gameSize; i++) {
            tiles[i].reverse();
        }
    }

    function transpose() {
        var temp = [];
        for (var i = 0; i < gameSize; i++) {
            temp[i] = [];
            for (var j = 0; j < gameSize; j++) {
                temp[i][j] = tiles[j][i];
            }
        }
        tiles = temp;
    }

    function isGameOver() {
        return !(canMoveLeft() || moveRight() || moveUp() || moveDown());
    }

    function restartGame() {
        score = 0;
        gameOver = false;
        gameWon = false;
        scoreSubmitted = false;
        initTiles();
        drawBoard();
    }

    function handleKeyDown(event) {
        if (gameOver) {
            restartGame();
            return;
        }

        let moved = false;
        switch (event.key) {
            case 'ArrowLeft': moved = moveLeft(); break;
            case 'ArrowRight': moved = moveRight(); break;
            case 'ArrowUp': moved = moveUp(); break;
            case 'ArrowDown': moved = moveDown(); break;
        }

        if (moved) addRandomTile();

        drawBoard();

        if (isGameOver() && !scoreSubmitted) {
            gameOver = true;
            scoreSubmitted = true;
            
            // Easter Egg: Score-based messages
            if (score < 1000) {
                showMessage('💥 Mathematical failure! Even calculators are ashamed!', 'error');
            } else if (score < 5000) {
                showMessage('🧐 Not terrible, but still mathematically challenged!', 'error');
            } else if (score < 20000) {
                showMessage('🎉 Decent score! You might actually understand numbers!', 'success');
            } else {
                showMessage('🤓 Math genius! The numbers bow to your superiority!', 'success');
            }
            
            submitScore('2048', score);
            drawBoard();
        }
    }

    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        tileSize = canvas.width / gameSize;

        document.addEventListener('keydown', handleKeyDown);

        restartGame();
    }

    return {
        init: createGame
    };
})();

function start2048Game() {
    game2048.init('gameCanvas');
}
