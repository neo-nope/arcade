const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });

    console.log('✓ Firebase Admin SDK initialized successfully');
    console.log('Project ID:', serviceAccount.project_id);
    console.log('Service Account Email:', serviceAccount.client_email);
    
    const db = admin.firestore();
    console.log('✓ Firestore instance created');

    // Test Firestore connection
    async function testFirestore() {
        try {
            console.log('\n--- Testing Firestore Connection ---');
            
            // Test 1: Write a test document
            const testRef = db.collection('test').doc('connection-test');
            await testRef.set({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                message: 'Connection test successful'
            });
            console.log('✓ Test document written successfully');
            
            // Test 2: Read the test document
            const testDoc = await testRef.get();
            if (testDoc.exists) {
                console.log('✓ Test document read successfully');
                console.log('Document data:', testDoc.data());
            } else {
                console.log('✗ Test document not found');
            }
            
            // Test 3: Delete the test document
            await testRef.delete();
            console.log('✓ Test document deleted successfully');
            
            // Test 4: Check if users collection exists
            const usersSnapshot = await db.collection('users').limit(1).get();
            console.log('✓ Users collection accessible');
            console.log('Users collection size:', usersSnapshot.size);
            
            // Test 5: Check if scores collection exists
            const scoresSnapshot = await db.collection('scores').limit(1).get();
            console.log('✓ Scores collection accessible');
            console.log('Scores collection size:', scoresSnapshot.size);
            
            console.log('\n✅ All Firestore tests passed!');
            
        } catch (error) {
            console.error('❌ Firestore test failed:', error.message);
            console.error('Error code:', error.code);
            console.error('Error details:', error.details);
            
            // Provide specific troubleshooting advice
            if (error.code === 16 || error.message.includes('UNAUTHENTICATED')) {
                console.log('\n🔍 Troubleshooting UNAUTHENTICATED error:');
                console.log('1. Verify the service account has the correct roles:');
                console.log('   - Firebase Admin SDK Administrator Service Agent');
                console.log('   - Cloud Datastore User (or Editor/Owner)');
                console.log('2. Ensure Firestore is enabled in Firebase Console');
                console.log('3. Check if the service account is active');
                console.log('4. Verify the project ID matches your Firebase project');
            }
            
            if (error.code === 7 || error.message.includes('PERMISSION_DENIED')) {
                console.log('\n🔍 Troubleshooting PERMISSION_DENIED error:');
                console.log('1. Check Firestore security rules');
                console.log('2. Verify service account permissions');
                console.log('3. Ensure Firestore is properly configured');
            }
        }
    }
    
    testFirestore().then(() => {
        console.log('\n--- Test completed ---');
        process.exit(0);
    }).catch((error) => {
        console.error('Test failed:', error);
        process.exit(1);
    });
    
} catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
}
