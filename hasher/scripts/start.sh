#!/bin/bash

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Criar diretórios necessários
mkdir -p prometheus/templates
mkdir -p grafana/provisioning/{datasources,dashboards,alerting}
mkdir -p grafana/dashboards

# Copiar arquivos de configuração
cp prometheus/prometheus.yml prometheus/
cp prometheus/alertmanager.yml prometheus/
cp prometheus/templates/slack.tmpl prometheus/templates/
cp grafana/dashboards/application.json grafana/dashboards/
cp grafana/provisioning/datasources/prometheus.yml grafana/provisioning/datasources/
cp grafana/provisioning/dashboards/dashboards.yml grafana/provisioning/dashboards/
cp grafana/provisioning/alerting/alertmanager.yml grafana/provisioning/alerting/

# Iniciar serviços
echo "Iniciando serviços..."
docker-compose up -d

# Verificar status dos serviços
echo "Verificando status dos serviços..."
docker-compose ps

# Aguardar serviços iniciarem
echo "Aguardando serviços iniciarem..."
sleep 10

# Verificar logs
echo "Verificando logs..."
docker-compose logs --tail=50

echo "Serviços iniciados com sucesso!"
echo "Acesse:"
echo "- Aplicação: http://localhost:3000"
echo "- Grafana: http://localhost:3000 (admin/admin)"
echo "- Prometheus: http://localhost:9090"
echo "- Alertmanager: http://localhost:9093"
echo "- Jaeger: http://localhost:16686"
echo "- Kibana: http://localhost:5601" 