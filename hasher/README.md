# Ibelieve - Sistema de Provas ZKP com Open Finance

Sistema de provas Zero-Knowledge Proof (ZKP) com integração ao Open Finance Brasil.

## Funcionalidades

- Integração com Open Finance Brasil
- Geração e validação de provas ZKP
- Monitoramento e métricas
- Logs de auditoria
- Cache distribuído
- Backup automático

## Requisitos

- Node.js 18+
- Redis
- PostgreSQL 13+
- Elasticsearch
- Prometheus
- Grafana
- Kubernetes (para produção)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ibeleve.git
cd ibeleve
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env-dev .env
# Edite o arquivo .env com suas configurações
```

4. Inicie os serviços:
```bash
docker-compose up -d
```

5. Execute as migrações do banco de dados:
```bash
npm run migrate
```

6. Inicie a aplicação:
```bash
npm run dev
```

## Estrutura do Projeto

```
hasher/
├── src/
│   ├── openfinance/     # Integração com Open Finance
│   ├── utils/           # Utilitários e helpers
│   └── __tests__/       # Testes unitários
├── scripts/             # Scripts de automação
├── grafana/             # Dashboards e alertas
├── k8s/                 # Manifests Kubernetes
└── .github/             # Configurações CI/CD
```

## Monitoramento

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Jaeger: http://localhost:16686
- Kibana: http://localhost:5601

## Testes

```bash
# Executar testes
npm test

# Executar testes com cobertura
npm run test:coverage
```

## CI/CD

O projeto utiliza GitHub Actions para CI/CD. O pipeline inclui:
- Linting
- Testes unitários
- Build
- Deploy (apenas na branch main)

## Logs e Backup

Os logs são armazenados no Elasticsearch e podem ser visualizados no Kibana.
O backup é executado automaticamente via cron job:

```bash
# Executar backup manualmente
./scripts/backup-logs.sh
```

## Checklist de Produção

### Segurança
- [ ] HTTPS configurado em todos os endpoints
- [ ] Rate limiting implementado
- [ ] Autenticação básica nos endpoints de monitoramento
- [ ] Sanitização de inputs
- [ ] Criptografia de dados sensíveis
- [ ] Nonce com expiração para autenticação
- [ ] IP allowlist para endpoints críticos

### Alta Disponibilidade
- [ ] Kubernetes configurado
- [ ] Múltiplas réplicas dos serviços
- [ ] Auto-scaling configurado
- [ ] RabbitMQ em cluster
- [ ] Load balancing configurado
- [ ] Healthchecks implementados
- [ ] Retry automático em falhas

### Performance
- [ ] Cache implementado
- [ ] Compressão de payloads
- [ ] Pré-compilação de circuitos ZKP
- [ ] Otimização de consultas
- [ ] Monitoramento de recursos

### Observabilidade
- [ ] Prometheus configurado
- [ ] Grafana dashboards provisionados
- [ ] Alertas configurados
- [ ] Logs centralizados
- [ ] Métricas customizadas

### Backup e Recuperação
- [ ] Backup automático configurado
- [ ] Script de restauração testado
- [ ] Retenção de backups definida
- [ ] DR plan documentado

## Kubernetes

### Estrutura
```
k8s/
├── backend/           # API Backend
├── zkp/              # Serviço ZKP
├── rabbitmq/         # Cluster RabbitMQ
├── ingress/          # Ingress Controller
└── secrets/          # Secrets e ConfigMaps
```

### Deploy em Produção

1. Configure o cluster Kubernetes:
```bash
# Criar namespace
kubectl create namespace ibeleve

# Aplicar secrets
kubectl apply -f k8s/secrets/

# Aplicar ConfigMaps
kubectl apply -f k8s/rabbitmq/configmap.yaml

# Aplicar deployments e serviços
kubectl apply -f k8s/backend/
kubectl apply -f k8s/zkp/
kubectl apply -f k8s/rabbitmq/

# Aplicar ingress
kubectl apply -f k8s/ingress/
```

2. Verifique o status:
```bash
kubectl get all -n ibeleve
```

3. Configure o DNS:
- Adicione registros A para api.ibeleve.com e zkp.ibeleve.com
- Configure SSL/TLS com cert-manager ou similar

### Monitoramento

1. Instale o Prometheus Operator:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack
```

2. Configure o Alertmanager:
```bash
kubectl apply -f k8s/alertmanager/alertmanager.yaml
```

3. Acesse os dashboards:
- Grafana: https://grafana.ibeleve.com
- Prometheus: https://prometheus.ibeleve.com

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
