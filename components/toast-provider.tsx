'use client';

import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

export function ToastProvider() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Get theme from document or localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const docTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(savedTheme || docTheme || 'dark');
  }, []);

  return (
    <Toaster
      position="top-right"
      theme={theme}
      richColors
      closeButton
      expand={false}
      duration={3000}
      toastOptions={{
        style: {
          border: '2px solid',
        },
        className: 'retro-card',
      }}
    />
  );
}

