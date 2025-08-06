#!/bin/bash

# 🚀 Script de Deploy Automatizado - CineAssist
# Uso: ./scripts/deploy.sh [vercel|netlify|docker]

set -e

echo "🚀 Iniciando deploy do CineAssist..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  Aviso: Arquivo .env.local não encontrado"
    echo "📝 Criando .env.local com configurações padrão..."
    cp env.example .env.local
    echo "✅ Arquivo .env.local criado. Configure suas variáveis antes do deploy."
fi

# Verificar vulnerabilidades
echo "🔒 Verificando vulnerabilidades..."
npm run security:check

# Build de produção
echo "🏗️  Fazendo build de produção..."
npm run build:prod

# Testar build
echo "🧪 Testando build..."
timeout 30s npm run start:prod &
PID=$!
sleep 5
curl -f http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build testado com sucesso"
    kill $PID 2>/dev/null || true
else
    echo "❌ Erro: Build falhou no teste"
    kill $PID 2>/dev/null || true
    exit 1
fi

# Escolher plataforma de deploy
PLATFORM=${1:-vercel}

case $PLATFORM in
    "vercel")
        echo "🚀 Deployando no Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "📦 Instalando Vercel CLI..."
            npm i -g vercel
        fi
        vercel --prod
        ;;
    "netlify")
        echo "🚀 Deployando no Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "📦 Instalando Netlify CLI..."
            npm i -g netlify-cli
        fi
        netlify deploy --prod
        ;;
    "docker")
        echo "🐳 Deployando com Docker..."
        docker build -t cineassist .
        echo "✅ Imagem Docker criada: cineassist"
        echo "🚀 Para executar: docker run -p 3000:3000 --env-file .env.local cineassist"
        ;;
    *)
        echo "❌ Plataforma não suportada: $PLATFORM"
        echo "📋 Plataformas suportadas: vercel, netlify, docker"
        exit 1
        ;;
esac

echo "✅ Deploy concluído!"
echo "📋 Próximos passos:"
echo "1. Configurar variáveis de ambiente na plataforma"
echo "2. Configurar domínio personalizado"
echo "3. Configurar HTTPS"
echo "4. Testar todas as funcionalidades"
echo "5. Configurar monitoramento"

echo "🎉 CineAssist está no ar!" 