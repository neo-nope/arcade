// Main BROWSERCADE Script with Easter Eggs
const socket = io();

// Global variables
let currentUser = null;
let currentGame = null;
let easterEggCounter = 0;
let konamiCode = [];
let konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

// Cursed sound effects (base64 encoded beeps)
const cursedSounds = {
    death: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFA==',
    fail: 'data:audio/wav;base64,UklGRlYGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiR1/LNeSsFA=='
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Check session status from server
    try {
        const response = await fetch('/api/session');
        const sessionData = await response.json();
        
        if (sessionData.loggedIn) {
            currentUser = sessionData.username;
            localStorage.setItem('currentUser', currentUser);
            showUserPanel();
        } else {
            currentUser = null;
            localStorage.removeItem('currentUser');
            showLoginForm();
        }
    } catch (error) {
        console.log('Session check failed, assuming not logged in');
        currentUser = null;
        showLoginForm();
    }
    
    // Start insult ticker
    startInsultTicker();
    
    // Add Easter egg listeners
    addEasterEggListeners();
    
    // Initialize mobile controls
    initializeMobileControls();
    
    // Random cursed events
    setInterval(randomCursedEvent, 30000); // Every 30 seconds
}

// Section navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Load achievements when section is shown
    if (sectionName === 'achievements') {
        loadAchievements();
    }
}

// Tab navigation
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Game functions
function playGame(gameName) {
    currentGame = gameName;
    document.getElementById('game-title').textContent = getGameTitle(gameName);
    document.getElementById('game-modal').style.display = 'block';
    
    // Clear previous game
    document.getElementById('game-container').innerHTML = '<canvas id="gameCanvas" width="400" height="400"></canvas>';
    
    // Grant achievement for clicking on dino game
    if (gameName === 'dino') {
        grantAchievement('old');
    }
    
    // Show mobile controls if on mobile device
    showMobileControls(gameName);
    
    // Start the selected game
    switch(gameName) {
        case 'snake':
            startSnakeGame();
            break;
        case 'tetris':
            startTetrisGame();
            break;
        case 'dino':
            startDinoGame();
            break;
        case '2048':
            start2048Game();
            break;
        case 'flappy':
            startFlappyGame();
            break;
        case 'rigged':
            startRiggedGame();
            break;
        default:
            document.getElementById('game-container').innerHTML = '<p>Game not implemented yet! 💀</p>';
    }
}

// Score submission function
async function submitScore(game, score) {
    try {
        const response = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game, score })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let message = `Score saved! Rank: #${data.rank}`;
            if (data.insult) {
                message += ` - ${data.insult}`;
            }
            showMessage(message, data.rank <= 10 ? 'success' : 'error');
        } else if (response.status === 401) {
            // User not logged in
            showMessage('💀 Create an account to save your shameful scores!', 'error');
            showMessage('🎮 Click "Account" to register and preserve your failure!', 'error');
            
            // Highlight the account button
            const accountBtn = document.querySelector('[onclick="showSection(\'account\')"]');
            if (accountBtn) {
                accountBtn.style.animation = 'pulse 1s infinite';
                setTimeout(() => {
                    accountBtn.style.animation = '';
                }, 5000);
            }
        } else {
            showMessage(data.message || data.error || 'Failed to save score', 'error');
            if (data.insult) {
                showMessage(data.insult, 'error');
            }
        }
    } catch (error) {
        console.error('Score submission error:', error);
        showMessage('Failed to submit score!', 'error');
    }
}

