# Sistema de Notificações

## Visão Geral

O sistema de notificações implementa um sistema completo de notificações push para o site de pedidos, permitindo que os usuários recebam notificações em tempo real sobre:

- Status dos seus pedidos
- Novos conteúdos adicionados
- Comunicados sobre seus pedidos
- Notificações personalizadas por usuário

## Funcionalidades

### 1. Notificações Push
- **Firebase Cloud Messaging**: Notificações push para desktop e mobile
- **Service Worker**: Processamento de notificações em background
- **Permissões**: Solicitação automática de permissão de notificações

### 2. Status de Pedidos
- **Acompanhamento Individual**: Cada usuário vê apenas seus próprios pedidos
- **Status em Tempo Real**: Atualizações automáticas de status
- **Histórico Completo**: Todos os pedidos com detalhes e observações

### 3. Notificações Personalizadas
- **Usuário Específico**: "Seu pedido X foi adicionado"
- **Geral**: "Novos pedidos adicionados" para outros usuários
- **Comunicados**: Mensagens específicas sobre pedidos

## Estrutura do Sistema

### Componentes Principais

1. **NotificationContext** (`src/contexts/NotificationContext.tsx`)
   - Gerencia estado das notificações
   - Carrega notificações do usuário
   - Inicializa Firebase Messaging

2. **NotificationBell** (`src/components/notification-bell.tsx`)
   - Sino de notificações com contador
   - Dropdown com lista de notificações
   - Marcar como lida

3. **StatusPedidosPage** (`src/app/(main)/status-pedidos/page.tsx`)
   - Página de status dos pedidos
   - Filtros por status
   - Detalhes completos dos pedidos

4. **NotificationPermission** (`src/components/notification-permission.tsx`)
   - Solicita permissão de notificações
   - Explica benefícios das notificações

### Banco de Dados (Firestore)

#### Coleções

1. **notifications**
   ```typescript
   {
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
   ```

2. **user-requests**
   ```typescript
   {
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
   ```

3. **user-notification-settings**
   ```typescript
   {
     userId: string;
     pushEnabled: boolean;
     emailEnabled: boolean;
     newContentNotifications: boolean;
     requestStatusNotifications: boolean;
     communicationNotifications: boolean;
     lastUpdated: string;
   }
   ```

## Configuração

### 1. Firebase Cloud Messaging

1. **Configurar Firebase Console**:
   - Acesse [Firebase Console](https://console.firebase.google.com)
   - Crie um projeto ou use existente
   - Ative Cloud Messaging

2. **Gerar VAPID Key**:
   - No Firebase Console, vá em Project Settings
   - Aba "Cloud Messaging"
   - Gere uma nova chave VAPID

3. **Configurar Service Worker**:
   - O arquivo `public/firebase-messaging-sw.js` já está configurado
   - Certifique-se de que as credenciais do Firebase estão corretas

### 2. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Firebase Cloud Messaging VAPID Key
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_vapid_key
```

## Como Usar

### Para Usuários

1. **Primeira Visita**: O sistema solicitará permissão para notificações
2. **Sino de Notificações**: Clique no sino para ver notificações
3. **Status de Pedidos**: Acesse "Status dos Pedidos" no menu lateral
4. **Notificações Push**: Receba notificações mesmo com o site fechado

### Para Administradores

1. **Adicionar Conteúdo**: Ao marcar um pedido como "Adicionado", o usuário recebe notificação
2. **Comunicar**: Ao enviar comunicado, o usuário recebe notificação específica
3. **Status Automático**: O sistema atualiza automaticamente o status dos pedidos

## Tipos de Notificação

### 1. Pedido Adicionado
- **Para o usuário**: "Seu pedido 'Nome do Conteúdo' foi adicionado"
- **Para outros**: "Novos pedidos adicionados"

### 2. Status de Pedido
- **Pendente**: "Seu pedido está sendo analisado"
- **Adicionado**: "Seu pedido foi adicionado com sucesso"
- **Comunicado**: "Há uma comunicação sobre seu pedido"

### 3. Comunicado
- **Mensagem específica**: "Recebemos uma comunicação sobre seu pedido: [mensagem]"

## Benefícios

### Para Usuários
- ✅ **Notificações em Tempo Real**: Saiba imediatamente quando seu pedido é processado
- ✅ **Acompanhamento Individual**: Veja apenas seus próprios pedidos
- ✅ **Notificações Push**: Receba notificações mesmo com o site fechado
- ✅ **Histórico Completo**: Acompanhe todos os seus pedidos

### Para Administradores
- ✅ **Comunicação Direta**: Envie comunicados específicos para usuários
- ✅ **Feedback Automático**: Sistema notifica automaticamente sobre mudanças
- ✅ **Controle Total**: Gerencie status e comunicações facilmente

## Segurança

- **Permissões**: Usuários controlam se querem receber notificações
- **Dados Privados**: Cada usuário vê apenas suas próprias notificações
- **Firebase Security Rules**: Configure regras de segurança no Firestore
- **HTTPS**: Notificações push só funcionam em HTTPS

## Troubleshooting

### Notificações não aparecem
1. Verifique se o usuário permitiu notificações
2. Confirme se o Firebase está configurado corretamente
3. Verifique se o service worker está registrado

### Erro de Firebase
1. Verifique as credenciais do Firebase
2. Confirme se o VAPID key está correto
3. Verifique se o projeto tem Cloud Messaging ativado

### Status não atualiza
1. Verifique a conexão com o Firestore
2. Confirme se as regras de segurança permitem leitura/escrita
3. Verifique se o usuário está logado corretamente
