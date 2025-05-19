#!/bin/bash

# Verificar argumento
if [ -z "$1" ]; then
    echo "Uso: $0 <arquivo_de_backup>"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="/backup"
TEMP_DIR="$BACKUP_DIR/temp_restore"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Criar diretório temporário
mkdir -p "$TEMP_DIR"

# Extrair backup
echo "Extraindo backup..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Restaurar PostgreSQL
echo "Restaurando PostgreSQL..."
docker-compose exec -T postgres psql -U postgres -d ibeleve < "$TEMP_DIR/postgres_*.sql"

# Restaurar Redis
echo "Restaurando Redis..."
docker cp "$TEMP_DIR/redis_*.rdb" $(docker-compose ps -q redis):/data/dump.rdb
docker-compose restart redis

# Restaurar Elasticsearch
echo "Restaurando Elasticsearch..."
curl -X POST "localhost:9200/_snapshot/backup/restore_$(date +%Y%m%d_%H%M%S)?wait_for_completion=true" -H 'Content-Type: application/json' -d'
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true
}'

# Restaurar Prometheus
echo "Restaurando Prometheus..."
docker cp "$TEMP_DIR/prometheus_*" $(docker-compose ps -q prometheus):/prometheus
docker-compose restart prometheus

# Restaurar Grafana
echo "Restaurando Grafana..."
docker cp "$TEMP_DIR/grafana_*" $(docker-compose ps -q grafana):/var/lib/grafana
docker-compose restart grafana

# Limpar diretório temporário
echo "Limpando arquivos temporários..."
rm -rf "$TEMP_DIR"

echo "Restauração concluída!" 