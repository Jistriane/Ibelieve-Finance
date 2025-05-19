#!/bin/bash
set -e  # Exit on error

echo "Iniciando o backend..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

# Compilar o projeto
echo "Compilando o projeto..."
npm run build

# Iniciar o servidor
echo "Iniciando o servidor..."
npm run dev 