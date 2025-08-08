# Debug da API Route - Erro "Not Found"

## 🔍 Diagnóstico do Problema

O erro `Error: Erro ao enviar notificação push: "Not Found"` indica que a API route `/api/send-notification` não está sendo encontrada pelo Next.js.

## 🛠️ Solução Passo a Passo

### 1. **Verificar se o Servidor está Rodando**

Primeiro, certifique-se de que o servidor Next.js está rodando:

```bash
npm run dev
```

### 2. **Testar a API Route**

Acesse no navegador:
- `http://localhost:9002/api/send-notification` (GET)
- `http://localhost:9002/api/test-notification` (GET)

Se retornar JSON, a API route está funcionando.

### 3. **Verificar Estrutura de Arquivos**

Certifique-se de que a estrutura está correta:

```
src/
  app/
    api/
      send-notification/
        route.ts  ✅
      test-notification/
        route.ts  ✅
```

### 4. **Reiniciar o Servidor**

Se a estrutura estiver correta mas ainda não funcionar:

1. Pare o servidor (Ctrl+C)
2. Execute: `npm run dev`
3. Teste novamente

### 5. **Verificar Variáveis de Ambiente**

Certifique-se de que o arquivo `.env.local` existe e tem as variáveis:

```env
# Firebase Server Key (obrigatório para notificações push)
FIREBASE_SERVER_KEY=sua_chave_do_servidor_aqui

# Firebase VAPID Key
NEXT_PUBLIC_FIREBASE_VAPID_KEY=sua_vapid_key_aqui
```

### 6. **Testar com curl**

Teste a API route diretamente:

```bash
# Teste GET
curl http://localhost:9002/api/send-notification

# Teste POST
curl -X POST http://localhost:9002/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"token":"test","notification":{"title":"Test","body":"Test"}}'
```

## 🔧 Soluções Alternativas

### **Solução 1: Usar Notificações Locais Apenas**

Se a API route não funcionar, você pode desabilitar temporariamente as notificações push:

```typescript
// Em src/lib/notifications.ts, comente a linha:
// await sendPushNotification(notification.userId, notification);
```

### **Solução 2: Verificar Configuração do Next.js**

Certifique-se de que o `next.config.js` não está interferindo:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suas configurações aqui
}

module.exports = nextConfig
```

### **Solução 3: Usar API Route Alternativa**

Se o problema persistir, você pode criar uma API route alternativa:

```typescript
// src/app/api/notifications/route.ts
export async function POST(request: NextRequest) {
  // Mesmo código da send-notification
}
```

## 📋 Checklist de Verificação

- [ ] Servidor Next.js rodando
- [ ] Estrutura de arquivos correta
- [ ] Variáveis de ambiente configuradas
- [ ] API route respondendo a GET
- [ ] API route respondendo a POST
- [ ] Logs do servidor mostrando requisições

## 🚨 Possíveis Causas

1. **Servidor não reiniciado**: Mudanças em API routes requerem reinicialização
2. **Estrutura de pastas incorreta**: Verificar se `route.ts` está no local correto
3. **Conflito de rotas**: Verificar se não há conflitos com outras rotas
4. **Problema de cache**: Limpar cache do navegador
5. **Configuração do Next.js**: Verificar se há configurações que interferem

## 🔍 Logs para Verificar

No terminal onde o servidor está rodando, procure por:
- `API route /api/send-notification chamada`
- `API route /api/send-notification GET chamada`
- Erros de compilação ou roteamento

## 📞 Próximos Passos

1. Teste as URLs da API route no navegador
2. Verifique os logs do servidor
3. Teste com curl se necessário
4. Se ainda não funcionar, use notificações locais temporariamente

---

**Após resolver o problema da API route, as notificações push funcionarão corretamente! 🎉**
