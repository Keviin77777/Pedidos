'use client';

import { db, app } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';

// ======== TYPES ========

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'new_content' | 'request_added' | 'request_status' | 'communication';
  data?: {
    requestId?: string;
    contentTitle?: string;
    status?: string;
    message?: string;
  };
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface UserNotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  newContentNotifications: boolean;
  requestStatusNotifications: boolean;
  communicationNotifications: boolean;
  lastUpdated: string;
}

export interface UserRequestStatus {
  id: string;
  userId: string;
  requestId: string;
  requestTitle: string;
  status: 'Pendente' | 'Adicionado' | 'Comunicado';
  requestedAt: string;
  updatedAt?: string;
  addedToCategory?: string;
  addedObservation?: string;
  communicatedMessage?: string;
  communicatedAt?: string;
}

// ======== COLLECTIONS ========
const notificationsCollection = collection(db, 'notifications');
const userSettingsCollection = collection(db, 'user-notification-settings');
const userRequestsCollection = collection(db, 'user-requests');

// ======== HELPER FUNCTIONS ========

// Função para converter timestamp de forma segura
const convertTimestamp = (timestamp: any): string => {
  if (!timestamp) {
    return new Date().toISOString();
  }
  
  // Se já é uma string ISO
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // Se é um Timestamp do Firestore
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // Fallback
  return new Date().toISOString();
};

// ======== FIREBASE MESSAGING ========

let messaging: Messaging | null = null;
let fcmToken: string | null = null;

// Inicializar Firebase Messaging
const initializeMessaging = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
                 // Registrar o service worker primeiro
           const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
     
           // Solicitar permissão para notificações
           const permission = await Notification.requestPermission();
           
           if (permission === 'granted') {
             try {
               // Usar VAPID key pública (rotacionada periodicamente)
               const vapidKey = "BIaVes_ZLFFzeJ4LB_s28XBdAfnhhJhgoEcS0lAUZq7-qVSnv9ko9ouz84OrYMwyLCOJp1JO5giNuvPgOYnG2WQ";
         
               // Inicializar messaging após a permissão
               messaging = getMessaging(app);
               
               // Obter token FCM
               let token;
               try {
                 token = await getToken(messaging, {
                   vapidKey,
                   serviceWorkerRegistration: registration
                 });
               } catch (vapidError) {
                 token = await getToken(messaging, {
                   serviceWorkerRegistration: registration
                 });
               }
               
               if (!token) {
                 return null;
               }
               
               fcmToken = token;
               
               // Salvar o token no Firestore para enviar notificações push
               await saveFCMToken(token);
               
               return token;
             } catch (tokenError) {
               return null;
             }
           }
           return null;
         } catch (error) {
           return null;
         }
  }
  return null;
};

// Salvar FCM token do usuário
const saveFCMToken = async (token: string) => {
  try {
    // Importar dinamicamente para evitar problemas de SSR
    const XtreamContext = await import('@/contexts/XtreamContext');
    // Por enquanto, vamos salvar o token sem o userId específico
    // O userId será definido quando o usuário fizer login
    const tokenRef = doc(db, 'fcm-tokens', 'default');
    await setDoc(tokenRef, {
      token,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar FCM token:', error);
  }
};

// Salvar FCM token para um usuário específico
export const saveUserFCMToken = async (userId: string, token: string) => {
  try {
    const tokenRef = doc(db, 'fcm-tokens', userId);
    await setDoc(tokenRef, {
      token,
      userId,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar FCM token do usuário:', error);
  }
};

// Enviar notificação push via FCM
const sendPushNotification = async (userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) => {
  try {
    // Buscar o FCM token do usuário
    const tokenRef = doc(db, 'fcm-tokens', userId);
    const tokenDoc = await getDoc(tokenRef);
    
    if (!tokenDoc.exists()) {
      return;
    }
    
    const tokenData = tokenDoc.data();
    if (!tokenData.token) {
      return;
    }
    
    // Enviar notificação via FCM
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenData.token,
        notification: {
          title: notification.title,
          body: notification.body,
          data: {
            ...notification.data,
            type: notification.type,
            userId: notification.userId
          }
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      
      // Se o token estiver inválido, tentar obter um novo
      if (errorData.error && errorData.error.includes('Token FCM inválido')) {
        try {
          const newToken = await initializeMessaging();
          if (newToken) {
            await saveUserFCMToken(userId, newToken);
            
            // Tentar enviar novamente com o novo token
            const retryResponse = await fetch('/api/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: newToken,
                notification: {
                  title: notification.title,
                  body: notification.body,
                  data: {
                    ...notification.data,
                    type: notification.type,
                    userId: notification.userId
                  }
                }
              })
            });
            
            if (!retryResponse.ok) {
              console.error('Falha ao enviar notificação mesmo com novo token');
            }
          }
        } catch (tokenError) {
          console.error('Erro ao tentar obter novo token FCM:', tokenError);
        }
      }
      
      // Não falhar se a notificação push não funcionar
      // A notificação local ainda será enviada
      return;
    }
    
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
    // Não falhar se a notificação push não funcionar
    // A notificação local ainda será enviada
  }
};

// ======== NOTIFICATION FUNCTIONS ========

// Salvar notificação no Firestore
export const saveNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await addDoc(notificationsCollection, {
      ...notification,
      createdAt: serverTimestamp(),
    });
    
    // Enviar notificação push via FCM
    await sendPushNotification(notification.userId, notification);
    
    // Enviar notificação local se o service worker estiver disponível
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Verificar se as notificações estão permitidas
        if (Notification.permission === 'granted') {
          await registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: {
              ...notification.data,
              type: notification.type,
              userId: notification.userId
            },
            tag: 'pedidos-cine-notification',
            requireInteraction: true
          });
        }
      } catch (error) {
        console.error('Erro ao enviar notificação local:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao salvar notificação:', error);
    throw error;
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(notificationsCollection, notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
};

// Obter notificações de um usuário
export const getUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const notification: Notification = {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        data: data.data,
        read: data.read,
        createdAt: convertTimestamp(data.createdAt),
        expiresAt: data.expiresAt ? convertTimestamp(data.expiresAt) : undefined,
      };
      notifications.push(notification);
    });
    callback(notifications);
  }, onError);
};

