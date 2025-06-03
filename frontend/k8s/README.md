# Kubernetes Manifests para I Believe Finance

Este diretório contém os manifests Kubernetes para deploy da aplicação I Believe Finance, incluindo configurações de observabilidade, backup e namespaces.

## Estrutura de Diretórios

```
k8s/
├── observability/
│   ├── prometheus/
│   │   └── prometheus-operator.yaml
│   ├── alertmanager/
│   │   └── alertmanager.yaml
│   ├── loki/
│   │   └── loki.yaml
│   ├── grafana/
│   │   └── grafana.yaml
│   └── logging/
│       └── fluent-bit.yaml
├── backup/
│   └── velero.yaml
├── namespaces.yaml
└── resource-quota.yaml
```

## Namespaces

- `ibelieve-dev`: Ambiente de desenvolvimento
- `ibelieve-homolog`: Ambiente de homologação
- `ibelieve-prod`: Ambiente de produção
- `monitoring`: Stack de observabilidade
- `velero`: Backup e restauração

## Observabilidade

### Prometheus
- Coleta métricas de aplicação e infraestrutura
- Retenção de 15 dias
- 2 réplicas para alta disponibilidade
- ServiceMonitors para frontend e Ollama

### Alertmanager
- Gerenciamento de alertas
- Integração com canais de notificação
- Regras de alerta para:
  - Alta latência no frontend
  - Alto uso de memória no Ollama
  - Indisponibilidade de serviços

### Loki
- Coleta e armazenamento de logs
- Retenção de 15 dias em produção
- Armazenamento em S3
- Labels para filtragem por app, componente e ambiente

### Grafana
- Dashboards para métricas e logs
- Datasources configurados para Prometheus e Loki
- Autenticação básica habilitada
- Persistência de dados via PVC

### Fluent Bit
- Coleta de logs de todos os containers
- Enriquecimento com metadados do Kubernetes
- Envio para Loki
- RBAC configurado

## Backup

### Velero
- Backup diário de todos os ambientes
- Backup semanal do ambiente de produção
- Retenção de 30 dias para backups diários
- Retenção de 90 dias para backups semanais
- Armazenamento em S3
- Snapshots de volumes persistentes

## Resource Quotas

### Desenvolvimento
- CPU: 4 cores (requests) / 8 cores (limits)
- Memória: 8Gi (requests) / 16Gi (limits)
- Storage: 100Gi
- Pods: 20
- Services: 10
- LoadBalancers: 2

### Homologação
- CPU: 8 cores (requests) / 16 cores (limits)
- Memória: 16Gi (requests) / 32Gi (limits)
- Storage: 200Gi
- Pods: 40
- Services: 20
- LoadBalancers: 4

### Produção
- CPU: 16 cores (requests) / 32 cores (limits)
- Memória: 32Gi (requests) / 64Gi (limits)
- Storage: 500Gi
- Pods: 100
- Services: 50
- LoadBalancers: 10

## Deploy

1. Criar namespaces:
```bash
kubectl apply -f namespaces.yaml
```

2. Configurar ResourceQuotas:
```bash
kubectl apply -f resource-quota.yaml
```

3. Deploy da stack de observabilidade:
```bash
kubectl apply -f observability/
```

4. Configurar backup:
```bash
kubectl apply -f backup/
```

## Manutenção

### Logs
- Retenção de 15 dias em produção
- Retenção de 7 dias em homologação/desenvolvimento
- Expurgo automático via Loki

### Backup
- Backups diários às 1h
- Backups semanais aos domingos às 1h
- Limpeza automática após período de retenção

### Monitoramento
- Dashboards Grafana atualizados semanalmente
- Alertas revisados mensalmente
- Capacidade de recursos monitorada diariamente

## Segurança

- Todos os componentes rodam como usuários não-root
- Secrets gerenciados via Sealed Secrets
- NetworkPolicies restringindo comunicação entre namespaces
- TLS em todas as comunicações
- RBAC configurado para todos os componentes 