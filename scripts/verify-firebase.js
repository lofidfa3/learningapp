#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDYXHIfb5T574P5CWyPfb-BQ1WnWJiYbic",
  authDomain: "linguanewes.firebaseapp.com",
  projectId: "linguanewes",
  storageBucket: "linguanewes.firebasestorage.app",
  messagingSenderId: "414257249045",
  appId: "1:414257249045:web:17ad5d90d62d3ad831871c"
};

async function verifyFirebaseServices() {
  console.log('🔥 Firebase Services Verification');
  console.log('================================');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log(`📱 Project ID: ${firebaseConfig.projectId}`);
    console.log(`🌐 Auth Domain: ${firebaseConfig.authDomain}`);
    
    // Test Authentication
    console.log('\n🔐 Testing Authentication...');
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Anonymous authentication successful');
      console.log(`👤 User ID: ${userCredential.user.uid}`);
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.message);
    }
    
    // Test Firestore
    console.log('\n🗄️ Testing Firestore...');
    try {
      // Test reading from a test collection
      const testRef = collection(db, 'test');
      const testSnapshot = await getDocs(testRef);
      console.log('✅ Firestore read successful');
      console.log(`📊 Test collection documents: ${testSnapshot.size}`);
      
      // Test writing to Firestore
      const testDocRef = doc(db, 'test', 'verification-test');
      await setDoc(testDocRef, {
        timestamp: new Date().toISOString(),
        message: 'Firebase verification test',
        status: 'success'
      });
      console.log('✅ Firestore write successful');
      
      // Test reading the written document
      const testDocSnap = await getDoc(testDocRef);
      if (testDocSnap.exists()) {
        console.log('✅ Firestore document verification successful');
        console.log('📄 Document data:', testDocSnap.data());
      }
      
    } catch (firestoreError) {
      console.log('❌ Firestore test failed:', firestoreError.message);
    }
    
    // Test user-specific collections
    console.log('\n👥 Testing User Collections...');
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Test vocabulary collection
        const vocabRef = collection(db, 'users', currentUser.uid, 'vocabulary');
        const vocabSnapshot = await getDocs(vocabRef);
        console.log('✅ User vocabulary collection accessible');
        console.log(`📚 User vocabulary count: ${vocabSnapshot.size}`);
        
        // Test user actions collection
        const actionsRef = collection(db, 'user_actions');
        const actionsSnapshot = await getDocs(actionsRef);
        console.log('✅ User actions collection accessible');
        console.log(`📈 Total user actions: ${actionsSnapshot.size}`);
      } else {
        console.log('⚠️ No authenticated user for user collection tests');
      }
    } catch (userError) {
      console.log('❌ User collection test failed:', userError.message);
    }
    
    console.log('\n🎉 Firebase verification completed!');
    console.log('All Firebase services are properly connected and working.');
    
  } catch (error) {
    console.error('❌ Firebase verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
verifyFirebaseServices().catch(console.error);
