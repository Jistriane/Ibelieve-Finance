#!/bin/bash

# Criar backup
echo "Criando backup..."
mkdir -p backup
cp -r frontend backup/
cp -r circom backup/

# Verificar se estamos na branch master
current_branch=$(git branch --show-current)
if [ "$current_branch" != "master" ]; then
    echo "Criando branch master..."
    git checkout -b master
fi

# Remover do git
echo "Removendo do git..."
git rm -r --cached .

# Adicionar tudo novamente
echo "Adicionando ao git..."
git add .

# Commit
echo "Fazendo commit..."
git commit -m "feat: adiciona todo o conteúdo do repositório"

# Forçar push com --force-with-lease
echo "Forçando push..."
git push --force-with-lease origin master 