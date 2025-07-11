const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

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

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
} catch (error) {
  console.error('🚨 Firebase service account file not found!');
  console.error('Please create firebase-service-account.json with your Firebase credentials.');
  console.error('Using default configuration for now...');
  
  // Fallback configuration - this will fail but allows server to start
  serviceAccount = {
    "type": "service_account",
    "project_id": "browsecade",
    "private_key_id": "dummy",
    "private_key": "-----BEGIN PRIVATE KEY-----\nDUMMY\n-----END PRIVATE KEY-----\n",
    "client_email": "dummy@browsecade.iam.gserviceaccount.com",
    "client_id": "dummy",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/dummy@browsecade.iam.gserviceaccount.com"
  };
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'browsecade'
});

const db = admin.firestore();

// Firestore collections
const usersCollection = db.collection('users');
const scoresCollection = db.collection('scores');
const achievementsCollection = db.collection('achievements');

console.log('Firebase Firestore initialized successfully!');
console.log('Collections ready: users, scores, achievements');

// Cursed insults for bad players
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

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  try {
    // Check if username already exists
    const existingUser = await usersCollection.where('username', '==', username).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user document
    const userDoc = await usersCollection.add({
      username: username,
      password: hashedPassword,
      avatar: 'default.png',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    req.session.userId = userDoc.id;
    req.session.username = username;
    
    // Award first blood achievement
    grantAchievement(userDoc.id, 'first-blood');
    
    // Check for admin privilege
    if (username.toLowerCase() === 'admin') {
      grantAchievement(userDoc.id, 'admin-privilege');
    }
    
    res.json({ success: true, message: 'Welcome to the cursed realm!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user by username
    const userQuery = await usersCollection.where('username', '==', username).get();
    
    if (userQuery.empty) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const userDoc = userQuery.docs[0];
    const user = userDoc.data();
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = userDoc.id;
    req.session.username = user.username;
    
    res.json({ success: true, message: 'Welcome back, you cursed soul!' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Submit score
app.post('/api/score', async (req, res) => {
  const { game, score } = req.body;
  
  // Ensure user is logged in to submit scores
  if (!req.session.userId || !req.session.username) {
    return res.status(401).json({ 
      success: false, 
      error: 'You must be logged in to submit scores!',
      message: 'Create an account to save your shameful scores!' 
    });
  }
  
  const username = req.session.username;
  const userId = req.session.userId;
  
  // Detect impossibly high scores (cheating)
  const maxScores = {
    'snake': 10000,
    'tetris': 100000,
    'dino': 50000,
    '2048': 131072,
    'flappy': 1000,
    'rigged': 1000,
    'pong': 100
  };
  
  if (score > maxScores[game]) {
    if (userId) {
      grantAchievement(userId, 'cheater-detected');
    }
    return res.json({ 
      success: false, 
      message: 'Nice try, cheater! 🚨',
      insult: 'Your coding skills are as fake as your score!'
    });
  }
  
  // Check for death magnet achievement (very low score)
  if (score < 10 && userId) {
    grantAchievement(userId, 'death-magnet');
  }
  
  try {
    // Save score to Firestore
    await scoresCollection.add({
      user_id: userId,
      username: username,
      game: game,
      score: score,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get user rank for this game
    const higherScores = await scoresCollection
      .where('game', '==', game)
      .where('score', '>', score)
      .get();
    
    const rank = higherScores.size + 1;
    const insult = rank > 50 ? cursedInsults[Math.floor(Math.random() * cursedInsults.length)] : null;
    
    res.json({ 
      success: true, 
      message: 'Score saved!',
      rank: rank,
      insult: insult
    });
  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Get leaderboard
app.get('/api/leaderboard/:game', async (req, res) => {
  const game = req.params.game;
  
  try {
    // Get all scores for this game
    const gameScores = await scoresCollection
      .where('game', '==', game)
      .get();
    
    // Group scores by username and calculate stats
    const userStats = {};
    gameScores.forEach(doc => {
      const data = doc.data();
      const username = data.username;
      
      if (!userStats[username]) {
        userStats[username] = {
          username: username,
          best_score: data.score,
          games_played: 1,
          last_played: data.created_at
        };
      } else {
        userStats[username].best_score = Math.max(userStats[username].best_score, data.score);
        userStats[username].games_played++;
        if (data.created_at > userStats[username].last_played) {
          userStats[username].last_played = data.created_at;
        }
      }
    });
    
    // Convert to array and sort by best score
    const leaderboard = Object.values(userStats)
      .sort((a, b) => b.best_score - a.best_score)
      .slice(0, 10)
      .map((row, index) => ({
        ...row,
        rank: index + 1,
        title: index === 0 ? '👑 Cursed Champion' : 
               index < 3 ? '🏆 Decent Human' : 
               index < 7 ? '🥉 Mediocre Mortal' : 
               '🥦 Useless Broccoli'
      }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get user achievements
app.get('/api/achievements', async (req, res) => {
  if (!req.session.userId) {
    return res.json([]);
  }
  
  try {
    // Query without orderBy first to avoid index issues
    const userAchievements = await achievementsCollection
      .where('user_id', '==', req.session.userId)
      .get();
    
    const achievements_list = userAchievements.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...achievements[data.achievement_name],
          earned_at: data.earned_at
        };
      })
      .sort((a, b) => {
        // Sort by earned_at descending (newest first)
        if (!a.earned_at) return 1;
        if (!b.earned_at) return -1;
        return b.earned_at._seconds - a.earned_at._seconds;
      });
    
    res.json(achievements_list);
  } catch (error) {
    console.error('Achievements error:', error);
    
    // Check if it's a Firebase auth error
    if (error.code === 'auth/invalid-credential') {
      res.status(500).json({ 
        error: 'Firebase configuration error. Please check your service account credentials.' 
      });
    } else if (error.code === 'failed-precondition') {
      res.status(500).json({ 
        error: 'Database index required. Please create a composite index in Firestore console.',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Database error',
        details: error.message 
      });
    }
  }
});

// Admin - Unlock All Achievements
app.post('/api/unlock-all', async (req, res) => {
  if (!req.session.userId || req.session.username !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Get all achievement names
    const allAchievements = Object.keys(achievements);
    
    // Check which achievements the user already has
    const existingAchievements = await achievementsCollection
      .where('user_id', '==', req.session.userId)
      .get();
    
    const existingAchievementNames = existingAchievements.docs.map(doc => doc.data().achievement_name);
    
    // Find achievements that need to be unlocked
    const achievementsToUnlock = allAchievements.filter(name => !existingAchievementNames.includes(name));
    
    if (achievementsToUnlock.length === 0) {
      return res.json({ success: true, message: 'All achievements already unlocked' });
    }
    
    // Create batch write for new achievements
    const batch = db.batch();
    
    achievementsToUnlock.forEach(achievementName => {
      const achievementRef = achievementsCollection.doc();
      batch.set(achievementRef, {
        user_id: req.session.userId,
        achievement_name: achievementName,
        earned_at: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    
    console.log(`Admin unlocked ${achievementsToUnlock.length} achievements`);
    res.json({ 
      success: true, 
      message: `Unlocked ${achievementsToUnlock.length} achievements` 
    });
  } catch (error) {
    console.error('Error unlocking achievements:', error);
    res.status(500).json({ error: 'Failed to unlock achievements' });
  }
});

app.post('/api/achievement/:achievementName', (req, res) => {
  const achievementName = req.params.achievementName;

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  if (!achievements[achievementName]) {
    return res.status(400).json({ error: 'Achievement not found' });
  }

  grantAchievement(req.session.userId, achievementName, (granted, err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to grant achievement' });
    }

    if (granted) {
      res.json({ 
        success: true, 
        achievement: achievements[achievementName],
        message: `Achievement unlocked: ${achievements[achievementName].name}!`
      });
    } else {
      // Achievement already earned, do not respond with message
      res.json({ success: false });
    }
  });
});


// Check session status
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

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

async function grantAchievement(userId, achievementName, callback = () => {}) {
  try {
    const existingAchievement = await achievementsCollection
      .where('user_id', '==', userId)
      .where('achievement_name', '==', achievementName)
      .get();

    if (!existingAchievement.empty) {
      // Already exists
      callback(false, null);
      return;
    }

    // Grant achievement
    await achievementsCollection.add({
      user_id: userId,
      achievement_name: achievementName,
      earned_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Achievement '${achievementName}' granted to user ${userId}`);
    callback(true, null);
  } catch (err) {
    console.error('Failed to grant achievement:', err);
    callback(false, err);
  }
}




// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('A cursed soul connected');
  
  socket.on('disconnect', () => {
    console.log('Soul departed to the void');
  });
  // Real-time score updates
  socket.on('new-score', (data) => {
    socket.broadcast.emit('score-update', data);
  });
});

app.get('/health', async (req, res) => {
  try {
    // Check Firestore connection by running a quick harmless query
    await db.collection('health').doc('test').get();
    res.status(200).json({ status: 'OK', message: 'Still cursed. Still breathing.' });
  } catch (error) {
    console.error('💀 Firestore is unresponsive:', error.message);
    res.status(500).json({ status: 'DEAD', error: error.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 BROWSERCADE is running on port ${PORT}`);
  console.log(`💀 Prepare for maximum cursed-ness!`);
});

