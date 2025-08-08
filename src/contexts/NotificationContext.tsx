'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useXtream } from './XtreamContext';
import {
  Notification,
  UserRequestStatus,
  getUserNotifications,
  getUserRequests,
  markNotificationAsRead,
  initializeMessaging,
  saveUserFCMToken,
} from '@/lib/notifications';

interface NotificationContextType {
  notifications: Notification[];
  userRequests: UserRequestStatus[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  initializeNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequestStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo } = useXtream();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Inicializar sistema de notificações
  const initializeNotifications = async () => {
    if (!userInfo?.username) return;

    try {
      // Inicializar Firebase Messaging
      const token = await initializeMessaging();
      
      // Salvar o FCM token para o usuário atual
      if (token) {
        await saveUserFCMToken(userInfo.username, token);
      }
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    }
  };

  // Carregar notificações do usuário
  useEffect(() => {
    if (!userInfo?.username) {
      setNotifications([]);
      setUserRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Inicializar notificações push
    initializeNotifications();

    const unsubscribeNotifications = getUserNotifications(
      userInfo.username,
      (notifications) => {
        setNotifications(notifications);
        setIsLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar notificações:', error);
        setIsLoading(false);
      }
    );

    const unsubscribeRequests = getUserRequests(
      userInfo.username,
      (requests) => {
        setUserRequests(requests);
      },
      (error) => {
        console.error('Erro ao carregar pedidos do usuário:', error);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeRequests();
    };
  }, [userInfo?.username]);

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => markNotificationAsRead(n.id))
      );
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    userRequests,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    initializeNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
}
