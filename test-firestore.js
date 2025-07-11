const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
  console.log('✅ Service account loaded successfully');
} catch (error) {
  console.error('❌ Error loading service account:', error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'browsecade'
});

const db = admin.firestore();

async function testFirestore() {
  console.log('🔍 Testing Firestore connection...');
  
  try {
    // Test basic connection
    const testDoc = await db.collection('test').doc('connection-test').get();
    console.log('✅ Successfully connected to Firestore');
    
    // Test write operation
    await db.collection('test').doc('connection-test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Test connection successful'
    });
    console.log('✅ Write operation successful');
    
    // Test read operation
    const doc = await db.collection('test').doc('connection-test').get();
    if (doc.exists) {
      console.log('✅ Read operation successful');
      console.log('📄 Document data:', doc.data());
    }
    
    // Test query operation
    const snapshot = await db.collection('test').limit(1).get();
    console.log('✅ Query operation successful');
    console.log(`📊 Found ${snapshot.size} documents`);
    
    // Clean up test document
    await db.collection('test').doc('connection-test').delete();
    console.log('✅ Cleanup successful');
    
    console.log('🎉 All Firestore tests passed!');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    
    if (error.code === 'failed-precondition') {
      console.log('💡 Suggestion: Make sure Firestore is enabled in Firebase Console');
    }
    
    if (error.code === 'permission-denied') {
      console.log('💡 Suggestion: Check your Firestore security rules');
    }
  }
  
  process.exit(0);
}

testFirestore();
