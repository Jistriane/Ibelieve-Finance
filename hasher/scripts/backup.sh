#!/bin/bash

# Configurações
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

# Backup do PostgreSQL
echo "Fazendo backup do PostgreSQL..."
docker-compose exec postgres pg_dump -U postgres ibeleve > "$BACKUP_DIR/postgres_$BACKUP_NAME.sql"

# Backup do Redis
echo "Fazendo backup do Redis..."
docker-compose exec redis redis-cli SAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_$BACKUP_NAME.rdb"

# Backup do Elasticsearch
echo "Fazendo backup do Elasticsearch..."
curl -X PUT "localhost:9200/_snapshot/backup/$BACKUP_NAME?wait_for_completion=true" -H 'Content-Type: application/json' -d'
{
  "indices": "*",
  "ignore_unavailable": true,
  "include_global_state": true
}'

# Backup do Prometheus
echo "Fazendo backup do Prometheus..."
docker cp $(docker-compose ps -q prometheus):/prometheus "$BACKUP_DIR/prometheus_$BACKUP_NAME"

# Backup do Grafana
echo "Fazendo backup do Grafana..."
docker cp $(docker-compose ps -q grafana):/var/lib/grafana "$BACKUP_DIR/grafana_$BACKUP_NAME"

# Compactar backup
echo "Compactando backup..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    "$BACKUP_DIR/postgres_$BACKUP_NAME.sql" \
    "$BACKUP_DIR/redis_$BACKUP_NAME.rdb" \
    "$BACKUP_DIR/prometheus_$BACKUP_NAME" \
    "$BACKUP_DIR/grafana_$BACKUP_NAME"

# Remover arquivos temporários
echo "Limpando arquivos temporários..."
rm -rf "$BACKUP_DIR/postgres_$BACKUP_NAME.sql" \
       "$BACKUP_DIR/redis_$BACKUP_NAME.rdb" \
       "$BACKUP_DIR/prometheus_$BACKUP_NAME" \
       "$BACKUP_DIR/grafana_$BACKUP_NAME"

# Remover backups antigos (manter últimos 7 dias)
echo "Removendo backups antigos..."
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $BACKUP_DIR/$BACKUP_NAME.tar.gz" 