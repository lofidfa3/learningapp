# 🔥 Firestore Security Rules for Stripe Extension

## Required Security Rules

You need to add these rules to your Firestore to allow the Stripe extension to work properly.

### How to Add Rules:

1. Go to: https://console.firebase.google.com/project/linguanewes/firestore/rules
2. Replace the existing rules with the rules below
3. Click **"Publish"**

---

## Complete Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Customers collection (Stripe extension)
    match /customers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Checkout sessions subcollection
      match /checkout_sessions/{id} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Subscriptions subcollection (read-only for users)
      match /subscriptions/{id} {
        allow read: if request.auth != null && request.auth.uid == userId;
      }
      
      // Payments subcollection (read-only for users)
      match /payments/{id} {
        allow read: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Products collection (Stripe extension - public read)
    match /products/{id} {
      allow read: if true;
      
      // Prices subcollection (public read)
      match /prices/{id} {
        allow read: if true;
      }
    }
  }
}
```

---

## What These Rules Do:

### ✅ Users Collection
- Users can read and write their own profile data
- Prevents users from accessing other users' data

### ✅ Customers Collection (Stripe Extension)
- Each user can only access their own customer data
- **checkout_sessions**: Users can create and read their checkout sessions
- **subscriptions**: Users can read their subscription status (read-only)
- **payments**: Users can view their payment history (read-only)

### ✅ Products Collection (Stripe Extension)
- Anyone can read products and prices
- Allows displaying pricing without authentication

---

## Important Notes:

⚠️ **The Stripe extension needs these permissions to function:**
- Create customer documents
- Create checkout sessions
- Update subscription status
- Record payment information

✅ **These rules are secure because:**
- Users can only access their own data
- Subscriptions and payments are read-only
- The Stripe extension runs with admin privileges

---

## After Adding Rules:

1. ✅ Publish the rules in Firebase Console
2. ✅ Wait 1-2 minutes for rules to propagate
3. ✅ Try subscribing again in your app

---

## Testing the Rules:

You can test the rules in the Firebase Console:
1. Go to: https://console.firebase.google.com/project/linguanewes/firestore/rules
2. Click the **"Rules Playground"** tab
3. Test different scenarios

---

**Once you've published these rules, your app will work with the Stripe extension!** 🎉

