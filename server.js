const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const simpleGit = require('simple-git');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database('cursed_arcade.db');

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'cursed-arcade-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Cursed Insults
const cursedInsults = [
  "🥦 Useless broccoli",
  "🧻 Soggy toilet paper",
  "🦆 Rubber duck with trust issues",
  "🍞 Stale bread crumb",
  "🧦 Wet sock on a cold day",
  "🐌 Snail with performance anxiety",
  "🥔 Disappointing potato",
  "🦴 Brittle bone",
  "🍃 Leaf in a hurricane",
  "🧽 Squeaky sponge"
];

// Achievement definitions
const achievements = {
  'death-magnet': { name: 'Death Magnet', description: 'Die in under 3 seconds', icon: '💀' },
  'tryhard-supreme': { name: 'Tryhard Supreme', description: 'Play for over 2 hours', icon: '🏆' },
  'first-blood': { name: 'First Blood', description: 'Your first game!', icon: '🩸' },
  'bottom-feeder': { name: 'Bottom Feeder', description: 'Consistently terrible', icon: '🐟' },
  'cheater-detected': { name: 'Sus Behavior', description: 'Impossible score detected', icon: '🚨' },
  'admin-privilege': { name: 'Admin Privilege', description: 'Username is "admin"', icon: '👑' },
  'old': { name: 'Old', description: 'You clicked on the dino game! Welcome to the prehistoric era!', icon: '🦕' },
  'idiot': { name: 'Idiot', description: 'Just use the website! nobody makes apps these days', icon: '😂🫵' },
  'clickaholic': { name: 'Clickaholic', description: 'respect for this one', icon: '👇' },
};

// Database setup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT 'default.png',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    game TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    achievement_name TEXT NOT NULL,
    description TEXT,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, achievement_name)
  )`, (err) => {
    if (err) return console.error('Error creating achievements table:', err);

    db.run(`DELETE FROM achievements
            WHERE id NOT IN (
              SELECT MIN(id)
              FROM achievements
              GROUP BY user_id, achievement_name
            )`);

    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_achievements 
            ON achievements(user_id, achievement_name);`);
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }

      req.session.userId = this.lastID;
      req.session.username = username;

      grantAchievement(this.lastID, 'first-blood');
      if (username.toLowerCase() === 'admin') {
        grantAchievement(this.lastID, 'admin-privilege');
      }

      res.json({ success: true, message: 'Welcome to the cursed realm!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ success: true, message: 'Welcome back, you cursed soul!' });
  });
});

app.post('/api/score', (req, res) => {
  const { game, score } = req.body;
  if (!req.session.userId || !req.session.username) {
    return res.status(401).json({ 
      success: false, 
      error: 'You must be logged in to submit scores!',
      message: 'Create an account to save your shameful scores!' 
    });
  }

  const username = req.session.username;
  const userId = req.session.userId;

  const maxScores = {
    'snake': 10000,
    'tetris': 100000,
    'dino': 50000,
    '2048': 131072,
    'flappy': 1000,
    'pong': 100
  };

  if (score > maxScores[game]) {
    grantAchievement(userId, 'cheater-detected');
    return res.json({ 
      success: false, 
      message: 'Nice try, cheater! 🚨',
      insult: 'Your coding skills are as fake as your score!'
    });
  }

  if (score < 10) {
    grantAchievement(userId, 'death-magnet');
  }

  db.run('INSERT INTO scores (user_id, username, game, score) VALUES (?, ?, ?, ?)', 
    [userId, username, game, score], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to save score' });

      db.get(`SELECT COUNT(*) as rank FROM scores WHERE game = ? AND score > ?`, 
        [game, score], (err, result) => {
          const rank = result ? result.rank + 1 : 1;
          const insult = rank > 50 ? cursedInsults[Math.floor(Math.random() * cursedInsults.length)] : null;
          res.json({ success: true, message: 'Score saved!', rank, insult });
        });
    });
});

