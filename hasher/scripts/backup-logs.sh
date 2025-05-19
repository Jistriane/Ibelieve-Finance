#!/bin/bash

# Configurações
BACKUP_DIR="/backup/logs"
ELASTICSEARCH_URL=${ELASTICSEARCH_URL:-"http://localhost:9200"}
RETENTION_DAYS=30
DATE=$(date +%Y%m%d)
BACKUP_NAME="ibeleve-logs-$DATE"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Backup dos índices do Elasticsearch
echo "Iniciando backup dos logs..."

# Backup dos logs de auditoria
curl -X PUT "$ELASTICSEARCH_URL/_snapshot/ibeleve/$BACKUP_NAME" -H 'Content-Type: application/json' -d'
{
  "indices": "audit_logs_*",
  "ignore_unavailable": true,
  "include_global_state": false
}'

# Backup dos logs gerais
curl -X PUT "$ELASTICSEARCH_URL/_snapshot/ibeleve/$BACKUP_NAME-general" -H 'Content-Type: application/json' -d'
{
  "indices": "ibeleve-logs-*",
  "ignore_unavailable": true,
  "include_global_state": false
}'

# Verificar status do backup
echo "Verificando status do backup..."
curl -X GET "$ELASTICSEARCH_URL/_snapshot/ibeleve/$BACKUP_NAME/_status"
curl -X GET "$ELASTICSEARCH_URL/_snapshot/ibeleve/$BACKUP_NAME-general/_status"

# Limpar backups antigos
echo "Limpando backups antigos..."
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

echo "Backup concluído!" 