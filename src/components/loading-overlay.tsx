
'use client';

import { useContext, useEffect, useState } from 'react';
import { M3uContext } from '@/contexts/M3uContext';
import { Progress } from './ui/progress';

export default function LoadingOverlay() {
  const { isInitialLoading } = useContext(M3uContext);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(isInitialLoading);

  useEffect(() => {
    // Only show the overlay if it's the initial load.
    if (!isInitialLoading) {
       // Start the fade-out process
       setProgress(100);
       const timer = setTimeout(() => {
         setVisible(false);
       }, 500); // Wait for animation to finish
       return () => clearTimeout(timer);
    }
    
    // If it is loading, run the progress bar animation
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(timer);
          return 95;
        }
        return prev + 5;
      });
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [isInitialLoading]);
  
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isInitialLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Aguarde para conexão com o servidor</h2>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
