'use client';

import { useState, useEffect } from 'react';
import { UserDataManager, createUserDataManager } from './user-data';

// Hook for using user data in React components
export function useUserData(userId: string | null) {
  const [userDataManager, setUserDataManager] = useState<UserDataManager | null>(null);

  useEffect(() => {
    if (userId) {
      setUserDataManager(createUserDataManager(userId));
    } else {
      setUserDataManager(null);
    }
  }, [userId]);

  return userDataManager;
}

