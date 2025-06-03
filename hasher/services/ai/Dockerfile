FROM rust:1.75 as builder

WORKDIR /usr/src/app
COPY . .

RUN cargo build --release --bin ai-service

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/ai-service /usr/local/bin/ai-service

ENV RUST_LOG=info

EXPOSE 3000

CMD ["ai-service"] 