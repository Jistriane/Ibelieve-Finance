# Imagem base
FROM rust:1.75 as builder

# Criar diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos do projeto
COPY . .

# Compilar em modo release
RUN cargo build --release --bin blockchain-service

# Imagem final
FROM debian:bookworm-slim

# Instalar dependências de runtime
RUN apt-get update && \
    apt-get install -y \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar binário compilado
COPY --from=builder /usr/src/app/target/release/blockchain-service /usr/local/bin/blockchain-service

# Expor porta
EXPOSE 3001

# Comando para iniciar o serviço
CMD ["blockchain-service"]

# Adicionar variável de ambiente
ENV RUST_LOG=info 