// ======== USER REQUEST STATUS FUNCTIONS ========

// Salvar status de pedido do usuário
export const saveUserRequestStatus = async (userRequest: Omit<UserRequestStatus, 'id'>): Promise<void> => {
  try {
    await addDoc(userRequestsCollection, {
      ...userRequest,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao salvar status de pedido:', error);
    throw error;
  }
};

// Atualizar status de pedido do usuário
export const updateUserRequestStatus = async (
  requestId: string,
  status: UserRequestStatus['status'],
  additionalData?: {
    addedToCategory?: string;
    addedObservation?: string;
    communicatedMessage?: string;
  }
): Promise<void> => {
  try {
    // Buscar o documento na coleção user-requests pelo requestId
    const userRequestsSnap = await getDocs(
      query(userRequestsCollection, where('requestId', '==', requestId))
    );
    
    if (userRequestsSnap.empty) {
      console.warn(`Nenhum documento encontrado na coleção user-requests para requestId: ${requestId}`);
      return;
    }
    
    // Pegar o primeiro documento encontrado (deve ser único)
    const userRequestDoc = userRequestsSnap.docs[0];
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    await updateDoc(userRequestDoc.ref, updateData);
  } catch (error) {
    console.error('Erro ao atualizar status de pedido:', error);
    throw error;
  }
};

// Obter pedidos de um usuário
export const getUserRequests = (
  userId: string,
  callback: (requests: UserRequestStatus[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    userRequestsCollection,
    where('userId', '==', userId),
    orderBy('requestedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const requests: UserRequestStatus[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const request: UserRequestStatus = {
        id: doc.id,
        userId: data.userId,
        requestId: data.requestId,
        requestTitle: data.requestTitle,
        status: data.status,
        requestedAt: convertTimestamp(data.requestedAt),
        updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined,
        addedToCategory: data.addedToCategory,
        addedObservation: data.addedObservation,
        communicatedMessage: data.communicatedMessage,
        communicatedAt: data.communicatedAt ? convertTimestamp(data.communicatedAt) : undefined,
      };
      requests.push(request);
    });
    callback(requests);
  }, onError);
};

// ======== NOTIFICATION TRIGGERS ========

// Notificar quando um pedido é adicionado
export const notifyRequestAdded = async (
  userId: string,
  requestTitle: string,
  addedToCategory?: string
): Promise<void> => {
  try {
    // Notificação personalizada para o usuário que fez o pedido
    await saveNotification({
      userId,
      title: 'Pedido Adicionado!',
      body: `Seu pedido "${requestTitle}" foi adicionado${addedToCategory ? ` na categoria ${addedToCategory}` : ''}. Confira agora!`,
      type: 'request_added',
      data: {
        contentTitle: requestTitle,
        status: 'Adicionado',
      },
      read: false,
    });

    // Notificação geral para outros usuários
    const allUsers = await getAllUsers();
    for (const otherUserId of allUsers) {
      if (otherUserId !== userId) {
        await saveNotification({
          userId: otherUserId,
          title: 'Novos Conteúdos Adicionados',
          body: 'Novos pedidos foram adicionados. Confira as novidades!',
          type: 'new_content',
          data: {
            status: 'new_content',
          },
          read: false,
        });
      }
    }
  } catch (error) {
    console.error('Erro ao enviar notificação de pedido adicionado:', error);
  }
};

