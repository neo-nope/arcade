const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // or use env vars if on Render

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
