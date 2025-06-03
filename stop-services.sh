#!/bin/bash

# Cores para output
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m' # No Color

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

# Função para encontrar PIDs por nome
find_pid() {
    pgrep -f "$1" | head -n 1
}

# Função para encerrar processo de forma segura
kill_process() {
    local pid=$1
    local name=$2
    if [ ! -z "$pid" ]; then
        print_status "Encerrando $name (PID: $pid)..."
        kill -15 $pid 2>/dev/null
        sleep 2
        if kill -0 $pid 2>/dev/null; then
            print_warning "$name não respondeu ao sinal de término. Forçando encerramento..."
            kill -9 $pid 2>/dev/null
        fi
    fi
}

echo -e "${VERDE}Iniciando encerramento dos serviços do IbelieveFinance...${NC}\n"

# 1. Encerrar Frontend
FRONTEND_PID=$(find_pid "yarn start")
kill_process "$FRONTEND_PID" "Frontend"

# 2. Encerrar Backend
BACKEND_PID=$(find_pid "yarn dev")
kill_process "$BACKEND_PID" "Backend"

# 3. Encerrar Serviços Docker
if [ -f "docker-compose.yml" ]; then
    print_status "Encerrando serviços Docker..."
    docker-compose down
fi

# 4. Verificar e encerrar processos Node.js restantes
NODE_PIDS=$(pgrep -f "node" | grep -v "$$")
if [ ! -z "$NODE_PIDS" ]; then
    print_warning "Encontrados processos Node.js restantes. Encerrando..."
    for pid in $NODE_PIDS; do
        kill_process "$pid" "Processo Node.js"
    done
fi

# 5. Verificar portas em uso
echo -e "\nVerificando portas em uso..."
PORTS=(3000 3001 8545 8546)
for port in "${PORTS[@]}"; do
    if lsof -i :$port >/dev/null 2>&1; then
        print_warning "Porta $port ainda está em uso"
        PID=$(lsof -ti :$port)
        if [ ! -z "$PID" ]; then
            kill_process "$PID" "Processo na porta $port"
        fi
    else
        print_status "Porta $port está livre"
    fi
done

# 6. Limpar arquivos temporários
echo -e "\nLimpando arquivos temporários..."
if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache
    print_status "Cache do frontend limpo"
fi

if [ -d "backend/node_modules/.cache" ]; then
    rm -rf backend/node_modules/.cache
    print_status "Cache do backend limpo"
fi

# 7. Verificar processos restantes
echo -e "\nVerificando processos restantes..."
REMAINING_PIDS=$(pgrep -f "node|yarn" | grep -v "$$")
if [ ! -z "$REMAINING_PIDS" ]; then
    print_warning "Ainda existem processos em execução:"
    for pid in $REMAINING_PIDS; do
        ps -p $pid -o pid,cmd | tail -n 1
    done
else
    print_status "Todos os processos foram encerrados com sucesso"
fi

echo -e "\n${VERDE}Encerramento dos serviços concluído!${NC}"

# Sugestões de verificação manual
echo -e "\n${AMARELO}Sugestões de verificação manual:${NC}"
echo "1. Verifique se todas as portas estão livres:"
echo "   - Frontend (3000)"
echo "   - Backend (3001)"
echo "   - Sepolia (8545, 8546)"
echo "2. Verifique se não há processos Node.js rodando:"
echo "   - Use 'ps aux | grep node' para verificar"
echo "3. Verifique se os containers Docker foram encerrados:"
echo "   - Use 'docker ps' para verificar" 