# Sincronização de Credenciais Admin

## Visão Geral

O sistema de credenciais admin agora está sincronizado com o Firebase, garantindo que as mudanças sejam aplicadas em todos os dispositivos em tempo real.

## Como Funciona

### 1. **Armazenamento no Firebase**
- As credenciais são armazenadas no Firestore em: `admin/credentials`
- Documento contém: `username` e `password`
- Sincronização em tempo real usando `onSnapshot`

### 2. **Inicialização**
- Se não existir documento no Firebase, cria com credenciais padrão:
  - Usuário: `admin`
  - Senha: `admin`

### 3. **Sincronização**
- Quando as credenciais são alteradas, são salvas no Firebase
- Todos os dispositivos conectados recebem a atualização automaticamente
- Backup local no localStorage como fallback

### 4. **Segurança**
- Credenciais alteradas são aplicadas imediatamente em todos os dispositivos
- Se alguém descobrir o painel admin, não conseguirá acessar com credenciais antigas
- Mudanças são persistentes e sincronizadas

## Estrutura do Firebase

```javascript
// Coleção: admin
// Documento: credentials
{
  username: "admin",
  password: "admin"
}
```

## Componentes Afetados

1. **AdminContext** (`src/contexts/AdminContext.tsx`)
   - Gerencia estado das credenciais
   - Sincroniza com Firebase
   - Fornece loading state

2. **AdminSettingsDialog** (`src/components/admin-settings-dialog.tsx`)
   - Interface para alterar credenciais
   - Feedback visual de sincronização
   - Validação de entrada

3. **AdminLoginPage** (`src/app/admin/page.tsx`)
   - Usa credenciais sincronizadas para autenticação
   - Verificação em tempo real

## Benefícios

- ✅ **Segurança**: Mudanças aplicadas em todos os dispositivos
- ✅ **Sincronização**: Tempo real via Firebase
- ✅ **Persistência**: Dados salvos na nuvem
- ✅ **Fallback**: Backup local como segurança
- ✅ **UX**: Feedback visual de loading e sincronização

## Fluxo de Alteração

1. Usuário acessa configurações admin
2. Altera usuário/senha
3. Sistema valida entrada
4. Salva no Firebase
5. Atualiza estado local
6. Notifica todos os dispositivos
7. Feedback de sucesso ao usuário

## Tratamento de Erros

- Conexão com internet perdida
- Firebase indisponível
- Validação de entrada
- Timeout de operações

## Configuração Inicial

O sistema automaticamente:
1. Verifica se existe documento no Firebase
2. Cria credenciais padrão se necessário
3. Sincroniza com dispositivos existentes
4. Mantém backup local 