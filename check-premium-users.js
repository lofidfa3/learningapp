const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'linguanewes'
  });
}

const db = admin.firestore();

async function checkAndGrantPremium() {
  try {
    console.log('🔍 Checking existing users and subscriptions...');
    
    // Check users collection
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} users in users collection`);
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`👤 User ${doc.id}:`, {
        email: userData.email,
        subscription: userData.subscription?.status || 'none',
        createdAt: userData.createdAt?.toDate?.() || 'unknown'
      });
    });
    
    // Check customers collection
    const customersSnapshot = await db.collection('customers').get();
    console.log(`💳 Found ${customersSnapshot.size} customers`);
    
    customersSnapshot.forEach(doc => {
      const customerData = doc.data();
      console.log(`💳 Customer ${doc.id}:`, {
        email: customerData.email,
        stripeId: customerData.stripeId,
        updated: customerData.updated?.toDate?.() || 'unknown'
      });
    });
    
    // Grant premium to imsry51@gmail.com user
    const targetUserId = 'NfNbSBd2vjTPeJ5iRKXSyG6KQa63';
    const targetEmail = 'imsry51@gmail.com';
    
    console.log(`\n🎯 Granting premium access to ${targetEmail} (${targetUserId})...`);
    
    // Update user profile
    await db.collection('users').doc(targetUserId).set({
      subscription: {
        status: 'premium',
        stripeCustomerId: `manual_customer_${targetUserId}`,
        stripeSubscriptionId: 'manual_premium_1year',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        updated: admin.firestore.FieldValue.serverTimestamp(),
        source: 'manual_grant_double_payment'
      }
    }, { merge: true });
    
    // Create customer document
    await db.collection('customers').doc(targetUserId).set({
      email: targetEmail,
      stripeId: `manual_customer_${targetUserId}`,
      updated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // Create subscription document
    await db.collection('customers').doc(targetUserId).collection('subscriptions').doc('manual_premium_1year').set({
      id: 'manual_premium_1year',
      customer: `manual_customer_${targetUserId}`,
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      price: 'price_1SHuT8KG36KCQ0Q54bupdoVU',
      items: [{ price: 'price_1SHuT8KG36KCQ0Q54bupdoVU', quantity: 1 }],
      created: admin.firestore.FieldValue.serverTimestamp(),
      source: 'manual_grant_double_payment'
    }, { merge: true });
    
    console.log('✅ Premium access granted successfully!');
    
    // Verify the grant
    const userDoc = await db.collection('users').doc(targetUserId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('🔍 Verification - User subscription status:', userData.subscription?.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndGrantPremium().then(() => {
  console.log('🎉 Script completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
