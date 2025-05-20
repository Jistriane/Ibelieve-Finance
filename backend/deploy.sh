#!/bin/bash

set -e  # Exit on error

echo "Iniciando processo de implantação..."

# Verificar se o Hardhat está instalado
if ! command -v npx &> /dev/null; then
    echo "Erro: npx não está instalado"
    exit 1
fi

# Compilar o contrato
echo "Compilando o contrato..."
npx hardhat compile

# Verificar se a compilação foi bem-sucedida
if [ ! -d "artifacts/contracts/ProofRegistry.sol" ]; then
    echo "Erro: Compilação falhou"
    exit 1
fi

# Implantar o contrato
echo "Implantando o contrato..."
npx hardhat run scripts/deploy.ts --network localhost

# Verificar se a implantação foi bem-sucedida
if [ $? -ne 0 ]; then
    echo "Erro: Implantação falhou"
    exit 1
fi

echo "Implantação concluída com sucesso!"

# Salvar o endereço do contrato
echo "Salvando o endereço do contrato..."
CONTRACT_ADDRESS=$(npx hardhat run scripts/deploy.ts --network localhost | grep "ProofRegistry implantado em:" | awk '{print $4}')
echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > .env.local 