'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { XtreamAuthService, XtreamUserInfo } from '@/lib/xtream-auth';

interface XtreamContextType {
  userInfo: XtreamUserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAutoLoggingIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const XtreamContext = createContext<XtreamContextType | undefined>(undefined);

export function XtreamProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<XtreamUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  // Função para limpar cache do usuário (adaptado para web)
  const clearUserCache = () => {
    try {
      // Remove dados específicos do IPTV do localStorage
      const keysToRemove = [
        '@xtream_user',
        '@xtream_auth_state',
        '@unlocked_adult_categories',
        '@adult_movies_unlocked',
        '@stream_type',
        '@last_channel'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('Cache do usuário IPTV limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar cache do usuário:', error);
    }
  };

  // Detecta mudança de servidor/usuário
  const detectServerOrUserChange = (newUsername: string, newPassword: string): boolean => {
    try {
      const savedUser = localStorage.getItem('@xtream_user');
      
      if (savedUser) {
        const oldUserData = JSON.parse(savedUser);
        
        // Verifica se é um usuário diferente OU se as credenciais mudaram
        const isUserChanged = oldUserData.username !== newUsername;
        const isPasswordChanged = oldUserData.password !== newPassword;
        
        if (isUserChanged || isPasswordChanged) {
          console.log('🔄 Detectada mudança de usuário/servidor:', {
            oldUser: oldUserData.username,
            newUser: newUsername,
            userChanged: isUserChanged,
            passwordChanged: isPasswordChanged
          });
          
          // Limpa cache para novo usuário/servidor
          clearUserCache();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao detectar mudança de servidor/usuário:', error);
      return false;
    }
  };

  // Carrega credenciais salvas na inicialização
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        setIsLoading(true);
        const savedUser = localStorage.getItem('@xtream_user');
        
        if (savedUser) {
          const userData: XtreamUserInfo = JSON.parse(savedUser);
          
          // Verifica se a conta não expirou
          if (userData.exp_date && userData.exp_date !== "0") {
            const expDate = new Date(parseInt(userData.exp_date) * 1000);
            const now = new Date();
            
            if (expDate < now) {
              console.log('Conta IPTV expirada, removendo credenciais salvas');
              localStorage.removeItem('@xtream_user');
              localStorage.removeItem('@xtream_auth_state');
              clearUserCache();
              setUserInfo(null);
              setIsLoading(false);
              return;
            }
          }
          
          // Tenta fazer login automático com as credenciais salvas
          try {
            setIsAutoLoggingIn(true);
            console.log('Tentando login automático IPTV...');
            
            const freshUserData = await XtreamAuthService.login(userData.username, userData.password);
            
            setUserInfo(freshUserData);
            
            // Salva os dados atualizados
            localStorage.setItem('@xtream_user', JSON.stringify(freshUserData));
            localStorage.setItem('@xtream_auth_state', 'true');
            
            console.log('✅ Login automático IPTV realizado com sucesso');
          } catch (autoLoginError) {
            console.error('❌ Erro no login automático IPTV:', autoLoginError);
            
            // Se o login automático falhou, remove as credenciais salvas
            localStorage.removeItem('@xtream_user');
            localStorage.removeItem('@xtream_auth_state');
            clearUserCache();
            setUserInfo(null);
          } finally {
            setIsAutoLoggingIn(false);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar credenciais IPTV:', error);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCredentials();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Detecta se é um novo usuário/servidor e limpa cache se necessário
      detectServerOrUserChange(username, password);
      
      const userData = await XtreamAuthService.login(username, password);
      
      setUserInfo(userData);
      
      // Salva todos os dados no localStorage
      localStorage.setItem('@xtream_user', JSON.stringify(userData));
      localStorage.setItem('@xtream_auth_state', 'true');
      
      console.log('✅ Login IPTV realizado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no login IPTV:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const username = userInfo?.username;
      
      if (username) {
        // Notifica servidor sobre logout (se suportado)
        await XtreamAuthService.logout(username);
      }
      
      // Limpar estado local
      setUserInfo(null);
      
      // Limpar localStorage
      localStorage.removeItem('@xtream_user');
      localStorage.removeItem('@xtream_auth_state');
      
      // Limpar cache do usuário
      clearUserCache();
      
      console.log('✅ Logout IPTV realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout IPTV:', error);
      // Mesmo com erro, limpar dados locais
      setUserInfo(null);
      localStorage.removeItem('@xtream_user');
      localStorage.removeItem('@xtream_auth_state');
      clearUserCache();
    }
  };

  return (
    <XtreamContext.Provider
      value={{
        userInfo,
        isLoading,
        isAuthenticated: !!userInfo,
        isAutoLoggingIn,
        login,
        logout,
      }}
    >
      {children}
    </XtreamContext.Provider>
  );
}

export function useXtream() {
  const context = useContext(XtreamContext);
  if (context === undefined) {
    throw new Error('useXtream must be used within a XtreamProvider');
  }
  return context;
}