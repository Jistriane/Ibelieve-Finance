#!/bin/bash

# Criar backup
echo "Criando backup..."
mkdir -p backup
cp -r frontend backup/
cp -r circom backup/

# Remover do git
echo "Removendo do git..."
git rm -r --cached frontend/
git rm -r --cached circom/

# Adicionar novamente
echo "Adicionando ao git..."
git add frontend/
git add circom/

# Commit
echo "Fazendo commit..."
git commit -m "feat: adiciona conteúdo das pastas frontend e circom"

# Push
echo "Fazendo push..."
git push origin master 