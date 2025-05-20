#!/bin/bash
set -e  # Exit on error

echo "Iniciando o backend..."

# Navegar para o diretório do backend
cd "$(dirname "$0")"

# Verificar e liberar a porta 3005 se estiver em uso
PORT=3005
if lsof -i :$PORT > /dev/null; then
    echo "Porta $PORT está em uso. Tentando liberar..."
    PID=$(lsof -t -i :$PORT)
    if [ ! -z "$PID" ]; then
        echo "Matando processo $PID que está usando a porta $PORT"
        kill -9 $PID
        sleep 2
    fi
fi

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