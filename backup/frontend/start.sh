#!/bin/bash
set -e  # Exit on error

echo "Iniciando o frontend..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

# Iniciar o servidor de desenvolvimento
echo "Iniciando o servidor de desenvolvimento..."
npm start 