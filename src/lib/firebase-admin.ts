import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Configuração do Firebase Admin SDK
const serviceAccount: ServiceAccount = {
  projectId: "cineassist-knotb",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9gnKpgsB2S7S9\ngoXQf58u3p7FduZgtLyq9bULTa9GAy9dVhBB8lawBUrRj0BSbc1CAulEVnVgcak+\n6k5nIJL0fY4b1JcWOGlfRrCadATzJl1UfRSzJ24HtB86pCpohPtDXWIQqBI8eaN9\nbK0QKq6ETYFbhFNq8OY4i/VGoRfSQ+2F9jS+WxDfBBevdRm4rMDo6iUGwTbkh7ZK\nMt+moRCQHLlznMaPD1EzrcrmxIG8Fn+EpIebkQB1MIpde6AmycMrs0cy0Z+rB4Wx\ndcDrzVSbriB0/uLYrESoYNw/0WwkzCzQulSBwwMV+1tZn1O9sj5edaungdLdGDPn\nhTSLFtUtAgMBAAECggEAEu1f6VkzQr1d8F2EYuYULniyj9NHwBndDBAdRGM+YbY4\nuVA6sHN1QABPUC3IBVONIA4tYRNnhrnjZvK84OTqeHu/wTzS2DfLImZrhgmXYveO\nc71IX3pNLXzKb69swuKhO8GsZTB8HckiUIkVods5ceJRzKOjNzeXLsefuC2ntOrC\nzOnqN0zr649VAs/8EkmSghlE2l2+8t46FgIldMBN7lm342YoQovCpD6MmsZGY/MA\n/mEy7A13ji27YuvNxrASBX4Axh3d2VoTB9z96sGODQDgwbDLQUL9ca+T7aQRBRa6\nhi3ON/yeqlR+yXh1JHP2x7C0peTgEsIovCEkB5y5SwKBgQDqo/nr+Nox47fFZX8H\nR/n8kjO9Sv/zRO7V1v9E0CKBQigxkVbBfp42Zm6edRQbizZJeR+BVSR03nDvnSYw\nEKGvULSLLDTSOgaugtYrIKxF2qTBk5618Llg3lQY3wO5bBNmx3XWmlKMosI+jEU6\nLLM1ryQTE/UAEnVWtCewz+jZ0wKBgQDOwr8/KU8TBPLaRYq3oj8BwW9mwBelzoX3\n7UboTQd1zFYGWBzZcpv2fLXIe9LPbe6WKhjGAZLeopF4gPd8YyH31IBvZyvzE7oX\n+L9QB5N24majyn5uBf7yi/XmAJJNUhXQWHRACfD+mM1ljLYzlB71dLEwcJqIdMdf\n0c7kAx00/wKBgQC+V37qOdlnFz+A1jESCwV0KnXmXOz8vzKwLdSuUdlr2esZKrmi\nBcD6iGW8DWXeYjQLrkIsfJEybTBYcLcFzrgaq/GJ5LaEw6Wf82shWUPm9tMoZUQe\ne8UmG7VE58TxqgajHbMt/8pvY6kHbGrMIm7OYeF1yH67LD4bs9Fu0XonGQKBgQCb\nWiSMdqNdbQh0DHBwDc49qXPkxkx+XrC2Wmg+vzHtxryUQ7xZfg3FpGqJ2s/I35a2\n6aZ3kFMkSQ34dx59LZcmOVrPWbviBl57CIHmxep9Fxt70fgw/vxSjesTCDblNdoC\nE5Q1UcLr6S/bL2DvXEnur+E6vkC+atArJN/I3rYhTQKBgAmwgWFN6ClqXIv0LeXM\nUQ+mKbfoVjgFJNQoUmPCQdBSA0FQCem8I1brCB6aiFhAeq5nmEY8YfsU+34+MzZr\naPaOBzxGK4AAUfOm21DAy0HCdxD6YJ6Lo2qL/ndz7vuwYsQUzakwsZCLTqLF7GXM\n+bG3U5jsaHJwPdJDBH0c/l0K\n-----END PRIVATE KEY-----\n",
  clientEmail: "firebase-adminsdk-fbsvc@cineassist-knotb.iam.gserviceaccount.com"
};

// Inicializar Firebase Admin SDK
let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: 'cineassist-knotb'
  });
} else {
  adminApp = getApps()[0];
}

// Exportar instâncias
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminMessaging = getMessaging(adminApp);

// Função para enviar notificação diretamente via Firebase Admin SDK
export const sendNotificationViaAdmin = async (token: string, notification: any) => {
  try {
    const message = {
      token: token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      android: {
        priority: 'high' as const,
        notification: {
          icon: '/favicon.ico',
          color: '#FF0000',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    return await adminMessaging.send(message);
  } catch (error) {
    throw error;
  }
};
