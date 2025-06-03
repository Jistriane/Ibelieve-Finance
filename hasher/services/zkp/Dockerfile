FROM rust:1.75 as builder

WORKDIR /usr/src/app
COPY . .

RUN cargo build --release --bin zkp-service

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/zkp-service /usr/local/bin/zkp-service

ENV RUST_LOG=info

EXPOSE 3002

CMD ["zkp-service"] 