# Criar Índice para `notifications`

## Configuração Manual:

### 1. Acesse o Console do Firebase
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: `cineassist-knotb`

### 2. Vá para Firestore Database
- Menu lateral → Firestore Database
- Clique na aba **"Índices"**

### 3. Clique em "Criar índice"

### 4. Configure o índice:

**Código da coleção**: `notifications`

**Campos para indexar**:
- **Campo 1**: `userId` (Crescente)
- **Campo 2**: `createdAt` (Decrescente)

**Escopo da consulta**: `Coleta`

### 5. Clique em "Criar"

## Configuração Automática (Recomendado):

### 1. Temporariamente comente a ordenação:
```javascript
// Em src/lib/notifications.ts, linha ~130
const q = query(
  notificationsCollection,
  where('userId', '==', userId),
  // orderBy('createdAt', 'desc') // Comente esta linha
);
```

### 2. Execute a aplicação
- O Firebase vai gerar um erro com link exato
- Clique no link para criar o índice automaticamente

### 3. Descomente a linha após criar o índice

## Verificação:

Após criar o índice:
1. Aguarde 2-5 minutos
2. Recarregue a página
3. Teste o sistema de notificações
4. O erro deve desaparecer

## Índices Necessários:

1. ✅ **user-requests** (já criado)
   - `userId` (Crescente)
   - `requestedAt` (Decrescente)

2. ❌ **notifications** (precisa criar)
   - `userId` (Crescente)
   - `createdAt` (Decrescente)
