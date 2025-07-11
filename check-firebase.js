// Firebase Setup Checker
console.log('🔍 Checking Firebase setup...\n');

// Check if service account file exists
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  console.log('✅ firebase-service-account.json found');
  
  try {
    const serviceAccount = require('./firebase-service-account.json');
    console.log('✅ Service account file is valid JSON');
    console.log(`📝 Project ID: ${serviceAccount.project_id}`);
    console.log(`📧 Client Email: ${serviceAccount.client_email}`);
    
    // Check if it's the dummy config
    if (serviceAccount.private_key_id === 'dummy') {
      console.log('⚠️  Using dummy configuration - please replace with real credentials');
    } else {
      console.log('✅ Real credentials detected');
    }
  } catch (error) {
    console.log('❌ Invalid JSON in service account file');
    console.log('Error:', error.message);
  }
} else {
  console.log('❌ firebase-service-account.json not found');
  console.log('📋 Please create this file with your Firebase credentials');
}

// Check package.json dependencies
console.log('\n🔍 Checking dependencies...');
try {
  const packageJson = require('./package.json');
  const deps = packageJson.dependencies;
  
  if (deps['firebase-admin']) {
    console.log('✅ firebase-admin dependency found');
  } else {
    console.log('❌ firebase-admin dependency missing');
  }
  
  if (deps['firebase']) {
    console.log('✅ firebase dependency found');
  } else {
    console.log('❌ firebase dependency missing');
  }
} catch (error) {
  console.log('❌ Could not read package.json');
}

console.log('\n🔧 Next steps if setup is incomplete:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your "browsecade" project');
console.log('3. Go to Project Settings → Service Accounts');
console.log('4. Click "Generate new private key"');
console.log('5. Download the file and rename it to "firebase-service-account.json"');
console.log('6. Place it in your project root directory');
console.log('7. Run: npm install (if dependencies are missing)');
