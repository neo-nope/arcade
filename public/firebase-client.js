// Firebase Client-Side Operations with Custom Username/Password Auth
// This handles custom authentication and Firestore operations

class FirebaseClient {
    constructor() {
        this.db = null;
        this.currentUser = null; // Will contain { uid, username }
        this.achievements = {};
        this.maxScores = {};
        this.cursedInsults = [];
        
        // Wait for Firebase to be initialized
        this.initializeWhenReady();
    }

    async initializeWhenReady() {
        // Wait for Firebase to be available
        const waitForFirebase = () => {
            return new Promise((resolve) => {
                const checkFirebase = () => {
                    if (window.firebaseDB) {
                        resolve();
                    } else {
                        setTimeout(checkFirebase, 100);
                    }
                };
                checkFirebase();
            });
        };

        await waitForFirebase();
        
        this.db = window.firebaseDB;
        this.firestoreMethods = window.firebaseFirestoreMethods;
        
        // Load static data from server
        await this.loadStaticData();
        
        // Check for stored session
        this.checkStoredSession();
        
        console.log('🔥 Firebase Client initialized and ready!');
    }

    async loadStaticData() {
        try {
            // Load achievements definitions
            const achievementsResponse = await fetch('/api/achievements-list');
            this.achievements = await achievementsResponse.json();
            
            // Load max scores
            const maxScoresResponse = await fetch('/api/max-scores');
            this.maxScores = await maxScoresResponse.json();
            
            // Load cursed insults
            const insultsResponse = await fetch('/api/insults');
            this.cursedInsults = await insultsResponse.json();
            
            console.log('📊 Static data loaded successfully');
        } catch (error) {
            console.error('Failed to load static data:', error);
        }
    }

