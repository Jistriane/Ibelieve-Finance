#!/bin/bash

# Configurar variáveis de ambiente
export RUST_LOG=info
export BLOCKCHAIN_SERVICE_PORT=8084

# Compilar e executar o serviço
echo "Compilando serviço blockchain..."
cargo build

echo "Iniciando serviço blockchain na porta $BLOCKCHAIN_SERVICE_PORT..."
cargo run 