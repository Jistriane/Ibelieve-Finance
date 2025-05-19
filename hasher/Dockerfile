# Estágio de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./
COPY babel.config.js ./
COPY jest.config.js ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY src/ ./src/

# Limpar e compilar TypeScript
RUN npm run clean && npm run build

# Verificar se o diretório dist foi criado
RUN ls -la dist/

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Instalar dependências de produção
COPY package*.json ./
RUN npm install --only=production

# Copiar arquivos compilados
COPY --from=builder /app/dist ./dist

# Verificar se os arquivos foram copiados
RUN ls -la dist/

# Configurar usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"] 