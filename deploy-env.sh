#!/bin/bash

# Verificar se o ambiente foi especificado
if [ -z "$1" ]; then
    echo "Por favor, especifique o ambiente (dev, homolog ou prod)"
    echo "Exemplo: ./deploy-env.sh dev"
    exit 1
fi

ENV=$1

# Validar ambiente
if [[ ! "$ENV" =~ ^(dev|homolog|prod)$ ]]; then
    echo "Ambiente inválido. Use: dev, homolog ou prod"
    exit 1
fi

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
git commit -m "feat: deploy para ambiente $ENV"

# Criar branch do ambiente
echo "Criando branch $ENV..."
git branch -M $ENV

# Forçar push
echo "Forçando push..."
git push -f origin $ENV

# Voltar para a pasta original
cd ../Ibelieve

# Remover pasta temporária
echo "Limpando..."
rm -rf "$TEMP_DIR"

echo "Deploy para $ENV iniciado!"
echo "Links do deploy:"
echo "1. Ambiente de Desenvolvimento: https://jistriane.github.io/Ibelieve-Finance/dev"
echo "2. Ambiente de Homologação: https://jistriane.github.io/Ibelieve-Finance/homolog"
echo "3. Ambiente de Produção: https://jistriane.github.io/Ibelieve-Finance/prod"
echo ""
echo "O pipeline será executado automaticamente. Você pode acompanhar o progresso em:"
echo "https://github.com/Jistriane/Ibelieve-Finance/actions" 