
'use client';

import { useContext, useEffect, useState } from 'react';
import { M3uContext } from '@/contexts/M3uContext';
import { Progress } from './ui/progress';

export default function LoadingOverlay() {
  const { isLoading } = useContext(M3uContext);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      // Fast-fill to 95%
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 50); // Update every 50ms for a quick fill effect
    } else {
      // Once loading is done, fill to 100% and fade out
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
      }, 500); // Wait for animation to finish
    }

    return () => {
      clearInterval(timer);
    };
  }, [isLoading]);
  
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Aguarde para conexão com o servidor</h2>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
