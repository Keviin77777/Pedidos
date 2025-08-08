// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyAMHnI0IsSaMKehzbVLRm-1KmL8iIdwkk8",
  authDomain: "cineassist-knotb.firebaseapp.com",
  projectId: "cineassist-knotb",
  storageBucket: "cineassist-knotb.firebasestorage.app",
  messagingSenderId: "1041433213591",
  appId: "1:1041433213591:web:428754d08842988c8e87d2",
  vapidKey: "BIaVes_ZLFFzeJ4LB_s28XBdAfnhhJhgoEcS0lAUZq7-qVSnv9ko9ouz84OrYMwyLCOJp1JO5giNuvPgOYnG2WQ"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Nova Notificação';
  const notificationBody = payload.notification?.body || payload.data?.body || 'Você tem uma nova notificação';
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/cine-pulse-logo.svg',
    badge: '/cine-pulse-logo.svg',
    data: payload.data || {},
    tag: 'pedidos-cine-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Abrir', icon: '/cine-pulse-logo.svg' },
      { action: 'close', title: 'Fechar' }
    ],
    silent: false,
    vibrate: [200, 100, 200],
    priority: 'high'
  };

  // Fechar notificações existentes com o mesmo tag
  self.registration.getNotifications().then(notifications => {
    notifications.forEach(notification => {
      if (notification.tag === 'pedidos-cine-notification') {
        notification.close();
      }
    });
  });

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    let urlToOpen = '/';
    
    if (event.notification.data) {
      const data = event.notification.data;
      
      if (data.type === 'request_status' || data.type === 'request_added' || data.type === 'communication') {
        urlToOpen = '/status-pedidos';
      }
      else if (data.type === 'new_content') {
        urlToOpen = '/pedidos-adicionados';
      }
    }
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Service Worker lifecycle
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));