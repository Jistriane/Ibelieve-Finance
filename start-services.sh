#!/bin/bash

# Cores para output
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar se uma porta está em uso
check_port() {
    lsof -i :$1 >/dev/null 2>&1
}

# Função para exibir mensagens de status
print_status() {
    echo -e "${VERDE}[✓] $1${NC}"
}

print_warning() {
    echo -e "${AMARELO}[!] $1${NC}"
}

print_error() {
    echo -e "${VERMELHO}[✗] $1${NC}"
}

# Verificar pré-requisitos
echo "Verificando pré-requisitos..."

# Verificar Node.js
if ! command_exists node; then
    print_error "Node.js não encontrado. Por favor, instale o Node.js >= 14"
    exit 1
fi

# Verificar Yarn
if ! command_exists yarn; then
    print_error "Yarn não encontrado. Por favor, instale o Yarn"
    exit 1
fi

# Verificar Docker
if ! command_exists docker; then
    print_warning "Docker não encontrado. Alguns serviços podem não funcionar corretamente"
fi

# Verificar Docker Compose
if ! command_exists docker-compose; then
    print_warning "Docker Compose não encontrado. Alguns serviços podem não funcionar corretamente"
fi

# Verificar MetaMask/SubWallet
print_warning "Certifique-se de ter MetaMask ou SubWallet instalado e configurado para a rede Sepolia"

# Iniciar serviços
echo -e "\n${VERDE}Iniciando serviços do IbelieveFinance...${NC}\n"

# 1. Iniciar Frontend
echo "Iniciando Frontend..."
cd frontend
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado. Copiando de .env-dev..."
    cp .env-dev .env
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    print_status "Instalando dependências do frontend..."
    yarn install
fi

# Iniciar frontend em background
yarn start &
FRONTEND_PID=$!
print_status "Frontend iniciado (PID: $FRONTEND_PID)"

# 2. Iniciar Backend (se existir)
if [ -d "../backend" ]; then
    echo -e "\nIniciando Backend..."
    cd ../backend
    
    # Instalar dependências se necessário
    if [ ! -d "node_modules" ]; then
        print_status "Instalando dependências do backend..."
        yarn install
    fi
    
    # Iniciar backend em background
    yarn dev &
    BACKEND_PID=$!
    print_status "Backend iniciado (PID: $BACKEND_PID)"
fi

# 3. Iniciar Serviços Docker (se existirem)
if [ -f "../docker-compose.yml" ]; then
    echo -e "\nIniciando serviços Docker..."
    cd ..
    docker-compose up -d
    print_status "Serviços Docker iniciados"
fi

# 4. Verificar portas em uso
echo -e "\nVerificando portas em uso..."
PORTS=(3000 3001 8545 8546) # Adicione outras portas conforme necessário
for port in "${PORTS[@]}"; do
    if check_port $port; then
        print_warning "Porta $port está em uso"
    else
        print_status "Porta $port está livre"
    fi
done

# 5. Verificar conexão com a rede Sepolia
echo -e "\nVerificando conexão com a rede Sepolia..."
if curl -s https://sepolia.infura.io/v3/your-project-id > /dev/null; then
    print_status "Conexão com Sepolia estabelecida"
else
    print_warning "Não foi possível conectar à rede Sepolia"
fi

# Função para limpar processos ao sair
cleanup() {
    echo -e "\n${VERDE}Encerrando serviços...${NC}"
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ -f "../docker-compose.yml" ]; then
        docker-compose down
    fi
    print_status "Serviços encerrados"
    exit 0
}

# Registrar função de limpeza para ser chamada ao sair
trap cleanup SIGINT SIGTERM

echo -e "\n${VERDE}Todos os serviços foram iniciados!${NC}"
echo -e "${AMARELO}Pressione Ctrl+C para encerrar todos os serviços${NC}"

# Manter o script rodando
while true; do
    sleep 1
done 