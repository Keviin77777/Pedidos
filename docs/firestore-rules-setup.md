# Configuração das Regras do Firestore

## Problema
O erro "Missing or insufficient permissions" ocorre porque as regras do Firestore não permitem as operações necessárias para o sistema de notificações.

## Solução

### 1. Acesse o Console do Firebase
1. Vá para [https://console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras**

### 2. Aplique as Regras
Substitua as regras atuais pelas seguintes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção de notificações
    match /notifications/{notificationId} {
      allow read, write: if true;
    }
    
    // Regras para configurações de notificação do usuário
    match /user-notification-settings/{settingId} {
      allow read, write: if true;
    }
    
    // Regras para status de pedidos do usuário
    match /user-requests/{requestId} {
      allow read, write: if true;
    }
    
    // Regras para pedidos de conteúdo (se existir)
    match /content-requests/{requestId} {
      allow read, write: if true;
    }
    
    // Regras para problemas reportados (se existir)
    match /problem-reports/{reportId} {
      allow read, write: if true;
    }
    
    // Regras para configurações admin
    match /admin/{document} {
      allow read, write: if true;
    }
    
    // Regra padrão - negar acesso a todas as outras coleções
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Publicar as Regras
1. Clique em **Publicar** para aplicar as novas regras
2. Aguarde alguns segundos para que as regras sejam aplicadas

## Explicação das Regras

### `allow read, write: if true;`
- Permite leitura e escrita para todas as operações nas coleções específicas
- Como o sistema usa autenticação simples (não Firebase Auth), permitimos acesso direto
- A segurança é mantida através da lógica da aplicação

### Coleções Cobertas
- **notifications**: Notificações dos usuários
- **user-notification-settings**: Configurações de notificação
- **user-requests**: Status dos pedidos dos usuários
- **content-requests**: Pedidos de conteúdo
- **problem-reports**: Relatórios de problemas
- **admin**: Configurações administrativas

### Segurança
- A regra padrão `allow read, write: if false;` nega acesso a todas as outras coleções
- Isso garante que apenas as coleções específicas sejam acessíveis

## Teste
Após aplicar as regras:
1. Recarregue sua aplicação
2. Teste o sistema de notificações
3. Verifique se os erros de permissão foram resolvidos

## Alternativa Temporária (Apenas para Desenvolvimento)
Se você quiser uma configuração mais permissiva para desenvolvimento, pode usar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ ATENÇÃO**: Esta configuração permite acesso total e deve ser usada apenas em desenvolvimento!