// Notificar quando um pedido recebe comunicação
export const notifyRequestCommunication = async (
  userId: string,
  requestTitle: string,
  message: string
): Promise<void> => {
  try {
    await saveNotification({
      userId,
      title: 'Comunicado sobre seu pedido',
      body: `Recebemos uma comunicação sobre seu pedido "${requestTitle}": ${message}`,
      type: 'communication',
      data: {
        contentTitle: requestTitle,
        message,
      },
      read: false,
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de comunicação:', error);
  }
};

// Notificar mudança de status de pedido
export const notifyRequestStatusChange = async (
  userId: string,
  requestTitle: string,
  status: string
): Promise<void> => {
  try {
    let title = '';
    let body = '';

    switch (status) {
      case 'Pendente':
        title = 'Pedido em Análise';
        body = `Seu pedido "${requestTitle}" está sendo analisado.`;
        break;
      case 'Adicionado':
        title = 'Pedido Adicionado';
        body = `Seu pedido "${requestTitle}" foi adicionado com sucesso!`;
        break;
      case 'Comunicado':
        title = 'Comunicado sobre Pedido';
        body = `Há uma comunicação sobre seu pedido "${requestTitle}".`;
        break;
    }

    await saveNotification({
      userId,
      title,
      body,
      type: 'request_status',
      data: {
        contentTitle: requestTitle,
        status,
      },
      read: false,
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de mudança de status:', error);
  }
};

// Notificar exclusão de pedido
export const notifyRequestDeleted = async (
  userId: string,
  requestTitle: string
): Promise<void> => {
  try {
    await saveNotification({
      userId,
      title: 'Pedido Excluído',
      body: `Esse conteúdo já foi solicitado ou duplicado, refaça o pedido ou solicite outro!!!`,
      type: 'communication',
      data: {
        contentTitle: requestTitle,
        message: 'Pedido excluído por duplicação ou já solicitado',
      },
      read: false,
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de exclusão:', error);
  }
};

// ======== HELPER FUNCTIONS ========

// Remover pedido do usuário
export const deleteUserRequest = async (requestId: string): Promise<void> => {
  try {
    // Buscar o documento na coleção user-requests pelo requestId
    const userRequestsSnap = await getDocs(
      query(userRequestsCollection, where('requestId', '==', requestId))
    );
    
    if (userRequestsSnap.empty) {
      console.warn(`Nenhum documento encontrado na coleção user-requests para requestId: ${requestId}`);
      return;
    }
    
    // Excluir todos os pedidos do usuário relacionados
    for (const userRequestDoc of userRequestsSnap.docs) {
      await deleteDoc(userRequestDoc.ref);
    }
    
    // Também excluir o pedido da coleção content-requests (painel do admin)
    try {
      const contentRequestRef = doc(db, 'content-requests', requestId);
      await deleteDoc(contentRequestRef);
      console.log(`Pedido ${requestId} excluído da coleção content-requests`);
    } catch (error) {
      console.warn(`Erro ao excluir pedido ${requestId} da coleção content-requests:`, error);
      // Não falha se não conseguir excluir do content-requests
    }
  } catch (error) {
    console.error('Erro ao excluir pedido do usuário:', error);
    throw error;
  }
};

// Limpar todas as notificações de um usuário
export const clearAllNotifications = async (userId: string): Promise<void> => {
  try {
    const notificationsSnap = await getDocs(
      query(notificationsCollection, where('userId', '==', userId))
    );
    
    for (const notificationDoc of notificationsSnap.docs) {
      await deleteDoc(notificationDoc.ref);
    }
  } catch (error) {
    console.error('Erro ao limpar notificações:', error);
    throw error;
  }
};

// Obter todos os usuários (simplificado - você pode implementar conforme sua lógica)
const getAllUsers = async (): Promise<string[]> => {
  try {
    // Por enquanto, retorna uma lista vazia
    // Você pode implementar para buscar todos os usuários do seu sistema
    return [];
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    return [];
  }
};

// ======== EXPORTS ========

export { initializeMessaging };
