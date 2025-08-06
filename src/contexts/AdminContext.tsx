'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminCredentials {
  username: string;
  password: string;
}

interface AdminContextType {
  credentials?: AdminCredentials;
  updateCredentials?: (newCredentials: AdminCredentials) => Promise<void>;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  isReady: boolean;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Função para inicializar credenciais padrão no Firebase
const initializeDefaultCredentials = async () => {
  try {
    const adminDocRef = doc(db, 'admin', 'credentials');
    const docSnap = await getDoc(adminDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(adminDocRef, {
        username: 'admin',
        password: 'admin'
      });
              // Credenciais padrão inicializadas no Firebase
    }
  } catch (error) {
    console.error('Erro ao inicializar credenciais padrão:', error);
  }
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<AdminCredentials>({ username: 'admin', password: 'admin' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Função para carregar estado de autenticação do localStorage
  const loadAuthState = () => {
    try {
      const savedAuthState = localStorage.getItem('adminAuthState');
      if (savedAuthState === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao carregar estado de autenticação:', error);
    }
  };

  // Função para salvar estado de autenticação no localStorage
  const saveAuthState = (authenticated: boolean) => {
    try {
      localStorage.setItem('adminAuthState', authenticated.toString());
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Erro ao salvar estado de autenticação:', error);
      setIsAuthenticated(authenticated);
    }
  };

  // Marcar como montado no cliente e carregar estado de autenticação
  useEffect(() => {
    setMounted(true);
    loadAuthState();
  }, []);

  // Carregar credenciais do Firebase com fallback para localStorage
  useEffect(() => {
    if (!mounted) return;
    
    let unsubscribe: (() => void) | undefined;
    
    const loadCredentials = async () => {
      try {
        // Primeiro, verificar localStorage para carregar rapidamente
        const localCredentials = localStorage.getItem('adminCredentials');
        if (localCredentials) {
          const parsed = JSON.parse(localCredentials);
          setCredentials(parsed);
        }

        // Depois, inicializar e sincronizar com Firebase
        await initializeDefaultCredentials();
        
        const adminDocRef = doc(db, 'admin', 'credentials');
        
        unsubscribe = onSnapshot(adminDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const newCredentials = {
              username: data.username || 'admin',
              password: data.password || 'admin'
            };
            setCredentials(newCredentials);
            // Sincronizar com localStorage
            localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
            // Credenciais sincronizadas do Firebase
          }
          setIsLoading(false);
        }, (error) => {
          console.warn('Erro no Firebase, usando credenciais locais:', error);
          // Se Firebase falhar, usar localStorage ou padrão
          if (!localCredentials) {
            const defaultCredentials = { username: 'admin', password: 'admin' };
            setCredentials(defaultCredentials);
            localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Erro ao conectar Firebase:', error);
        // Fallback completo para localStorage
        const localCredentials = localStorage.getItem('adminCredentials');
        if (localCredentials) {
          const parsed = JSON.parse(localCredentials);
          setCredentials(parsed);
        } else {
          const defaultCredentials = { username: 'admin', password: 'admin' };
          setCredentials(defaultCredentials);
          localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
        }
        setIsLoading(false);
      }
    };

    loadCredentials();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [mounted]);

  const updateCredentials = async (newCredentials: AdminCredentials) => {
    try {
      // 1. Atualizar estado local imediatamente
      setCredentials(newCredentials);
      
      // 2. Salvar no localStorage como backup
      localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
      
      // 3. Sincronizar com Firebase
      const adminDocRef = doc(db, 'admin', 'credentials');
      await setDoc(adminDocRef, newCredentials);
      
              // Credenciais atualizadas e sincronizadas com Firebase
    } catch (error) {
              // Erro ao atualizar credenciais
      throw error;
    }
  };

  // Sempre fornecer o contexto, mesmo durante o loading
  const isReady = mounted && !isLoading;
  
  return (
    <AdminContext.Provider value={{
      credentials: isReady ? credentials : undefined,
      updateCredentials: isReady ? updateCredentials : undefined,
      isAuthenticated,
      setIsAuthenticated: saveAuthState,
      isLoading,
      isReady,
    }}>
      {(!mounted || isLoading) ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
} 