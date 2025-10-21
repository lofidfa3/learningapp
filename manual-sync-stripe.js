#!/usr/bin/env node

/**
 * Manual Stripe Product Sync to Firestore
 * This creates the product and price in Firestore so the Firebase extension can use it
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

console.log('🔥 Syncing Stripe product to Firestore...\n');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: 'linguanewes',
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'your-client-email',
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

try {
  initializeApp({
    credential: require('firebase-admin/app').cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.error('❌ Firebase init failed:', error.message);
  console.log('\nTrying alternative initialization...\n');
  
  // Try without credentials for local emulator or if already initialized
  try {
    initializeApp();
    console.log('✅ Firebase initialized (alternative method)\n');
  } catch (e) {
    console.error('❌ Could not initialize Firebase:', e.message);
    process.exit(1);
  }
}

const db = getFirestore();

async function syncProduct() {
  try {
    // Product data FROM STRIPE
    const productId = 'prod_TEBaR9KSiD5mXS';
    const priceId = 'price_1SHjCrKG36KCQ0Q5SVzZTsm8';
    
    const productData = {
      active: true,
      name: 'linguanews monthly',
      description: 'Full access to translations, flashcards, Spotify lyrics, and all premium features',
      role: 'premium',
      images: [],
      metadata: {
        firebaseRole: 'premium',
      },
      tax_code: 'txcd_20030000',
      type: 'service',
    };
    
    const priceData = {
      active: true,
      billing_scheme: 'per_unit',
      currency: 'eur',
      interval: 'month',
      interval_count: 1,
      product: productId,
      recurring: {
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        usage_type: 'licensed',
      },
      type: 'recurring',
      unit_amount: 100, // €1.00
      tax_behavior: 'unspecified',
      metadata: {},
    };
    
    console.log('📦 Creating product in Firestore...');
    await db.collection('products').doc(productId).set(productData, { merge: true });
    console.log(`✅ Product created: ${productId}\n`);
    
    console.log('💰 Creating price in Firestore...');
    await db.collection('products').doc(productId)
      .collection('prices').doc(priceId).set(priceData, { merge: true });
    console.log(`✅ Price created: ${priceId}\n`);
    
    // Verify it was created
    console.log('🔍 Verifying...');
    const productDoc = await db.collection('products').doc(productId).get();
    const priceDoc = await db.collection('products').doc(productId)
      .collection('prices').doc(priceId).get();
    
    if (productDoc.exists && priceDoc.exists) {
      console.log('✅ Verification successful!\n');
      console.log('Product data:', productDoc.data());
      console.log('\nPrice data:', priceDoc.data());
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 SUCCESS! Product synced to Firestore');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Next steps:');
      console.log('1. Update your code to use product ID:', productId);
      console.log('2. Make sure price ID is:', priceId);
      console.log('3. Test subscription at: /test-subscription');
      console.log('');
    } else {
      console.error('❌ Verification failed - documents not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

syncProduct();