app.get('/api/leaderboard/:game', (req, res) => {
  const game = req.params.game;
  db.all(`SELECT username, MAX(score) as best_score, COUNT(*) as games_played,
          datetime(created_at, 'localtime') as last_played
          FROM scores 
          WHERE game = ? 
          GROUP BY username 
          ORDER BY best_score DESC 
          LIMIT 10`, 
    [game], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const leaderboard = rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        title: index === 0 ? '👑 Cursed Champion' : 
               index < 3 ? '🏆 Decent Human' : 
               index < 7 ? '🥉 Mediocre Mortal' : 
               '🥦 Useless Broccoli'
      }));

      res.json(leaderboard);
    });
});

app.get('/api/achievements', (req, res) => {
  if (!req.session.userId) return res.json([]);

  db.all(`SELECT achievement_name, earned_at FROM achievements 
          WHERE user_id = ? 
          ORDER BY earned_at DESC`, 
    [req.session.userId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const userAchievements = rows.map(row => ({
        ...achievements[row.achievement_name],
        earned_at: row.earned_at
      }));

      res.json(userAchievements);
    });
});

app.post('/api/achievement/:achievementName', (req, res) => {
  const achievementName = req.params.achievementName;
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  if (!achievements[achievementName]) return res.status(400).json({ error: 'Achievement not found' });

  grantAchievement(req.session.userId, achievementName, (granted, err) => {
    if (err) return res.status(500).json({ error: 'Failed to grant achievement' });

    if (granted) {
      res.json({ 
        success: true, 
        achievement: achievements[achievementName],
        message: `Achievement unlocked: ${achievements[achievementName].name}!`
      });
    } else {
      res.json({ success: false });
    }
  });
});

app.get('/api/session', (req, res) => {
  if (req.session.userId && req.session.username) {
    res.json({ 
      loggedIn: true, 
      username: req.session.username,
      userId: req.session.userId 
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

function grantAchievement(userId, achievementName, callback = () => {}) {
  db.get('SELECT 1 FROM achievements WHERE user_id = ? AND achievement_name = ?', 
    [userId, achievementName], (err, row) => {
      if (err) return callback(false, err);
      if (row) return callback(false, null);

      db.run('INSERT INTO achievements (user_id, achievement_name) VALUES (?, ?)', 
        [userId, achievementName], (err) => {
          if (err) return callback(false, err);
          console.log(`Achievement '${achievementName}' granted to user ${userId}`);
          callback(true, null);
        });
    });
}

// Admin DB download
app.get('/admin/download-db', (req, res) => {
  if (req.session.username !== 'admin') return res.status(403).json({ error: 'Access denied' });

  const filePath = path.join(__dirname, 'cursed_arcade.db');
  res.download(filePath, 'cursed_arcade.db');
});

const git = simpleGit();

async function commitAndPushDbUpdate() {
  try {
    const dbFile = 'cursed_arcade.db'; // replace with your .db file name

    await git.add(dbFile);
    await git.commit(`Update ${dbFile} - ${new Date().toISOString()}`);
    await git.push(); // change branch name if not 'main'

    console.log('DB file committed and pushed successfully!');
  } catch (err) {
    console.error('Failed to push DB update:', err);
  }
}

app.post('/admin/upload-db', upload.single('dbfile'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

    commitAndPushDbUpdate();
    });
// Socket.IO events
io.on('connection', (socket) => {
  console.log('A cursed soul connected');
  socket.on('disconnect', () => {
    console.log('Soul departed to the void');
  });
  socket.on('new-score', (data) => {
    socket.broadcast.emit('score-update', data);
  });
});

// Health check
app.get('/health', (req, res) => {
  db.get('SELECT 1', [], (err) => {
    if (err) return res.status(500).json({ status: 'DEAD', error: err.message });
    res.status(200).json({ status: 'OK', message: 'Still cursed. Still breathing.' });
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 BROWSERCADE is running on port ${PORT}`);
  console.log(`💀 Prepare for maximum cursed-ness!`);
});
