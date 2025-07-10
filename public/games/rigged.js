// Rigged Roulette Game - The House Always Wins!
var riggedGame = (function() {
    var canvas, ctx;
    var isSpinning = false;
    var currentUser = null;
    var wheel = {
        x: 200,
        y: 200,
        radius: 150,
        angle: 0,
        speed: 0
    };
    
    var numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    var colors = ['green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'];
    
    var playerBet = null;
    var betAmount = 100;
    var playerBalance = 1000;
    var gameResult = null;

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw wheel background
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(wheel.x, wheel.y, wheel.radius + 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw wheel segments
        var segmentAngle = (2 * Math.PI) / numbers.length;
        
        for (var i = 0; i < numbers.length; i++) {
            var startAngle = i * segmentAngle + wheel.angle;
            var endAngle = (i + 1) * segmentAngle + wheel.angle;
            
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(wheel.x, wheel.y);
            ctx.arc(wheel.x, wheel.y, wheel.radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            
            // Draw numbers
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            var textAngle = startAngle + segmentAngle / 2;
            var textX = wheel.x + Math.cos(textAngle) * (wheel.radius - 20);
            var textY = wheel.y + Math.sin(textAngle) * (wheel.radius - 20);
            ctx.fillText(numbers[i], textX, textY);
        }
        
        // Draw pointer
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.moveTo(wheel.x, wheel.y - wheel.radius - 15);
        ctx.lineTo(wheel.x - 10, wheel.y - wheel.radius - 35);
        ctx.lineTo(wheel.x + 10, wheel.y - wheel.radius - 35);
        ctx.closePath();
        ctx.fill();
        
        // Draw game info
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Balance: $' + playerBalance, 10, 30);
        ctx.fillText('Bet: $' + betAmount, 10, 50);
        if (playerBet) {
            ctx.fillText('Betting on: ' + playerBet, 10, 70);
        }
        
        // Draw result
        if (gameResult) {
            ctx.fillStyle = 'yellow';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(gameResult, wheel.x, wheel.y + wheel.radius + 40);
        }
    }

    function spin() {
        if (isSpinning || !playerBet) return;
        
        isSpinning = true;
        wheel.speed = 0.3 + Math.random() * 0.2;
        
        // Easter Egg: Check if user is admin
        var isAdmin = (currentUser && currentUser.toLowerCase() === 'admin');
        
        var spinAnimation = function() {
            wheel.angle += wheel.speed;
            wheel.speed *= 0.995; // Decelerate
            
            if (wheel.speed < 0.01) {
                // Determine result
                var segmentAngle = (2 * Math.PI) / numbers.length;
                var normalizedAngle = ((2 * Math.PI) - (wheel.angle % (2 * Math.PI))) % (2 * Math.PI);
                var segmentIndex = Math.floor(normalizedAngle / segmentAngle);
                var resultNumber = numbers[segmentIndex];
                
                // RIGGED: Always make player lose unless they're admin
                if (!isAdmin) {
                    // Force a losing result
                    if (playerBet === 'red' || playerBet === 'black') {
                        // If betting on color, make it land on the opposite or green
                        if (playerBet === 'red') {
                            resultNumber = Math.random() < 0.5 ? 0 : numbers.filter((n, i) => colors[i] === 'black')[0];
                        } else {
                            resultNumber = Math.random() < 0.5 ? 0 : numbers.filter((n, i) => colors[i] === 'red')[0];
                        }
                    } else if (typeof playerBet === 'number') {
                        // If betting on number, make it different
                        do {
                            resultNumber = numbers[Math.floor(Math.random() * numbers.length)];
                        } while (resultNumber === playerBet);
                    }
                    
                    gameResult = '💀 HOUSE WINS! Number: ' + resultNumber + ' - You lose $' + betAmount;
                    playerBalance -= betAmount;
                    
                    // Easter Egg: Extra insult
                    setTimeout(() => {
                        gameResult += ' 🎲 The game was rigged from the start!';
                        drawWheel();
                    }, 2000);
                    
                } else {
                    // Admin always wins
                    gameResult = '👑 ADMIN PRIVILEGE! You win $' + (betAmount * 2);
                    playerBalance += betAmount * 2;
                }
                
                isSpinning = false;
                playerBet = null;
                
                // Reset game if out of money
                if (playerBalance <= 0) {
                    setTimeout(() => {
                        gameResult = '💸 BANKRUPT! Game reset. The house always wins!';
                        playerBalance = 1000;
                        drawWheel();
                    }, 3000);
                }
            } else {
                requestAnimationFrame(spinAnimation);
            }
            
            drawWheel();
        };
        
        spinAnimation();
    }

    function placeBet(bet) {
        if (isSpinning || playerBalance < betAmount) return;
        
        playerBet = bet;
        gameResult = null;
        drawWheel();
    }

    function createGame(canvasId) {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        // Get current user (this would be passed from the main app)
        currentUser = getCurrentUser();
        
        // Create betting buttons
        var container = canvas.parentElement;
        var buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '10px';
        
        // Color bets
        var redBtn = document.createElement('button');
        redBtn.textContent = 'Bet Red';
        redBtn.className = 'btn';
        redBtn.onclick = () => placeBet('red');
        buttonContainer.appendChild(redBtn);
        
        var blackBtn = document.createElement('button');
        blackBtn.textContent = 'Bet Black';
        blackBtn.className = 'btn';
        blackBtn.onclick = () => placeBet('black');
        buttonContainer.appendChild(blackBtn);
        
        // Number bet
        var numberBtn = document.createElement('button');
        numberBtn.textContent = 'Bet 7 (Lucky!)';
        numberBtn.className = 'btn';
        numberBtn.onclick = () => placeBet(7);
        buttonContainer.appendChild(numberBtn);
        
        // Spin button
        var spinBtn = document.createElement('button');
        spinBtn.textContent = '🎰 SPIN!';
        spinBtn.className = 'btn danger';
        spinBtn.onclick = spin;
        buttonContainer.appendChild(spinBtn);
        
        container.appendChild(buttonContainer);
        
        drawWheel();
    }

    // Mock function to get current user
    function getCurrentUser() {
        // This would integrate with your actual user system
        return localStorage.getItem('currentUser') || 'anonymous';
    }

    return {
        init: createGame
    };
})();

function startRiggedGame() {
    riggedGame.init('gameCanvas');
}
