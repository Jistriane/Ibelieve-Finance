#!/bin/bash

# Configurações
DB_NAME="ibelieve"
DB_USER="postgres"
BACKUP_DIR="/backups/database"
LOG_FILE="/var/log/backup/database_restore.log"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Verificar se foi fornecido o arquivo de backup
if [ -z "$1" ]; then
    echo "Uso: $0 <arquivo_backup>"
    echo "Exemplo: $0 ibelieve_20240324_123456.sql.gz"
    exit 1
fi

BACKUP_FILE="$BACKUP_DIR/$1"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    log "ERRO: Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Iniciar restauração
log "Iniciando restauração do banco de dados $DB_NAME"

# Descompactar backup se necessário
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Dropar conexões existentes
psql -U $DB_USER -d postgres -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_NAME'
    AND pid <> pg_backend_pid();"

# Dropar banco existente
psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

# Criar banco novo
psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restaurar backup
psql -U $DB_USER $DB_NAME < $BACKUP_FILE 2>> $LOG_FILE

if [ $? -eq 0 ]; then
    log "Restauração concluída com sucesso"
    
    # Limpar arquivo temporário se foi descompactado
    if [[ "$1" == *.gz ]]; then
        rm "$BACKUP_FILE"
    fi
else
    log "ERRO: Falha na restauração"
    exit 1
fi

# Verificar integridade
psql -U $DB_USER -d $DB_NAME -c "\dt" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    log "Verificação de integridade concluída com sucesso"
else
    log "ERRO: Falha na verificação de integridade"
    exit 1
fi

log "Processo de restauração finalizado"
exit 0 