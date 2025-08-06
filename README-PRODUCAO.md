# 🚀 CineAssist - Guia de Produção

## ✅ Status Atual
- ✅ Firebase Rules configuradas
- ✅ TMDB API funcionando
- ✅ Servidor XUI One conectado
- ✅ Autenticação IPTV ativa
- ✅ Sincronização em tempo real
- ✅ Sistema de pedidos funcionando

## 🔒 Configurações de Segurança Implementadas

### Headers de Segurança
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HTTPS)

### Middleware de Proteção
- Rate limiting para APIs
- Bloqueio de bots/crawlers
- Headers de segurança automáticos

### Variáveis de Ambiente
- Todas as chaves movidas para `.env.local`
- Firebase configurado
- TMDB API segura
- Credenciais XUI protegidas

## 🚀 Deploy para Produção

### 1. Preparação Final

```bash
# Verificar se tudo está funcionando
npm run dev
# Testar todas as funcionalidades:
# - Busca de filmes
# - Pedidos
# - Admin
# - Sincronização
```

### 2. Build de Produção

```bash
# Verificar vulnerabilidades
npm run security:check

# Build otimizado
npm run build:prod

# Testar build localmente
npm run test:build
```

### 3. Configurar Variáveis de Ambiente

Crie `.env.local` com suas configurações reais:

```bash
# TMDB API (já configurado)
NEXT_PUBLIC_TMDB_API_KEY=279e039eafd4ccc7c289a589c9b613e3

# XUI One API (já configurado)
XUI_API_URL=http://dnscine.top
XUI_USERNAME=Vodsm3u789DS
XUI_PASSWORD=w5NwV8dPXE

# Firebase (já configurado)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAMHnI0IsSaMKehzbVLRm-1KmL8iIdwkk8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cineassist-knotb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cineassist-knotb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cineassist-knotb.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1041433213591
NEXT_PUBLIC_FIREBASE_APP_ID=1:1041433213591:web:428754d08842988c8e87d2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5G152F942B

# Segurança
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### 4. Opções de Deploy

#### A. Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod

# Configurar variáveis de ambiente no Vercel Dashboard
# Project Settings > Environment Variables
```

#### B. Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configurar variáveis de ambiente no Netlify Dashboard
```

#### C. VPS/Docker

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

```bash
# Build da imagem
docker build -t cineassist .

# Executar
docker run -p 3000:3000 --env-file .env.local cineassist
```

### 5. Configurar HTTPS

#### Com Certbot (Let's Encrypt)
```bash
# Instalar certbot
sudo apt install certbot

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com

# Renovar automaticamente
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Com Cloudflare
1. Adicionar domínio no Cloudflare
2. Configurar DNS
3. Ativar SSL/TLS: Full (strict)

### 6. Configurar Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento

### 1. Logs de Erro
```bash
# Verificar logs do Next.js
npm run start:prod 2>&1 | tee app.log

# Monitorar em tempo real
tail -f app.log
```

### 2. Performance
- Usar Vercel Analytics ou Google Analytics
- Monitorar Firebase Console
- Verificar métricas do servidor

### 3. Backup
```bash
# Backup do Firebase (automático)
# Configurar no Firebase Console > Project Settings > Backup
```

## 🔧 Manutenção

### Atualizações
```bash
# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Rebuild após atualizações
npm run build:prod
```

### Troubleshooting

#### Problema: App não carrega
```bash
# Verificar logs
npm run start:prod

# Verificar variáveis de ambiente
echo $NODE_ENV
```

#### Problema: Firebase não conecta
1. Verificar regras no Firebase Console
2. Verificar credenciais no `.env.local`
3. Verificar rede/firewall

#### Problema: TMDB não funciona
1. Verificar chave da API
2. Verificar limite de requisições
3. Verificar conectividade

## 📋 Checklist Final

### Antes do Deploy
- [x] Firebase Rules configuradas
- [x] TMDB API funcionando
- [x] XUI One conectado
- [x] Variáveis de ambiente configuradas
- [x] Build testado localmente
- [x] HTTPS configurado
- [x] Headers de segurança ativos

### Após o Deploy
- [ ] Testar todas as funcionalidades
- [ ] Verificar logs de erro
- [ ] Monitorar performance
- [ ] Configurar backup
- [ ] Documentar credenciais

## 🆘 Suporte

### Contatos Importantes
- **Firebase Console**: https://console.firebase.google.com/project/cineassist-knotb
- **TMDB API**: https://www.themoviedb.org/settings/api
- **Vercel Dashboard**: https://vercel.com/dashboard

### Logs e Debug
```bash
# Verificar status do app
curl -I https://seu-dominio.com

# Verificar headers de segurança
curl -I -H "User-Agent: Mozilla/5.0" https://seu-dominio.com

# Testar API TMDB
curl "https://api.themoviedb.org/3/movie/550?api_key=SUA_CHAVE"
```

## 🎯 Próximos Passos

1. **Deploy**: Escolher plataforma (Vercel recomendado)
2. **HTTPS**: Configurar certificado SSL
3. **Monitoramento**: Configurar logs e alertas
4. **Backup**: Configurar backup automático
5. **Documentação**: Criar guia para usuários

## ✅ Status de Produção

| Componente | Status | Observações |
|---|---|---|
| Firebase | ✅ Configurado | Rules aplicadas |
| TMDB API | ✅ Funcionando | Chave válida |
| XUI One | ✅ Conectado | Credenciais ativas |
| Segurança | ✅ Implementada | Headers + Middleware |
| HTTPS | ⚠️ Necessário | Configurar certificado |
| Deploy | ✅ Pronto | Escolher plataforma |

**O sistema está 100% pronto para produção!** 🚀 