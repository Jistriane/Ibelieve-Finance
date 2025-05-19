# Documentação de Deploy - Ibelieve Finance

## 1. Visão Geral

Este documento descreve o processo de deploy do Ibelieve Finance, incluindo configuração de ambientes, scripts de deploy e procedimentos de manutenção.

## 2. Ambientes

### 2.1 Desenvolvimento
```bash
# Variáveis de ambiente
cp .env-dev .env

# Iniciar serviços
docker compose -f docker-compose.dev.yml up -d
```

### 2.2 Homologação
```bash
# Variáveis de ambiente
cp .env-homolog .env

# Iniciar serviços
docker compose -f docker-compose.homolog.yml up -d
```

### 2.3 Produção
```bash
# Variáveis de ambiente
cp .env-prod .env

# Iniciar serviços
docker compose -f docker-compose.prod.yml up -d
```

## 3. Scripts de Deploy

### 3.1 Frontend
```bash
#!/bin/bash
# deploy-frontend.sh

# Build
cd frontend
npm install
npm run build

# Deploy
aws s3 sync build/ s3://ibeleve-frontend
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

### 3.2 Backend
```bash
#!/bin/bash
# deploy-backend.sh

# Build
cd backend
npm install
npm run build

# Deploy
docker build -t ibeleve-backend .
docker push ibeleve-backend

# Kubernetes
kubectl apply -f k8s/backend
```

### 3.3 Smart Contracts
```bash
#!/bin/bash
# deploy-contracts.sh

# Compilar
cd backend
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.ts --network mainnet

# Verificar
npx hardhat verify --network mainnet $CONTRACT_ADDRESS
```

## 4. Configuração de Infraestrutura

### 4.1 Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - elasticsearch

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:7.9.3
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
```

### 4.2 Kubernetes
```yaml
# k8s/backend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ibeleve-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ibeleve-backend
  template:
    metadata:
      labels:
        app: ibeleve-backend
    spec:
      containers:
      - name: ibeleve-backend
        image: ibeleve-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
```

## 5. Monitoramento

### 5.1 Prometheus
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ibeleve-backend'
    static_configs:
      - targets: ['backend:3001']
```

### 5.2 Grafana
```yaml
# grafana-dashboard.json
{
  "dashboard": {
    "id": null,
    "title": "Ibelieve Finance",
    "panels": [
      {
        "title": "API Requests",
        "type": "graph",
        "datasource": "Prometheus"
      }
    ]
  }
}
```

## 6. Backup

### 6.1 Banco de Dados
```bash
#!/bin/bash
# backup-db.sh

# Backup
pg_dump -U $DB_USER -d $DB_NAME > backup.sql

# Upload
aws s3 cp backup.sql s3://ibeleve-backups/db/$(date +%Y%m%d).sql
```

### 6.2 Logs
```bash
#!/bin/bash
# backup-logs.sh

# Backup
tar -czf logs.tar.gz /var/log/ibeleve

# Upload
aws s3 cp logs.tar.gz s3://ibeleve-backups/logs/$(date +%Y%m%d).tar.gz
```

## 7. Manutenção

### 7.1 Atualização de Dependências
```bash
#!/bin/bash
# update-dependencies.sh

# Frontend
cd frontend
npm update
npm audit fix

# Backend
cd ../backend
npm update
npm audit fix
```

### 7.2 Limpeza
```bash
#!/bin/bash
# cleanup.sh

# Limpar containers
docker system prune -f

# Limpar imagens
docker image prune -f

# Limpar volumes
docker volume prune -f
```

## 8. Troubleshooting

### 8.1 Logs
```bash
# Frontend
docker logs ibeleve-frontend

# Backend
docker logs ibeleve-backend

# Kubernetes
kubectl logs -f deployment/ibeleve-backend
```

### 8.2 Métricas
```bash
# Prometheus
curl http://localhost:9090/metrics

# Grafana
http://localhost:3000/dashboards
```

## 9. Segurança

### 9.1 SSL/TLS
```bash
# Gerar certificado
certbot certonly --standalone -d ibeleve.com

# Configurar Nginx
server {
    listen 443 ssl;
    server_name ibeleve.com;
    
    ssl_certificate /etc/letsencrypt/live/ibeleve.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ibeleve.com/privkey.pem;
}
```

### 9.2 Firewall
```bash
# Configurar UFW
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp
```

## 10. Referências

- [Documentação Docker](https://docs.docker.com)
- [Documentação Kubernetes](https://kubernetes.io/docs)
- [Documentação AWS](https://aws.amazon.com/documentation)
- [Documentação Nginx](https://nginx.org/en/docs) 