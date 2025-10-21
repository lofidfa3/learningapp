#!/usr/bin/env node

/**
 * Automated Firestore Database Initialization
 * This script creates and configures the Firestore database if it doesn't exist
 */

const { execSync } = require('child_process');
const https = require('https');

const PROJECT_ID = 'linguanewes';
const DATABASE_ID = '(default)';

console.log('🔥 Initializing Firestore Database...\n');

// Function to execute shell commands
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Success\n');
    return output;
  } catch (error) {
    console.log('⚠️  Warning:', error.message, '\n');
    return null;
  }
}

// Function to check if database exists
function checkDatabaseExists() {
  console.log('🔍 Checking if Firestore database exists...');
  try {
    const result = execSync('firebase firestore:databases:list', { encoding: 'utf8' });
    const exists = result.includes('(default)');
    if (exists) {
      console.log('✅ Firestore database already exists\n');
      return true;
    } else {
      console.log('⚠️  Firestore database not found\n');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Could not check database status\n');
    return false;
  }
}

// Function to create a test document (this will auto-create the database)
async function createTestDocument() {
  console.log('📝 Creating test document to initialize database...');
  
  const script = `
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = {
  projectId: '${PROJECT_ID}',
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
};

try {
  initializeApp({
    credential: require('firebase-admin/app').cert(serviceAccount),
  });
  
  const db = getFirestore();
  
  db.collection('_init').doc('setup').set({
    initialized: true,
    timestamp: new Date().toISOString(),
  }).then(() => {
    console.log('✅ Test document created');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
  `;
  
  const fs = require('fs');
  fs.writeFileSync('/tmp/init-db.js', script);
  
  try {
    execSync('node /tmp/init-db.js', { 
      encoding: 'utf8', 
      stdio: 'inherit',
      env: process.env 
    });
    console.log('✅ Database initialized\n');
    return true;
  } catch (error) {
    console.log('⚠️  Could not create test document (this is OK if db exists)\n');
    return false;
  }
}

// Main execution
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 FIRESTORE INITIALIZATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Step 1: Check if database exists
  const exists = checkDatabaseExists();
  
  // Step 2: Deploy security rules
  runCommand(
    'firebase deploy --only firestore:rules --force',
    'Deploying Firestore security rules'
  );
  
  // Step 3: Create a test document if needed
  if (!exists) {
    console.log('💡 Creating initial document to activate database...');
    await createTestDocument();
  }
  
  // Step 4: Verify database is ready
  console.log('🔍 Verifying database status...');
  const verified = checkDatabaseExists();
  
  if (verified) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FIRESTORE DATABASE READY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  MANUAL ACTION REQUIRED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Please create the Firestore database manually:');
    console.log('1. Go to: https://console.firebase.google.com/project/linguanewes/firestore');
    console.log('2. Click "Create database"');
    console.log('3. Select "Start in production mode"');
    console.log('4. Choose location: us-central1 or europe-west1');
    console.log('5. Click "Enable"\n');
  }
}

main().catch(console.error);

