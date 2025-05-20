#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para exibir mensagens de erro e sair
error_exit() {
    echo -e "${RED}Erro: $1${NC}" >&2
    exit 1
}

# Função para verificar se um comando existe
check_command() {
    if ! command -v $1 &> /dev/null; then
        error_exit "$1 não está instalado. Por favor, instale-o primeiro."
    fi
}

# Função para verificar se um serviço está rodando
check_service() {
    if ! systemctl is-active --quiet $1; then
        echo -e "${YELLOW}Iniciando serviço $1...${NC}"
        sudo systemctl start $1 || error_exit "Falha ao iniciar $1"
        sleep 5
    fi
}

# Função para verificar a saúde dos containers
check_container_health() {
    local container=$1
    local max_attempts=30
    local attempt=1

    echo -e "${BLUE}Verificando saúde do container $container...${NC}"
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps $container | grep -q "healthy"; then
            echo -e "${GREEN}Container $container está saudável!${NC}"
            return 0
        fi
        echo -e "${YELLOW}Tentativa $attempt de $max_attempts...${NC}"
        sleep 10
        attempt=$((attempt + 1))
    done
    error_exit "Container $container não ficou saudável após $max_attempts tentativas"
}

echo -e "${BLUE}=== Iniciando o servidor Hasher ===${NC}"

# Verificar pré-requisitos
echo -e "${YELLOW}Verificando pré-requisitos...${NC}"
check_command docker
check_command docker-compose

# Verificar e iniciar serviços necessários
echo -e "${YELLOW}Verificando serviços...${NC}"
check_service docker

# Navegar até o diretório do projeto
cd "$(dirname "$0")" || error_exit "Falha ao navegar para o diretório do projeto"

# Verificar se os arquivos necessários existem
echo -e "${YELLOW}Verificando arquivos de configuração...${NC}"
[ -f "docker-compose.yml" ] || error_exit "docker-compose.yml não encontrado"
[ -f "redis.conf" ] || error_exit "redis.conf não encontrado"
[ -f ".env-dev" ] || error_exit ".env-dev não encontrado"

# Parar containers existentes
echo -e "${YELLOW}Parando containers existentes...${NC}"
docker compose down -v || error_exit "Falha ao parar containers"

# Reconstruir e iniciar containers
echo -e "${YELLOW}Reconstruindo e iniciando containers...${NC}"
docker compose up --build -d || error_exit "Falha ao iniciar containers"

# Aguardar os serviços iniciarem
echo -e "${YELLOW}Aguardando serviços iniciarem...${NC}"
sleep 10

# Verificar saúde dos containers
check_container_health redis
check_container_health elasticsearch
check_container_health prometheus
check_container_health grafana
check_container_health app

# Verificar status dos containers
echo -e "${YELLOW}Status dos containers:${NC}"
docker compose ps

# Verificar logs
echo -e "${YELLOW}Últimos logs:${NC}"
docker compose logs --tail=50

echo -e "${GREEN}=== Servidor iniciado com sucesso! ===${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "API: http://localhost:3001"
echo -e "Grafana: http://localhost:3002"
echo -e "Prometheus: http://localhost:9090"
echo -e "Elasticsearch: http://localhost:9200"
echo -e "Alertmanager: http://localhost:9093"

# Manter o script rodando para mostrar logs
echo -e "${YELLOW}Pressione Ctrl+C para parar o servidor${NC}"
docker compose logs -f 