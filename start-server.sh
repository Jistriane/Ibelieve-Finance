#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando o servidor Hasher...${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se o Docker está rodando
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker não está rodando. Iniciando o serviço...${NC}"
    sudo systemctl start docker
    sleep 5
fi

# Navegar até o diretório do projeto
cd "$(dirname "$0")"

# Parar containers existentes
echo -e "${YELLOW}Parando containers existentes...${NC}"
docker compose down -v

# Reconstruir e iniciar containers
echo -e "${YELLOW}Reconstruindo e iniciando containers...${NC}"
docker compose up --build -d

# Aguardar os serviços iniciarem
echo -e "${YELLOW}Aguardando serviços iniciarem...${NC}"
sleep 10

# Verificar status dos containers
echo -e "${YELLOW}Verificando status dos containers...${NC}"
docker compose ps

# Verificar logs
echo -e "${YELLOW}Últimos logs:${NC}"
docker compose logs --tail=50

echo -e "${GREEN}Servidor iniciado com sucesso!${NC}"
echo -e "${GREEN}Você pode acessar:${NC}"
echo -e "API: http://localhost:3001"
echo -e "Grafana: http://localhost:3002"
echo -e "Prometheus: http://localhost:9090"
echo -e "Elasticsearch: http://localhost:9200"
echo -e "Alertmanager: http://localhost:9093" 