#!/bin/bash

# Criar pasta temporária com timestamp
TEMP_DIR="../temp_repo_$(date +%s)"
echo "Criando pasta temporária: $TEMP_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Clonar o repositório
echo "Clonando repositório..."
git clone https://github.com/Jistriane/Ibelieve-Finance.git .

# Remover remote origin existente
echo "Removendo remote origin existente..."
git remote remove origin

# Adicionar novo remote origin
echo "Adicionando novo remote origin..."
git remote add origin https://github.com/Jistriane/Ibelieve-Finance.git

# Copiar todo o conteúdo
echo "Copiando arquivos..."
cp -r ../Ibelieve/* .

# Adicionar tudo
echo "Adicionando ao git..."
git add .

# Commit
echo "Fazendo commit..."
git commit -m "feat: adiciona todo o conteúdo do repositório"

# Criar branch master
echo "Criando branch master..."
git branch -M master

# Forçar push
echo "Forçando push..."
git push -f origin master

# Voltar para a pasta original
cd ../Ibelieve

# Remover pasta temporária
echo "Limpando..."
rm -rf "$TEMP_DIR"

echo "Deploy concluído!"
echo "Links do deploy:"
echo "1. URL Principal: https://jistriane.github.io/Ibelieve-Finance/"
echo "2. URL do Pipeline: https://github.com/Jistriane/Ibelieve-Finance/actions"
echo "3. URL do Repositório: https://github.com/Jistriane/Ibelieve-Finance"
echo ""
echo "O pipeline será executado automaticamente. Você pode acompanhar o progresso na URL do Pipeline." 