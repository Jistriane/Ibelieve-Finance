FROM rust:1.75 as builder

WORKDIR /usr/src/ibeleve

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos do projeto
COPY . .

# Compilar o projeto
RUN cargo build --release

# Imagem final
FROM debian:bullseye-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar o binário compilado
COPY --from=builder /usr/src/ibeleve/target/release/${SERVICE_NAME} /app/

# Expor a porta do serviço
EXPOSE ${SERVICE_PORT}

# Executar o serviço
CMD ["./${SERVICE_NAME}"] 