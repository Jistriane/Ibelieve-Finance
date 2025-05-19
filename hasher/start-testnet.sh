#!/bin/bash

# Parar containers existentes
docker compose down -v

# Remover volumes antigos
docker volume rm hasher_redis-data hasher_elasticsearch-data hasher_prometheus-data hasher_alertmanager-data hasher_grafana-data 2>/dev/null || true

# Iniciar containers com arquivo de ambiente de teste
docker compose --env-file .env-test up -d

# Aguardar todos os serviços estarem saudáveis
echo "Aguardando serviços iniciarem..."
sleep 30

# Verificar status dos serviços
echo "Verificando status dos serviços..."
docker compose ps

# Mostrar logs dos serviços
echo "Mostrando logs dos serviços..."
docker compose logs --tail=50 