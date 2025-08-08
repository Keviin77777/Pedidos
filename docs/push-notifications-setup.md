# Configuração de Notificações Push

Este guia explica como configurar as notificações push para funcionar quando o site estiver fechado.

## 1. Configuração do Firebase

### 1.1 Obter a Chave do Servidor Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para **Configurações do Projeto** (ícone de engrenagem)
4. Clique na aba **Cloud Messaging**
5. Copie a **Chave do servidor** (Server key)

### 1.2 Configurar Variáveis de Ambiente

Adicione a chave do servidor ao seu arquivo `.env.local`:

```env
# Firebase Server Key (para enviar notificações push)
FIREBASE_SERVER_KEY=sua_chave_do_servidor_aqui
```

### 1.3 Verificar VAPID Key

Certifique-se de que a VAPID key está configurada:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=sua_vapid_key_aqui
```

## 2. Como Funciona

### 2.1 Notificações Push

O sistema agora suporta dois tipos de notificações:

1. **Notificações Locais**: Aparecem quando o site está aberto
2. **Notificações Push**: Aparecem mesmo quando o site está fechado

### 2.2 Fluxo de Notificações

1. **Usuário faz login** → FCM token é gerado e salvo
2. **Admin adiciona conteúdo** → Notificação é enviada via FCM
3. **Usuário recebe notificação** → Mesmo com site fechado
4. **Usuário clica na notificação** → Site abre na página correta

## 3. Tipos de Notificações

### 3.1 Pedido Adicionado
- **Para o usuário que fez o pedido**: "Seu pedido 'Nome do Conteúdo' foi adicionado"
- **Para outros usuários**: "Novos Conteúdos Adicionados"

### 3.2 Comunicado sobre Pedido
- **Para o usuário específico**: "Recebemos uma comunicação sobre seu pedido"

### 3.3 Status do Pedido
- **Pendente**: "Seu pedido está sendo analisado"
- **Adicionado**: "Seu pedido foi adicionado com sucesso"
- **Comunicado**: "Há uma comunicação sobre seu pedido"

### 3.4 Pedido Excluído
- **Para o usuário**: "Esse conteúdo já foi solicitado ou duplicado"

## 4. Testando as Notificações

### 4.1 Teste Local
1. Abra o site
2. Permita notificações quando solicitado
3. Faça login
4. Peça para alguém adicionar um conteúdo no painel admin
5. Verifique se a notificação aparece

### 4.2 Teste com Site Fechado
1. Abra o site e permita notificações
2. Faça login
3. Feche o site completamente
4. Peça para alguém adicionar um conteúdo
5. Verifique se a notificação push aparece

## 5. Solução de Problemas

### 5.1 Notificações não aparecem
- Verifique se as permissões estão concedidas
- Verifique se o FCM token foi gerado (console do navegador)
- Verifique se a chave do servidor está correta

### 5.2 Erro "FCM Token"
- Verifique se a VAPID key está configurada
- Verifique se o Firebase está configurado corretamente

### 5.3 Notificações não aparecem quando site fechado
- Verifique se o service worker está registrado
- Verifique se a chave do servidor está correta
- Verifique os logs do Firebase Console

## 6. Configuração do Service Worker

O service worker (`public/firebase-messaging-sw.js`) é responsável por:

- Receber notificações quando o site está fechado
- Mostrar notificações com ações
- Abrir o site na página correta quando clicado

## 7. Segurança

- A chave do servidor Firebase deve ser mantida segura
- Nunca exponha a chave do servidor no código do cliente
- Use variáveis de ambiente para todas as chaves

## 8. Monitoramento

Para monitorar as notificações:

1. **Firebase Console**: Verifique Analytics > Events
2. **Console do Navegador**: Verifique logs do service worker
3. **Logs do Servidor**: Verifique logs da API `/api/send-notification`