// Grant achievement function
async function grantAchievement(achievementName) {
    try {
        const response = await fetch(`/api/achievement/${achievementName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
        } else if (response.status === 401) {
            // User not logged in - don't show error for achievements
            console.log('User not logged in for achievement');
        } else {
            console.error('Achievement error:', data.error);
        }
    } catch (error) {
        console.error('Achievement submission error:', error);
    }
}

function getGameTitle(gameName) {
    const titles = {
        'snake': '🐍 Snake - Eat Yourself to Death',
        'tetris': '🧩 Tetris - Stack Your Failures',
        'dino': '🦕 Dino Run - Extinct Before You Start',
        '2048': '🔢 2048 - Math is Hard',
        'flappy': '🐦 Flappy Bird - Gravity Always Wins',
        'rigged': '🎲 Rigged Roulette - The House Always Wins'
    };
    return titles[gameName] || 'Unknown Game';
}

function closeGame() {
    document.getElementById('game-modal').style.display = 'none';
    hideMobileControls();
    currentGame = null;
}

function restartGame() {
    if (currentGame) {
        // Universal restart - works for all games
        switch(currentGame) {
            case 'snake':
                if (typeof snakeGame !== 'undefined' && snakeGame.restart) {
                    snakeGame.restart();
                } else {
                    playGame(currentGame);
                }
                break;
            case 'tetris':
                if (typeof tetrisGame !== 'undefined' && tetrisGame.restart) {
                    tetrisGame.restart();
                } else {
                    playGame(currentGame);
                }
                break;
            case 'dino':
                if (typeof dinoGame !== 'undefined' && dinoGame.restart) {
                    dinoGame.restart();
                } else {
                    playGame(currentGame);
                }
                break;
            case '2048':
                if (typeof game2048 !== 'undefined' && typeof restartGame === 'function') {
                    // 2048 has internal restart, just replay
                    playGame(currentGame);
                } else {
                    playGame(currentGame);
                }
                break;
            case 'flappy':
                if (typeof flappyGame !== 'undefined') {
                    // Flappy handles restart via space key, just replay
                    playGame(currentGame);
                } else {
                    playGame(currentGame);
                }
                break;
            case 'rigged':
                if (typeof riggedGame !== 'undefined') {
                    playGame(currentGame);
                } else {
                    playGame(currentGame);
                }
                break;
            default:
                playGame(currentGame);
        }
    }
}

// Account functions
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            showUserPanel();
            showMessage(data.message, 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Login failed!', 'error');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            showUserPanel();
            showMessage(data.message, 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Registration failed!', 'error');
    }
}

function logout() {
    fetch('/api/logout', { method: 'POST' });
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginForm();
    showMessage('Logged out successfully!', 'success');
}

function showUserPanel() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('user-panel').style.display = 'block';
    document.getElementById('username-display').textContent = currentUser;
    document.getElementById('user-status').textContent = `Welcome back, ${currentUser}! 🎮`;
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('user-panel').style.display = 'none';
    document.getElementById('user-status').textContent = 'Welcome, Nameless Gremlin! 💀 (Login to save scores)';
}

// Leaderboard
async function loadLeaderboard(game) {
    try {
        const response = await fetch(`/api/leaderboard/${game}`);
        const data = await response.json();
        
        let html = `<div class="leaderboard-header">
            <h3>🏆 ${game.toUpperCase()} Hall of Shame</h3>
            <p class="leaderboard-subtitle">See who's less terrible than you!</p>
        </div>`;
        
        if (data.length === 0) {
            html += `<div class="empty-leaderboard">
                <p>📊 No scores yet. Be the first to embarrass yourself!</p>
                <p>💀 The void awaits your failure...</p>
            </div>`;
        } else {
            html += `<table class="leaderboard-table">
                <thead>
                    <tr>
                        <th width="10%">Rank</th>
                        <th width="30%">Player</th>
                        <th width="20%">Score</th>
                        <th width="15%">Games</th>
                        <th width="25%">Cursed Title</th>
                    </tr>
                </thead>
                <tbody>`;
            
            data.forEach((entry, index) => {
                const isCurrentUser = currentUser && entry.username === currentUser;
                const rankClass = `rank-${Math.min(entry.rank, 3)}`;
                const userClass = isCurrentUser ? 'current-user' : '';
                
                html += `<tr class="${rankClass} ${userClass}" ${isCurrentUser ? 'title="This is you!"' : ''}>
                    <td class="rank-cell">
                        <span class="rank-badge">#${entry.rank}</span>
                        ${entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : ''}
                    </td>
                    <td class="username-cell">
                        ${isCurrentUser ? '🎯 ' : ''}${entry.username}${isCurrentUser ? ' (You)' : ''}
                        ${entry.username === 'admin' ? ' 👑' : ''}
                    </td>
                    <td class="score-cell">${entry.best_score.toLocaleString()}</td>
                    <td class="games-cell">${entry.games_played}</td>
                    <td class="title-cell">${entry.title}</td>
                </tr>`;
            });
            
            html += `</tbody></table>`;
            
            // Add current user's stats if not in top 10
            if (currentUser) {
                const userInList = data.find(entry => entry.username === currentUser);
                if (!userInList) {
                    html += `<div class="user-stats">
                        <h4>📊 Your Pathetic Stats</h4>
                        <p>💀 Not even in the top 10... How embarrassing!</p>
                        <p>🎮 Keep trying, ${currentUser}!</p>
                    </div>`;
                }
            }
        }
        
        document.getElementById('leaderboard-content').innerHTML = html;
    } catch (error) {
        showMessage('Failed to load leaderboard!', 'error');
    }
}

// Achievements
async function loadAchievements() {
    try {
        const response = await fetch('/api/achievements');
        const data = await response.json();
        
        let html = '<div class="achievements-grid">';
        
        if (data.length === 0) {
            html += '<p>No achievements yet. Play some games to unlock them!</p>';
        } else {
            data.forEach(achievement => {
                html += `<div class="achievement-card">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <small>Earned: ${new Date(achievement.earned_at).toLocaleDateString()}</small>
                </div>`;
            });
        }
        
        html += '</div>';
        document.getElementById('achievements-content').innerHTML = html;
    } catch (error) {
        showMessage('Failed to load achievements!', 'error');
    }
}

// Message system
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Cursed features
function startInsultTicker() {
    const insults = [
        '💀 Your skills are... questionable',
        '🥦 Even vegetables show more promise',
        '🎮 Retro gaming expert... at failing',
        '🧠 Skill.exe has stopped working',
        '💸 High score: Still disappointing',
        '🎯 Accuracy: Needs improvement',
        '🎲 Maybe try a different hobby?'
    ];
    
    const ticker = document.getElementById('insult-ticker');
    let index = 0;
    
    // Start with a delay and show less frequently
    setTimeout(() => {
        setInterval(() => {
            ticker.textContent = insults[index];
            index = (index + 1) % insults.length;
        }, 2000); // Every 15 seconds instead of 8
    }, 50); // Wait 5 seconds before starting
}

function randomCursedEvent() {
    const events = [
        () => {
            document.body.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => document.body.style.filter = '', 3000);
            showMessage('🎨 Reality glitched for a moment...', 'error');
        },
        () => {
            const audio = new Audio(cursedSounds.fail);
            audio.play().catch(() => {}); // Ignore errors
            showMessage('🔊 The void whispers...', 'error');
        },
        () => {
            showMessage('📸 Screenshot saved! (Just kidding, creep)', 'error');
        },
        () => {
            showMessage('🧿 Someone is watching you play...', 'error');
        }
    ];
    
    if (Math.random() < 0.1) { // 10% chance
        const event = events[Math.floor(Math.random() * events.length)];
        event();
    }
}

// Easter eggs
function addEasterEggListeners() {
    // Konami code
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateKonamiCode();
            konamiCode = [];
        }
    });
    
    // Click counter easter egg
    document.addEventListener('click', function() {
        easterEggCounter++;
        if (easterEggCounter === 100) {
            grantAchievement('clickaholic')
            showMessage('🎉 You clicked 100 times! Achievement unlocked: Clickaholic!', 'success');
        }
    });
}

function activateKonamiCode() {
    showMessage('🎮 KONAMI CODE ACTIVATED! 30 lives added! (Not really)', 'success');
    document.body.style.animation = 'rainbow 2s infinite';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 10000);
}

// Fake install button
function fakeInstall() {
    const responses = [
        'You think we care enough?😂',
        'Installing virus... 99% complete 😈',
        'Downloading more RAM... please wait 🖥️',
        'Installing Windows 95... prepare for nostalgia 💾',
        'Rickrolling your browser... 🎵',
        'Installing common sense... ERROR: File not found 🧠',
        'Downloading the internet... this might take a while 🌐'
    ];
    grantAchievement('idiot');
    const message = responses[Math.floor(Math.random() * responses.length)];
    showMessage(message, 'error');
    
    // Fake loading bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) {
            clearInterval(interval);
            showMessage('Installation failed successfully! Just like your life! 💀', 'error');
        }
    }, 200);
}

// Window controls (fake)
function minimizeWindow() {
    showMessage('Nice try! This is a web page, not Windows 95! 🪟', 'error');
}

function maximizeWindow() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
}

function closeWindow() {
    if (confirm('Are you sure you want to abandon your cursed journey?')) {
        window.close();
    }
}

// Mobile Controls
let mobileControlsActive = false;
let currentGameControls = null;

function initializeMobileControls() {
    // More accurate mobile detection
    const isMobile = (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
        'ontouchstart' in window &&
        navigator.maxTouchPoints > 0
    ) || (
        // Additional check for touch devices without mouse
        navigator.maxTouchPoints > 1 && 
        !window.matchMedia('(any-hover: hover)').matches
    );
    
    if (isMobile) {
        setupMobileControls();
    }
}

function setupMobileControls() {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const actionBtn = document.getElementById('action-btn');
    const jumpBtn = document.getElementById('jump-btn');
    
    // Add touch event listeners
    upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput('up'); });
    downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput('down'); });
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput('left'); });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput('right'); });
    actionBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput('action'); });
    jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMobileInput('jump'); });
    
    // Also add click events for testing on desktop
    upBtn.addEventListener('click', (e) => { e.preventDefault(); handleMobileInput('up'); });
    downBtn.addEventListener('click', (e) => { e.preventDefault(); handleMobileInput('down'); });
    leftBtn.addEventListener('click', (e) => { e.preventDefault(); handleMobileInput('left'); });
    rightBtn.addEventListener('click', (e) => { e.preventDefault(); handleMobileInput('right'); });
    actionBtn.addEventListener('click', (e) => { e.preventDefault(); handleMobileInput('action'); });
    jumpBtn.addEventListener('click', (e) => { e.preventDefault(); handleMobileInput('jump'); });
}

function showMobileControls(gameType) {
    // Only show on mobile devices during active gameplay
    const isMobile = (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
        'ontouchstart' in window &&
        navigator.maxTouchPoints > 0
    ) || (
        navigator.maxTouchPoints > 1 && 
        !window.matchMedia('(any-hover: hover)').matches
    );
    
    // Only show if mobile AND game modal is open
    const gameModal = document.getElementById('game-modal');
    if (!isMobile || !gameModal || gameModal.style.display === 'none') return;
    
    mobileControlsActive = true;
    currentGameControls = gameType;
    const controls = document.getElementById('mobile-controls');
    const actionBtn = document.getElementById('action-btn');
    const jumpBtn = document.getElementById('jump-btn');
    
    // Show controls
    controls.style.display = 'flex';
    
    // Customize buttons based on game
    switch(gameType) {
        case 'snake':
        case 'tetris':
            actionBtn.textContent = '🔄'; // Rotate/Action
            jumpBtn.style.display = 'none';
            break;
        case 'dino':
        case 'flappy':
            actionBtn.style.display = 'none';
            jumpBtn.textContent = '🚀'; // Jump
            jumpBtn.style.display = 'block';
            break;
        case '2048':
            actionBtn.textContent = '🔄'; // Action
            jumpBtn.style.display = 'none';
            break;
        default:
            actionBtn.textContent = '🎮';
            jumpBtn.textContent = '🚀';
            break;
    }
}

function hideMobileControls() {
    mobileControlsActive = false;
    currentGameControls = null;
    document.getElementById('mobile-controls').style.display = 'none';
}

function handleMobileInput(direction) {
    if (!mobileControlsActive || !currentGameControls) return;
    
    // Create keyboard event simulation
    let keyCode;
    
    switch(direction) {
        case 'up':
            keyCode = 38; // Arrow Up
            break;
        case 'down':
            keyCode = 40; // Arrow Down
            break;
        case 'left':
            keyCode = 37; // Arrow Left
            break;
        case 'right':
            keyCode = 39; // Arrow Right
            break;
        case 'action':
            keyCode = 32; // Space bar
            break;
        case 'jump':
            keyCode = 32; // Space bar
            break;
    }
    
    // Dispatch keyboard event
    const event = new KeyboardEvent('keydown', {
        keyCode: keyCode,
        which: keyCode,
        key: direction === 'action' || direction === 'jump' ? ' ' : 'Arrow' + direction.charAt(0).toUpperCase() + direction.slice(1),
        code: direction === 'action' || direction === 'jump' ? 'Space' : 'Arrow' + direction.charAt(0).toUpperCase() + direction.slice(1)
    });
    
    document.dispatchEvent(event);
    
    // Visual feedback
    const btn = document.getElementById(direction === 'action' ? 'action-btn' : direction === 'jump' ? 'jump-btn' : direction + '-btn');
    if (btn) {
        btn.style.background = 'linear-gradient(to bottom, #BFBFBF, #DFDFDF)';
        setTimeout(() => {
            btn.style.background = 'linear-gradient(to bottom, #DFDFDF, #BFBFBF)';
        }, 100);
    }
}
