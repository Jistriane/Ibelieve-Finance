#!/bin/bash

# Configurações
DB_NAME="ibelieve"
DB_USER="postgres"
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"
LOG_FILE="/var/log/backup/database_backup.log"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR
mkdir -p /var/log/backup

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Iniciar backup
log "Iniciando backup do banco de dados $DB_NAME"

# Realizar backup
pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE 2>> $LOG_FILE

if [ $? -eq 0 ]; then
    # Compactar backup
    gzip $BACKUP_FILE
    log "Backup concluído com sucesso: ${BACKUP_FILE}.gz"

    # Remover backups antigos (manter últimos 30 dias)
    find $BACKUP_DIR -name "*.gz" -type f -mtime +30 -delete
    log "Backups antigos removidos"
else
    log "ERRO: Falha ao realizar backup"
    exit 1
fi

# Verificar espaço em disco
DISK_USAGE=$(df -h $BACKUP_DIR | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    log "ALERTA: Uso de disco alto ($DISK_USAGE%)"
fi

# Enviar notificação (implementar de acordo com sua necessidade)
# notify "Backup do banco de dados concluído"

log "Processo de backup finalizado"
exit 0