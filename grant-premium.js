const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "linguanewes.firebaseapp.com",
  projectId: "linguanewes",
  storageBucket: "linguanewes.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

async function grantPremiumAccess() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const userId = 'NfNbSBd2vjTPeJ5iRKXSyG6KQa63'; // imsry51@gmail.com
    const userEmail = 'imsry51@gmail.com';

    console.log('👑 Granting premium access to:', userEmail);

    // Create/update customer document
    const customerRef = doc(db, 'customers', userId);
    await setDoc(customerRef, {
      email: userEmail,
      stripeId: `manual_customer_${userId}`,
      createdAt: serverTimestamp(),
    }, { merge: true });
    console.log('✅ Created customer document');

    // Create/update subscription document
    const subscriptionRef = doc(db, 'customers', userId, 'subscriptions', 'manual_premium_paid_twice');
    await setDoc(subscriptionRef, {
      id: 'manual_premium_paid_twice',
      customer: `manual_customer_${userId}`,
      status: 'active',
      cancel_at_period_end: false,
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      price: 'price_1SHuT8KG36KCQ0Q54bupdoVU',
      items: [{ price: 'price_1SHuT8KG36KCQ0Q54bupdoVU', quantity: 1 }],
      created: serverTimestamp(),
      source: 'manual_grant_paid_twice',
      notes: 'User paid twice, granted premium access manually',
    }, { merge: true });
    console.log('✅ Created subscription document');

    // Update user's profile in 'users' collection
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email: userEmail,
      subscription: {
        status: 'premium',
        stripeCustomerId: `manual_customer_${userId}`,
        stripeSubscriptionId: 'manual_premium_paid_twice',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        activatedAt: serverTimestamp(),
        source: 'manual_grant',
        notes: 'Granted premium access due to double payment',
      },
    }, { merge: true });
    console.log('✅ Updated user profile with premium status');

    console.log('🎉 Premium access granted successfully!');
    console.log('User:', userEmail);
    console.log('UID:', userId);
    console.log('Status: Premium Active');
    console.log('Duration: 1 year (due to double payment)');

  } catch (error) {
    console.error('❌ Error granting premium access:', error);
  }
}

grantPremiumAccess();
