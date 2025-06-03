# Imagem base
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Limpar dependências de desenvolvimento
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"] 