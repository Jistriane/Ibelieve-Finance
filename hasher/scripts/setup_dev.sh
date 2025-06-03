#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🚀 Configurando ambiente de desenvolvimento..."

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando PostgreSQL..."
    sudo pacman -S postgresql --noconfirm

    # Inicializar banco de dados
    echo "🔄 Inicializando cluster PostgreSQL..."
    sudo -u postgres initdb -D /var/lib/postgres/data

    # Iniciar serviço
    echo "🔄 Iniciando serviço PostgreSQL..."
    sudo systemctl enable postgresql
    sudo systemctl start postgresql

    # Criar usuário e banco
    echo "👤 Criando usuário e banco de dados..."
    sudo -u postgres psql -c "CREATE USER ibeleve WITH PASSWORD 'ibeleve';"
    sudo -u postgres psql -c "CREATE DATABASE ibeleve OWNER ibeleve;"
    sudo -u postgres psql -c "CREATE DATABASE ibeleve_test OWNER ibeleve;"
    sudo -u postgres psql -c "ALTER USER ibeleve WITH SUPERUSER;"
else
    echo "✅ PostgreSQL já está instalado"
fi

# Verificar se Rust está instalado
if ! command -v cargo &> /dev/null; then
    echo "📦 Instalando Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo "✅ Rust já está instalado"
fi

# Verificar se Ollama está instalado
if ! command -v ollama &> /dev/null; then
    echo "📦 Instalando Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    
    # Iniciar serviço Ollama
    echo "🔄 Iniciando serviço Ollama..."
    systemctl --user enable ollama
    systemctl --user start ollama
    
    # Baixar modelo Mistral
    echo "📥 Baixando modelo Mistral..."
    ollama pull mistral
else
    echo "✅ Ollama já está instalado"
fi

# Executar migrações
echo "🔄 Executando migrações..."
PGPASSWORD=ibeleve psql -U ibeleve -h localhost -d ibeleve -f services/common/src/db/migrations/001_initial_schema.sql
PGPASSWORD=ibeleve psql -U ibeleve -h localhost -d ibeleve_test -f services/common/src/db/migrations/001_initial_schema.sql

echo -e "${GREEN}✅ Ambiente configurado com sucesso!${NC}" 