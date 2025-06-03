#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🚀 Iniciando testes..."

# Criar banco de teste se não existir
echo "📦 Configurando banco de dados de teste..."
PGPASSWORD=ibeleve psql -U ibeleve -h localhost -c "CREATE DATABASE ibeleve_test;" 2>/dev/null || true

# Executar migrações no banco de teste
echo "🔄 Executando migrações..."
PGPASSWORD=ibeleve psql -U ibeleve -h localhost -d ibeleve_test -f services/common/src/db/migrations/001_initial_schema.sql

# Função para executar testes de um serviço
run_service_tests() {
    local service=$1
    echo "🧪 Testando $service service..."
    cd services/$service
    cargo test -- --nocapture
    local result=$?
    cd ../..
    return $result
}

# Função para executar testes de integração
run_integration_tests() {
    echo "🔄 Executando testes de integração..."
    cd tests/integration
    cargo test -- --nocapture
    local result=$?
    cd ../..
    return $result
}

# Array de serviços
services=("ai" "blockchain" "zkp")

# Contador de falhas
failures=0

# Executar testes unitários para cada serviço
echo "📋 Executando testes unitários..."
for service in "${services[@]}"; do
    if run_service_tests $service; then
        echo -e "${GREEN}✅ Testes do $service service passaram${NC}"
    else
        echo -e "${RED}❌ Testes do $service service falharam${NC}"
        ((failures++))
    fi
    echo "-----------------------------------"
done

# Executar testes de integração
echo "📋 Executando testes de integração..."
if run_integration_tests; then
    echo -e "${GREEN}✅ Testes de integração passaram${NC}"
else
    echo -e "${RED}❌ Testes de integração falharam${NC}"
    ((failures++))
fi
echo "-----------------------------------"

# Relatório final
echo "📊 Relatório de Testes"
echo "-----------------------------------"
if [ $failures -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os testes passaram${NC}"
    exit 0
else
    echo -e "${RED}❌ $failures serviço(s)/módulo(s) falharam nos testes${NC}"
    exit 1
fi 