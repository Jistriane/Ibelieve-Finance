#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando ambiente de desenvolvimento...${NC}"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não está instalado. Por favor, instale o Docker primeiro:${NC}"
    echo "https://docs.docker.com/engine/install/"
    exit 1
fi

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker não está rodando. Por favor, inicie o Docker com:${NC}"
    echo "sudo systemctl start docker"
    exit 1
fi

# Verificar se o docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose não está instalado. Por favor, instale o Docker Compose:${NC}"
    echo "https://docs.docker.com/compose/install/"
    exit 1
fi

# Copiar arquivo .env-dev para .env se não existir
if [ ! -f .env ]; then
    echo -e "${YELLOW}Copiando .env-dev para .env...${NC}"
    cp .env-dev .env
fi

# Criar diretório deployments se não existir
if [ ! -d deployments ]; then
    echo -e "${YELLOW}Criando diretório deployments...${NC}"
    mkdir -p deployments
fi

# Iniciar serviços do Docker
echo -e "${YELLOW}Iniciando serviços do Docker...${NC}"
docker-compose up -d postgres redis prometheus grafana

# Aguardar serviços iniciarem
echo -e "${YELLOW}Aguardando serviços iniciarem...${NC}"
sleep 5

# Compilar contratos
echo -e "${YELLOW}Compilando contratos...${NC}"
npx hardhat compile

# Iniciar node local do Hardhat
echo -e "${YELLOW}Iniciando node local do Hardhat...${NC}"
npx hardhat node > /dev/null 2>&1 &
HARDHAT_PID=$!

# Aguardar node iniciar
sleep 5

# Deploy dos contratos
echo -e "${YELLOW}Deployando contratos...${NC}"
npx hardhat run scripts/deploy.ts --network localhost

# Iniciar backend
echo -e "${YELLOW}Iniciando backend...${NC}"
cd backend && npm run dev > /dev/null 2>&1 &
BACKEND_PID=$!

# Iniciar frontend
echo -e "${YELLOW}Iniciando frontend...${NC}"
cd ../frontend && npm start > /dev/null 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}Ambiente de desenvolvimento iniciado!${NC}"
echo -e "${YELLOW}Serviços rodando:${NC}"
echo "- Hardhat Node (PID: $HARDHAT_PID)"
echo "- Backend (PID: $BACKEND_PID)"
echo "- Frontend (PID: $FRONTEND_PID)"
echo "- PostgreSQL (porta: 5432)"
echo "- Redis (porta: 6379)"
echo "- Prometheus (porta: 9090)"
echo "- Grafana (porta: 3002)"

# Função para limpar processos ao encerrar
cleanup() {
    echo -e "${YELLOW}Encerrando serviços...${NC}"
    kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID
    docker-compose down
    echo -e "${GREEN}Ambiente encerrado!${NC}"
    exit 0
}

# Registrar função de cleanup
trap cleanup SIGINT SIGTERM

# Manter script rodando
while true; do
    sleep 1
done 