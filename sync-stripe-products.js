#!/usr/bin/env node

/**
 * Sync Stripe Products to Firestore
 * This script manually syncs Stripe products/prices to Firestore
 * for use with the Firebase Stripe Extension
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  admin.initializeApp({
    projectId: 'linguanewes',
  });
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Your Stripe product and price data
const PRODUCT = {
  id: 'prod_TENDUFNTcTNf9G',
  name: 'monthly subscription',
  description: 'monthly subscription',
  active: true,
  type: 'service',
  tax_code: 'txcd_20030000',
  images: [],
  metadata: {
    firebaseRole: 'premium',
  },
  role: 'premium', // This is used by Firebase Extension for custom claims
};

const PRICE = {
  id: 'price_1SHuT8KG36KCQ0Q54bupdoVU',
  active: true,
  billing_scheme: 'per_unit',
  currency: 'eur',
  type: 'recurring',
  unit_amount: 100, // €1.00
  recurring: {
    interval: 'month',
    interval_count: 1,
    trial_period_days: null,
    usage_type: 'licensed',
  },
  product: 'prod_TENDUFNTcTNf9G',
  tax_behavior: 'unspecified',
  metadata: {},
};

async function syncProducts() {
  console.log('🔄 Syncing Stripe products to Firestore...\n');

  try {
    // Create/Update product document
    console.log(`📦 Syncing product: ${PRODUCT.id}`);
    console.log(`   Name: ${PRODUCT.name}`);
    console.log(`   Active: ${PRODUCT.active}`);
    
    await db.collection('products').doc(PRODUCT.id).set({
      active: PRODUCT.active,
      name: PRODUCT.name,
      description: PRODUCT.description,
      role: PRODUCT.role,
      images: PRODUCT.images,
      metadata: PRODUCT.metadata,
      tax_code: PRODUCT.tax_code,
      type: PRODUCT.type,
    }, { merge: true });
    
    console.log('   ✅ Product synced to Firestore\n');

    // Create/Update price document
    console.log(`💰 Syncing price: ${PRICE.id}`);
    console.log(`   Amount: €${PRICE.unit_amount / 100}`);
    console.log(`   Interval: ${PRICE.recurring.interval}`);
    
    await db.collection('products').doc(PRODUCT.id).collection('prices').doc(PRICE.id).set({
      active: PRICE.active,
      billing_scheme: PRICE.billing_scheme,
      currency: PRICE.currency,
      type: PRICE.type,
      unit_amount: PRICE.unit_amount,
      recurring: PRICE.recurring,
      product: PRICE.product,
      tax_behavior: PRICE.tax_behavior,
      metadata: PRICE.metadata,
      description: PRODUCT.description,
    }, { merge: true });
    
    console.log('   ✅ Price synced to Firestore\n');

    // Verify sync
    console.log('🔍 Verifying sync...');
    const productDoc = await db.collection('products').doc(PRODUCT.id).get();
    const priceDoc = await db.collection('products').doc(PRODUCT.id).collection('prices').doc(PRICE.id).get();
    
    if (productDoc.exists && priceDoc.exists) {
      console.log('✅ Verification successful!');
      console.log('\n📊 Synced Data:');
      console.log('   Product:', productDoc.data());
      console.log('   Price:', priceDoc.data());
    } else {
      console.error('❌ Verification failed - documents not found');
    }

    console.log('\n✅ Sync complete!\n');
    console.log('🎯 Next steps:');
    console.log('   1. Go to your app: /pricing');
    console.log('   2. Click "Subscribe Now"');
    console.log('   3. Should now redirect to Stripe Checkout!\n');
    
  } catch (error) {
    console.error('\n❌ Error syncing products:', error.message);
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

syncProducts();

