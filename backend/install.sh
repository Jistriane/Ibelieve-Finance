#!/bin/bash

# Instalar dependências
npm install
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers@5.7.2 typescript ts-node @types/node @types/mocha @types/chai chai

# Compilar contratos
npx hardhat compile

# Implantar contrato na rede local
npx hardhat run scripts/deploy.ts --network localhost

# Iniciar rede local
npx hardhat node 