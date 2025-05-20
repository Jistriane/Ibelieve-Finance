#!/bin/bash

# Instala o circom se não estiver instalado
if ! command -v circom &> /dev/null; then
    echo "Instalando circom..."
    npm install -g circom
fi

# Compila o circuito
echo "Compilando circuito..."
circom circuits/proof.circom --r1cs --wasm --sym -o circuits/

# Gera a chave de prova
echo "Gerando chave de prova..."
snarkjs groth16 setup circuits/proof.r1cs circuits/powersOfTau28_hez_final_10.ptau circuits/proof.zkey

# Exporta a chave de verificação
echo "Exportando chave de verificação..."
snarkjs zkey export verificationkey circuits/proof.zkey circuits/verification_key.json

echo "Compilação concluída!" 