# Funcionalidade de Exclusão de Pedidos

## Problema Resolvido

**Erro**: `ReferenceError: where is not defined` e `FirebaseError: No document to update`

**Causa**: 
1. A função `where` não estava sendo importada no arquivo `admin.ts`
2. A função `updateUserRequestStatus` estava tentando usar o `requestId` como ID do documento na coleção `user-requests`, mas os documentos têm IDs diferentes

## Soluções Implementadas

### 1. Correção do Import

**Arquivo**: `src/lib/admin.ts`

```typescript
// Antes:
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  CollectionReference,
} from 'firebase/firestore';

// Depois:
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
  query,
  where, // ✅ Adicionado
  orderBy,
  onSnapshot,
  getDocs,
  CollectionReference,
} from 'firebase/firestore';
```

### 2. Correção da Função updateUserRequestStatus

**Arquivo**: `src/lib/notifications.ts`

```typescript
// Antes:
const requestRef = doc(userRequestsCollection, requestId);
await updateDoc(requestRef, updateData);

// Depois:
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
await updateDoc(userRequestDoc.ref, updateData);
```

### 3. Funcionalidade de Exclusão Completa

**Arquivo**: `src/lib/admin.ts`

```typescript
export const deleteContentRequest = async (id: string): Promise<void> => {
  try {
    // Obter dados do pedido antes de excluir
    const requestSnap = await getDocs(query(requestsCollection, where('__name__', '==', id)));
    const requestData = requestSnap.docs[0]?.data();
    
    // Excluir o pedido principal
    const requestDoc = doc(db, 'content-requests', id);
    await deleteDoc(requestDoc);
    
    // Excluir o pedido do usuário e enviar notificação
    if (requestData?.username) {
      // Excluir da coleção user-requests
      const userRequestsSnap = await getDocs(
        query(
          collection(db, 'user-requests'), 
          where('requestId', '==', id)
        )
      );
      
      // Excluir todos os pedidos do usuário relacionados
      for (const userRequestDoc of userRequestsSnap.docs) {
        await deleteDoc(userRequestDoc.ref);
      }
      
      // Enviar notificação de exclusão
      await notifyRequestDeleted(requestData.username, requestData.title);
    }
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};
```

### 4. Nova Função de Notificação

**Arquivo**: `src/lib/notifications.ts`

```typescript
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
```

## Funcionalidades Implementadas

✅ **Exclusão Completa**: Remove o pedido da coleção principal e da coleção do usuário

✅ **Notificação Automática**: Envia mensagem específica sobre exclusão

✅ **Mensagem Personalizada**: "Esse conteúdo já foi solicitado ou duplicado, refaça o pedido ou solicite outro!!!"

✅ **Limpeza de Dados**: Remove todos os registros relacionados ao pedido

✅ **Tratamento de Erros**: Verifica se documentos existem antes de tentar atualizar

## Como Funciona

1. **Admin exclui pedido** → Função `deleteContentRequest` é chamada
2. **Busca dados do pedido** → Obtém informações antes de excluir
3. **Exclui pedido principal** → Remove da coleção `content-requests`
4. **Exclui pedido do usuário** → Remove da coleção `user-requests`
5. **Envia notificação** → Usuário recebe mensagem sobre exclusão
6. **Limpeza automática** → Status do pedido desaparece da interface do usuário

## Benefícios

- ✅ **Experiência do Usuário**: Recebe notificação clara sobre exclusão
- ✅ **Integridade dos Dados**: Remove todos os registros relacionados
- ✅ **Feedback Imediato**: Usuário sabe que o pedido foi removido
- ✅ **Prevenção de Duplicatas**: Mensagem incentiva novos pedidos
- ✅ **Sistema Robusto**: Trata erros e documentos inexistentes
