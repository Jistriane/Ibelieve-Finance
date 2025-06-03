# I Believe Finance

Sistema de empréstimos descentralizado com integração de IA e provas zero-conhecimento.

## Funcionalidades

- Conexão com carteiras (MetaMask e SubWallet)
- Sistema de Prova Zero (ZkVerify)
- Assistente Virtual de IA
- Análise de Risco
- Otimização ZKP
- Detecção de Fraudes
- Sistema de Empréstimos com:
  - Geração de hash de prova
  - Registro na blockchain
  - Visualização de status e limites
  - Análise de garantias

## Pré-requisitos

- Node.js 18+
- Yarn ou npm
- MetaMask ou SubWallet instalado
- Ollama instalado e configurado localmente
- Modelo ollama gemma-mistral

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/i-believe-finance.git
cd i-believe-finance
```

2. Instale as dependências:
```bash
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env-dev .env
```

4. Inicie o servidor de desenvolvimento:
```bash
yarn dev
```

## Configuração do Ollama

1. Instale o Ollama seguindo as instruções em https://ollama.ai/

2. Baixe o modelo gemma-mistral:
```bash
ollama pull gemma-mistral
```

3. Inicie o servidor Ollama:
```bash
ollama serve
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  ├── services/      # Serviços (IA, ZKP, etc.)
  ├── store/         # Configuração Redux
  ├── pages/         # Páginas da aplicação
  ├── utils/         # Funções utilitárias
  ├── types/         # Definições de tipos TypeScript
  └── theme/         # Configuração do tema Material-UI
```

## Uso

1. Acesse http://localhost:3000
2. Conecte sua carteira (MetaMask ou SubWallet)
3. Insira o valor do empréstimo desejado
4. Gere a prova zero-conhecimento
5. Aguarde a análise do sistema
6. Verifique o status do empréstimo

## Desenvolvimento

### Scripts Disponíveis

- `yarn dev`: Inicia o servidor de desenvolvimento
- `yarn build`: Gera a build de produção
- `yarn lint`: Executa o linter
- `yarn test`: Executa os testes
- `yarn preview`: Visualiza a build de produção localmente

### Convenções de Código

- TypeScript para tipagem estática
- ESLint para linting
- Prettier para formatação
- Material-UI para componentes
- Redux para gerenciamento de estado

## Segurança

- Todas as provas zero-conhecimento são geradas localmente
- Dados sensíveis são criptografados
- Integração segura com carteiras
- Validação de entrada em todos os campos
- Proteção contra ataques comuns

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Suporte

Para suporte, envie um email para seu-email@exemplo.com ou abra uma issue no GitHub.

# IbelieveFinance - Ambiente de Desenvolvimento

Este projeto utiliza Docker Compose para gerenciar todos os serviços necessários para o desenvolvimento.

## Serviços Disponíveis

1. **Frontend (React)**
   - Porta: 3000
   - URL: http://localhost:3000

2. **Backend API**
   - Porta: 3001
   - URL: http://localhost:3001

3. **Ollama (IA)**
   - Porta: 11434
   - URL: http://localhost:11434

4. **Redis (Cache)**
   - Porta: 6379

5. **PostgreSQL**
   - Porta: 5432
   - Usuário: postgres
   - Senha: postgres
   - Banco: ibelieve

6. **Elasticsearch (Logs)**
   - Porta: 9200
   - URL: http://localhost:9200

7. **Prometheus (Métricas)**
   - Porta: 9090
   - URL: http://localhost:9090

8. **Grafana (Visualização)**
   - Porta: 3004
   - URL: http://localhost:3004
   - Usuário padrão: admin
   - Senha padrão: admin

9. **Polkadot Node**
   - Porta: 9944
   - WebSocket: ws://localhost:9944

10. **Ganache (Blockchain Local)**
    - Porta: 8545
    - RPC: http://localhost:8545

## Requisitos

- Docker
- Docker Compose
- Node.js >= 14
- Yarn
- NVIDIA GPU (para Ollama)

## Iniciando os Serviços

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ibelieve-finance.git
cd ibelieve-finance
```

2. Configure as variáveis de ambiente:
```bash
cp frontend/.env-dev frontend/.env
# Edite o arquivo .env conforme necessário
```

3. Inicie todos os serviços:
```bash
./start-services.sh
```

## Encerrando os Serviços

Para encerrar todos os serviços:
```bash
./stop-services.sh
```

## Monitoramento

### Métricas
- Acesse o Grafana em http://localhost:3004
- Configure o Prometheus como fonte de dados (http://prometheus:9090)
- Dashboards pré-configurados estão disponíveis

### Logs
- Logs do Elasticsearch: http://localhost:9200
- Use Kibana para visualização (se necessário)

## Desenvolvimento

### Frontend
```bash
cd frontend
yarn install
yarn start
```

### Backend
```bash
cd backend
yarn install
yarn dev
```

## Testes

### Frontend
```bash
cd frontend
yarn test
```

### Backend
```bash
cd backend
yarn test
```

## Troubleshooting

### Problemas Comuns

1. **Portas em uso**
   - Use `./stop-services.sh` para encerrar todos os serviços
   - Verifique se não há outros processos usando as portas necessárias

2. **Erro de conexão com banco de dados**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no arquivo .env

3. **Erro de GPU no Ollama**
   - Verifique se o Docker tem acesso à GPU
   - Confirme se os drivers NVIDIA estão instalados

4. **Problemas de cache**
   - Limpe o cache do Redis: `docker-compose exec redis redis-cli FLUSHALL`
   - Reinicie o serviço Redis

## Contribuição

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Envie um Pull Request

## Licença

Este projeto está sob a licença MIT.
