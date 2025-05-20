#!/bin/bash

# Parar serviços
echo "Parando serviços..."
docker-compose down

# Remover volumes (opcional)
read -p "Deseja remover os volumes? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Removendo volumes..."
    docker-compose down -v
fi

echo "Serviços parados com sucesso!" 