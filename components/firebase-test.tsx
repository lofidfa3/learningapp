'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export function FirebaseTest() {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking...');
  const [userCount, setUserCount] = useState<number>(0);
  const [vocabCount, setVocabCount] = useState<number>(0);

  useEffect(() => {
    // Test Authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus(`✅ Authenticated as ${user.email}`);
        setUserCount(1);
      } else {
        setAuthStatus('❌ Not authenticated');
        setUserCount(0);
      }
    });

    // Test Firestore
    const testFirestore = async () => {
      try {
        // Test reading from a collection
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setFirestoreStatus('✅ Firestore connected');
        
        // Test reading user data if authenticated
        const currentUser = auth.currentUser;
        if (currentUser) {
          const vocabRef = collection(db, 'users', currentUser.uid, 'vocabulary');
          const vocabSnapshot = await getDocs(vocabRef);
          setVocabCount(vocabSnapshot.size);
        }
      } catch (error) {
        setFirestoreStatus(`❌ Firestore error: ${(error as any)?.message || 'Unknown error'}`);
      }
    };

    testFirestore();

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Firebase Connection Test</h3>
      <div className="space-y-2">
        <div>
          <strong>Authentication:</strong> {authStatus}
        </div>
        <div>
          <strong>Firestore:</strong> {firestoreStatus}
        </div>
        <div>
          <strong>Current User Vocabulary Count:</strong> {vocabCount}
        </div>
        <div>
          <strong>Firebase Project:</strong> linguanewes
        </div>
      </div>
    </div>
  );
}