    checkStoredSession() {
        // Check if user was previously logged in
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                this.handleUserSignedIn(this.currentUser);
            } catch (error) {
                localStorage.removeItem('currentUser');
            }
        } else {
            this.handleUserSignedOut();
        }
    }

    handleUserSignedIn(user) {
        // Update UI to show user as logged in
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            userStatus.textContent = `Welcome, ${user.username}!`;
        }
        
        // Show user panel, hide login form
        if (window.showUserPanel) {
            window.showUserPanel();
        }
        
        // Check for admin privileges
        if (user.username.toLowerCase() === 'admin') {
            console.log('Admin user detected, granting privileges...');
            this.grantAchievement('admin-privilege');
            
            // Show admin panel - try multiple times to ensure DOM is ready
            const showAdminPanel = () => {
                const adminPanel = document.getElementById('admin-panel');
                if (adminPanel) {
                    console.log('Showing admin panel');
                    adminPanel.style.display = 'block';
                } else {
                    console.log('Admin panel element not found');
                }
            };
            
            // Try immediately and with delays
            showAdminPanel();
            setTimeout(showAdminPanel, 500);
            setTimeout(showAdminPanel, 1000);
            setTimeout(showAdminPanel, 2000);
        }
    }

    handleUserSignedOut() {
        // Update UI to show user as logged out
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            userStatus.textContent = 'Welcome, Nameless Gremlin!';
        }
        
        // Hide admin panel
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }
        
        // Show login form, hide user panel
        if (window.showLoginForm) {
            window.showLoginForm();
        }
    }

    // Register new user
    async register(username, password) {
        try {
            // Check if username already exists
            const usersQuery = this.firestoreMethods.query(
                this.firestoreMethods.collection(this.db, 'users'),
                this.firestoreMethods.where('username', '==', username)
            );
            
            const existingUsers = await this.firestoreMethods.getDocs(usersQuery);
            
            if (!existingUsers.empty) {
                return { success: false, error: 'Username already exists' };
            }
            
            // Hash the password
            const hashResponse = await fetch('/api/hash-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            const hashData = await hashResponse.json();
            if (!hashResponse.ok) {
                return { success: false, error: hashData.error || 'Failed to process password' };
            }
            
            // Create user document
            const userRef = await this.firestoreMethods.addDoc(
                this.firestoreMethods.collection(this.db, 'users'),
                {
                    username: username,
                    passwordHash: hashData.hashedPassword,
                    createdAt: this.firestoreMethods.serverTimestamp()
                }
            );
            
            // Set current user
            this.currentUser = { uid: userRef.id, username: username };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // Handle UI updates
            this.handleUserSignedIn(this.currentUser);
            
            // Grant first blood achievement
            await this.grantAchievement('first-blood');
            
            return { success: true, message: 'Welcome to the cursed realm!' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    }

    // Login user
    async login(username, password) {
        try {
            // Find user by username
            const usersQuery = this.firestoreMethods.query(
                this.firestoreMethods.collection(this.db, 'users'),
                this.firestoreMethods.where('username', '==', username)
            );
            
            const userDocs = await this.firestoreMethods.getDocs(usersQuery);
            
            if (userDocs.empty) {
                return { success: false, error: 'Invalid username or password' };
            }
            
            const userDoc = userDocs.docs[0];
            const userData = userDoc.data();
            
            // Verify password
            const verifyResponse = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    password: password, 
                    hashedPassword: userData.passwordHash 
                })
            });
            
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.isValid) {
                return { success: false, error: 'Invalid username or password' };
            }
            
            // Set current user
            this.currentUser = { uid: userDoc.id, username: userData.username };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // Handle UI updates
            this.handleUserSignedIn(this.currentUser);
            
            return { success: true, message: 'Welcome back, you cursed soul!' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    // Logout user
    async logout() {
        try {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.handleUserSignedOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Logout failed' };
        }
    }

    // Submit score
    async submitScore(game, score) {
        if (!this.currentUser) {
            return {
                success: false,
                error: 'You must be logged in to submit scores!',
                message: 'Create an account to save your shameful scores!'
            };
        }

        // Check for cheating
        if (score > this.maxScores[game]) {
            await this.grantAchievement('cheater-detected');
            return {
                success: false,
                message: 'Nice try, cheater! 🚨',
                insult: 'Your coding skills are as fake as your score!'
            };
        }

        // Check for death magnet achievement
        if (score < 10) {
            await this.grantAchievement('death-magnet');
        }

        try {
            // Save score
            await this.firestoreMethods.addDoc(
                this.firestoreMethods.collection(this.db, 'scores'),
                {
                    user_id: this.currentUser.uid,
                    username: this.currentUser.username,
                    game: game,
                    score: score,
                    created_at: this.firestoreMethods.serverTimestamp()
                }
            );

            // Get user rank
            const rank = await this.getUserRank(game, score);
            const insult = rank > 50 ? this.cursedInsults[Math.floor(Math.random() * this.cursedInsults.length)] : null;

            return {
                success: true,
                message: 'Score saved!',
                rank: rank,
                insult: insult
            };
        } catch (error) {
            console.error('Score submission error:', error);
            return { success: false, error: 'Failed to save score' };
        }
    }

    // Get user rank for a game
    async getUserRank(game, score) {
        try {
            const higherScoresQuery = this.firestoreMethods.query(
                this.firestoreMethods.collection(this.db, 'scores'),
                this.firestoreMethods.where('game', '==', game),
                this.firestoreMethods.where('score', '>', score)
            );
            
            const higherScores = await this.firestoreMethods.getDocs(higherScoresQuery);
            return higherScores.size + 1;
        } catch (error) {
            console.error('Error getting rank:', error);
            return 999;
        }
    }

    // Get leaderboard
    async getLeaderboard(game) {
        try {
            const scoresQuery = this.firestoreMethods.query(
                this.firestoreMethods.collection(this.db, 'scores'),
                this.firestoreMethods.where('game', '==', game)
            );
            
            const gameScores = await this.firestoreMethods.getDocs(scoresQuery);
            
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
                    if (data.created_at && userStats[username].last_played && 
                        data.created_at.seconds > userStats[username].last_played.seconds) {
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
            
            return leaderboard;
        } catch (error) {
            console.error('Leaderboard error:', error);
            return [];
        }
    }

    // Get user achievements
    async getUserAchievements() {
        if (!this.currentUser) {
            return [];
        }

        try {
            const achievementsQuery = this.firestoreMethods.query(
                this.firestoreMethods.collection(this.db, 'achievements'),
                this.firestoreMethods.where('user_id', '==', this.currentUser.uid)
            );
            
            const userAchievements = await this.firestoreMethods.getDocs(achievementsQuery);
            
            const achievements_list = userAchievements.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        ...this.achievements[data.achievement_name],
                        earned_at: data.earned_at
                    };
                })
                .sort((a, b) => {
                    // Sort by earned_at descending (newest first)
                    if (!a.earned_at) return 1;
                    if (!b.earned_at) return -1;
                    return b.earned_at.seconds - a.earned_at.seconds;
                });
            
            return achievements_list;
        } catch (error) {
            console.error('Achievements error:', error);
            return [];
        }
    }

    // Grant achievement
    async grantAchievement(achievementName) {
        if (!this.currentUser || !this.achievements[achievementName]) {
            return { success: false };
        }

        try {
            // Check if user already has this achievement
            const existingQuery = this.firestoreMethods.query(
                this.firestoreMethods.collection(this.db, 'achievements'),
                this.firestoreMethods.where('user_id', '==', this.currentUser.uid),
                this.firestoreMethods.where('achievement_name', '==', achievementName)
            );
            
            const existing = await this.firestoreMethods.getDocs(existingQuery);
            
            if (!existing.empty) {
                return { success: false }; // Already has achievement
            }

            // Grant achievement
            await this.firestoreMethods.addDoc(
                this.firestoreMethods.collection(this.db, 'achievements'),
                {
                    user_id: this.currentUser.uid,
                    achievement_name: achievementName,
                    earned_at: this.firestoreMethods.serverTimestamp()
                }
            );

            console.log(`Achievement '${achievementName}' granted!`);
            return {
                success: true,
                achievement: this.achievements[achievementName],
                message: `Achievement unlocked: ${this.achievements[achievementName].name}!`
            };
        } catch (error) {
            console.error('Failed to grant achievement:', error);
            return { success: false };
        }
    }

    // Unlock all achievements (admin only)
    async unlockAllAchievements() {
        console.log('unlockAllAchievements called');
        console.log('Current user:', this.currentUser);
        console.log('Available achievements:', this.achievements);
        
        if (!this.currentUser) {
            console.log('No current user');
            return { success: false, error: 'You must be logged in' };
        }
        
        if (this.currentUser.username.toLowerCase() !== 'admin') {
            console.log('User is not admin:', this.currentUser.username);
            return { success: false, error: 'Unauthorized - Admin access required' };
        }

        try {
            const allAchievements = Object.keys(this.achievements);
            console.log('All achievement keys:', allAchievements);
            
            if (allAchievements.length === 0) {
                return { success: false, error: 'No achievements defined' };
            }
            
            let unlocked = 0;
            let alreadyHad = 0;
            const errors = [];

            for (const achievementName of allAchievements) {
                console.log(`Granting achievement: ${achievementName}`);
                try {
                    const result = await this.grantAchievement(achievementName);
                    if (result.success) {
                        unlocked++;
                        console.log(`Successfully granted: ${achievementName}`);
                    } else {
                        alreadyHad++;
                        console.log(`Already had: ${achievementName}`);
                    }
                } catch (error) {
                    console.error(`Error granting ${achievementName}:`, error);
                    errors.push(`${achievementName}: ${error.message}`);
                }
            }

            const totalProcessed = unlocked + alreadyHad;
            console.log(`Processed ${totalProcessed} achievements: ${unlocked} new, ${alreadyHad} already had`);
            
            if (errors.length > 0) {
                console.error('Errors during unlock:', errors);
            }

            return {
                success: true,
                message: `Processing complete! Unlocked ${unlocked} new achievements (${alreadyHad} already owned)`
            };
        } catch (error) {
            console.error('Error unlocking achievements:', error);
            return { success: false, error: `Failed to unlock achievements: ${error.message}` };
        }
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.username.toLowerCase() === 'admin';
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize Firebase Client
const firebaseClient = new FirebaseClient();

// Make it available globally
window.firebaseClient = firebaseClient;
