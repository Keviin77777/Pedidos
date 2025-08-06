# CineAssist

Sistema de solicitação de filmes e séries com sincronização em tempo real.

## 🚀 Funcionalidades

- ✅ Busca de filmes e séries no catálogo existente
- ✅ Solicitação de novos conteúdos
- ✅ Sincronização em tempo real entre usuários
- ✅ Painel admin para gerenciar pedidos
- ✅ Integração com TMDB para sinopses
- ✅ Sistema de categorias automático
- ✅ Interface responsiva e moderna

## 🛠️ Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Firebase (opcional)

### Instalação

```bash
# Clonar repositório
git clone <repository-url>
cd Pedidos

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env.local
# Editar .env.local com suas configurações

# Executar em desenvolvimento
npm run dev
```

Acesse [http://localhost:9002](http://localhost:9002) para ver o resultado.

## 🔒 Produção

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```bash
# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=sua_chave_tmdb

# XUI One API
XUI_API_URL=http://seu-servidor.com
XUI_USERNAME=seu_usuario
XUI_PASSWORD=sua_senha

# Firebase (opcional)
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Segurança
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### 2. Build para Produção

```bash
# Verificar segurança
npm run security:check

# Build otimizado
npm run build:prod

# Testar build
npm run test:build

# Executar em produção
npm run start:prod
```

### 3. Deploy

#### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:prod
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📋 Checklist de Segurança

- [ ] Variáveis de ambiente configuradas
- [ ] Firebase Security Rules aplicadas
- [ ] HTTPS configurado
- [ ] Headers de segurança ativos
- [ ] Rate limiting implementado
- [ ] Backup configurado

Ver detalhes em: [docs/security-checklist.md](docs/security-checklist.md)

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build normal
npm run build:prod   # Build otimizado para produção
npm run start:prod   # Executar em produção
npm run security:check # Verificar vulnerabilidades
npm run test:build   # Testar build de produção
```

## 📚 Documentação

- [Security Checklist](docs/security-checklist.md)
- [Admin Sync](docs/admin-sync.md)
- [Blueprint](docs/blueprint.md)

## 🚀 Deploy Rápido

### Deploy Automatizado
```bash
# Deploy no Vercel (recomendado)
./scripts/deploy.sh vercel

# Deploy no Netlify
./scripts/deploy.sh netlify

# Deploy com Docker
./scripts/deploy.sh docker
```

### Deploy Manual
```bash
# Build de produção
npm run build:prod

# Testar build
npm run test:build

# Executar em produção
npm run start:prod
```

### Docker Compose
```bash
# Deploy com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 📋 Checklist de Produção

### ✅ Configurado
- [x] Firebase Rules aplicadas
- [x] TMDB API funcionando
- [x] XUI One conectado
- [x] Headers de segurança
- [x] Middleware de proteção
- [x] Variáveis de ambiente

### ⚠️ Necessário
- [ ] Configurar HTTPS
- [ ] Escolher plataforma de deploy
- [ ] Configurar domínio
- [ ] Testar em produção

## 🆘 Suporte

Para problemas de segurança ou configuração, consulte:
- [Firebase Console](https://console.firebase.google.com)
- [TMDB API](https://www.themoviedb.org/settings/api)
- [Next.js Docs](https://nextjs.org/docs)

## 📚 Documentação Completa

- [Guia de Produção](README-PRODUCAO.md) - Instruções detalhadas
- [Security Checklist](docs/security-checklist.md) - Checklist de segurança
- [Admin Sync](docs/admin-sync.md) - Sincronização admin
- [Blueprint](docs/blueprint.md) - Especificações do projeto
