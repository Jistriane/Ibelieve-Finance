#!/bin/bash

set -e  # Exit on error

echo "Iniciando instalação do frontend..."

# Instalar dependências
echo "Instalando dependências..."
npm install

# Instalar ethers para interação com blockchain
echo "Instalando ethers..."
npm install ethers@5.7.2

# Compilar o circuito
echo "Compilando o circuito..."
npm run compile-circuit

echo "Instalação concluída com sucesso!" 