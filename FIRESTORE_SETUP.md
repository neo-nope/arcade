# Firestore Migration Setup

Your arcade application has been successfully migrated from SQLite to Firestore! 🔥

## What's Changed

- **Database**: SQLite → Firestore
- **Collections**: `users`, `scores`, `achievements`
- **Authentication**: Still using bcrypt for password hashing
- **Real-time**: Socket.io integration maintained
- **Firebase Analytics**: Added to track usage

## Setup Instructions

### 1. Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "browsecade" project
3. Navigate to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Rename it to `firebase-service-account.json`
7. Place it in your project root

### 2. Firestore Database

1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location

### 3. Environment Variables (Optional)

You can set the Firebase project ID as an environment variable:
```bash
export FIREBASE_PROJECT_ID=browsecade
```

### 4. Dependencies

All required Firebase dependencies are already in your `package.json`:
- `firebase-admin`: For server-side operations
- `firebase`: For client-side operations

## Running the Application

```bash
npm install
npm start
```

## Features Migrated

✅ User Registration & Login
✅ Score Submission & Leaderboards  
✅ Achievement System
✅ Real-time Updates
✅ Health Check Endpoint
✅ Firebase Analytics Integration

## Notes

- The client-side Firebase is initialized in `public/index.html`
- Server-side Firebase Admin SDK is configured in `server.js`
- All database operations now use Firestore instead of SQLite
- The old `cursed_arcade.db` file is no longer needed

## Troubleshooting

If you encounter any issues:

1. **Service Account Error**: Ensure `firebase-service-account.json` exists and has correct permissions
2. **Firestore Rules**: Make sure your Firestore security rules allow read/write access
3. **Project ID**: Verify the project ID in your configuration matches your Firebase project

Happy gaming! 🎮💀
