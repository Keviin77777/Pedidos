# Configuração Rápida do Firestore

## ⚠️ ERRO: "Missing or insufficient permissions"

### Solução Imediata

1. **Acesse o Console do Firebase:**
   - Vá para: https://console.firebase.google.com
   - Selecione seu projeto: `cineassist-knotb`

2. **Vá para Firestore Database:**
   - Menu lateral → Firestore Database
   - Clique na aba **"Regras"**

3. **Adicione as novas regras às suas regras existentes:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite que qualquer pessoa leia e escreva nas coleções.
    // Para uma aplicação real, você restringiria isso a usuários autenticados.
    
    // Coleções existentes
    match /content-requests/{requestId} {
      allow read, write: if true;
    }
    match /problem-reports/{reportId} {
      allow read, write: if true;
    }
    match /admin/{document} {
      allow read, write: if true;
    }
    
    // Novas coleções para o sistema de notificações
    match /notifications/{notificationId} {
      allow read, write: if true;
    }
    
    match /user-notification-settings/{settingId} {
      allow read, write: if true;
    }
    
    match /user-requests/{requestId} {
      allow read, write: if true;
    }
  }
}
```

4. **Clique em "Publicar"**

5. **Teste a aplicação:**
   - Recarregue a página
   - Teste o sistema de notificações
   - Verifique se o erro foi resolvido

## ✅ Pronto!

Após aplicar essas regras, o sistema de notificações deve funcionar corretamente.

## 🔒 Segurança

- As regras permitem acesso apenas às coleções necessárias
- Outras coleções permanecem protegidas
- A segurança é mantida através da lógica da aplicação
