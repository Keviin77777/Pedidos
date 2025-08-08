# Debug de Índices do Firestore

## ⚠️ Erro Persiste Mesmo com Índice Ativado

### Possíveis Causas:

1. **Índice para `notifications` não criado**
   - A consulta `getUserNotifications` usa `orderBy('createdAt', 'desc')`
   - Precisa de índice: `notifications` + `userId` (Ascending) + `createdAt` (Descending)

2. **Cache do navegador**
   - O erro pode estar em cache
   - Tente recarregar a página com Ctrl+F5

3. **Índice ainda não propagado**
   - Pode levar alguns minutos para propagar
   - Aguarde 5-10 minutos

### Solução Imediata:

#### 1. Criar Índice para `notifications`

1. **Acesse o Console do Firebase:**
   - Vá para: https://console.firebase.google.com
   - Selecione seu projeto: `cineassist-knotb`

2. **Vá para Firestore Database:**
   - Menu lateral → Firestore Database
   - Clique na aba **"Índices"**

3. **Clique em "Criar índice"**

4. **Configure o índice:**
   - **Coleção**: `notifications`
   - **Campos**: 
     - `userId` (Ascending)
     - `createdAt` (Descending)
   - **Tipo de consulta**: Collection

5. **Clique em "Criar"**

#### 2. Teste Temporário (Sem Ordenação)

Se quiser testar rapidamente, modifique temporariamente o código:

```javascript
// Em src/lib/notifications.ts, linha ~130
const q = query(
  notificationsCollection,
  where('userId', '==', userId),
  // orderBy('createdAt', 'desc') // Comente esta linha
);
```

```javascript
// Em src/lib/notifications.ts, linha ~210
const q = query(
  userRequestsCollection,
  where('userId', '==', userId),
  // orderBy('requestedAt', 'desc') // Comente esta linha
);
```

#### 3. Verificar Console do Navegador

1. **Abra o DevTools** (F12)
2. **Vá para a aba Console**
3. **Procure por erros específicos** que indiquem qual consulta está falhando

### Índices Necessários:

1. ✅ **user-requests** (já criado)
   - `userId` (Ascending)
   - `requestedAt` (Descending)

2. ❌ **notifications** (precisa criar)
   - `userId` (Ascending)
   - `createdAt` (Descending)

### Verificação:

Após criar o índice para `notifications`:
1. Aguarde 5-10 minutos
2. Recarregue a página com Ctrl+F5
3. Teste o sistema de notificações
4. Verifique se o erro desapareceu
