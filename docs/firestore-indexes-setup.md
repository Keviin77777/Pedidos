# Configuração dos Índices do Firestore

## ⚠️ ERRO: "The query requires an index"

### Solução Imediata

#### Opção 1: Link Direto (Mais Rápido)
1. **Clique neste link:**
   ```
   https://console.firebase.google.com/v1/r/project/cineassist-knotb/firestore/indexes?create_composite=ClZwcm9qZWN0cy9jaW5lYXNzaXN0LWtub3RiL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91c2VyLXJlcXVlc3RzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg8KC3JlcXVlc3RlZEF0EAIaDAoIX19uYW1lX18QAg
   ```
2. **Clique em "Criar índice"**
3. **Aguarde alguns minutos para o índice ser criado**

#### Opção 2: Manual
1. **Acesse o Console do Firebase:**
   - Vá para: https://console.firebase.google.com
   - Selecione seu projeto: `cineassist-knotb`

2. **Vá para Firestore Database:**
   - Menu lateral → Firestore Database
   - Clique na aba **"Índices"**

3. **Clique em "Criar índice"**

4. **Configure o índice:**
   - **Coleção**: `user-requests`
   - **Campos**: 
     - `userId` (Ascending)
     - `requestedAt` (Descending)
   - **Tipo de consulta**: Collection

5. **Clique em "Criar"**

## Índices Necessários

### 1. Índice para `user-requests`
- **Coleção**: `user-requests`
- **Campos**: 
  - `userId` (Ascending)
  - `requestedAt` (Descending)

### 2. Índice para `notifications`
- **Coleção**: `notifications`
- **Campos**: 
  - `userId` (Ascending)
  - `createdAt` (Descending)

## Por que isso acontece?

O Firestore precisa de índices compostos quando você:
- Filtra por um campo (`userId`)
- E ordena por outro campo (`requestedAt`)

## ⏱️ Tempo de Criação

- **Índices pequenos**: 1-2 minutos
- **Índices grandes**: 5-10 minutos
- **Muitos dados**: Até 30 minutos

## ✅ Verificação

Após criar o índice:
1. Aguarde a mensagem "Índice criado com sucesso"
2. Recarregue sua aplicação
3. Teste o sistema de notificações
4. O erro deve desaparecer

## 🔧 Alternativa Temporária

Se você quiser testar rapidamente, pode modificar temporariamente a consulta para não usar ordenação:

```javascript
// Em vez de:
orderBy('requestedAt', 'desc')

// Use:
// orderBy('requestedAt', 'desc') // Comente esta linha
```

Mas é melhor criar o índice para ter a funcionalidade completa.
