const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

console.log('🎮 BROWSERCADE Server - Client-side Firebase mode');
console.log('🔥 All Firebase operations handled client-side!');
console.log('📁 Collections: users, scores, achievements');

// Cursed insults for bad players (now available to client)
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

// Achievement definitions (now available to client)
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
  'ghost': { name: 'Ghost', description: 'your hopes have been ghosted', icon: '👻' },
  
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get cursed insults
app.get('/api/insults', (req, res) => {
  res.json(cursedInsults);
});

// API endpoint to get achievements definitions
app.get('/api/achievements-list', (req, res) => {
  res.json(achievements);
});

// Max scores for cheat detection (available to client)
app.get('/api/max-scores', (req, res) => {
  const maxScores = {
    'snake': 10000,
    'tetris': 100000,
    'dino': 50000,
    '2048': 131072,
    'flappy': 1000,
    'rigged': 1000,
    'pong': 100
  };
  res.json(maxScores);
});

// Password hashing utility endpoints
app.post('/api/hash-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    res.json({ hashedPassword });
  } catch (error) {
    res.status(500).json({ error: 'Failed to hash password' });
  }
});

app.post('/api/verify-password', async (req, res) => {
  try {
    const { password, hashedPassword } = req.body;
    if (!password || !hashedPassword) {
      return res.status(400).json({ error: 'Password and hash required' });
    }
    const isValid = await bcrypt.compare(password, hashedPassword);
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify password' });
  }
});

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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server alive! Firebase operations handled client-side.' 
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 BROWSERCADE is running on port ${PORT}`);
  console.log(`💀 Prepare for maximum cursed-ness!`);
  console.log(`🔥 Firebase Client SDK ready for action!`);
});

