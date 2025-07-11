// Firebase-powered server.js for BROWSECADE
const express = require('express');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

// Load Firebase service account credentials
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin Init
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Constants
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

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  const fakeEmail = `${username}@cursedarcade.fake`;
  try {
    const user = await auth.createUser({
      email: fakeEmail,
      password,
      displayName: username
    });

    await db.collection('users').doc(user.uid).set({
      username,
      avatar: 'default.png',
      createdAt: new Date().toISOString()
    });

    await grantAchievement(user.uid, 'first-blood');
    if (username.toLowerCase() === 'admin') {
      await grantAchievement(user.uid, 'admin-privilege');
    }

    res.json({ success: true, uid: user.uid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const userDoc = await db.collection('users').doc(uid).get();
    const username = userDoc.exists ? userDoc.data().username : 'Unknown';

    res.json({ success: true, uid, username });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Submit Score
app.post('/api/score', async (req, res) => {
  const { uid, username, game, score } = req.body;

  const maxScores = {
    snake: 10000,
    tetris: 100000,
    dino: 50000,
    "2048": 131072,
    flappy: 1000,
    pong: 100
  };

  try {
    if (!uid || !username) return res.status(403).json({ error: 'Not authenticated' });

    if (score > maxScores[game]) {
      await grantAchievement(uid, 'cheater-detected');
      return res.json({
        success: false,
        message: 'Nice try, cheater! 🚨',
        insult: 'Your coding skills are as fake as your score!'
      });
    }

    if (score < 10) {
      await grantAchievement(uid, 'death-magnet');
    }

    await db.collection('scores').add({
      uid,
      username,
      game,
      score,
      createdAt: new Date().toISOString()
    });

    const scoresSnapshot = await db.collection('scores')
      .where('game', '==', game)
      .where('score', '>', score)
      .get();

    const rank = scoresSnapshot.size + 1;
    const insult = rank > 50 ? cursedInsults[Math.floor(Math.random() * cursedInsults.length)] : null;

    res.json({ success: true, message: 'Score saved!', rank, insult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Score submission failed' });
  }
});

// Leaderboard
app.get('/api/leaderboard/:game', async (req, res) => {
  const { game } = req.params;
  try {
    const snapshot = await db.collection('scores')
      .where('game', '==', game)
      .orderBy('score', 'desc')
      .limit(10)
      .get();

    const leaderboard = [];
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      leaderboard.push({
        username: data.username,
        best_score: data.score,
        last_played: data.createdAt,
        games_played: 'n/a', // Optional: count user games separately
        rank: index + 1,
        title: index === 0 ? '👑 Cursed Champion' :
               index < 3 ? '🏆 Decent Human' :
               index < 7 ? '🥉 Mediocre Mortal' :
               '🥦 Useless Broccoli'
      });
    });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Leaderboard error' });
  }
});

// Get Achievements
app.get('/api/achievements/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const snapshot = await db.collection('achievements')
      .where('uid', '==', uid)
      .orderBy('earnedAt', 'desc')
      .get();

    const list = snapshot.docs.map(doc => {
      const ach = doc.data();
      return {
        ...achievements[ach.name],
        earnedAt: ach.earnedAt
      };
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Grant Custom Achievement (manually or via frontend call)
app.post('/api/achievement/:achievementName', async (req, res) => {
  const { uid } = req.body;
  const achievementName = req.params.achievementName;

  if (!achievements[achievementName]) return res.status(400).json({ error: 'Invalid achievement' });

  try {
    const granted = await grantAchievement(uid, achievementName);
    if (granted) {
      res.json({
        success: true,
        achievement: achievements[achievementName],
        message: `Achievement unlocked: ${achievements[achievementName].name}!`
      });
    } else {
      res.json({ success: false, message: 'Already unlocked' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to grant achievement' });
  }
});

// Grant Achievement Function
async function grantAchievement(uid, name) {
  const snapshot = await db.collection('achievements')
    .where('uid', '==', uid)
    .where('name', '==', name)
    .get();

  if (!snapshot.empty) return false;

  await db.collection('achievements').add({
    uid,
    name,
    earnedAt: new Date().toISOString()
  });

  console.log(`Achievement '${name}' granted to user ${uid}`);
  return true;
}

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('A cursed soul connected');
  socket.on('disconnect', () => {
    console.log('Soul departed to the void');
  });
  socket.on('new-score', (data) => {
    socket.broadcast.emit('score-update', data);
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Still cursed. Still breathing.' });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 BROWSECADE is running on port ${PORT}`);
  console.log(`💀 Maximum cursed-ness enabled`);
});
