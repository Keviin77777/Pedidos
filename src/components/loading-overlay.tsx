
'use client';

import { useState, useEffect, useContext } from 'react';
import { M3uContext } from '@/contexts/M3uContext';
import { Progress } from './ui/progress';

export default function LoadingOverlay() {
  const { isLoading } = useContext(M3uContext);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress(oldProgress => {
          if (oldProgress >= 95) {
            return 95;
          }
          return Math.min(oldProgress + Math.random() * 20, 95);
        });
      }, 300);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
      setTimeout(() => setVisible(false), 500);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center gap-4 transition-opacity duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          CineAssist
        </h2>
        <p className="text-muted-foreground">Aguarde para conexão com o servidor...</p>
      </div>
      <Progress value={progress} className="w-1/4 max-w-xs" />
    </div>
  );
}
